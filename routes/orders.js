const express = require("express");
const router = express.Router();

const { Order } = require("../models");
const { checkIfAuthenticated } = require("../middlewares");

router.get("/", checkIfAuthenticated, async (req, res) => {
  try {
    const orders = (await Order.collection().fetch()).toJSON();
    res.send(orders);
  } catch (err) {
    res.status(500).send([]);
  }
});

module.exports = router;
