const express = require("express");
const { authenticateToken } = require("../../middlewares/auth");
const router = express.Router();

const { CartItem } = require("../../models");
const { getUserCart } = require("../../dal/cart");
const { removeItemFromCart } = require("../../services/cart");

router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const cart = await getUserCart(req.params.id);
    res.send(cart.toJSON());
  } catch (err) {
    res.sendStatus(500);
  }
});

router.post("/add/:id", authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.userId;
    const product_id = req.params.id;

    const cartItem = new CartItem();
    cartItem.set({ user_id, product_id });
    const result = await cartItem.save();

    res.status(201).send({ createdItemId: result.id });
  } catch (err) {
    res.sendStatus(500);
  }
});

// delete entire product regardless of qty
router.delete("/remove/product/:id", authenticateToken, async (req, res) => {
  try {
    await removeItemFromCart(req.params.id, req.user.userId);
    res.status(204).send({});
  } catch (err) {
    res.sendStatus(500);
  }
});

// delete cartItem, minus 1 from qty
router.delete("/remove/:productId", authenticateToken, async (req, res) => {
  try {
    const item = await CartItem.where({
      product_id: req.params.productId,
      user_id: req.user.userId,
    }).fetch({ require: true });

    await item.destroy();
    res.status(204).send({ success: true });
  } catch (err) {
    res.sendStatus(500);
  }
});

module.exports = router;
