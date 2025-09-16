const productsModel = require("../models/productsModel");
const usersModel = require("../models/usersModel");
const { generatedToken } = require("../utils/generatedToken");
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const mongoose = require("mongoose");
const isLoggedIn = require("../middleware/isLoggedIn");

//on the index page

router.get("/", (req, res) => {
  const success = req.flash("success"); // Flash for success
  const error = req.flash("error"); // Flash for error

  res.render("index", {
    loggedin: res.locals.loggedin,
    success,
    error,
  });
});

// Contact Us

//for logout
router.get("/logout", (req, res) => {
  res.render("index");
});

//showing products
router.get("/products", async (req, res) => {
  try {
    const { badge, category } = req.query;
    let filter = {};

    if (badge) filter.badge = badge;
    if (category) filter.category = category;

    const products = await productsModel.find(filter);

    // ✅ Pass success and error flash messages to the view
    res.render("products", {
      products,
      success: req.flash("success"), // for success messages
      error: req.flash("error"), // for error messages
    });
  } catch (err) {
    console.error("Error fetching products:", err);
    req.flash("error", "Failed to fetch products");
    res.redirect("/products"); // Redirect with error message
  }
});

router.get("/cart", isLoggedIn, async (req, res) => {
  let user = await usersModel
    .findOne({ email: req.user.email })
    .populate("cart.product");
  console.log(user);
  res.render("cart", { user });
});
// User Profile
router.get("/profile", isLoggedIn, async (req, res) => {
  try {
    let user = await usersModel
      .findOne({ email: req.user.email })
      .populate([
        { path: "cart.product" },
        { path: "orders.product" },
        { path: "placeOrders.product" },
      ]);

    // ✅ Retrieve success message
    const success = req.flash("success");

    console.log("User Profile:", user);

    // ✅ Pass it to the template
    res.render("userprofile", { user, success });
  } catch (err) {
    console.error("Error loading profile:", err);
    res.status(500).send("Server Error");
  }
});

// Product Details
router.get("/productdetials/:id", isLoggedIn, async (req, res) => {
  try {
    let product = await productsModel.findById(req.params.id);
    if (!product) {
      return res.status(404).send("Product not found");
    }
    console.log(product);
    res.render("productdetail", { product });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});
// Checkout
router.get("/checkout", isLoggedIn, async (req, res) => {
  try {
    const user = await usersModel
      .findOne({ email: req.user.email })
      .populate("orders.product"); // populate orders

    if (!user) {
      req.flash("error", "User not found");
      return res.redirect("/cart");
    }

    // Clean formatted orders
    const orderItems = user.orders
      .filter((order) => order.product) // only valid products
      .map((order) => ({
        id: order.product._id,
        name: order.product.name,
        image: order.product.image,
        price: order.product.price,
        discount: order.product.discount || 0,
        quantity: order.quantity,
        total:
          order.quantity *
          ((order.product.price || 0) - (order.product.discount || 0)),
      }));

    // ✅ Pass flash messages to checkout view
    res.render("checkout", {
      user,
      orderItems,
      success: req.flash("success"),
      error: req.flash("error"),
    });
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong while loading checkout.");
    res.redirect("/cart");
  }
});

// TO checkout all the products here is the functionality

router.get("/checkout-all", isLoggedIn, async (req, res) => {
  try {
    const user = await usersModel
      .findOne({ email: req.user.email })
      .populate("cart.product");

    if (!user) {
      req.flash("error", "User not found");
      return res.redirect("/");
    }

    if (user.cart.length === 0) {
      req.flash("error", "Your cart is empty");
      return res.redirect("/cart"); // Redirect back to cart
    }

    // Push all cart items into orders
    user.cart.forEach((item) => {
      user.orders.push({
        product: item.product._id,
        quantity: item.quantity,
      });
    });

    // Clear cart after moving to orders
    user.cart = [];

    await user.save();

    req.flash("success", "All items moved to checkout");
    res.redirect("/checkout");
  } catch (err) {
    console.error("Error moving cart items to checkout:", err);
    req.flash("error", "Something went wrong");
    res.redirect("/cart");
  }
});

//addToCart functionality
router.get("/addToCart/:id", isLoggedIn, async (req, res) => {
  try {
    let product = await productsModel.findById(req.params.id);

    if (!product) {
      return res.status(404).send("Product not found");
    }

    if (product.amount <= 0) {
      return res.status(400).send("Product is out of stock");
    }

    product.amount -= 1;
    await product.save();

    let user = await usersModel.findOne({ email: req.user.email });

    const existingItem = user.cart.find(
      (item) => item.product.toString() === product._id.toString()
    );

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      user.cart.push({ product: product._id, quantity: 1 });
    }

    await user.save();

    console.log("Product added to cart and stock decreased");
    res.redirect("/cart");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// OrderNow functionality
router.get("/ordernow/:id", isLoggedIn, async (req, res) => {
  try {
    const productId = req.params.id; // ✅ Get product id from URL

    // 1️⃣ Find the logged-in user
    const user = await usersModel.findOne({ email: req.user.email });
    if (!user) {
      req.flash("error", "User not found");
      return res.redirect("/");
    }

    // 2️⃣ Find the product using the productId
    const product = await productsModel.findById(productId);
    if (!product) {
      req.flash("error", "Product not found");
      return res.redirect("/");
    }

    // 3️⃣ Find the product quantity in cart
    const cartItem = user.cart.find(
      (item) => item.product.toString() === productId
    );
    const quantity = cartItem ? cartItem.quantity : 1;

    // 4️⃣ Push the product into orders array
    user.orders.push({
      product: product._id,
      quantity: quantity, // Use quantity from cart if available
    });

    // 5️⃣ Remove the product from the cart
    user.cart = user.cart.filter(
      (item) => item.product.toString() !== productId
    );

    // 6️⃣ Save the updated user
    await user.save();

    console.log(
      `Product "${product.name}" moved to orders and removed from cart`
    );
    req.flash("success", "Ordered successfully");
    res.redirect("/checkout");
  } catch (err) {
    console.error("Error placing order:", err);
    req.flash("error", "Something went wrong");
    res.redirect("/");
  }
});

// Delete Functionality
router.get("/cart/remove/:productId", isLoggedIn, async (req, res) => {
  try {
    const productId = req.params.productId;

    const result = await usersModel.findOneAndUpdate(
      { email: req.user.email },
      { $pull: { cart: { product: productId } } },
      { new: true }
    );

    res.redirect("/cart");
  } catch (err) {
    console.error("Error removing product:", err);
    res.status(500).send("Server error");
  }
});

// Delete Functionality for Orders
router.get("/orders/remove/:productId", isLoggedIn, async (req, res) => {
  try {
    const productId = req.params.productId;

    await usersModel.findOneAndUpdate(
      { email: req.user.email },
      { $pull: { orders: { product: productId } } }, // ✅ correct structure
      { new: true }
    );

    req.flash("success", "Item removed from checkout");
    res.redirect("/checkout");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// INcrement Functionality
router.get("/cart/inc/:id", isLoggedIn, async (req, res) => {
  try {
    const user = await usersModel.findOne({ email: req.user.email });
    const product = await productsModel.findById(req.params.id);

    if (product.amount <= 0) {
      return res.status(400).send("Product is out of stock");
    }

    const cartItem = user.cart.find(
      (item) => item.product.toString() === req.params.id
    );

    if (cartItem) {
      cartItem.quantity += 1;
      product.amount -= 1;
      await product.save();
      await user.save();
    }

    res.redirect("/cart");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Decrement Functionality
router.get("/cart/dec/:id", isLoggedIn, async (req, res) => {
  try {
    const user = await usersModel.findOne({ email: req.user.email });
    const product = await productsModel.findById(req.params.id);

    if (!product) {
      return res.status(404).send("Product not found");
    }

    // Find the item in the user's cart
    const cartItem = user.cart.find(
      (item) => item.product.toString() === req.params.id
    );

    if (!cartItem) {
      return res.status(404).send("Item not found in cart");
    }

    // Decrease quantity
    cartItem.quantity -= 1;

    // Increase product stock
    product.amount += 1;

    // If quantity is now 0 or less, remove it from the cart
    if (cartItem.quantity <= 0) {
      user.cart = user.cart.filter(
        (item) => item.product.toString() !== req.params.id
      );
    }

    await product.save();
    await user.save();

    res.redirect("/cart");
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Place Your Order Functionality
// Place Your Order Functionality
router.post("/placeorder", isLoggedIn, async (req, res) => {
  try {
    const { email, contact, address, paymentMethod } = req.body;

    // ✅ Check if logged-in user exists
    const user = await usersModel
      .findOne({ email: req.user.email })
      .populate("orders.product");

    if (!user) {
      req.flash("error", "User not found");
      return res.redirect("/checkout");
    }

    // ✅ Validate email matches logged-in user
    if (email !== req.user.email) {
      req.flash("error", "The email you entered does not match your account");
      return res.redirect("/checkout");
    }

    // ✅ Validate phone and address
    if (!contact || !address) {
      req.flash("error", "Phone and Address are required to place the order");
      return res.redirect("/checkout");
    }

    // ✅ Update user's contact and address
    user.contact = contact;
    user.address = address;

    // ✅ Check if there are orders to place
    if (user.orders.length === 0) {
      req.flash("error", "You have no active orders to place");
      return res.redirect("/cart");
    }

    // ✅ Move current orders to placed orders
    user.orders.forEach((orderItem) => {
      user.placeOrders.push({
        product: orderItem.product._id,
        quantity: orderItem.quantity,
        orderedAt: new Date(),
      });
    });

    // ✅ Clear active orders after placing them
    user.orders = [];

    await user.save();

    req.flash("success", "Your order has been placed successfully!");
    return res.redirect("/profile");
  } catch (err) {
    console.error("Error placing your order:", err);
    req.flash("error", "Something went wrong while placing the order");
    return res.redirect("/checkout");
  }
});

module.exports = router;
