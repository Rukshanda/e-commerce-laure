const express = require("express");
const router = express.Router();
const {registerUser, loginUser, logout} = require("../controllers/authController") 

router.get("/login", (req ,res)=> {
    res.render("login")
})

router.post("/register", registerUser);
router.get("/logout" , logout)
router.post("/login", loginUser)

router.get("/register", (req ,res)=> {
    res.render("signup")
})

module.exports = router;