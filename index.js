const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
const session = require("express-session");
const flash = require("connect-flash");
const FileStore = require("session-file-store")(session);
const csrf = require("csurf");
require("dotenv").config();

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

app.use(
  session({
    store: new FileStore(),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(flash());
app.use(csrf());

app.use((req, res, next) => {
  res.locals.success_messages = req.flash("success_messages");
  res.locals.error_messages = req.flash("error_messages");
  next();
});

app.use((req, res, next) => {
  res.locals.user = req.session.user;
  res.locals.csrfToken = req.csrfToken();
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

const landingRoutes = require("./routes/landing");
const productRoutes = require("./routes/products");
const brandRoutes = require("./routes/brands");
const materialRoutes = require("./routes/materials");
const orderRoutes = require("./routes/orders");
const seriesRoutes = require("./routes/series");
const tagsRoutes = require("./routes/tags");
const userRoutes = require("./routes/users");
const shopRoutes = require("./routes/shop");
const cartRoutes = require("./routes/cart");

async function main() {
  app.use("/", landingRoutes);
  app.use("/products", productRoutes);
  app.use("/brands", brandRoutes);
  app.use("/materials", materialRoutes);
  app.use("/orders", orderRoutes);
  app.use("/series", seriesRoutes);
  app.use("/tags", tagsRoutes);
  app.use("/users", userRoutes);
  app.use("/shop", shopRoutes);
  app.use("/cart", cartRoutes);
}

main();

app.listen(3000, () => {
  console.log("Server has started");
});
