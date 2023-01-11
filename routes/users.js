const express = require("express");
const {
  createLoginForm,
  createSignUpForm,
  bootstrapField,
  createEditProfileForm,
} = require("../forms");
const router = express.Router();

const { User } = require("../models");
const { getUserById } = require("../services/users");
const { getHashedPassword } = require("../utils/getHashedPw");
const { checkIfAuthenticated } = require("../middlewares");

// router.get("/", async (req, res) => {
//   try {
//     const users = (await User.collection().fetch()).toJSON();
//     res.send(users);
//   } catch (err) {
//     if (err?.message === "EmptyResponse") res.status(404).send([]);
//     res.sendStatus(500);
//   }
// });

router.get("/:id/profile", checkIfAuthenticated, async (req, res) => {
  try {
    const user = (await getUserById(req.params.id))?.[0];
    res.send(user);
  } catch (err) {
    res.sendStatus(500);
  }
});

router.get("/:id/profile/view", checkIfAuthenticated, async (req, res) => {
  try {
    const userInfo = (await getUserById(req.params.id))?.[0];
    if (userInfo) res.render("users/profile", { userInfo });
    else res.render("users/login");
  } catch (err) {
    res.sendStatus(500);
  }
});

// todo
router.put("/:id/edit", checkIfAuthenticated,async (req, res) => {
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

router.get("/login", async (req, res) => {
  try {
    if (req.session.user) {
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

router.post("/login", async (req, res) => {
  try {
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
          req.flash("success_messages", "Login successful!");
          res.redirect("/");
        } else {
          req.flash("error_messages", "Your login credentials is invalid");
          res.redirect("/users/login");
        }
      },
      error: (form) => {
        res.render("users/login", {
          form,
        });
      },
      empty: (form) => {
        res.render("users/login", {
          form,
        });
      },
    });
  } catch (err) {
    res.sendStatus(500);
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
