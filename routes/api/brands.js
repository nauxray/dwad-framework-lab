const express = require("express");
const router = express.Router();

const { Brand } = require("../../models");

router.get("/", async (req, res) => {
  try {
    const brands = (await Brand.collection().fetch()).toJSON();
    res.send(brands);
  } catch (err) {
    res.status(500).send([]);
  }
});

module.exports = router;
