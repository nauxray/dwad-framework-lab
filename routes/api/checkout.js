const express = require("express");
const { authenticateToken } = require("../../middlewares");
const router = express.Router();
const { getUserCart } = require("../../dal/cart");
require("dotenv").config();
const Stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

router.get("/", authenticateToken, async (req, res) => {
  let items = await getUserCart(req.user.userId);

  let lineItems = [];
  let meta = [];
  const filteredItems = [];
  items.toJSON().map((item) => {
    if (
      filteredItems.filter((j) => j.product_id === item.product_id).length === 0
    ) {
      filteredItems.push(item);
    }
  });

  for (let i of filteredItems) {
    const quantity = await items.where({ product_id: i.product_id }).count();
    const lineItem = {
      quantity,
      price_data: {
        currency: "SGD",
        unit_amount: parseFloat(i.product.price),
        product_data: {
          name: i.product.name,
        },
      },
    };
    lineItems.push(lineItem);
    meta.push({
      product_id: i.product_id,
      quantity,
    });
  }

  let metaData = JSON.stringify(meta);
  const payment = {
    payment_method_types: ["card"],
    mode: "payment",
    line_items: lineItems,
    success_url:
      process.env.STRIPE_SUCCESS_URL + "?sessionId={CHECKOUT_SESSION_ID}",
    cancel_url: process.env.STRIPE_ERROR_URL,
    metadata: {
      orders: metaData,
    },
  };

  let stripeSession = await Stripe.checkout.sessions.create(payment);
  res.send({ sessionID: stripeSession.id });
});

router.post(
  "/process_payment",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    let payload = req.body;
    let endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;
    let sigHeader = req.headers["stripe-signature"];
    let event;
    try {
      event = Stripe.webhooks.constructEvent(
        payload,
        sigHeader,
        endpointSecret
      );
    } catch (e) {
      res.send({
        error: e.message,
      });
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
