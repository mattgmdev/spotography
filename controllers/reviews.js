const Photoplace = require("../models/photoplace")
const Review = require("../models/review")

module.exports.createReview = async (req, res) => {
  const photoplace = await Photoplace.findById(req.params.id)
  const review = new Review(req.body.review)
  review.author = req.user._id
  photoplace.reviews.push(review)
  await review.save()
  await photoplace.save()
  req.flash("success", "La recensione è stata inserita correttamente!")
  res.redirect(`/photoplaces/${photoplace._id}`)
}

module.exports.deleteReview = async (req, res, next) => {
  const { id, reviewId } = req.params
  await Photoplace.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
  await Review.findByIdAndDelete(reviewId)
  req.flash("success", "La recensione è stata cancellata!")
  res.redirect(`/photoplaces/${id}`)
}
