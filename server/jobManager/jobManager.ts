import * as amqp from 'amqplib';
import Domain from './mongo/models.js';
import mongoose from 'mongoose';


// Connect to MongoDB database
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

async function declareQueue(channel: amqp.Channel, queueName: string): Promise<void> {
  await channel.assertQueue(queueName);
}
  
async function publishToQueue(channel: amqp.Channel, queueName: string, message: string): Promise<void> {
  try{
    await channel.sendToQueue(queueName, Buffer.from(message));
    console.log('Task published to the queue.');
  }catch(err){
    console.error(`failed to update for ${queueName} and task: ${message}` + err)
  }
}
  
async function publishUpdateData(channel: amqp.Channel, updateDataQueueName: string) {
  const services: string[] = JSON.parse(process.env.SERVICES);
  const unixTime = Math.floor(Date.now());
  let index = 0;
  for(const service of services){
    const query = {  [`lastUpdated.${service}`]: { $lt: unixTime - parseFloat(process.env.MAX_UPDATE_DAYS) } };

    let domainsToUpdate: any[]= [];
    let tasks: any[] = [];

    try {
        domainsToUpdate = await Domain.find(query,{ _id: 1 });
      } catch (err) {
        console.error('failed to query domains. ', err);
        return;
    }
    let packageDomains = [];
    while(domainsToUpdate.length){
        for(let i=0;i<parseInt(process.env.TASKS_PAGGING_UPDATE_DATA) && domainsToUpdate.length>0;i++){
            if(domainsToUpdate.length > 0){
                packageDomains.push(domainsToUpdate.pop());
              }
        }
        const task = {
            id: `${service} updateData ${index}`,
            data: {
              domains: packageDomains,
              service
            }
          };
        tasks.push(task);

    }
    const promises = tasks.map((task: any)=> publishToQueue(channel, updateDataQueueName, JSON.stringify(task)));
    await Promise.all(promises);
    index++;
  }
}

async function handler(){
    try {
      const connection = await connect();
      const channel = await createChannel(connection);
      const existUpdateDataQueue = await channel.assertQueue(process.env.UPDATE_DATA_QUEUE_NAME)
      if(!existUpdateDataQueue){
        await declareQueue(channel, process.env.UPDATE_DATA_QUEUE_NAME);
      }

      await publishUpdateData(channel, process.env.UPDATE_DATA_QUEUE_NAME);
      
      await channel.close();
      await connection.close();
    } catch (error) {
      console.error('Error:', error);
    }
}
setInterval(handler, parseInt(process.env.JOB_MANAGER_INTERVAL)); 








