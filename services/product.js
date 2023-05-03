const { Product } = require("../models");

const deductProductQty = async (id, qty) => {
  const product = await Product.where({ id }).fetch({ require: true });
  const productData = product.toJSON();
  const endQty = productData.quantity - qty;
  product.set({
    ...product.toJSON(),
    quantity: endQty <= 0 ? productData.quantity : endQty,
  });
  await product.save();
};

const updateProductSales = async (id, qty) => {
  const product = await Product.where({ id }).fetch({ require: true });
  const productData = product.toJSON();
  product.set({
    ...product.toJSON(),
    sales: +productData.sales + qty,
  });
  await product.save();
};

module.exports = { deductProductQty, updateProductSales };
