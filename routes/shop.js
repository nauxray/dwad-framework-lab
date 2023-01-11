const express = require("express");
const { createSignUpForm, bootstrapField } = require("../forms");
const router = express.Router();

const { User, Shop } = require("../models");
const { getHashedPassword } = require("../utils/getHashedPw");

router.get("/featured", async (req, res) => {
  try {
    const featuredShops = await Shop.query({
      where: ["shop_featured", ">", 0],
      limit: 5,
    }).fetch({
      withRelated: {
        user: (query) => {
          query.select(["id", "username", "created_at", "pfp"]);
        },
      },
      require: true,
    });

    res.send(featuredShops.toJSON());
  } catch (err) {
    if (err?.message === "EmptyResponse") res.status(404).send([]);
    res.sendStatus(500);
  }
});

// router.get("/create", async (req, res) => {
//   try {
//     const signUpForm = createSignUpForm();
//     res.render("users/create", {
//       form: signUpForm.toHTML(bootstrapField),
//     });
//   } catch (err) {
//     res.sendStatus(500);
//   }
// });

// router.post("/create", async (req, res) => {
//   try {
//     const signUpForm = createSignUpForm();
//     signUpForm.handle(req, {
//       success: async (form) => {
//         const user = new User();
//         const { confirm_password, ...userData } = form.data;
//         userData.password = getHashedPassword(userData.password);
//         userData.role = "seller";
//         userData.pfp = "https://youtube.com";
//         userData.created_at = new Date();
//         user.set(userData);

//         await user.save();
//         // req.flash("success_messages", "Your account has been created");
//         res.redirect("/users/login");
//       },
//       error: (form) => {
//         res.render("users/create", {
//           form: form.toHTML(bootstrapField),
//         });
//       },
//       empty: (form) => {
//         res.render("users/create", {
//           form: form.toHTML(bootstrapField),
//         });
//       },
//     });
//   } catch (err) {
//     if (err?.message === "EmptyResponse") res.status(404).send([]);
//     res.sendStatus(500);
//   }
// });

module.exports = router;
