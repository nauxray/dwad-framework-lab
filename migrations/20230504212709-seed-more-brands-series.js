"use strict";

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
      "POP MART",
      "POP MART is famous for its collectible anime and cartoon figures which are often bought in “blind boxes”.",
    ]
  );
  db.insert(
    "brands",
    ["name", "description"],
    [
      "Square Enix",
      "Square Enix Holdings Co., Ltd. is a Japanese multinational holding company, production enterprise and entertainment conglomerate, best known for its RPG franchises, such as Final Fantasy, Dragon Quest, Star Ocean, and Kingdom Hearts, among numerous others.",
    ]
  );
  db.insert(
    "brands",
    ["name", "description"],
    [
      "Bandai Namco",
      "Bandai Namco exists to share dreams, fun and inspiration with people around the world. Connecting people and societies in the enjoyment of uniquely entertaining products and services, we're working to create a brighter future for everyone.",
    ]
  );
  db.insert(
    "series",
    ["name", "release_date"],
    ["Final Fantasy", new Date(2004, 2, 9).toJSON().split("T")[0]]
  );
  db.insert(
    "series",
    ["name", "release_date"],
    ["Dimoo", new Date(2021, 9, 20).toJSON().split("T")[0]]
  );
  db.insert(
    "series",
    ["name", "release_date"],
    ["Molly", new Date(2020, 3, 1).toJSON().split("T")[0]]
  );
  db.insert(
    "series",
    ["name", "release_date"],
    ["Skullpanda", new Date(2022, 6, 5).toJSON().split("T")[0]]
  );
  db.insert(
    "series",
    ["name", "release_date"],
    ["My Neighbor Totoro", new Date(1988, 4, 16).toJSON().split("T")[0]]
  );
  db.insert(
    "series",
    ["name", "release_date"],
    ["Spirited Away", new Date(2001, 12, 20).toJSON().split("T")[0]]
  );
  db.insert("tags", ["name"], ["Movies/Films"]);
  db.insert("tags", ["name"], ["Cartoon"]);
  return db.insert("tags", ["name"], ["Video Games"]);
};

exports.down = function (db) {
  return null;
};

exports._meta = {
  version: 1,
};
