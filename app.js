if (process.env.NODE_ENV !== "production") {
  require('dotenv').config();
}



console.log(process.env.SECRET);  

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const Joi = require('joi');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const { campgroundSchema } = require('./schemas');
const helmet=require('helmet');

const mongoSanitize=require('express-mongo-sanitize');

const usersRoutes = require('./routes/users');
const campgroundsRoutes = require('./routes/campgrounds');
const reviewsRoutes = require('./routes/reviews');
const MongoDBStore=require("connect-mongo")(session);
const dbUrl='mongodb://127.0.0.1:27017/yelp-camp';

mongoose.set('strictQuery', true);
mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  // useCreateIndex:true, it  is no longer supported in newer version so no need to write it
  useUnifiedTopology: true,
  // useFindAndModify:false
})



const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize({
  replaceWith:'_ '
}));

const store=new MongoDBStore({
  url:dbUrl,
  secret:"thisshouldbeabettersecret!",
  touchAfter:24*60*60
});
store.on("error",function(e){
  console.log("session store error",e)
})

const sessionConfig = {
  store,
  name:'session',
  secret: 'thisshouldbeabettersecret!',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}
app.use(session(sessionConfig));
app.use(flash());
// app.use(helmet());

// const scriptSrcUrls = [
//   "https://stackpath.bootstrapcdn.com/",
//   // "https://api.tiles.mapbox.com/",
//   // "https://api.mapbox.com/",
//   "https://kit.fontawesome.com/",
//   "https://cdnjs.cloudflare.com/",
//   "https://cdn.jsdelivr.net",
//   "https://cdn.maptiler.com/", // add this
// ];
// const styleSrcUrls = [
//   "https://kit-free.fontawesome.com/",
//   "https://stackpath.bootstrapcdn.com/",
//   // "https://api.mapbox.com/",
//   // "https://api.tiles.mapbox.com/",
//   "https://fonts.googleapis.com/",
//   "https://use.fontawesome.com/",
//   "https://cdn.jsdelivr.net",
//   "https://cdn.maptiler.com/", // add this
// ];
// const connectSrcUrls = [
//   // "https://api.mapbox.com/",
//   // "https://a.tiles.mapbox.com/",
//   // "https://b.tiles.mapbox.com/",
//   // "https://events.mapbox.com/",
//   "https://api.maptiler.com/", // add this
// ];
// const fontSrcUrls=[];
// app.use(
//   helmet.contentSecurityPolicy({
//       directives: {
//         defaultSrc: [],
//         connectsrc:["'self'",...connectSrcUrls],
//         scriptSrc: ["'unsafe-inline'","'self'", ...scriptSrcUrls],
//         styleSrc:["'unsafe-inline'","'self'", ...styleSrcUrls],
//         workerSrc:["'self'","blob:"],
//         objectSrc: [],
//         imgSrc:[
//           "'self'",
//           "blob:",
//           "data:",
//           "https://res.cloudinary.com/doaax0mtm/",
//           "https://images.unsplash.com/",
//           "https://api.maptiler.com/",
//         ],
//         fontSrc:["'self'",...fontSrcUrls]
//       },
//     },
//   ),
// );

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  console.log(req.query);
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
})

app.get('/fakeUser', async (req, res) => {
  const user = new User({ email: 'sihag@gmail.com', username: 'pranjal' })
  const newUser = await User.register(user, 'chicken');
  res.send(newUser);
})


app.use('/', usersRoutes)
app.use('/campgrounds', campgroundsRoutes)
app.use('/campgrounds/:id/reviews', reviewsRoutes)

app.get('/', (req, res) => {
  res.render('home')
});


app.all('*', (req, res, next) => {
  next(new ExpressError('page not found', 404))
})

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = 'oh no something went wrong';
  res.status(statusCode).render('error', { err });

})

app.listen(3001, () => {
  console.log('serving on port 3000');
})

