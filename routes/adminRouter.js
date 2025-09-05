// on this router we will create our admin
const express = require("express");
const router = express.Router();
const adminModel = require("../models/adminModel");
const jwt = require("jsonwebtoken");
const isAdmin = require("../middleware/isAdmin");
const upload = require("../config/multerconfig");
const productsModel = require("../models/productsModel");

// Render login page
router.get("/create", (req, res) => {
  let success = req.flash("success");
  let error = req.flash("error");
  res.render("adminlogin", { success, error });
});

// Admin login -> generate JWT
router.post("/create", async (req, res) => {
  try {
    let { email, psw } = req.body;

    let admin = await adminModel.findOne({ email: email });

    if (!admin || admin.psw !== psw) {
      req.flash("error", "Email or Password incorrect");
      return res.redirect("/admin/create"); // ✅ return immediately
    }

    // Create JWT token
    const token = jwt.sign(
      { id: admin._id, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, { httpOnly: true, secure: false });

    req.flash("success", "Welcome back, Admin!");
    console.log("✅ Admin logged in, token issued");

    // Only render once
    return res.render("addproduct", {
      success: req.flash("success"),
      token,
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "Server error");
    return res.redirect("/admin/create");
  }
});


router.get("/addproduct", isAdmin, (req, res) => {
  res.render("addproduct");
});

router.get("/allproducts", isAdmin, async (req, res) => {
  try {
    let products = await productsModel.find();
    res.render("allproducts", {
      products,
      success: req.flash("success"),
      error: req.flash("error"),
    });
  } catch (error) {
    console.log(error);
    req.flash("error", "Failed to load products");
    res.render("allproducts", { products: [] });
  }
});

router.get("/allusers", isAdmin, (req, res) => {
  res.render("allusers");
});

// Create product (only admin)
router.post(
  "/addproduct",
  isAdmin,
  upload.single("image"),
  async (req, res) => {
    try {
      let { name, price, discount, amount, category, badge } = req.body;
      let product = await productsModel.create({
        image: req.file.buffer,
        name,
        price,
        discount,
        amount,
        category,
        badge,
      });

      console.log("✅ Product Created", product);
      req.flash("success", "Product Created Successfully");
      res.redirect("/admin/allproducts");
    } catch (err) {
      res.send(err.message);
    }
  }
);

module.exports = router;
