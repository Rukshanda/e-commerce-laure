// -- what we will need
// we need to register user
// we need to login user
// we need to logout user

const usersModel = require("../models/usersModel");
const bcrypt = require("bcrypt");
const { generatedToken } = require("../utils/generatedToken");
const cookie = require("cookie-parser");

// REGISTER USER

module.exports.registerUser = async (req, res) => {
  try {
    let { name, email, psw } = req.body;

    let user = await usersModel.findOne({ email: email });
    if (user) {
      req.flash("error", "You already have an account, please login");
      return res.redirect("/users/login");
    }

    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(psw, salt, async (err, hash) => {
        if (err) return res.send(err.message);
        else {
          let user = await usersModel.create({
            name,
            email,
            psw: hash,
          });

          let token = generatedToken(user);
          res.cookie("token", token);

          req.flash("success", "Account created successfully, please login");
          res.redirect("/users/login");
        }
      });
    });
  } catch (error) {
    console.log(error.message);
    req.flash("error", "Something went wrong, try again");
    res.redirect("/users/signup");
  }
};

// Login USer

module.exports.loginUser = async (req, res) => {
  let { email, psw } = req.body;
  let user = await usersModel.findOne({ email: email });
  if (!user) {
    req.flash("error", "Email or Password incorrect");
    return res.redirect("/users/login");
  }

  bcrypt.compare(psw, user.psw, (err, result) => {
    
    if (result) {
      let token = generatedToken(user);
      res.cookie("token", token);
      res.redirect("/products");
    } else {
      req.flash("error", "Email or Password incorrect");
      return res.redirect("/");
    }
  });
};

module.exports.logout = function (req, res) {
  res.cookie("token", "");
  res.redirect("/");
};
