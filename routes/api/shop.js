const express = require("express");
const { createSignUpForm, bootstrapField } = require("../../forms");
const router = express.Router();

const { User, Shop } = require("../../models");
const { getHashedPassword } = require("../../utils/getHashedPw");

router.get("/featured", async (req, res) => {
  try {
    const featuredShops = await Shop.query({
      where: ["shop_featured", ">", 0],
      limit: 5,
    }).fetchAll({
      withRelated: {
        user: (query) => {
          query.select(["id", "username", "created_at", "pfp"]);
        },
      },
      require: false,
    });

    res.send(featuredShops.toJSON());
  } catch (err) {
    res.sendStatus(500);
  }
});

module.exports = router;
