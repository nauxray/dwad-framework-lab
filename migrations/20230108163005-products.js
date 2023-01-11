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
  return db.createTable("products", {
    id: {
      type: "int",
      primaryKey: true,
      autoIncrement: true,
      unsigned: true,
      notNull: true,
    },
    name: {
      type: "string",
      length: 255,
      notNull: true,
    },
    price: {
      type: "decimal",
      unsigned: true,
      notNull: true,
    },
    quantity: {
      type: "int",
      unsigned: true,
      notNull: true,
    },
    sales: {
      type: "int",
      unsigned: true,
      notNull: true,
    },
    description: {
      type: "text",
      notNull: false,
    },
    img_url: {
      type: "string",
      length: 255,
      notNull: true,
    },
    created_at: {
      type: "date",
      notNull: true,
    },
    shop_id: {
      type: "int",
      unsigned: true,
      notNull: true,
    },
    brand_id: {
      type: "int",
      unsigned: true,
      notNull: true,
    },
    series_id: {
      type: "int",
      unsigned: true,
      notNull: true,
    },
  });
};

exports.down = function (db) {
  return db.dropTable("products");
};

exports._meta = {
  version: 1,
};
