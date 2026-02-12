const mongoose = require('mongoose');
const { Schema } = mongoose;
const Resturant = require("./Resturant")
const itemSchema = new Schema({
    name: {
        type: String,
        required: true
    }, // String is shorthand for {type: String}
    price:  {
        type: Number,
        required: true
    },
   quantity: {
        type: Number,
        required: true
    },
    resturant:{
        type: Schema.Types.ObjectId,
        ref: "Resturant",
    }

})
const Item = mongoose.model("Item", itemSchema)
module.exports = Item