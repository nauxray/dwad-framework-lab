'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function (db) {
  return db.createTable("products_tags", {
    id: {
      type: "int",
      primaryKey: true,
      autoIncrement: true,
      unsigned: true,
      notNull: true,
    },
    product_id: {
      type: "int",
      unsigned: true,
      notNull: true,
    },
    tag_id: {
      type: "int",
      unsigned: true,
      notNull: true,
    },
  });
};

exports.down = function (db) {
  return db.dropTable("products_tags");
};

exports._meta = {
  "version": 1
};
