const jwt = require("jsonwebtoken");

const generatedToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
    },
    process.env.JWT_SECRET, // secret key stored in .env
    {
      expiresIn: "1d", // token validity (1 day)
    }
  );
};

module.exports = { generatedToken };
