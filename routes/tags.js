const express = require("express");
const router = express.Router();

const { Tag } = require("../models");

router.get("/", async (req, res) => {
  try {
    const tags = (await Tag.collection().fetch()).toJSON();
    res.send(tags);
  } catch (err) {
    res.status(500).send([]);
  }
});

module.exports = router;
