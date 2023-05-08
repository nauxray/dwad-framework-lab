const jwt = require("jsonwebtoken");
require("dotenv").config();

const checkIfAuthenticated = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    req.flash("error_messages", "You need to sign in to access this page");
    res.redirect("/users/login");
  }
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
    if (err) {
      console.log(err);
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
};

module.exports = {
  checkIfAuthenticated,
  authenticateToken,
};
