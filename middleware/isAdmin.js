const jwt = require("jsonwebtoken");

function isAdmin(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1] || req.cookies.token;  
  if (!token) return res.status(401).json({ msg: "No token provided" });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ msg: "Invalid token" });
    if (decoded.role !== "admin") return res.status(403).json({ msg: "Access denied" });

    req.admin = decoded;  
    next();
  });
}

module.exports = isAdmin;
