const { User } = require("../models");

const getShopById = async (id) => {
  const user = await User.query()
    .join("shop", "shop.user_id", "=", "users.id")
    .where({ "users.id": id })
    .select([
      "users.id",
      "users.username",
      "users.email",
      "users.role",
      "users.created_at",
      "users.pfp",
      "shop.shop_featured",
      "shop.shop_bio",
    ]);

  return user;
};

const getUserById = async (id) => {
  return await User.query().where({ "users.id": id }).select();
};

module.exports = { getShopById, getUserById };
