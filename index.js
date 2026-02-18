if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
  }
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

const multer  = require('multer')
const {storage} = require("./cloudConfig.js")
const upload = multer({ storage })

const Resturant = require("./models/Resturant")
const Review = require("./models/review.js")
const Item = require("./models/items.js")
const User = require("./models/users.js")

const resturantRouter = require("./routes/resturantRouter.js")
const showRouter = require("./routes/showRouter.js")
const reviewRouter = require("./routes/reviewRouter.js")

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

app.use("/resturants", resturantRouter)
app.use("/show/:id", showRouter)
app.use("/show/:id/review", reviewRouter)



    
    app.post("/show/:id/item", isLogIn, isOwner, upload.single("image") ,asyncWrap(async(req, res)=>{
        let id = req.params.id
        let item = req.body.item
        let resturant = await Resturant.findById(id)
        let newItem = new Item(item)
        newItem.resturant = resturant
        newItem.image = {
          url : req.file.path,
          filename : req.file.originalname
        };  
        newItem = await newItem.save()
        // console.log(newItem)
    
        res.redirect(`/show/${id}`)
    
    }))
    
    app.put("/show/:id/items/:itemId", asyncWrap(async(req, res)=>{
      let {id, itemId} = req.params
      // console.log(id)
  // console.log(itemId)
  // console.log(req.body.item)
  
  let item = await Item.findOneAndUpdate({_id: itemId}, req.body.item, {returnDocument: "after", runValidator: true})
  
  console.log(item)
  
  res.redirect(`/show/${id}`)
}))
app.delete("/show/:id/items/:itemId",  asyncWrap(async(req, res)=>{
  let {id, itemId} = req.params
  // console.log(id)
  // console.log(itemId)
  // console.log(req.body.item)
  
  
  await Item.findByIdAndDelete(itemId)
  
  res.redirect(`/show/${id}`)
}))




app.get("/showItems", asyncWrap(async (req, res)=>{
  let items = await Item.find({})
  console.log(items)
  res.render("showItems.ejs", {items})
}))

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


app.get("/test", (req, res)=>{
  res.render("test.ejs")
})

app.post("/test", upload.single("image"), (req, res)=>{
  console.log("inside testr")
  console.log(req.file)
  res.redirect("/")
})
app.use((err, req, res, next)=>{
    let {status = 500, message = "Some error occured"} = err;
    console.log("error")
    res.render("error.ejs", {status, message})
})

let port = 4000
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});