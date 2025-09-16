// ✅ Load environment variables FIRST
require("dotenv").config();

const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const path = require("path");
const expressSession = require("express-session");
const flash = require("connect-flash");
const jwt = require("jsonwebtoken");
const cloudinary = require("cloudinary").v2;

// ✅ Performance & Security
const compression = require("compression");


// ✅ Routers
const adminRouter = require("./routes/adminRouter");
const indexRouter = require("./routes/indexRouter");
const userRouter = require("./routes/userRouter");
const contactRouter = require("./routes/contactRouter");

// ✅ Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// ✅ Connect to MongoDB
const connectDB = require("./config/db");
connectDB();




app.use(compression()); // GZIP compression
app.use(express.static(path.join(__dirname, "public")));


app.use(flash());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(cookieParser());
app.use(
  expressSession({
    resave: false,
    saveUninitialized: false,
    secret: process.env.EXPRESS_SESSION_SECRET,
  })
);

// ✅ Set EJS as view engine
app.set("view engine", "ejs");

// ✅ Middleware to check authentication
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

// ✅ Routes
app.use("/admin", adminRouter);
app.use("/users", userRouter);
app.use("/contact", contactRouter);
app.use("/", indexRouter);

// ✅ Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
