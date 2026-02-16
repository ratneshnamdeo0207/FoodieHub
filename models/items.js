const mongoose = require('mongoose');
const { Schema } = mongoose;
const Resturant = require("./Resturant")
const itemSchema = new Schema({
    name: String,
    price: Number,
    description: String,
    image: {
        url: String,
        filename: String
    },
    resturant:{
        type: Schema.Types.ObjectId,
        ref: "Resturant",
    }

})
const Item = mongoose.model("Item", itemSchema)
module.exports = Item