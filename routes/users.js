const express = require("express");
const {
  createLoginForm,
  createSignUpForm,
  bootstrapField,
} = require("../forms");
const router = express.Router();

const { getUserById } = require("../dal/users");
const { handleLoginForm, handleSignupForm } = require("../middlewares/forms");
const { checkIfAuthenticated } = require("../middlewares/auth");

router.get("/:id/profile/view", checkIfAuthenticated, async (req, res) => {
  try {
    const userInfo = (await getUserById(req.params.id))?.[0];
    if (userInfo) res.render("users/profile", { userInfo });
    else res.render("users/login");
  } catch (err) {
    res.sendStatus(500);
  }
});

router.get("/login", async (req, res) => {
  try {
    if (req.session?.user) {
      return res.redirect("/");
    }
    const loginForm = createLoginForm();
    res.render("users/login", {
      form: loginForm.toHTML(bootstrapField),
    });
  } catch (err) {
    res.sendStatus(500);
  }
});

router.post("/login", handleLoginForm, async (req, res) => {
  try {
    switch (res.locals.status) {
      case "success":
        req.flash("success_messages", "Login successful!");
        res.redirect("/");
        break;
      case "wrongCredentials":
        req.flash("error_messages", "Your login credentials is invalid");
        res.redirect("users/login");
        break;
      case "forbiddenLogin":
        req.flash("error_messages", "This portal is for sellers!");
        res.redirect("users/login");
        break;
      case "error":
      case "empty":
        res.redirect("users/login", { form: res.locals.form });
        break;
    }
  } catch (err) {
    req.flash("error_messages", "Something went wrong!");
    res.redirect("/");
  }
});

router.get("/logout", (req, res) => {
  req.session.user = null;
  req.flash("success_messages", "Logged out");
  res.redirect("/");
});

router.get("/create", async (req, res) => {
  try {
    const signUpForm = createSignUpForm();
    res.render("users/create", {
      form: signUpForm.toHTML(bootstrapField),
    });
  } catch (err) {
    res.sendStatus(500);
  }
});

router.post("/create", handleSignupForm, async (req, res) => {
  try {
    switch (res.locals.status) {
      case "success":
        req.flash("success_messages", "Your account has been created");
        res.redirect("/");
        break;
      case "wrongCredentials":
        req.flash("error_messages", "Your login credentials is invalid");
        res.redirect("/users/create");
        break;
      case "error":
      case "empty":
        res.render("users/create", { form: res.locals.form });
        break;
    }
  } catch (err) {
    if (err?.message === "EmptyResponse") res.status(404).send([]);
    res.sendStatus(500);
  }
});

module.exports = router;
