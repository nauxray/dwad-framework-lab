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
  db.removeColumn("orders", "delivery_mode");
  return db.removeColumn("orders", "shipping_address");
};

exports.down = function (db) {
  return;
};

exports._meta = {
  version: 1,
};
