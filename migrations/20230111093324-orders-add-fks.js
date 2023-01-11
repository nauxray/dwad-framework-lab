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
  return db.addForeignKey(
    "orders",
    "users",
    "orders_users_fk",
    {
      user_id: "id",
    },
    {
      onDelete: "CASCADE",
      onUpdate: "RESTRICT",
    }
  );
};

exports.down = function (db) {
  return db.removeForeignKey("orders", "orders_users_fk");
};


exports._meta = {
  "version": 1
};
