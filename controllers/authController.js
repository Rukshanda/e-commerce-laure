const usersModel = require("../models/usersModel");
const bcrypt = require("bcrypt");
const { generatedToken } = require("../utils/generatedToken");

// ==================== REGISTER USER ====================
module.exports.registerUser = async (req, res) => {
  try {
    const { name, email, psw } = req.body;

    // Check if the user already exists
    const existingUser = await usersModel.findOne({ email });
    if (existingUser) {
      req.flash("error", "You already have an account, please login");
      return res.redirect("/users/login");
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(psw, salt);

    // Create new user
    await usersModel.create({
      name,
      email,
      psw: hashedPassword,
    });

    // Do NOT generate token here
    req.flash("success", "Account created successfully, please login");
    res.redirect("/users/login");
  } catch (error) {
    console.error(error.message);
    req.flash("error", "Something went wrong, try again");
    res.redirect("/users/signup");
  }
};

// ==================== LOGIN USER ====================
module.exports.loginUser = async (req, res) => {
  try {
    const { email, psw } = req.body;

    // Check if user exists
    const user = await usersModel.findOne({ email });
    if (!user) {
      req.flash("error", "Email or Password incorrect");
      return res.redirect("/users/login");
    }

    // Compare password
    const isMatch = await bcrypt.compare(psw, user.psw);
    if (!isMatch) {
      req.flash("error", "Email or Password incorrect");
      return res.redirect("/users/login");
    }

    // Generate token on login
    const token = generatedToken(user);
    res.cookie("token", token, {
      httpOnly: true,      // helps protect from XSS attacks
      secure: process.env.NODE_ENV === "production", // only secure in prod
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    req.flash("success", "Logged in successfully");
    res.redirect("/products");
  } catch (error) {
    console.error(error.message);
    req.flash("error", "Something went wrong, try again");
    res.redirect("/users/login");
  }
};

// ==================== LOGOUT USER ====================
module.exports.logout = (req, res) => {
  res.clearCookie("token");
  req.flash("loginSuccess", "Logged out successfully");
  res.redirect("/users/login");
};
