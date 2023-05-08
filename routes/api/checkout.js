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
    const orderId = await createOrder(req.user.userId, cartItems);
    const stripeSession = await createCheckoutSession(cartItems);
    await clearCart(req.user.userId);
    await updateSessionId(orderId, stripeSession.id);
    res.send({ url: stripeSession.url });
  } catch (error) {
    res.status(400).send({ error: "Could not create a checkout session!" });
  }
});

router.post("/success", authenticateToken, async (req, res) => {
  try {
    const orderId = (await getOrderBySessionId(req.body.sessionId)).get("id");
    await updatePaidOrder(orderId);
  } catch (error) {
    res.status(400).send({ error });
  }
});

// another api for completing payment. need to createCheckoutSession, update order with new session id
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
