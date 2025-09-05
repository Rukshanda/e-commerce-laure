
const jwt = require("jsonwebtoken");


const generatedToken = (user) => {
return jwt.sign({ email: user.email, id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "1d",
          });
}


module.exports.generatedToken = generatedToken;