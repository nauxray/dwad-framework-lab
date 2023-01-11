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
  db.addForeignKey(
    "products_tags",
    "products",
    "products_tags_product_fk",
    {
      product_id: "id",
    },
    {
      onDelete: "CASCADE",
      onUpdate: "RESTRICT",
    }
  );
  return db.addForeignKey(
    "products_tags",
    "tags",
    "products_tags_tag_fk",
    {
      tag_id: "id",
    },
    {
      onDelete: "CASCADE",
      onUpdate: "RESTRICT",
    }
  );
};

exports.down = function (db) {
  db.removeForeignKey("products_tags", "products_tags_product_fk");
  return db.removeForeignKey("products_tags", "products_tags_tag_fk");
};

exports._meta = {
  version: 1,
};
