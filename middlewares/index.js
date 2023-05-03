const jwt = require("jsonwebtoken");
const { createLoginForm } = require("../forms");
const { User } = require("../models");
const { getHashedPassword } = require("../utils/getHashedPw");
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

const handleLoginForm = async (req, res, next) => {
  const loginForm = createLoginForm();
  loginForm.handle(req, {
    success: async (form) => {
      const user = await User.where({
        email: form.data.email,
        password: getHashedPassword(form.data.password),
      }).fetch({
        require: false,
      });
      if (user) {
        req.session.user = {
          id: user.get("id"),
          email: user.get("email"),
          username: user.get("username"),
        };
        res.locals.status = "success";
      } else {
        res.locals.status = "wrongCredentials";
      }
      next();
    },
    error: (form) => {
      res.locals.status = "error";
      res.locals.form = form;
      next();
    },
    empty: (form) => {
      res.locals.status = "empty";
      res.locals.form = form;
      next();
    },
  });
};

module.exports = { checkIfAuthenticated, authenticateToken, handleLoginForm };
