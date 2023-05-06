const bookshelf = require("../bookshelf");

const Product = bookshelf.model("Product", {
  tableName: "products",
  shop() {
    return this.belongsTo("Shop");
  },
  brand() {
    return this.belongsTo("Brand");
  },
  series() {
    return this.belongsTo("Series");
  },
  tags() {
    return this.belongsToMany("Tag");
  },
  materials() {
    return this.belongsToMany("Material");
  },
  cartItems() {
    return this.belongsToMany("CartItem");
  },
  orderItems() {
    return this.belongsTo("OrderItem");
  },
});

const CartItem = bookshelf.model("CartItem", {
  tableName: "cartItems",
  product() {
    return this.belongsTo("Product");
  },
  user() {
    return this.belongsTo("User");
  },
});

const Brand = bookshelf.model("Brand", {
  tableName: "brands",
  products() {
    return this.hasMany("Product");
  },
});

const Material = bookshelf.model("Material", {
  tableName: "materials",
  products() {
    return this.belongsToMany("Product");
  },
});

const Order = bookshelf.model("Order", {
  tableName: "orders",
  user() {
    return this.belongsTo("User");
  },
  orderItems() {
    return this.hasMany("OrderItem");
  },
});

const OrderItem = bookshelf.model("OrderItem", {
  tableName: "orderItems",
  product() {
    return this.belongsTo("Product");
  },
  order() {
    return this.belongsTo("Order");
  },
});

const Series = bookshelf.model("Series", {
  tableName: "series",
  products() {
    return this.hasMany("Product");
  },
});

const Shop = bookshelf.model("Shop", {
  tableName: "shop",
  products() {
    return this.hasMany("Product");
  },
  user() {
    return this.belongsTo("User");
  },
});

const Tag = bookshelf.model("Tag", {
  tableName: "tags",
  products() {
    return this.belongsToMany("Product");
  },
});

const User = bookshelf.model("User", {
  tableName: "users",
  products() {
    return this.hasMany("Product");
  },
  cartItems() {
    return this.hasMany("CartItem");
  },
  orders() {
    return this.hasMany("Order");
  },
});

module.exports = {
  Product,
  CartItem,
  Brand,
  Shop,
  Material,
  Order,
  OrderItem,
  Series,
  Tag,
  User,
};
