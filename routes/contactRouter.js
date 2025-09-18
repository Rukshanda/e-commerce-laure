const express = require("express");
const router = express.Router();

const isLoggedIn = require("../middleware/isLoggedIn");
const contactModel = require("../models/contactModel");

// Contact form submission
router.post("/", isLoggedIn, async (req, res) => {
  try {
    const { name, email, msg } = req.body;

    // ✅ Check if the email matches the logged-in user's email
    if (req.user.email !== email) {
      req.flash("error", "You can only send a message using your logged-in email.");
      return res.redirect("/contact");
    }

    // Check if contact with this email already exists (optional)
    let existingContact = await contactModel.findOne({ email });

    // If you want to block duplicate messages
    // if (existingContact) {
    //   req.flash("error", "You have already sent a message with this email.");
    //   return res.redirect("/contact");
    // }

    const newContact = new contactModel({
      name,
      email,
      msg,
    });

    await newContact.save();

    req.flash("success", "Your message has been sent successfully!");
    res.redirect("/");
  } catch (err) {
    console.error("Error saving contact:", err);
    req.flash("error", "Something went wrong. Please try again.");
    res.redirect("/contact");
  }
});

// GET Contact Page
router.get("/", isLoggedIn, async (req, res) => {
  res.render("contact" , {
    error: req.flash("error"),
  });
});

module.exports = router;
