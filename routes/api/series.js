const express = require("express");
const router = express.Router();

const { Series } = require("../../models");

router.get("/", async (req, res) => {
  try {
    const series = (await Series.collection().fetch()).toJSON();
    res.send(series);
  } catch (err) {
    res.status(500).send([]);
  }
});

module.exports = router;
