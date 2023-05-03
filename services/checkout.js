const Stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const stripeSuccessUrl = process.env.STRIPE_SUCCESS_URL;
const stripeErrorUrl = process.env.STRIPE_ERROR_URL;

const createCheckoutSession = async (cartItems) => {
  const lineItems = [];
  const meta = [];
  const filteredItems = [];

  cartItems.toJSON().map((item) => {
    if (
      filteredItems.filter((j) => j.product_id === item.product_id).length === 0
    ) {
      filteredItems.push(item);
    }
  });

  for (const i of filteredItems) {
    const quantity = await cartItems
      .where({ product_id: i.product_id })
      .count();
    const lineItem = {
      quantity,
      price_data: {
        currency: "SGD",
        unit_amount: +i.product.price * 100, //because the price is stored as dollars in db
        product_data: { name: i.product.name, images: [i.product.img_url] },
      },
    };
    lineItems.push(lineItem);
    meta.push({
      product_id: i.product_id,
      quantity,
    });
  }

  const metaData = JSON.stringify(meta);
  const payment = {
    payment_method_types: ["card"],
    mode: "payment",
    line_items: lineItems,
    success_url: stripeSuccessUrl + "?sessionId={CHECKOUT_SESSION_ID}",
    cancel_url: stripeErrorUrl,
    metadata: { orders: metaData },
  };

  return await Stripe.checkout.sessions.create(payment);
};

module.exports = { createCheckoutSession };
