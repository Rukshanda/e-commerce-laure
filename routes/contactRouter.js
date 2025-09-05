const express = require("express");
const router = express.Router();

const isLoggedIn = require("../middleware/isLoggedIn");
const contactModel = require("../models/contactModel");

// Contact form submission
router.post("/", isLoggedIn, async (req, res) => {
  try {
    const { name, email, msg } = req.body;

    
    let existingContact = await contactModel.findOne({ email });

  

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

router.get("/" , async(req, res)=> {
  res.render("contact")
})

module.exports = router;
