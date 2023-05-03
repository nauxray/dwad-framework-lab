const express = require("express");
const { createSignUpForm, bootstrapField } = require("../../forms");
const router = express.Router();

const { User } = require("../../models");
const { getUserById } = require("../../dal/users");
const { getHashedPassword } = require("../../utils/getHashedPw");
const { generateAccessToken } = require("../../utils/jwtUtils");
const { handleLoginForm } = require("../../middlewares");

router.get("/:id/profile", async (req, res) => {
  try {
    const user = (await getUserById(req.params.id))?.[0];
    res.send(user);
  } catch (err) {
    res.sendStatus(500);
  }
});

// todo
router.put("/:id/edit", async (req, res) => {
  try {
    const signUpForm = createSignUpForm();
    signUpForm.handle(req, {
      success: async (form) => {
        const user = new User();
        const { old_password, confirm_password, ...userData } = form.data;
        userData.password = getHashedPassword(userData.password);
        userData.role = "buyer";
        userData.pfp = "https://youtube.com";
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

router.post("/login", handleLoginForm, async (req, res) => {
  try {
    console.log("status", res.locals.status);
    if (res.locals.status === "success") {
      res.status(200).send({
        user: req.session.user,
        token: generateAccessToken(req.session.user.id),
      });
    } else {
      res.status(400).send({ error: "Invalid Credentials" });
    }
  } catch (err) {
    res.sendStatus(500);
  }
});

router.get("/logout", (req, res) => {
  req.session.user = null;
  res.status(200).send({});
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
