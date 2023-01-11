const express = require("express");
const router = express.Router();

const { Material } = require("../models");

router.get("/", async (req, res) => {
  try {
    const materials = (await Material.collection().fetch()).toJSON();
    res.send(materials);
  } catch (err) {
    res.status(500).send([]);
  }
});

module.exports = router;
