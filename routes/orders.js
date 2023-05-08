const express = require("express");
const router = express.Router();

const { checkIfAuthenticated } = require("../middlewares");
const { getShop } = require("../dal/shop");
const { getOrdersByShopId } = require("../dal/orders");

router.get("/", checkIfAuthenticated, async (req, res) => {
  try {
    const user = req.session.user;
    const shopId = (await getShop(user.id)).get("id");
    const orderPromises = await getOrdersByShopId(shopId);
    let orders = await Promise.all(orderPromises);
    orders = orders.map((i) => i.toJSON()).filter((i) => i.status !== "UNPAID");
    orders.map((i) => {
      const filtered = [];

      i.orderItems.map((j) => {
        j.qty = i.orderItems.filter(
          (k) => k.product_id === j.product_id
        ).length;

        if (!filtered.filter((f) => f.product_id === j.product_id).length) {
          filtered.push(j);
        }
      });

      i.orderItems = filtered;
      return i;
    });

    res.render("orders/index", { orders });
  } catch (err) {
    console.log(err);
    res.status(500).send([]);
  }
});

module.exports = router;
