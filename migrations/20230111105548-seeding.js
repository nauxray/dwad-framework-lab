"use strict";

const { getHashedPassword } = require("../utils/getHashedPw");

var dbm;
var type;
var seed;

/**
 * We receive the dbmigrate dependency from dbmigrate initially.
 * This enables us to not have to rely on NODE_PATH.
 */
exports.setup = function (options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db) {
  db.insert(
    "brands",
    ["name", "description"],
    [
      "Funko",
      "Funko is a leading pop culture lifestyle brand. We provide connection to pop culture with a product line that includes vinyl figures, action toys, plush, apparel, board games, housewares, NFTs and accessories. As the world's largest proprietor of licenses, entertainment enthusiasts display their fandom through the lens of Funko products.",
    ]
  );
  db.insert("materials", ["name"], ["Acrylic"]);
  db.insert(
    "series",
    ["name", "release_date"],
    ["Jujutsu Kaisen", new Date(2018, 2, 18).toJSON().split("T")[0]]
  );
  db.insert("tags", ["name"], ["Anime"]);
  db.insert(
    "users",
    ["username", "password", "email", "role", "created_at", "pfp"],
    [
      "AnimeFunkoPopSeller",
      getHashedPassword("password"),
      "abc@gmail.com",
      "seller",
      new Date().toJSON().split("T")[0],
      "https://i.imgur.com/XZOuZfm.jpegpfp",
    ]
  );
  db.insert(
    "shop",
    ["user_id", "shop_featured", "shop_bio"],
    [1, 100, "We sell good anime merch!"]
  );
  db.insert(
    "products",
    [
      "name",
      "price",
      "quantity",
      "sales",
      "description",
      "img_url",
      "created_at",
      "shop_id",
      "brand_id",
      "series_id",
    ],
    [
      "RYOMEN SUKUNA - JUJUTSU KAISEN",
      89.9,
      10,
      0,
      "Ryomen Sukuna from popular anime/manga Jujutsu Kaisen",
      "https://cdn.shopify.com/s/files/1/1052/2158/products/61362_POP_Deluxe_JJK_S1_Sukuna_Lifestyle_112322.jpg?v=1670451223",
      new Date().toJSON().split("T")[0],
      1,
      1,
      1,
    ]
  );
  return null;
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
