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
    require: false,
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

const searchProductByName = async (name) => {
  const products = await Product.query((query) => {
    query.whereILike("name", `%${name}%`);
  }).fetchAll({
    withRelated: ["brand", "series"],
    require: false,
  });

  return products ?? [];
};

module.exports = { getShopProducts, getProductById, searchProductByName };
