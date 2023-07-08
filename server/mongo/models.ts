import mongoose from 'mongoose';
const services: string[] = JSON.parse(process.env.SERVICES);

const domainSchema = new mongoose.Schema({
  url: { type: String, require: true },
  data:  services.reduce((obj: any, str: string) => {
    obj[`${str}`] = { type: String};
    return obj;
  }, {}),
  lastUpdated: {
    _id: false,
    type:  services.reduce((obj: any, str: string) => {
      obj[`${str}`] =  { type: Number, default: 0 };
      return obj;
    }, {})
  }
});

try{
  services.forEach((service: string) => domainSchema.index({ [`lastUpdated.${service}`]: 1 }));
}catch(error){
    console.error('Error creating index:', error);
};

export default mongoose.model('Domain', domainSchema);
