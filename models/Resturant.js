const mongoose = require('mongoose');
const { Schema } = mongoose;

const resturantSchema = new Schema({
  name: String, // String is shorthand for {type: String}
  location: String,
  description: String,
   openingHour: String,
   closingHour: String,
   startingPrice: Number,
   endingPrice: Number,
   Category : {
    type: String,
    enum: ['North Indian', 'South Indian', 'Chinese', 'Fast Food', 'Desserts', 'Beverages']
   }
})
const Resturant = mongoose.model("Resturant", resturantSchema)
module.exports = Resturant