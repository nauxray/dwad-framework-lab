const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
const cors = require("cors");
const session = require("express-session");
const flash = require("connect-flash");
const FileStore = require("session-file-store")(session);
const csrf = require("csurf");
require("dotenv").config();

const port = process.env.PORT || 8080;

const app = express();
app.set("view engine", "hbs");
app.use(express.static("public"));

wax.on(hbs.handlebars);
wax.setLayoutPath("./views/layouts");

app.use(
  express.urlencoded({
    extended: false,
  })
);

app.use(cors());

app.use(
  session({
    store: new FileStore(),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(flash());

const csrfInstance = csrf();
app.use(function (req, res, next) {
  if (req.url === "/checkout/process_payment" || req.url.startsWith("/api/")) {
    return next();
  }
  csrfInstance(req, res, next);
});

app.use((req, res, next) => {
  res.locals.success_messages = req.flash("success_messages");
  res.locals.error_messages = req.flash("error_messages");
  next();
});

app.use((req, res, next) => {
  res.locals.user = req.session.user;
  if (req.csrfToken) {
    res.locals.csrfToken = req.csrfToken();
  }
  next();
});

app.use((err, req, res, next) => {
  if (err && err.code == "EBADCSRFTOKEN") {
    req.flash("error_messages", "The form has expired. Please try again");
    res.redirect("back");
  } else {
    next();
  }
});

const api = {
  users: require("./routes/api/users"),
  products: require("./routes/api/products"),
  cart: require("./routes/api/cart"),
  shop: require("./routes/api/shop"),
  checkout: require("./routes/api/checkout"),
  orders: require("./routes/api/orders"),
};

const productRoutes = require("./routes/products");
const brandRoutes = require("./routes/brands");
const materialRoutes = require("./routes/materials");
const orderRoutes = require("./routes/orders");
const seriesRoutes = require("./routes/series");
const tagsRoutes = require("./routes/tags");
const userRoutes = require("./routes/users");
const cloudinaryRoutes = require("./routes/cloudinary");

async function main() {
  app.use("/products", productRoutes);
  app.use("/brands", brandRoutes);
  app.use("/materials", materialRoutes);
  app.use("/orders", orderRoutes);
  app.use("/series", seriesRoutes);
  app.use("/tags", tagsRoutes);
  app.use("/users", userRoutes);
  app.use("/cloudinary", cloudinaryRoutes);

  Object.keys(api).map((route) => {
    app.use(`/api/${route}`, api[route]);
  });

  app.use("/", (req, res) => {
    res.redirect("/products");
  });
}

main();

app.listen(port, () => {
  console.log("Server has started");
});
