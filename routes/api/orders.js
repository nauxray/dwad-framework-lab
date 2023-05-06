const express = require("express");
const { authenticateToken } = require("../../middlewares");
const { getUserOrders } = require("../../dal/orders");
const router = express.Router();

router.get("/user/:userId", authenticateToken, async (req, res) => {
  try {
    const userOrders = (await getUserOrders(req.params.userId)).toJSON();
    res.send(userOrders);
  } catch (err) {
    console.log(err);
    res.sendStatus(500);
  }
});

module.exports = router;
