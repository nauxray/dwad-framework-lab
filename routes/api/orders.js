const express = require("express");
const { authenticateToken } = require("../../middlewares/auth");
const {
  getUserOrders,
  searchOrders,
  getOrderById,
} = require("../../dal/orders");
const { cancelOrder } = require("../../services/orders");
const router = express.Router();

router.get("/user", authenticateToken, async (req, res) => {
  try {
    const userOrders = (await getUserOrders(req.user.userId)).toJSON();
    res.send(userOrders);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

router.post("/search", authenticateToken, async (req, res) => {
  try {
    const orders = await searchOrders(req.user.userId, req.body.searchTerm);
    res.send(orders);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const order = (await getOrderById(req.params.id)).toJSON();
    if (order.user_id !== req.user.userId || order.status !== "UNPAID") {
      res.send("Forbidden");
    } else {
      await cancelOrder(req.params.id);
      res.sendStatus(204);
    }
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

module.exports = router;
