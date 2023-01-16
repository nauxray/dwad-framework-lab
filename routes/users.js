const express = require("express");
const {
  createLoginForm,
  createSignUpForm,
  bootstrapField,
} = require("../forms");
const router = express.Router();

const { User } = require("../models");
const { getUserById, handleLoginForm } = require("../services/users");
const { getHashedPassword } = require("../utils/getHashedPw");
const { checkIfAuthenticated } = require("../middlewares");

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
        res.redirect("/users/login");
        break;
      case "error":
      case "empty":
        res.render("users/login", {
          form: res.locals.form,
        });
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

router.post("/create", async (req, res) => {
  try {
    const signUpForm = createSignUpForm();
    signUpForm.handle(req, {
      success: async (form) => {
        const user = new User();
        const { confirm_password, ...userData } = form.data;
        userData.password = getHashedPassword(userData.password);
        userData.role = "buyer";
        userData.pfp = "https://youtube.com";
        userData.created_at = new Date();
        user.set(userData);

        await user.save();
        req.flash("success_messages", "Your account has been created");
        res.redirect("/users/login");
      },
      error: (form) => {
        res.render("users/create", {
          form: form.toHTML(bootstrapField),
        });
      },
      empty: (form) => {
        res.render("users/create", {
          form: form.toHTML(bootstrapField),
        });
      },
    });
  } catch (err) {
    if (err?.message === "EmptyResponse") res.status(404).send([]);
    res.sendStatus(500);
  }
});

module.exports = router;
