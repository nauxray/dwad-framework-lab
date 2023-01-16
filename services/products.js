const { Product } = require("../models");

const getShopProducts = async (shop_id) => {
  const shopProducts = await Product.query({
    where: { shop_id },
  }).fetchAll({
    withRelated: [
      "brand",
      "series",
      {
        shop: (query) => {
          query
            .join("users", "users.id", "=", "shop.user_id")
            .select(
              "shop.id",
              "shop.shop_bio",
              "users.username",
              "users.pfp",
              "users.role",
              "users.email"
            );
        },
      },
    ],
    require: true,
  });

  return shopProducts;
};

const getProductById = async (id) => {
  const product = await Product.query({
    where: { id },
  }).fetch({
    withRelated: [
      "brand",
      "series",
      "tags",
      "materials",
      {
        shop: (query) => {
          query
            .join("users", "users.id", "=", "shop.user_id")
            .select(
              "shop.id",
              "shop.shop_bio",
              "users.username",
              "users.pfp",
              "users.role",
              "users.email"
            );
        },
      },
    ],
    require: true,
  });

  return product;
};

module.exports = { getShopProducts, getProductById };
