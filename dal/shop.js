const { Shop } = require("../models");

const getShop = async (userId) => {
  const shop = await Shop.query({ where: { user_id: userId } }).fetch({
    require: true,
  });
  return shop;
};

module.exports = { getShop };
