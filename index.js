const express = require("express")
const app = express();
const mongoose = require("mongoose")
const path = require("path")
const methodOverride = require('method-override')
engine = require('ejs-mate');
const session = require('express-session')
const passport = require("passport")
const LocalStrategy = require("passport-local");
const passportLocalMongoose = require('passport-local-mongoose');
const flash = require('connect-flash');

const Resturant = require("./models/Resturant")
const Review = require("./models/review.js")
const Item = require("./models/items.js")
const User = require("./models/users.js")

app.set("views", path.join(__dirname, "views"))
app.engine('ejs', engine);
app.set("view engine", "ejs")

app.use(express.static(path.join(__dirname, "public")))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(methodOverride('_method'))

let asyncWrap = require("./utils/asyncWrap.js")


app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie:{
        expires: Date.now() + 4 * 24 * 60 * 60 * 1000,
        maxAge: 4 * 24 * 60 * 60 * 1000,
    }
}))
// req.user
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


let port = 4000
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/FoodieHub');
//   await mongoose.connect(dburl);  
}
main()
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch(err => console.log(err));

app.get("/", (req, res)=>{
    res.render("home")
})

app.get("/resturants", asyncWrap(async (req, res)=>{
    let resturants = await Resturant.find({}).populate("reviews");
    console.log(resturants)
    category = "all"
    res.render("resturants.ejs", {resturants, category})
}))

app.get("/show/:id", asyncWrap(async (req, res)=>{
    let id = req.params.id;
    console.log(id)
    let rest = await Resturant.findById(id).populate("reviews")
    let items = await Item.find({resturant: id})
    console.log(items)
    console.log(rest)
    res.render("show.ejs",  { rest, items})
}))

app.get("/filter", asyncWrap(async (req, res)=>{
    category = req.query.Category
    rating = req.query.rating
    let resturants = await Resturant.find({Category: category});
    console.log(resturants)
    res.render("resturants.ejs", {resturants, category, rating})
}))

app.get("/search", asyncWrap(async (req, res)=>{
    let location = req.query.location;  
  let resturants = await Resturant.find({location: location});
    console.log(resturants)
    res.render("search.ejs", {location , resturants})
}))

app.post("/show/:id/review", asyncWrap(async(req, res)=>{
  let review = req.body.review;
  let id = req.params.id;
  console.log(id)
  let resturant = await Resturant.findById(id)
  let newReview = new Review(review)
  resturant.reviews.push(newReview)
  await newReview.save()
  await resturant.save()
  console.log("REview accepted")
  res.redirect(`/show/${id}`)
}))

app.get("/signup", (req, res)=>{
  res.render("signup.ejs")
})

app.post("/signup", asyncWrap(async(req, res)=>{
  let {username, password, email} = req.body
  // let user = req.body.user
  let newUser = new User({username: username, email: email})
  let registeredUser = await User.register(newUser, password)
  console.log("New User Registered")
  res.redirect("/")
}))

app.get("/login", (req, res)=>{
  res.render("login.ejs")
})

app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/login' }),(req, res)=> {
    res.redirect('/');
  }); 
  
app.get("/session", (req, res)=>{
  console.log(req.session)
})

app.get("/demouser", async(req, res)=>{
  let fakeUser = new User({
    email: "user@gmail.com",
    username: "demo"
  })
  let registeredUser = await User.register(fakeUser, "demo@123")
  res.send(registeredUser)
})
app.get("/getuser", ((req, res)=>{
  
  console.log(req.user)
}))


app.use((err, req, res, next)=>{
    let {status = 500, message = "Some error occured"} = err;
    console.log("error")
    res.render("error.ejs", {status, message})
})