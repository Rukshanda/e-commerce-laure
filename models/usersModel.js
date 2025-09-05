const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  psw: {
    type: String,
    required: true,
  },
  cart: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product", 
      },
      quantity: {
        type: Number,
        default: 1,
      },
    },
  ],
  orders: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",  
      },
      quantity: {
        type: Number
      },
    },
  ],
    placeOrders: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
      },
      quantity: {
        type: Number,
        default: 1,
      },
      orderedAt: {
        type: Date,
        default: Date.now,  
      },
    },
  ],
  contact: {
    type: Number,
  },
  address: {
    type: String,
  },
});

module.exports = mongoose.model("user", userSchema);
