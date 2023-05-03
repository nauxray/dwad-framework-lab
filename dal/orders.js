const { Order, OrderItem } = require("../models");

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

module.exports = { getOrderBySessionId, getOrderItems };
