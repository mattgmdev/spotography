if (process.env.NODE_ENV !== "production") {
  require("dotenv").config()
}

const express = require("express")
const path = require("path")
const mongoose = require("mongoose")
const methodOverride = require("method-override")
const ejsMate = require("ejs-mate")
const session = require("express-session")
const flash = require("connect-flash")
const ExpressError = require("./utils/ExpressError")
const passport = require("passport")
const LocalStrategy = require("passport-local")
const User = require("./models/user")
const helmet = require("helmet")
const mongoSanitize = require("express-mongo-sanitize")
const usersRoutes = require("./routes/users")
const photoplacesRoutes = require("./routes/photoplaces")
const reviewsRoutes = require("./routes/reviews")

const MongoDBStore = require("connect-mongo")(session)

const dbUrl = process.env.DB_URL || "mongodb://localhost:27017/spotography"

mongoose.connect(dbUrl)
const db = mongoose.connection
db.on("error", console.error.bind(console, "connection error:"))
db.once("open", () => {
  console.log("Database connected")
})

const app = express()
app.engine("ejs", ejsMate)
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride("_method"))
app.use("/style", express.static("style"))
app.use(express.static(path.join(__dirname, "public")))

app.use(
  mongoSanitize({
    replaceWith: "_",
  })
)

const secret = process.env.SECRET || "thisshouldbeabettersecret!"

const store = new MongoDBStore({
  url: dbUrl,
  secret,
  touchAfter: 24 * 60 * 60,
})

store.on("error", function (e) {
  console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {
  store,
  name: "session",
  secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
}

app.use(session(sessionConfig))
app.use(flash())

/* app.use(
  helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false })
) */

app.use(helmet({ crossOriginEmbedderPolicy: false }))

const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
]
const styleSrcUrls = [
  "https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css",
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
]
const connectSrcUrls = [
  "https://api.mapbox.com/",
  "https://a.tiles.mapbox.com/",
  "https://b.tiles.mapbox.com/",
  "https://events.mapbox.com/",
]

const fontSrcUrls = []
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["self"],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/dh5z8rk4p/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
        "https://images.unsplash.com/",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
)

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

app.use((req, res, next) => {
  res.locals.currentUser = req.user
  res.locals.success = req.flash("success")
  res.locals.error = req.flash("error")
  next()
})

/* app.get("/fakeUser", async (req, res) => {
  const user = new User({ email: "mattgmdev@gmail.com", username: "mattgmdev" })
  const newUser = await User.register(user, "develoops")
  res.send(newUser)
}) */
app.use("/", usersRoutes)
app.use("/photoplaces", photoplacesRoutes)
app.use("/photoplaces/:id/reviews", reviewsRoutes)

app.get("/", (req, res) => {
  res.render("home")
})

/* CREATE Random place
app.get("/addphotoplace", async (req, res) => {
  const spot = new Photoplace({
    title: "Awesome place",
    description: "Wonderful for long exposure",
  })
  await spot.save()
  res.send(spot)
})
 */

app.all("*", (req, res, next) => {
  next(new ExpressError("Page not found 404", 404))
})

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err
  if (!err.message) error.message = "Something went wrong"
  res.status(statusCode).render("error", { err })
})

const port = process.env.PORT || 3000

app.listen(port, () => {
  console.log(`Serving on port ${port}`)
})
