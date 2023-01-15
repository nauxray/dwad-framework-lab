const jwt = require("jsonwebtoken");
require("dotenv").config();

const secret = process.env.TOKEN_SECRET;

const generateAccessToken = (userId) => {
  return jwt.sign({ userId }, secret, { expiresIn: "24h" });
};

module.exports = { generateAccessToken };
