const { User } = require("../models");

const getUserById = async (id) => {
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

module.exports = { getUserById };
