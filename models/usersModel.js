// so there will be users right
// what user model needs
// name , email , psw , cart data and orders data , contact number , address

const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    name: String,
    email: String,
    psw: String,
    cart: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product"
    },
    orders: {
        type: Array,
        default:[]
    },
    contact: Number,
    address: String
})

module.exports = mongoose.model("user" , userSchema)