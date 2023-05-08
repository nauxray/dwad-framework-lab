const express = require("express");
const router = express.Router();
require("dotenv").config();
const { authenticateToken } = require("../../middlewares/auth");
const { createCheckoutSession } = require("../../services/checkout");
const { getUserCart } = require("../../dal/cart");
const {
  createOrder,
  updateSessionId,
  updatePaidOrder,
} = require("../../services/orders");
const { clearCart } = require("../../services/cart");
const { getOrderBySessionId, getOrderProducts } = require("../../dal/orders");

const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;

router.get("/", authenticateToken, async (req, res) => {
  try {
    const cartItems = await getUserCart(req.user.userId);
    const groupByShop = {};
    cartItems.toJSON().forEach((item) => {
      if (groupByShop[item.product.shop_id]) {
        groupByShop[item.product.shop_id].push(item);
      } else {
        groupByShop[item.product.shop_id] = [item];
      }
    });

    let orderIds = [];
    Object.values(groupByShop).forEach(async (items) => {
      orderIds.push(createOrder(req.user.userId, items));
    });
    orderIds = await Promise.all(orderIds);
    const stripeSession = await createCheckoutSession(cartItems);
    await clearCart(req.user.userId);
    orderIds.forEach(async (id) => {
      await updateSessionId(id, stripeSession.id);
    });

    res.send({ url: stripeSession.url });
  } catch (error) {
    res.status(400).send({ error: "Could not create a checkout session!" });
  }
});

router.post("/success", authenticateToken, async (req, res) => {
  try {
    const orders = await getOrderBySessionId(req.body.sessionId);
    const orderIds = orders.toJSON().map((order) => order.id);
    orderIds.forEach(async (id) => {
      await updatePaidOrder(id);
    });
  } catch (error) {
    res.status(400).send({ error });
  }
});

router.get("/:orderId", authenticateToken, async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const orderItems = await getOrderProducts(orderId);
    const stripeSession = await createCheckoutSession(
      orderItems,
      "completePayment"
    );
    await updateSessionId(orderId, stripeSession.id);
    res.send({ url: stripeSession.url });
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: "Could not create a checkout session!" });
  }
});

router.post(
  "/process_payment",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const payload = req.body;
    const sigHeader = req.headers["stripe-signature"];
    let event;
    try {
      event = Stripe.webhooks.constructEvent(
        payload,
        sigHeader,
        endpointSecret
      );
    } catch (e) {
      res.send({ error: e.message });
      console.log(e.message);
    }
    if (event.type == "checkout.session.completed") {
      let stripeSession = event.data.object;
      console.log(stripeSession);
    }
    res.send({ received: true });
  }
);

module.exports = router;
