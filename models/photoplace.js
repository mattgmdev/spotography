const mongoose = require("mongoose")
const Review = require("./review")
const Schema = mongoose.Schema

const ImageSchema = new Schema({
  url: String,
  filename: String,
})

ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200")
})

const opts = { toJSON: { virtuals: true } }

const PhotoplaceSchema = new Schema(
  {
    title: String,
    images: [ImageSchema],
    geometry: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    price: Number,
    description: String,
    location: String,
    focal: String,
    category: String,
    subject: String,
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  opts
)

PhotoplaceSchema.virtual("properties.popUpMarkup").get(function () {
  return `<strong><a class="text-dark" href="/photoplaces/${
    this._id
  }">${this.title}</a></strong>
  <p class="text-dark">${this.description.substring(0, 30)}...</p>`
})

PhotoplaceSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Review.deleteMany({
      _id: {
        $in: doc.reviews,
      },
    })
  }
})

module.exports = mongoose.model("Photoplace", PhotoplaceSchema)
