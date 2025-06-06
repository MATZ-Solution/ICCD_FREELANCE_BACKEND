const jwt = require("jsonwebtoken");
const { queryRunner } = require("../helper/queryRunner");
const { selectQuery } = require("../constants/queries");

const verifyToken = async (req, res, next) => {
  try {

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Access Denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, '1dikjsaciwndvc'); 

    const query = ` SELECT email from users where email = ? `
    const result = await queryRunner(query, [decoded.email]);

    if (!result[0] || result[0].length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = result[0][0];

    req.user = {
      email: decoded.email,
      userId: user.id,
      name: user.name,
      // isAdmin: user.position?.toLowerCase() === "admin",
    };

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(400).json({
      message: "Invalid token",
      error: err.message,
    });
  }
};

module.exports = {
  verifyToken,
};
