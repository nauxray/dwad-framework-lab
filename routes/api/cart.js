const express = require("express");
const { authenticateToken } = require("../../middlewares");
const router = express.Router();

const { CartItem } = require("../../models");

router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const cart = await CartItem.query({
      where: { user_id: req.params.id },
    }).fetchAll({
      withRelated: {
        product: (query) => {
          query
            .join("shop", "shop.id", "=", "products.shop_id")
            .join("users", "users.id", "=", "shop.user_id")
            .select(
              "shop.shop_bio",
              "products.*",
              "users.username as shop_name",
              "users.pfp",
              "users.role",
              "users.email"
            );
        },
      },
      require: false,
    });
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
    console.log(err);
    res.sendStatus(500);
  }
});

module.exports = router;
