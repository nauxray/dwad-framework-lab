const { Tag } = require("../models");

const getTags = async () => {
  const tags = (await Tag.collection().fetch()).toJSON();
  return tags;
};

module.exports = { getTags };
