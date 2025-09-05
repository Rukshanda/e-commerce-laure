const path = require("path");
const express = require("express");
const serverless = require("serverless-http");
const cookieParser = require("cookie-parser");
const expressSession = require("express-session");
const flash = require("connect-flash");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Routers
const adminRouter = require("../../routes/adminRouter");
const indexRouter = require("../../routes/indexRouter");
const userRouter = require("../../routes/userRouter");
const contactRouter = require("../../routes/contactRouter");

// DB connection
const connectDB = require("../../config/db");
connectDB();

const app = express();

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  expressSession({
    resave: false,
    saveUninitialized: false,
    secret: process.env.EXPRESS_SESSION_SECRET,
  })
);
app.use(flash());

// ✅ FIXED: Correct paths for Netlify
const rootPath = path.join(__dirname, "../../");

app.set("view engine", "ejs");
app.set("views", path.join(rootPath, "views"));
app.use(express.static(path.join(rootPath, "public")));

// JWT check
app.use((req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    res.locals.loggedin = false;
    return next();
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.locals.loggedin = !!decoded;
  } catch (err) {
    res.locals.loggedin = false;
  }
  next();
});

// Routes
app.use("/admin", adminRouter);
app.use("/users", userRouter);
app.use("/contact", contactRouter);
app.use("/", indexRouter);

// Default handler for Netlify
module.exports.handler = serverless(app);
