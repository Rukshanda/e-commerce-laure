const express = require("express");
const router = express.Router();
const { registerUser, loginUser, logout } = require("../controllers/authController");

// GET Login Page
router.get("/login", (req, res) => {
  res.render("login", { 
    error: req.flash("error") // passing flash error
  });
});

// POST Login
router.post("/login", loginUser);

// GET Signup Page
router.get("/register", (req, res) => {
  res.render("signup");
});

// POST Signup
router.post("/register", registerUser);

// Logout
router.get("/logout", logout);

module.exports = router;
