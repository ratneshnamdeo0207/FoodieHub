const express = require("express")
const app = express();
const mongoose = require("mongoose")
const path = require("path")
const methodOverride = require('method-override')
engine = require('ejs-mate');

const Resturant = require("./models/Resturant")
const Review = require("./models/review.js")
const Item = require("./models/items.js")

app.set("views", path.join(__dirname, "views"))
app.engine('ejs', engine);
app.set("view engine", "ejs")

app.use(express.static(path.join(__dirname, "public")))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(methodOverride('_method'))


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

app.get("/resturants", async (req, res)=>{
    let resturants = await Resturant.find({}).populate("reviews");
    console.log(resturants)
    category = "all"
    res.render("resturants.ejs", {resturants, category})
})

app.get("/show/:id", async (req, res)=>{
    let id = req.params.id;
    console.log(id)
    let rest = await Resturant.findById(id).populate("reviews")
    console.log(rest)
    res.render("show.ejs",  { rest})
})

app.get("/filter", async (req, res)=>{
    category = req.query.Category
    rating = req.query.rating
    let resturants = await Resturant.find({Category: category});
    console.log(resturants)
    
    res.render("resturants.ejs", {resturants, category, rating})

})

app.get("/search", async (req, res)=>{
    let location = req.query.location;  
  let resturants = await Resturant.find({location: location});
    console.log(resturants)
    
    res.render("search.ejs", {location , resturants})
    
})

app.post("/show/:id/review", async(req, res)=>{
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
})



