const { CartItem } = require("../models");

const getUserCart = async (user_id) => {
  const cart = await CartItem.query({
    where: { user_id },
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

  return cart;
};

module.exports = { getUserCart };
