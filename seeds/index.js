
const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const Campground = require('../models/campground');


mongoose.set('strictQuery', true);
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp', {
  useNewUrlParser: true,
  // useCreateIndex:true, it  is no longer supported in newer version so no need to write it
  useUnifiedTopology: true,
})

 

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const sample = array =>
  array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 400; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      //your user id
      author:'6782b2aa17280ec322fd0edf',
      location: `${cities[random1000].city},${cities[random1000].state}`, 
      title: `${sample(descriptors)} ${sample(places)}`,
      description: 'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Assumenda debitis at sed pariatur hic in ullam iure nesciunt ex cumque quas perspiciatis id, maxime voluptas delectus itaque ut possimus veniam!',
      price,
      geometry: {
        type: 'Point',
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude,
        ]
      },
      images: [
        {
          url: 'https://res.cloudinary.com/doaax0mtm/image/upload/v1737106676/yelpcampcopy/gwd6rzvy0tsladv0retx.png',
          filename: 'yelpcampcopy/gwd6rzvy0tsladv0retx',

        },
        {
          url: 'https://res.cloudinary.com/doaax0mtm/image/upload/v1737106672/yelpcampcopy/a8phhzfqrqmwgmg1fakg.png',
          filename: 'yelpcampcopy/a8phhzfqrqmwgmg1fakg',
          
        }
      ]
    })
    await camp.save();
  }
}

seedDB().then(() => {
  mongoose.connection.close();
})