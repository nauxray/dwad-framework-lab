const { getOrderItems } = require("../dal/orders");
const { Order, OrderItem } = require("../models");
const { deductProductQty, updateProductSales } = require("./product");

const createOrder = async (userId, cartItems) => {
  let totalCost = 0;
  cartItems.map((item) => (totalCost += +item.product.price));

  const order = new Order();
  order.set("created_at", new Date());
  order.set("cost", totalCost);
  order.set("status", "UNPAID");
  order.set("user_id", userId);
  order.set("session_id", "");
  const createdOrder = await order.save();

  cartItems.map(async (item) => {
    const orderItem = new OrderItem();
    orderItem.set("product_id", item.product_id);
    orderItem.set("order_id", createdOrder.get("id"));
    await orderItem.save();
  });

  return createdOrder.get("id");
};

const updateSessionId = async (orderId, sessionId) => {
  const order = await Order.where({ id: orderId }).fetch({ require: true });
  order.set({ ...order.toJSON(), session_id: sessionId });
  await order.save();
};

const updateOrderStatus = async (orderId, status) => {
  const order = await Order.where({ id: orderId }).fetch({ require: true });
  order.set({ ...order.toJSON(), status });
  return await order.save();
};

const updatePaidOrder = async (orderId) => {
  const order = await updateOrderStatus(orderId, "PAID");

  if (order.previousAttributes().status === "UNPAID") {
    const orderItems = await getOrderItems(orderId);
    const productIdArr = orderItems.toJSON().map((i) => i.product_id);
    let productQtys = {};
    for (let i = 0; i < productIdArr.length; i++) {
      productQtys[productIdArr[i]] = (productQtys[productIdArr[i]] || 0) + 1;
    }
    Object.keys(productQtys).forEach(async (productId) => {
      await deductProductQty(+productId, productQtys[productId]);
      await updateProductSales(+productId, productQtys[productId]);
    });
  }
};

module.exports = {
  createOrder,
  updateSessionId,
  updateOrderStatus,
  updatePaidOrder,
};
