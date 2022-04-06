const express = require("express")
const router = express.Router({ mergeParams: true })
const Photoplace = require("../models/photoplace")
const Review = require("../models/review")
const catchAsync = require("../utils/CatchAsync")
const { ValidateReview, isLoggedIn, isReviewAuthor } = require("../middleware")
const reviews = require("../controllers/reviews")

router.post("/", isLoggedIn, ValidateReview, catchAsync(reviews.createReview))

router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  catchAsync(reviews.deleteReview)
)

module.exports = router
