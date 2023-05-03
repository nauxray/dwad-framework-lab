const { CartItem } = require("../models");

const clearCart = async (userId) => {
  await CartItem.where({ user_id: userId })
    .fetchAll()
    .map(async (item) => {
      await item.destroy();
    });
};

const removeItemFromCart = async (productId, userId) => {
  await CartItem.where({
    product_id: productId,
    user_id: userId,
  })
    .fetchAll()
    .map(async (item) => {
      await item.destroy();
    });
};

module.exports = { clearCart, removeItemFromCart };
