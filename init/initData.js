let resturants = require("./resturants.js")
let items = require("./items.js")
let reviews = require("./reviews.js")

const mongoose = require("mongoose")

const Resturant = require("../models/Resturant")
const Item = require("../models/items.js")
const Review = require("../models/review.js")
const User = require("../models/users.js")

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
    await Review.deleteMany({})
    await Item.deleteMany({})
// ObjectId('698f14a9b1433c495119b388'),

    const user = await User.findById("698f14a9b1433c495119b388");
    if (!user) {
      console.error("User not found. Please create the user first.");
      return;
    }

    let temp = 0, temp1 = 0;
    for(let i = 0;i < 5;i++)
    {
            
      let newReview1 = new Review(reviews[temp++])
      newReview1.author = user;
      await newReview1.save()

      let newReview2 = new Review(reviews[temp++])
      newReview2.author= user;
      await newReview2.save()
      
      let newResturant = new Resturant(resturants[i])
      newResturant.reviews.push(newReview1)
      newResturant.reviews.push(newReview2)
      newResturant.owner = user

      await newResturant.save()
      
      let newItem1 = new Item(items[temp1++])
      newItem1.resturant = newResturant
      await newItem1.save()

      let newItem2 = new Item(items[temp1++])
      newItem2.resturant = newResturant
      await newItem2.save()
      
      
    }
    console.log("Data saved successfull")


}
initData()

