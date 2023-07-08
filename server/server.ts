import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Domain from './mongo/models';

const express = require('express');

// Connect to MongoDB database
mongoose
  .connect('mongodb://mongo/domains')
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('Error connecting to MongoDB:', error));



const app = express();
const port = 3000;
const services: string[] = JSON.parse(process.env.SERVICES);

app.use(express.json());

function isValidDomain(domain: any) {
  const domainPattern = /^[a-zA-Z0-9]+([\-\.]{1}[a-zA-Z0-9]+)*\.[a-zA-Z]{2,}$/;

  return domainPattern.test(domain);
}

async function createDomain(url: String) {
  const data: { [key: string]: string } = {};
  const lastUpdated: { [key: string]: Number } = {};

  services.forEach((service: string)=> {
    data.service = 'undefined';
    lastUpdated[service] = 0;
  });

  const newDomain = new Domain({
    url,
    data,
    lastUpdated
  });
try {
  const _res = await newDomain.save();
  console.log(_res.url + " saved to domains collection.");
  return {statusCode: 200, body: _res}
} catch (err) {
  console.error(err);
  return {statusCode: 500, message: "Error while adding domain!"}
}
}

app.post('/domains', async (req: Request, res: Response) => {
    if(!req.body?.url){
        console.error('No url specified');
        res.json({
            statusCode: 400,
            message: 'No url specified'
        })
    }

    const existingDomain = await Domain.findOne({ url: req.body.url });
    if (existingDomain) {
        res.json({
            statusCode: 400,
            message: 'Domain already exists'
        });
        return;
    }
    if(!isValidDomain(req.body.url)){
      res.json({
        statusCode: 401,
        message: 'Domain pattern invalid'
    });
    return;
    }
    const createdDomain = await createDomain(req.body.url);
    res.json(createdDomain);

});

app.get('/domains/:url', async (req: Request, res: Response) => {
  console.log("start get domain on:", req.params.url);
  const url = req.params.url;
  if(!url || !isValidDomain(url)){
    res.json({
      statusCode: 401,
      message: 'Domain pattern invalid'
    });
  }

    try {
        const domain = await Domain.findOne({ url});
        if (!domain) {
          console.log(`${url} not found, creating new one`);
          const _res = await createDomain(url);
          _res.message = `${url} not found. new domain created, please check later for data about this domain.`
          res.json(_res);
          return;
        }
        const unixTime = Math.floor(Date.now());
        const data: { [key: string]: string } = {};

        services.forEach((service: string) => {
          const isExpired: boolean = domain.lastUpdated[service] > unixTime - parseFloat(process.env.MAX_UPDATE_DAYS);
          if (!isExpired) {
            const decodedString = Buffer.from( domain.data[service], 'base64').toString('utf8');
            data[service] = decodedString;
          }
        });
        if(Object.keys(data).length){
          res.json(data);
        }else{
          res.status(500).json({ message: 'no data available, please check later for data about this domain.' });
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error while querying domain' });
    }
});


app.get('/domains', async (req: Request, res: Response) => {

    try {
        const domains = await Domain.find({});
        res.send(domains)

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error while querying domain' });
    }
});


app.delete('/domains', async (req: Request, res: Response) => {

  try {
      const domains = await Domain.deleteMany({});
      res.send(domains)

  } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Error while querying domain' });
  }
});




app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
