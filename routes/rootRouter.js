const express = require("express")
// Router = express.Router()
const passport = require("passport")
const Router = express.Router({ mergeParams: true });
const zxcvbn = require("zxcvbn");

let asyncWrap = require("../utils/asyncWrap.js")

const multer  = require('multer')
const {storage} = require("../cloudConfig.js")
const upload = multer({ storage })

let { isLogIn, saveRedirectUrl, saveReturnTo, isLogged} = require("../middleware.js")

const Resturant = require("../models/Resturant.js")
const Item = require("../models/items.js")
const User = require("../models/users.js")

Router.get("/", async(req, res)=>{
    let resturants = await Resturant.find()

    res.render("home", {resturants})
})



Router.post("/signup",saveRedirectUrl, upload.single("profileImage"),  async(req, res)=>{
      try{
        let user = req.body.user
        let password = user.password
            // let user = req.body.user
            let newUser = new User(user)
            let result = zxcvbn(password);
            if(req.file)
            {
              newUser.profileImage = {
                  url : req.file.path,
                filename : req.file.originalname
              }
            }
            newUser.addresses = []
            for(let address of req.body.addresses)
            {
              newUser.addresses.push(address)
            }
            console.log(newUser)
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

Router.get("/login", isLogged, saveReturnTo,  (req, res)=>{
    // console.log(req.query.redirect)
    // if(req.query.redirect)
    // {
    //   req.session.returnTo = req.query.redirect
    //   console.log(req.session.returnTo)
    // }
    res.render("users/login.ejs")
    })

Router.post('/login', saveRedirectUrl,   
  passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),(req, res)=> {
    req.flash("success", "Login Successful")
     const redirectUrl = res.locals.redirectUrl || "/";
     delete req.session.returnTo;

    res.redirect(redirectUrl);

  }); 

Router.get("/signup", isLogged, saveReturnTo, (req, res)=>{ 
  
  res.render("users/signup.ejs")
})

Router.get("/logout",saveReturnTo,  saveRedirectUrl, (req, res, next) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "You are logged out!!")
          const redirectUrl = res.locals.redirectUrl || "/";
          delete req.session.returnTo;

          res.redirect(redirectUrl);
  })})

Router.get("/search", asyncWrap(async (req, res)=>{
    let location = req.query.location;  
  let resturants = await Resturant.find({location: location});
    // console.log(resturants)
    res.render("randoms/search.ejs", {location , resturants})
}))

Router.get("/filter", asyncWrap(async (req, res)=>{
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
    res.render("resturants/resturants.ejs", {resturants, category, rating})
}))

Router.route("/test")
    .post( upload.single("image"), (req, res)=>{
        console.log("inside testr")
        console.log(req.file)
        res.redirect("/")
    })
   .get( (req, res)=>{
        res.render("randoms/test.ejs")
    }) 

Router.get("/getuser", ((req, res)=>{
  
  console.log(req.user)
}))

Router.get("/demouser", async(req, res)=>{
  let fakeUser = new User({
    email: "user@gmail.com",
    username: "demo"
  })
  let registeredUser = await User.register(fakeUser, "demo@123")
  res.send(registeredUser)
})

Router.get("/showItems", asyncWrap(async (req, res)=>{
  let items = await Item.find({})
  console.log(items)
  res.render("items/showItems.ejs", {items})
}))

Router.get("/session", (req, res)=>{
  console.log(req.session)
})

module.exports = Router

