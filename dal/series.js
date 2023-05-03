const { Series } = require("../models");

const getAllSeries = async () => {
  const series = (await Series.collection().fetch()).toJSON();
  return series;
};

module.exports = { getAllSeries };
