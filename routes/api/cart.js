const express = require("express");
const { authenticateToken } = require("../../middlewares");
const router = express.Router();

const { CartItem } = require("../../models");
const { getUserCart } = require("../../dal/cart");

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

    // when checkout then minus product quantity
    // const product = await Product.where({
    //   id: product_id,
    // }).fetch({
    //   require: true,
    // });
    // const productData = product.toJSON();
    // product.set({
    //   ...product.toJSON(),
    //   quantity: productData.quantity === 0 ? 0 : productData.quantity - 1,
    // });
    // await product.save();

    res.status(201).send({ createdItemId: result.id });
  } catch (err) {
    res.sendStatus(500);
  }
});

// delete entire product regardless of qty
router.delete("/remove/product/:id", authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.userId;
    await CartItem.where({
      product_id: req.params.id,
      user_id,
    })
      .fetchAll()
      .map(async (item) => {
        await item.destroy();
      });

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
