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
    "materials_products",
    "products",
    "materials_products_product_fk",
    {
      product_id: "id",
    },
    {
      onDelete: "CASCADE",
      onUpdate: "RESTRICT",
    }
  );
  return db.addForeignKey(
    "materials_products",
    "materials",
    "materials_products_material_fk",
    {
      material_id: "id",
    },
    {
      onDelete: "CASCADE",
      onUpdate: "RESTRICT",
    }
  );
};

exports.down = function (db) {
  db.removeForeignKey("materials_products", "materials_products_product_fk");
  return db.removeForeignKey(
    "materials_products",
    "materials_products_material_fk"
  );
};

exports._meta = {
  version: 1,
};
