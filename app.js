const express = require("express");
const session = require('express-session');
const MongoStore = require('connect-mongo');
const app = express();
const cookieParser = require("cookie-parser");
const path = require("path");
const adminRouter = require("./routes/adminRouter");
const indexRouter = require("./routes/indexRouter");
const userRouter = require("./routes/userRouter");
const contactRouter = require("./routes/contactRouter")
 const flash = require("connect-flash");
const jwt = require("jsonwebtoken");

require("dotenv").config();

app.use(cookieParser());
const connectDB = require("./config/db");

connectDB();




app.use(session({
  secret: 'your-secret',
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI })
}));

app.use(flash());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");




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

app.use("/admin", adminRouter);
app.use("/users", userRouter);
app.use("/", indexRouter);
app.use("/contact", contactRouter);

app.listen(3000);
