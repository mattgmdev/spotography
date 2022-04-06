const express = require("express")
const router = express.Router()
const catchAsync = require("../utils/CatchAsync")
const photoplaces = require("../controllers/photoplaces")
const { isLoggedIn, isAuthor, validatePhotoplace } = require("../middleware")
const multer = require("multer")
const { storage } = require("../cloudinary")
const upload = multer({ storage })

router
  .route("/")
  .get(catchAsync(photoplaces.index))
  .post(
    isLoggedIn,
    upload.array("image"),
    validatePhotoplace,
    catchAsync(photoplaces.createPhotoplace)
  )
router.get("/new", isLoggedIn, photoplaces.renderNewForm)

router
  .route("/:id")
  .get(catchAsync(photoplaces.showPhotoplace))
  .put(
    isLoggedIn,
    isAuthor,
    upload.array("image"),
    validatePhotoplace,
    catchAsync(photoplaces.updatePhotoplace)
  )
  .delete(isLoggedIn, isAuthor, catchAsync(photoplaces.deletePhotoplace))

router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(photoplaces.renderEditForm)
)

module.exports = router
