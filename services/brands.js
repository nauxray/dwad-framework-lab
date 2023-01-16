const { Brand } = require("../models");

const getBrands = async () => {
  const brands = (await Brand.collection().fetch()).toJSON();
  return brands;
};

module.exports = { getBrands };
