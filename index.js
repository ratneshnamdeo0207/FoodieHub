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
const zxcvbn = require("zxcvbn");

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
let {saveRedirectUrl, saveReturnTo, isLogIn, isLogged, isReviewAuthor, isOwner} = require("./middleware.js")

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


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(flash());

app.use((req, res, next)=>{
  res.locals.success = req.flash("success")
  res.locals.error = req.flash("error")
  res.locals.currUser = req.user || null; 
  res.locals.currentPath  = req.path 
  next();
})

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
    let resturants = await Resturant.find({});
    // console.log(resturants)
    category = "all"
    rating = "all"
    res.render("resturants.ejs", {resturants, category, rating})
}))

app.get("/show/:id", asyncWrap(async (req, res)=>{
    let id = req.params.id;
    // console.log(id)
    // resturant - owner (ref)
    //           - reviews (array of ref) - author (ref) - ref
    let rest = await Resturant
    .findById(id)
    .populate("owner")
    .populate({path: "reviews", populate: {path: "author"}});
   
    // console.log(rest)
    let items = await Item.find({resturant: id})
    // console.log(items)
    // console.log(rest)
    res.render("show.ejs",  { rest, items})
}))

app.get("/resturant/new", (req, res)=>{
  res.render("new-resturant.ejs")
})
app.get("/filter", asyncWrap(async (req, res)=>{
    category = req.query.Category
    rating = req.query.rating
    // console.log("category:", category)
    // console.log("rating: ",  rating)

    let resturant;
    // let resturants = await Resturant.find({Category: category});
    if(category != ""){
    resturants = await Resturant.find({Category: category, rating : {$gt : rating}});
  }
  else{
     resturants = await Resturant.find({rating : {$gt : rating}});
  }

    // console.log(resturants)
    res.render("resturants.ejs", {resturants, category, rating})
}))

app.get("/search", asyncWrap(async (req, res)=>{
    let location = req.query.location;  
  let resturants = await Resturant.find({location: location});
    // console.log(resturants)
    res.render("search.ejs", {location , resturants})
}))

app.post("/show/:id/review", isLogIn,  asyncWrap(async(req, res)=>{
  let review = req.body.review;
  let id = req.params.id;
  // console.log(id)
  let resturant = await Resturant.findById(id).populate("reviews")

  let newReview = new Review(review)
  newReview.author = req.user;
  resturant.reviews.push(newReview)
 
  await newReview.save()
  // await resturant.save()
  
  let avg = 0, total = 0;
  if(resturant.reviews)
  {
    for(let r of resturant.reviews)
    {
      total += r.rating
    }
  }
   avg = total/resturant.reviews.length
  //  console.log(avg)
   avg = avg.toFixed(1)
   resturant.rating = avg
   await resturant.save()
  //  console.log(resturant)
  // console.log("REview accepted")
  req.flash("success", "Thanks! for your review")
  res.redirect(`/show/${id}`)
}))

app.put("/show/:id/review/:reviewId",isLogIn, isReviewAuthor ,asyncWrap( async(req, res)=>{
  let {id, reviewId} = req.params
  // console.log(id)
  // console.log(reviewId)
  let review = req.body.review;
  // console.log(review)
  let updatedReview = await Review.findOneAndUpdate({_id : reviewId}, req.body.review, {returnDocument: "after", runValidator: true})
  // console.log(updatedReview)
  res.redirect(`/show/${id}`)

}))

app.delete("/show/:id/review/:reviewId",isLogIn, asyncWrap( async(req, res)=>{
  let {id, reviewId} = req.params
  // console.log(id)
  // console.log(reviewId)
  // whenever we try to delete a review then first we must make sure that its ref must be removed from the array of reviews that is stored inside the resturant and for doing that we use pull operate to remove the ref from the array of review that is stored inside the resturant
  let resturant = await Resturant.findByIdAndUpdate(id, {$pull :{ reviews: reviewId}})

  await Review.findByIdAndDelete(reviewId)

  // console.log("Review Deleted Successfully")
  req.flash("success", "Review Deleted Successfully")
  res.redirect(`/show/${id}`)

}))

app.get("/signup", isLogged, saveReturnTo, (req, res)=>{ 
  
  res.render("signup.ejs")
})

app.post("/signup",saveRedirectUrl,  async(req, res)=>{
  try{
      let {username, password, email} = req.body
        // let user = req.body.user
        let newUser = new User({username: username, email: email})
        let result = zxcvbn(password);

        if (result.score >= 2) { // 0=weak, 4=strong
            let registeredUser = await User.register(newUser, password);
            console.log(registeredUser);
            
            req.login(registeredUser, (err) => {
                if (err) {
                    return next(err);
                }
               req.flash("success", "Welcome to FoodieHub")
                const redirectUrl = res.locals.redirectUrl || "/";
                delete req.session.returnTo;

                res.redirect(redirectUrl);
            })} 
            else {
            console.log("❌ Weak password");
            req.flash("error", "Weak Password")
            res.redirect("/signup")
        }
  }catch(err)
  {
      req.flash("error", err.message)
      res.redirect("/signup")
  }})

app.get("/login", isLogged, saveReturnTo,  (req, res)=>{
  // console.log(req.query.redirect)
  // if(req.query.redirect)
  // {
  //   req.session.returnTo = req.query.redirect
  //   console.log(req.session.returnTo)
  // }
  res.render("login.ejs")
  
})

app.post('/login', saveRedirectUrl,   
  passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),(req, res)=> {
    req.flash("success", "Login Successful")
     const redirectUrl = res.locals.redirectUrl || "/";
     delete req.session.returnTo;

    res.redirect(redirectUrl);

  }); 
app.get("/logout",saveReturnTo,  saveRedirectUrl, (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "You are logged out!!")
          const redirectUrl = res.locals.redirectUrl || "/";
          delete req.session.returnTo;

          res.redirect(redirectUrl);
  })})

  app.get("/show/:id/edit", isLogIn, async (req, res) => {
    let id = req.params.id;
    // console.log(id)
    let rest = await Resturant.findById(id)
    // console.log(rest)
    res.render("edit.ejs", {rest});
  })

  app.put("/show/:id/edit", async (req, res)=>{
    let resturant = req.body.resturant;
    // console.log(resturant)
    let id = req.params.id;
    // console.log(id)
    let rest = await Resturant.findById(id)
    let updatedResturant = await Resturant.findOneAndUpdate({_id: id}, req.body.resturant, {returnDocument: "after", runValidator: true})
    // console.log(updatedResturant)
    // console.log("Updation Successful")
    res.redirect(`/show/${id}`)

  })
  app.delete("/show/:id", isLogIn, isOwner, async (req, res)=>{
    let id = req.params.id;
   console.log(id)
   await Resturant.findByIdAndDelete(id)
    req.flash("success", "Resturant deleted successfully")
    res.redirect(`/resturants`)

  })


  
   
  
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