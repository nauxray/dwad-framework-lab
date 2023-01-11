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
  return db.createTable("orders", {
    id: {
      type: "int",
      primaryKey: true,
      autoIncrement: true,
      unsigned: true,
      notNull: true,
    },
    created_at: {
      type: "date",
      notNull: true,
    },
    delivery_mode: {
      type: "string",
      length: 255,
      notNull: true,
    },
    cost: {
      type: "decimal",
      notNull: true,
    },
    status: {
      type: "string",
      length: 255,
      notNull: true,
    },
    shipping_address: {
      type: "string",
      length: 255,
      notNull: true,
    },
    user_id: {
      type: "int",
      unsigned: true,
      notNull: true,
    },
  });
};

exports.down = function (db) {
  return db.dropTable("orders");
};

exports._meta = {
  version: 1,
};
