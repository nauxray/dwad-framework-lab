const { getBrands } = require("../dal/brands");
const { getOrdersByShopId } = require("../dal/orders");
const { getAllSeries } = require("../dal/series");
const { getShop } = require("../dal/shop");
const {
  createLoginForm,
  createSignUpForm,
  bootstrapField,
  createSearchForm,
  createOrderSearchForm,
} = require("../forms");
const { User, Product, Shop } = require("../models");
const { getHashedPassword } = require("../utils/getHashedPw");
require("dotenv").config();

const handleLoginForm = async (req, res, next) => {
  const loginForm = createLoginForm();
  loginForm.handle(req, {
    success: async (form) => {
      const user = await User.where({
        email: form.data.email,
        password: getHashedPassword(form.data.password),
      }).fetch({
        require: false,
      });

      if (user) {
        const role = user.get("role");
        if (
          (req.body.token && role === "buyer") ||
          (!req.body.token && role === "seller")
        ) {
          req.session.user = {
            id: user.get("id"),
            email: user.get("email"),
            username: user.get("username"),
          };
          res.locals.status = "success";
        } else {
          res.locals.status = "forbiddenLogin";
          res.locals.errorMsg = "Forbidden Login";
        }
      } else {
        res.locals.status = "wrongCredentials";
        res.locals.errorMsg = "Invalid Credentials";
      }
      res.locals.form = form.toHTML(bootstrapField);
      next();
    },
    error: (form) => {
      res.locals.status = "error";
      res.locals.errorMsg = "Internal Server Error";
      res.locals.form = form.toHTML(bootstrapField);
      next();
    },
    empty: (form) => {
      res.locals.status = "empty";
      res.locals.form = form.toHTML(bootstrapField);
      next();
    },
  });
};

const handleSignupForm = async (req, res, next) => {
  const signUpForm = createSignUpForm();
  signUpForm.handle(req, {
    success: async (form) => {
      const { email, username, password, confirm_password } = form.data;

      if (password !== confirm_password) {
        res.locals.status = "error";
        res.locals.errorMsg = "Passwords do not match";
        return next();
      }

      let user = await User.where({ email }).fetch({ require: false });
      if (user) {
        res.locals.status = "error";
        res.locals.errorMsg = "Email is already used";
        return next();
      }

      user = await User.where({ username }).fetch({ require: false });
      if (user) {
        res.locals.status = "error";
        res.locals.errorMsg = "Username is already used";
        return next();
      }

      const newUser = new User();
      const userData = {
        email,
        username,
        password: getHashedPassword(password),
        role: req.body.role ? "seller" : "buyer",
        pfp: "",
        created_at: new Date(),
      };

      newUser.set(userData);
      const createdUser = await newUser.save();

      if (req.body.role) {
        const newShop = new Shop();
        newShop.set({
          user_id: createdUser.get("id"),
          shop_featured: 0,
          shop_bio: "",
        });
        await newShop.save();
      }

      req.session.user = {
        id: createdUser.get("id"),
        email: createdUser.get("email"),
        username: createdUser.get("username"),
      };
      res.locals.status = "success";
      next();
    },
    error: (form) => {
      res.locals.status = "error";
      res.locals.errorMsg =
        form.fields.username.error ?? "Internal Server Error";
      res.locals.form = form.toHTML(bootstrapField);
      next();
    },
    empty: (form) => {
      res.locals.status = "empty";
      res.locals.form = form.toHTML(bootstrapField);
      next();
    },
  });
};

const handleProductsSearchForm = async (req, res, next) => {
  const brands = (await getBrands()).map((brand) => [brand.id, brand.name]);
  const allSeries = (await getAllSeries()).map((series) => [
    series.id,
    series.name,
  ]);
  allSeries.unshift([0, "----"]);
  brands.unshift([0, "----"]);

  const searchForm = createSearchForm(brands, allSeries);

  searchForm.handle(req, {
    empty: async (form) => {
      res.locals.status = "empty";
      res.locals.form = form.toHTML(bootstrapField);
      next();
    },
    error: async (form) => {
      res.locals.status = "error";
      res.locals.form = form.toHTML(bootstrapField);
      next();
    },
    success: async (form) => {
      const data = form.data;
      const shopId = (await getShop(req.session.user.id)).get("id");

      const products = await Product.query((qb) => {
        qb.where("shop_id", "=", shopId);
        if (data.name) {
          qb.whereILike("name", `%${data.name}%`);
        }
        if (data.brand_id && data.brand_id != "0") {
          qb.where("brand_id", "=", data.brand_id);
        }
        if (data.series_id && data.series_id != "0") {
          qb.where("series_id", "=", data.series_id);
        }
        if (data.min_price) {
          qb.andWhere("price", ">=", +data.min_price);
        }
        if (data.max_price) {
          qb.andWhere("price", "<=", +data.max_price);
        }
      }).fetchAll({ withRelated: ["brand", "series"], required: false });

      res.locals.status = "success";
      res.locals.products = products.toJSON();
      res.locals.form = form.toHTML(bootstrapField);
      next();
    },
  });
};

const handleOrdersSearchForm = async (req, res, next) => {
  const brands = (await getBrands()).map((brand) => [brand.id, brand.name]);
  const allSeries = (await getAllSeries()).map((series) => [
    series.id,
    series.name,
  ]);
  allSeries.unshift([0, "----"]);
  brands.unshift([0, "----"]);

  const shopId = (await getShop(req.session.user.id)).get("id");
  const searchForm = createOrderSearchForm(brands, allSeries);

  searchForm.handle(req, {
    empty: async (form) => {
      res.locals.status = "empty";
      res.locals.form = form.toHTML(bootstrapField);
      res.locals.orders = await getOrdersByShopId(shopId);
      next();
    },
    error: async (form) => {
      res.locals.status = "error";
      res.locals.form = form.toHTML(bootstrapField);
      res.locals.orders = await getOrdersByShopId(shopId);
      next();
    },
    success: async (form) => {
      const data = form.data;
      console.log(data);
      const queryCb = (qb) => {
        qb.where("shop_id", "=", shopId);
        if (data.product_name) {
          qb.whereILike("name", `%${data.product_name}%`);
        }
        if (data.brand_id && data.brand_id != "0") {
          qb.where("brand_id", "=", data.brand_id);
        }
        if (data.series_id && data.series_id != "0") {
          qb.where("series_id", "=", data.series_id);
        }
      };

      res.locals.status = "success";
      res.locals.orders = await getOrdersByShopId(
        shopId,
        queryCb,
        +data.order_id,
        data.status
      );
      res.locals.form = form.toHTML(bootstrapField);
      next();
    },
  });
};

module.exports = {
  handleLoginForm,
  handleSignupForm,
  handleProductsSearchForm,
  handleOrdersSearchForm,
};
