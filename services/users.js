const { createLoginForm } = require("../forms");
const { User } = require("../models");
const { getHashedPassword } = require("../utils/getHashedPw");

const getUserById = async (id) => {
  const user = await User.query()
    .join("shop", "shop.user_id", "=", "users.id")
    .where({ "users.id": id })
    .select([
      "users.id",
      "users.username",
      "users.email",
      "users.role",
      "users.created_at",
      "users.pfp",
      "shop.shop_featured",
      "shop.shop_bio",
    ]);

  return user;
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

module.exports = { getUserById, handleLoginForm };
