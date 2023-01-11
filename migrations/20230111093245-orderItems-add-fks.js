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
    "orderItems",
    "products",
    "orderItems_products_fk",
    {
      product_id: "id",
    },
    {
      onDelete: "CASCADE",
      onUpdate: "RESTRICT",
    }
  );
  return db.addForeignKey(
    "orderItems",
    "orders",
    "orderItems_orders_fk",
    {
      order_id: "id",
    },
    {
      onDelete: "CASCADE",
      onUpdate: "RESTRICT",
    }
  );
};

exports.down = function (db) {
  db.removeForeignKey("orderItems", "orderItems_products_fk");
  return db.removeForeignKey("orderItems", "orderItems_orders_fk");
};

exports._meta = {
  version: 1,
};
