const express = require("express")
const app = express();
const mongoose = require('mongoose');
const path = require("path")
const methodOverride = require('method-override')
engine = require('ejs-mate'),

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

app.get("/", (req, res)=>{
    res.render("home")
})


