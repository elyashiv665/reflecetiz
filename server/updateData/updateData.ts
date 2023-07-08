import mongoose from 'mongoose';
import Domain from './mongo/models.js';
import * as amqp from 'amqplib';
 
const axios = require('axios');
const SERVICE_METADATA = JSON.parse(process.env.SERVICES_METADATA)

mongoose
.connect('mongodb://mongo/domains')
.then(() => console.log('Connected to MongoDB'))
.catch((error) => console.error('Error connecting to MongoDB:', error));
async function connect(): Promise<any> {
  let connection;
  await amqp.connect('amqp://rabbitmq')
  .then((_connection) => {console.log('Connected to rabbitmq'); connection = _connection})
  .catch((error) => console.error('Error connecting to rabbitmq:', error));
  return connection;
  }

async function createChannel(connection: amqp.Connection): Promise<any> {
    let channel;
    await connection.createChannel()
    .then((_channel) => {console.log('createChannel to rabbitmq'); channel = _channel})
    .catch((error) => console.error('Error createChannel to rabbitmq:', error));
    return channel;
}
async function consumeFromQueue(channel: amqp.Channel, queueName: string, callback: (message: amqp.ConsumeMessage | null) => void): Promise<void> {
  await channel.consume(queueName, callback, { noAck: true });
}

async function handleReputationCallback(domain: any, reputationData:Object, isError:Boolean, service:String) {
  if(isError){
    console.log(`Error occurred for ${domain.url}:`);
    return;
  }
  try{
    const encodedString = Buffer.from(JSON.stringify(reputationData), 'utf8').toString('base64');
    const updateOperation = { $set: { [`lastUpdated.${service}`]: Math.floor(Date.now()), [`data.${service}`]:encodedString }};
    await Domain.findOneAndUpdate({ url: domain.url }, updateOperation);
  }catch(error){
    console.error('error updating domain data', error);
  }
 
}

function getReputation(domain:any, service: String) {
  try {
    let url = SERVICE_METADATA[`${service}`].url;
    
    interface Params {
      apiKey?: string;
      outputFormat?: string;
      domainName?: string;
    }
     
    interface Headers {
      "x-apikey"?: string;
    }
    
    let params: Params = {};
    let headers: Headers = {};
    
    // the api query could be saved in the Global scope, 
    // for simplicity I passed that even though the services is not editable in one place now but here and in the global.
    if (service === 'whoIs') {
      params.domainName = domain.url;
      params.apiKey = SERVICE_METADATA[`${service}`].apiKey;
      params.outputFormat = 'JSON';
    }
    
    if(service === 'virusTotal'){
      url+= domain.url;
      headers["x-apikey"] =  SERVICE_METADATA[`${service}`].apiKey;
    }
    const promise = axios.get(url, {params: params, headers: headers});

    return promise;
  } catch (error) {
    console.error('Error get reputation:', error);
  }
}

async function processTask(task: any){
  try {
    const unixTime = Math.floor(Date.now());
    const query = {
      $or: [
        { [`lastUpdated.${task.data.service}`]: 0 },
        {  [`lastUpdated.${task.data.service}`]: { $gt: unixTime - parseFloat(process.env.MAX_UPDATE_DAYS) } }
      ]
    };
    const deepDataDomains = await Domain.find(query);
    const promises = deepDataDomains.map((domain: any) => getReputation(domain, task.data.service));
    const responses = await Promise.all(promises);
    responses.forEach(async (response, index) => {
        const domain: any = deepDataDomains[index];
        const isError: boolean = response instanceof Error;
        await handleReputationCallback(domain, response.data, isError, task.data.service);
      });
    } catch (err) {
      console.error(err);
      return;
  }
};


async function pickupTask(){
  try{
    const connection = await connect();
    const channel = await createChannel(connection);
    let isQueueEmpty = false;
    while (!isQueueEmpty) {
      await consumeFromQueue(channel, process.env.UPDATE_DATA_QUEUE_NAME, async (message) => {
        if (message !== null) {
          const task = JSON.parse(message.content.toString());
          await processTask(task);
          console.log(`Consumer started for ${process.env.UPDATE_DATA_QUEUE_NAME}`);
        } else {
          isQueueEmpty = true;
          console.log("No tasks remaining. Queue is empty.");
        }
      });
    }
    await channel.close();
    await connection.close();
  
  }catch(error){
    console.error('error while updating data', error);
  }
  
};

setInterval(pickupTask, parseInt(process.env.UPDATE_DATA_INTERVAL)); 

