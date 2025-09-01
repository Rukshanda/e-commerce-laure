const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 4000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const connectDB = require("./config/db")

connectDB();

app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("admin");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

