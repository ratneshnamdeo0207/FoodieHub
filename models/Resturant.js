const mongoose = require('mongoose');
const { Schema } = mongoose;
const Review = require("./review.js")
const Item = require("./items.js")
const User = require("./users.js")
const resturantSchema = new Schema({
  name: String, // String is shorthand for {type: String}
  location: String,
  description: String,
   openingHour: String,
   closingHour: String,
   startingPrice: Number,
   endingPrice: Number,
   rating: Number,
   images: [{
        url: String,
        filename: String
    }],
   owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
   Category : {
    type: String,
    enum: ['North Indian', 'South Indian', 'Chinese', 'Fast Food', 'Desserts', 'Beverages']
   },
   reviews :[
        {
        type: Schema.Types.ObjectId,
        ref: "Review",
    }
],
   
})

resturantSchema.post("findOneAndDelete", async (resturant)=>{
    if(resturant.reviews){
        await Review.deleteMany({_id: {$in: resturant.reviews}})
    }
    
    await Item.deleteMany({resturant: resturant._id})
})
const Resturant = mongoose.model("Resturant", resturantSchema)
module.exports = Resturant