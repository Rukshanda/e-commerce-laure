// on this router we will create our admin
const express = require("express");
const router = express.Router();
const adminModel = require("../models/adminModel");
const cloudinary = require("cloudinary").v2;

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
      const { name, price, discount, amount, category, badge } = req.body;

      if (!req.file) {
        req.flash("error", "Please upload an image");
        return res.redirect("/admin/addproduct");
      }

      // ✅ Wrap Cloudinary stream in a Promise
      const cloudinaryUpload = () => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "products",
              resource_type: "image",
            },
            (error, result) => {
              if (error) {
                console.error("Cloudinary Upload Error:", error);
                return reject(error);
              }
              resolve(result);
            }
          );

          // Write file buffer to Cloudinary stream
          stream.end(req.file.buffer);
        });
      };

      // Wait for the upload to complete
      const uploadResult = await cloudinaryUpload();

      // ✅ Save product to database with Cloudinary image URL
      await productsModel.create({
        image: uploadResult.secure_url, // Cloudinary URL
        name,
        price,
        discount,
        amount,
        category,
        badge,
      });

      console.log("✅ Product Created Successfully");
      req.flash("success", "Product Created Successfully");
      return res.redirect("/admin/allproducts");
    } catch (err) {
      console.error("Server Error:", err);
      req.flash("error", "Server error");
      res.redirect("/admin/addproduct");
    }
  }
);

module.exports = router;
