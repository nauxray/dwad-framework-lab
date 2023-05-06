const { Order, OrderItem } = require("../models");
const { getProductById } = require("./products");

const getOrderBySessionId = async (sessionId) => {
  const order = await Order.query({ where: { session_id: sessionId } }).fetch({
    require: false,
  });

  return order;
};

const getOrderItems = async (orderId) => {
  const orderItems = await OrderItem.query({
    where: { order_id: orderId },
  }).fetchAll({ require: false });

  return orderItems;
};

const getUserOrders = async (user_id) => {
  const userOrders = await Order.query({ where: { user_id } }).fetchAll({
    withRelated: [
      {
        orderItems: (query) => {
          query
            .join("products", "products.id", "=", "orderItems.product_id")
            .select(
              "orderItems.*",
              "products.name",
              "products.price",
              "products.description",
              "products.img_url",
              "products.shop_id",
              "products.brand_id",
              "products.series_id"
            );
        },
      },
    ],
    require: false,
  });
  return userOrders;
};

module.exports = { getOrderBySessionId, getOrderItems, getUserOrders };
