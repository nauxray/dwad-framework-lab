const express = require("express");
const router = express.Router();

const { Product } = require("../models");

router.get("/", async (req, res) => {
  try {
    const reqQuery = req.query;
    const queryKeys = Object.keys(reqQuery);

    let products = await Product.query((qb) => {
      if (queryKeys.includes("name")) {
        qb.whereILike("name", `%${reqQuery.name}%`);
      }
      if (queryKeys.includes("quantity") && parseInt(reqQuery.quantity)) {
        qb.andWhere("quantity", ">=", parseInt(reqQuery.quantity));
      }
      if (queryKeys.includes("minPrice") && parseInt(reqQuery.minPrice)) {
        qb.andWhere("price", ">=", parseInt(reqQuery.minPrice));
      }
      if (queryKeys.includes("maxPrice") && parseInt(reqQuery.maxPrice)) {
        qb.andWhere("price", "<=", parseInt(reqQuery.maxPrice));
      }
      if (queryKeys.includes("limit") && parseInt(reqQuery.limit)) {
        qb.limit(parseInt(reqQuery.limit));
      }
      if (
        queryKeys.includes("sortBy") &&
        reqQuery.sortBy.split(":").length === 2
      ) {
        qb.orderBy(
          reqQuery.sortBy.split(":")[0],
          reqQuery.sortBy.split(":")[1]
        );
      }
    }).fetchAll({ withRelated: ["brand", "series"], required: false });
    res.send(products.toJSON());
  } catch (err) {
    res.sendStatus(500);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const products = await Product.query({
      where: { id: req.params.id },
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
    res.send(products.toJSON());
  } catch (err) {
    res.sendStatus(500);
  }
});

router.get("/shop/:id", async (req, res) => {
  try {
    const shopProducts = await Product.query({
      where: { shop_id: req.params.id },
    }).fetchAll({
      withRelated: {
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
      require: true,
    });
    res.send(shopProducts.toJSON());
  } catch (err) {
    res.sendStatus(500);
  }
});

module.exports = router;
