const express = require("express");
const serverless = require("serverless-http"); // <-- Added
const app = express();
const cookieParser = require("cookie-parser");
const path = require("path");
const adminRouter = require("./routes/adminRouter");
const indexRouter = require("./routes/indexRouter");
const userRouter = require("./routes/userRouter");
const contactRouter = require("./routes/contactRouter");
const expressSession = require("express-session");
const flash = require("connect-flash");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const connectDB = require("./config/db");
connectDB();

app.use(cookieParser());

app.use(
  expressSession({
    resave: false,
    saveUninitialized: false,
    secret: process.env.EXPRESS_SESSION_SECRET,
  })
);

app.use(flash());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

// Middleware for checking JWT
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
app.use("/", indexRouter);
app.use("/contact", contactRouter);

 
module.exports.handler = serverless(app);
