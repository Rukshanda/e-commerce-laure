const jwt = require("jsonwebtoken");
const usersModel = require("../models/usersModel");

module.exports = async function (req, res, next) {
  try {
    // 1️⃣ Check if token exists
    const token = req.cookies.token;
    if (!token) {
      req.flash("error", "You need to login first");
      return res.redirect("/users/login"); // ✅ return prevents multiple headers
    }

    // 2️⃣ Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      req.flash("error", "Invalid token, please log in again");
      return res.redirect("/users/login"); // ✅ return prevents multiple headers
    }

    // 3️⃣ Find the user
    let user = await usersModel.findOne({ email: decoded.email }).select("-psw");

    if (!user) {
      req.flash("error", "Invalid user, please log in again");
      return res.redirect("/users/login"); // ✅ return prevents multiple headers
    }

    // 4️⃣ Attach user to request and continue
    req.user = user;
    next();
  } catch (error) {
    console.error("Error in isLoggedIn middleware:", error);
    req.flash("error", "Something went wrong, please log in again");
    return res.redirect("/"); // ✅ return prevents multiple headers
  }
};
