if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
  }
const express = require("express")
const app = express();
const mongoose = require("mongoose")
const path = require("path")
const methodOverride = require('method-override')
engine = require('ejs-mate');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require("passport")
const LocalStrategy = require("passport-local");
const flash = require('connect-flash');
const multer  = require('multer')
const {storage} = require("./cloudConfig.js")

const dburl = process.env.ATLASDB_URL
const User = require("./models/users.js")

const resturantRouter = require("./routes/resturantRouter.js")
const showRouter = require("./routes/showRouter.js")
const reviewRouter = require("./routes/reviewRouter.js")
const itemRouter = require("./routes/itemRouter.js")
const rootRouter = require("./routes/rootRouter.js")
const userRouter = require("./routes/userRouter.js")

app.set("views", path.join(__dirname, "views"))
app.engine('ejs', engine);
app.set("view engine", "ejs")

app.use(express.static(path.join(__dirname, "public")))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(methodOverride('_method'))

const store = MongoStore.create({
    mongoUrl: process.env.ATLASDB_URL,
    touchAfter: 24 * 3600
});

// const store = MongoStore.create({
//     mongoUrl: process.env.ATLASDB_URL,
//     crypto: {
//         secret: process.env.SECRET
//     },
//     touchAfter: 24 * 3600
// });
const sessionOptions = {
    store,
    secret :process.env.SECRET,
    resave : false,
    saveUninitialized : true,
    cookie:{
        expires: Date.now() + 4 * 24 * 60 * 60 * 1000,
        maxAge: 4 * 24 * 60 * 60 * 1000,
    }
}

app.use(session(sessionOptions));



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
  await mongoose.connect(dburl);
//   await mongoose.connect(dburl);  
}
main()
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch(err => console.log(err));



app.use("/resturants", resturantRouter)
app.use("/show/:id", showRouter)
app.use("/show/:id/review", reviewRouter)
app.use("/show/:id/items", itemRouter)
app.use("/user", userRouter)
app.use("/", rootRouter)
  
app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err);   // VERY IMPORTANT
    }
    let { status = 500, message = "Some error occurred" } = err;
    console.log(err);
    res.status(status).render("randoms/error.ejs", { status, message });
});
let port = 4000
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});