// so what we need here for products
// hmmm
// name , price , discount , amount , cateogry , badge

const mongoose = require("mongoose");

const productSchema = mongoose.Schema({
    name: String,
    price: Number,
   discount: {
    type: Number,
    default: 0
   },
    amount: Number,
    category: String,
    badge: String
})

module.exports = mongoose.model("product" , productSchema)