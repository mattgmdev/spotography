const Photoplace = require("../models/photoplace")
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding")
const mapBoxToken = process.env.MAPBOX_TOKEN
const geocoder = mbxGeocoding({ accessToken: mapBoxToken })
const { cloudinary } = require("../cloudinary")

module.exports.index = async (req, res) => {
  const photoplaces = await Photoplace.find({})
  res.render("photoplaces/index", { photoplaces })
}

module.exports.renderNewForm = (req, res) => {
  res.render("photoplaces/new")
}

module.exports.createPhotoplace = async (req, res, next) => {
  const geoData = await geocoder
    .forwardGeocode({
      query: req.body.photoplace.location,
      limit: 1,
    })
    .send()
  //if (!req.body.photoplace throw new ExpressError("Invalid Photoplace Data", 400)
  const photoplace = new Photoplace(req.body.photoplace)
  photoplace.geometry = geoData.body.features[0].geometry
  photoplace.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }))
  photoplace.author = req.user._id
  await photoplace.save()
  req.flash("success", "Nuovo Spot creato correttamente!")
  res.redirect(`/photoplaces/${photoplace._id}`)
}

module.exports.showPhotoplace = async (req, res) => {
  const photoplace = await Photoplace.findById(req.params.id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("author")
  if (!photoplace) {
    req.flash("error", "Spot non trovato")
    return res.redirect("/photoplaces")
  }
  res.render("photoplaces/show", { photoplace })
}

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params
  const photoplace = await Photoplace.findById(id)
  if (!photoplace) {
    req.flash("error", "Spot non trovato")
    return res.redirect("/photoplaces")
  }
  res.render("photoplaces/edit", { photoplace })
}

module.exports.updatePhotoplace = async (req, res) => {
  const { id } = req.params
  const photoplace = await Photoplace.findByIdAndUpdate(id, {
    ...req.body.photoplace,
  })
  const imgs = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }))
  photoplace.images.push(...imgs)
  await photoplace.save()
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename)
    }
    await photoplace.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    })
  }
  req.flash("success", "Lo Spot è stato aggiornato correttamente!")
  res.redirect(`/photoplaces/${photoplace._id}`)
}

module.exports.deletePhotoplace = async (req, res) => {
  const { id } = req.params
  await Photoplace.findByIdAndDelete(id)
  req.flash("success", "Lo Spot è stato cancellato!")
  res.redirect("/photoplaces")
}
