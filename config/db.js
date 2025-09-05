const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MangoDB working");
  } catch (error) {
    console.log("Some Error occured");
  }
};

module.exports = connectDB;
