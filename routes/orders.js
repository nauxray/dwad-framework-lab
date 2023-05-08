const express = require("express");
const router = express.Router();

const { checkIfAuthenticated } = require("../middlewares/auth");
const { handleOrdersSearchForm } = require("../middlewares/forms");

router.get(
  "/",
  checkIfAuthenticated,
  handleOrdersSearchForm,
  async (req, res) => {
    try {
      switch (res.locals.status) {
        case "success":
          res.render("orders/index", {
            orders: res.locals.orders,
            form: res.locals.form,
          });
          break;
        case "error":
        case "empty":
          res.render("orders/index", {
            orders: res.locals.orders,
            form: res.locals.form,
          });
          break;
      }
    } catch (err) {
      console.log(err);
      req.flash("error_messages", "Something went wrong!");
      res.redirect("/");
    }
  }
);

module.exports = router;
