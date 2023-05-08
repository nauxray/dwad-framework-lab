const { Order, OrderItem, Product } = require("../models");

const getOrderBySessionId = async (sessionId) => {
  const order = await Order.query({
    where: { session_id: sessionId },
  }).fetchAll({
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

const getOrderProducts = async (orderId) => {
  const orderItems = await OrderItem.query({
    where: { order_id: orderId },
  }).fetchAll({
    withRelated: ["product"],
    require: false,
  });

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

const getOrderById = async (id) => {
  const order = await Order.query({ where: { id } }).fetch({
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
  return order;
};

const getOrdersByShopId = async (
  shopId,
  queryCb = null,
  orderId = false,
  status = null
) => {
  let shopProductIds;

  if (queryCb) {
    shopProductIds = (await Product.query(queryCb).fetchAll({ require: false }))
      .toJSON()
      .map((i) => i.id);
  } else {
    shopProductIds = (
      await Product.query().where({ shop_id: shopId }).select("id")
    ).map((i) => i.id);
  }

  const orderIds = (
    await OrderItem.query().whereIn("product_id", shopProductIds)
  )

    .map((i) => i.order_id)
    .filter((i) => (!!orderId ? i === orderId : true));

  const orderPromises = [];
  Array.from(new Set(orderIds)).forEach((id) => {
    orderPromises.push(getOrderById(id));
  });

  let orders = await Promise.all(orderPromises);

  orders = orders
    .map((i) => i.toJSON())
    .filter((i) => (!!status ? i.status === status : i.status !== "UNPAID"));

  orders.map((i) => {
    const filtered = [];

    i.orderItems.map((j) => {
      j.qty = i.orderItems.filter((k) => k.product_id === j.product_id).length;

      if (!filtered.filter((f) => f.product_id === j.product_id).length) {
        filtered.push(j);
      }
    });

    i.orderItems = filtered;
    return i;
  });

  return orders;
};

module.exports = {
  getOrderById,
  getOrderBySessionId,
  getOrderItems,
  getOrderProducts,
  getUserOrders,
  getOrdersByShopId,
};
