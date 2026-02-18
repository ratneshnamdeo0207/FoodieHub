const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["user", "admin", "restaurantOwner"],
        default: "user"
    },
    profileImage: {
        url: String,
        filename: String
    },
    addresses: [
        {
            houseNo: String,
            street: String,
            city: String,
            state: String,
            pincode: Number,
            isDefault: Boolean
        }
    ],
    orders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order"
    }]
}, { timestamps: true });



userSchema.plugin(passportLocalMongoose.default || passportLocalMongoose);


module.exports = mongoose.model('User', userSchema);