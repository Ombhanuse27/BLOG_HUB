// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id};
    const user = await User.findById(req.user.id);
    req.userName = `${user.firstName} ${user.lastName}`;
    req.userIcon = user.photo;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};
module.exports = authMiddleware;
