const express = require("express");
const router = express.Router();

const { Product } = require("../../models");
const { getShopProducts, getProductById } = require("../../dal/products");

router.get("/", async (req, res) => {
  try {
    const reqQuery = req.query;
    const queryKeys = Object.keys(reqQuery);

    let products = await Product.query((qb) => {
      if (queryKeys.includes("name")) {
        qb.whereILike("name", `%${reqQuery.name}%`);
      }
      if (queryKeys.includes("brand") && +reqQuery.brand) {
        qb.andWhere("brand_id", "=", +reqQuery.brand);
      }
      if (queryKeys.includes("series") && +reqQuery.series) {
        qb.andWhere("series_id", "=", +reqQuery.series);
      }
      if (queryKeys.includes("minPrice") && +reqQuery.minPrice) {
        qb.andWhere("price", ">=", +reqQuery.minPrice);
      }
      if (queryKeys.includes("maxPrice") && +reqQuery.maxPrice) {
        qb.andWhere("price", "<=", +reqQuery.maxPrice);
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
    const products = await getProductById(req.params.id);
    res.send(products.toJSON());
  } catch (err) {
    res.sendStatus(500);
  }
});

router.get("/shop/:id", async (req, res) => {
  try {
    const shopProducts = await getShopProducts(req.params.id);
    res.send(shopProducts.toJSON());
  } catch (err) {
    res.sendStatus(500);
  }
});

module.exports = router;
