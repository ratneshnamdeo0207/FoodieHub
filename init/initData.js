let data = require("./data.js")
const mongoose = require("mongoose")
const Resturant = require("../models/Resturant")

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/FoodieHub');
//   await mongoose.connect(dburl);  
}
main()
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch(err => console.log(err));

 async function initData() {
    await Resturant.deleteMany({})
    await Resturant.insertMany(data)
}
initData()

