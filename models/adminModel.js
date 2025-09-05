// -- we need model for ownere
// username - email , password .. so we will set them orignaliy like pre defined
// user have the abality to add products
// means basically creating the products 
//

const mongoose = require("mongoose");

const adminSchema = mongoose.Schema({
    email: String,
    psw: String,
    products:{
        type: Array,
        default:[]
    }
});

module.exports = mongoose.model("admin", adminSchema);