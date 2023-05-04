const jwt = require("jsonwebtoken");
const {
  createLoginForm,
  createSignUpForm,
  bootstrapField,
} = require("../forms");
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
        if (user.get("role") === "seller") {
          req.session.user = {
            id: user.get("id"),
            email: user.get("email"),
            username: user.get("username"),
          };
          res.locals.status = "success";
        } else {
          res.locals.status = "forbiddenLogin";
        }
      } else {
        res.locals.status = "wrongCredentials";
      }
      res.locals.form = form.toHTML(bootstrapField);
      next();
    },
    error: (form) => {
      res.locals.status = "error";
      res.locals.form = form.toHTML(bootstrapField);
      next();
    },
    empty: (form) => {
      res.locals.status = "empty";
      res.locals.form = form.toHTML(bootstrapField);
      next();
    },
  });
};

const handleSignupForm = async (req, res, next) => {
  const signUpForm = createSignUpForm();
  signUpForm.handle(req, {
    success: async (form) => {
      const { email, username, password, confirm_password } = form.data;

      if (password !== confirm_password) {
        res.locals.status = "error";
        res.locals.errorMsg = "Passwords do not match";
        return next();
      }

      let user = await User.where({ email }).fetch({ require: false });
      if (user) {
        res.locals.status = "error";
        res.locals.errorMsg = "Email is already used";
        return next();
      }

      user = await User.where({ username }).fetch({ require: false });
      if (user) {
        res.locals.status = "error";
        res.locals.errorMsg = "Username is already used";
        return next();
      }

      const newUser = new User();
      const userData = {
        email,
        username,
        password: getHashedPassword(password),
        role: req.body.role ? "seller" : "buyer",
        pfp: "",
        created_at: new Date(),
      };

      newUser.set(userData);
      const createdUser = await newUser.save();

      req.session.user = {
        id: createdUser.get("id"),
        email: createdUser.get("email"),
        username: createdUser.get("username"),
      };
      res.locals.status = "success";
      next();
    },
    error: (form) => {
      res.locals.status = "error";
      res.locals.form = form.toHTML(bootstrapField);
      next();
    },
    empty: (form) => {
      res.locals.status = "empty";
      res.locals.form = form.toHTML(bootstrapField);
      next();
    },
  });
};

module.exports = {
  checkIfAuthenticated,
  authenticateToken,
  handleLoginForm,
  handleSignupForm,
};
