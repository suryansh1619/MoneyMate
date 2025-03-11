const jwt = require("jsonwebtoken");
const prisma = require("../config/database");

const authenticate = async (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) {
    return res.status(401).json({ error: "Access Denied. No token provided." });
  }
  try {
    const decoded = jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET);
    req.user = await prisma.user.findUnique({ where: { id: decoded.userId } }); 
    if (!req.user) {
      return res.status(404).json({ error: "User not found" });
    }
    req.userId = decoded.userId;
    next();
  } 
  catch (error) {
    res.status(400).json({ error: "Invalid Token" });
  }
};



module.exports = authenticate;
