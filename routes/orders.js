const express = require("express");
const router = express.Router();

const { checkIfAuthenticated } = require("../middlewares/auth");
const {
  handleOrdersSearchForm,
  handleOrderUpdateForm,
} = require("../middlewares/forms");
const { statuses } = require("../utils/constant");
const { createOrderUpdateForm, bootstrapField } = require("../forms");
const { getOrdersByShopId } = require("../dal/orders");
const { getShop } = require("../dal/shop");

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

router.get("/update", checkIfAuthenticated, async (req, res) => {
  try {
    const shopId = (await getShop(req.session.user.id)).get("id");
    const shopOrders = await getOrdersByShopId(shopId);

    const orderUpdateForm = createOrderUpdateForm(
      shopOrders.map((i) => [i.id, i.id]),
      [...statuses.filter((i) => i !== "COMPLETED").map((i) => [i, i])]
    );

    res.render("orders/update", {
      form: orderUpdateForm.toHTML(bootstrapField),
    });
  } catch (err) {
    console.log(err);
    req.flash("error_messages", "Something went wrong!");
    res.redirect("/orders");
  }
});

router.post(
  "/update",
  checkIfAuthenticated,
  handleOrderUpdateForm,
  async (req, res) => {
    try {
      switch (res.locals.status) {
        case "success":
          res.redirect("/orders");
          break;
        case "error":
        case "empty":
          req.flash("error_messages", "Something went wrong!");
          res.render("orders/update", {
            form: res.locals.form,
          });
          break;
      }
    } catch (err) {
      console.log(err);
      req.flash("error_messages", "Something went wrong!");
      res.redirect("/orders");
    }
  }
);

module.exports = router;
