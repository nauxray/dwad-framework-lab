const express = require("express");
const {
  createAddProductForm,
  bootstrapField,
  createSearchForm,
} = require("../forms");
const { checkIfAuthenticated } = require("../middlewares");
const { Product } = require("../models");
const router = express.Router();

const { getAllSeries } = require("../dal/series");
const { getBrands } = require("../dal/brands");
const { getProductById, getShopProducts } = require("../dal/products");

router.get("/", checkIfAuthenticated, async (req, res) => {
  try {
    const userId = req.session.user.id;
    const shopProducts = (await getShopProducts(req.session.user.id)).toJSON();
    const brands = (await getBrands()).map((brand) => [brand.id, brand.name]);
    const allSeries = (await getAllSeries()).map((series) => [
      series.id,
      series.name,
    ]);
    allSeries.unshift([0, "----"]);
    brands.unshift([0, "----"]);

    const searchForm = createSearchForm(brands, allSeries);
    const query = Product.collection();

    searchForm.handle(req, {
      empty: async (form) => {
        res.render("products/index", {
          products: shopProducts,
          form: form.toHTML(bootstrapField),
        });
      },
      error: async (form) => {
        res.render("products/index", {
          products: shopProducts,
          form: form.toHTML(bootstrapField),
        });
      },
      success: async (form) => {
        const data = form.data;
        const products = await Product.query((qb) => {
          query.where("shop_id", "=", userId);
          if (data.name) {
            qb.whereILike("name", `%${data.name}%`);
          }
          if (data.brand_id && data.brand_id != "0") {
            query.where("brand_id", "=", data.brand_id);
          }
          if (data.series_id && data.series_id != "0") {
            query.where("series_id", "=", data.series_id);
          }
          if (data.min_price) {
            qb.andWhere("price", ">=", +data.min_price);
          }
          if (data.max_price) {
            qb.andWhere("price", "<=", +data.max_price);
          }
        }).fetchAll({ withRelated: ["brand", "series"], required: false });
        res.render("products/index", {
          products: products.toJSON(),
          form: form.toHTML(bootstrapField),
        });
      },
    });
  } catch (err) {
    res.status(500).send([]);
  }
});

router.get("/add", checkIfAuthenticated, async (req, res) => {
  try {
    const brands = await getBrands();
    const allSeries = await getAllSeries();
    const addProductForm = createAddProductForm(brands, allSeries);
    res.render("products/add", {
      form: addProductForm.toHTML(bootstrapField),
      cloudinaryName: process.env.CLOUDINARY_NAME,
      cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
      cloudinaryPreset: process.env.CLOUDINARY_UPLOAD_PRESET,
    });
  } catch (err) {
    res.status(500).send([]);
  }
});

router.post("/add", checkIfAuthenticated, async (req, res) => {
  try {
    const brands = await getBrands();
    const allSeries = await getAllSeries();
    const addProductForm = createAddProductForm(brands, allSeries);

    addProductForm.handle(req, {
      success: async (form) => {
        const newProd = new Product();
        newProd.set({
          ...form.data,
          sales: 0,
          created_at: new Date().toJSON().split("T")[0],
          shop_id: req.session.user.id,
        });

        await newProd.save();
        res.redirect("/products");
      },
      error: (form) => {
        res.render("products/add", {
          form: form.toHTML(bootstrapField),
          cloudinaryName: process.env.CLOUDINARY_NAME,
          cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
          cloudinaryPreset: process.env.CLOUDINARY_UPLOAD_PRESET,
        });
      },
      empty: (form) => {
        res.render("products/add", {
          form: form.toHTML(bootstrapField),
          cloudinaryName: process.env.CLOUDINARY_NAME,
          cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
          cloudinaryPreset: process.env.CLOUDINARY_UPLOAD_PRESET,
        });
      },
    });
  } catch (err) {
    res.status(500).send([]);
  }
});

router.get("/edit/:id", checkIfAuthenticated, async (req, res) => {
  try {
    const product = await getProductById(req.params.id);
    const brands = await getBrands();
    const allSeries = await getAllSeries();
    const editProductForm = createAddProductForm(brands, allSeries);

    editProductForm.fields.name.value = product.get("name");
    editProductForm.fields.price.value = product.get("price");
    editProductForm.fields.quantity.value = product.get("quantity");
    editProductForm.fields.description.value = product.get("description");
    editProductForm.fields.brand_id.value = product.get("brand");
    editProductForm.fields.series_id.value = product.get("series");
    editProductForm.fields.img_url.value = product.get("img_url");

    res.render("products/edit", {
      product: product.toJSON(),
      form: editProductForm.toHTML(bootstrapField),
      cloudinaryName: process.env.CLOUDINARY_NAME,
      cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
      cloudinaryPreset: process.env.CLOUDINARY_UPLOAD_PRESET,
    });
  } catch (err) {
    res.sendStatus(500);
  }
});

router.post("/edit/:id", checkIfAuthenticated, async (req, res) => {
  try {
    const brands = await getBrands();
    const allSeries = await getAllSeries();
    const editProductForm = createAddProductForm(brands, allSeries);

    editProductForm.handle(req, {
      success: async (form) => {
        const updated = await getProductById(req.params.id);
        updated.set({
          ...form.data,
          sales: updated.get("sales"),
          created_at: updated.get("created_at"),
          shop_id: updated.get("shop_id"),
        });

        await updated.save();
        res.redirect("/products");
      },
      error: (form) => {
        res.render("products/edit", {
          form: form.toHTML(bootstrapField),
          cloudinaryName: process.env.CLOUDINARY_NAME,
          cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
          cloudinaryPreset: process.env.CLOUDINARY_UPLOAD_PRESET,
        });
      },
      empty: (form) => {
        res.render("products/edit", {
          form: form.toHTML(bootstrapField),
          cloudinaryName: process.env.CLOUDINARY_NAME,
          cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
          cloudinaryPreset: process.env.CLOUDINARY_UPLOAD_PRESET,
        });
      },
    });
  } catch (err) {
    res.sendStatus(500);
  }
});

router.get("/delete/:id", checkIfAuthenticated, async (req, res) => {
  try {
    const product = (await getProductById(req.params.id)).toJSON();
    res.render("products/delete", {
      product,
    });
  } catch (err) {
    res.status(500).send([]);
  }
});

router.post("/delete/:id", async (req, res) => {
  try {
    const toDelete = await Product.where({ id: req.params.id }).fetch({
      require: true,
    });
    await toDelete.destroy();
    res.redirect("/products");
  } catch (err) {
    res.sendStatus(500);
  }
});

module.exports = router;
