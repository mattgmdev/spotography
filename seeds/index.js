const mongoose = require("mongoose")
const Photoplace = require("../models/photoplace")
const cities = require("./cities")
const {
  descriptors,
  phSubjects,
  phCategories,
  phFocals,
} = require("./seedHelpers")

mongoose.connect("mongodb://localhost:27017/spotography")
const db = mongoose.connection
db.on("error", console.error.bind(console, "connection error:"))
db.once("open", () => {
  console.log("Database connected")
})

const sample = (array) => array[Math.floor(Math.random() * array.length)]

const seedDB = async () => {
  await Photoplace.deleteMany({})
  for (let i = 0; i < 600; i++) {
    const random1000 = Math.floor(Math.random() * 1000)
    const price = Math.floor(Math.random() * 20) + 10
    /*  const num = Math.round(Math.random() * 100) */
    const spot = new Photoplace({
      author: "623dd1ef86491bef9712749b",
      location: `${cities[random1000].city}, ${cities[random1000].country}`,
      title: `${sample(descriptors)}`,
      price,
      geometry: {
        type: "Point",
        coordinates: [cities[random1000].lng, cities[random1000].lat],
      },
      description: `Lorem ipsum dolor sit amet consectetur adipisicing elit. Omnis esse aspernatur nesciunt dignissimos, ea facere delectus aut aliquid dicta iste cumque nostrum consequatur consequuntur optio et mollitia impedit, harum repellendus!`,
      /*  image: `https://source.unsplash.com/collection/10526825/` + num, */
      images: [
        {
          url: "https://res.cloudinary.com/dh5z8rk4p/image/upload/v1648485670/Spotography/muh5f6b3gr8rdhbzwhpi.png",
          filename: "Spotography/muh5f6b3gr8rdhbzwhpi",
        },
        {
          url: "https://res.cloudinary.com/dh5z8rk4p/image/upload/v1648485670/Spotography/muh5f6b3gr8rdhbzwhpi.png",
          filename: "Spotography/muh5f6b3gr8rdhbzwhpi",
        },
      ],
      subject: `${sample(phSubjects)}`,
      category: `${sample(phCategories)}`,
      focal: `${sample(phFocals)}`,
    })
    await spot.save()
  }
}

seedDB().then(() => {
  mongoose.connection.close()
})
