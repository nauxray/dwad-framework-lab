const express = require("express");
const { createAddProductForm, bootstrapField } = require("../forms");
const { checkIfAuthenticated } = require("../middlewares");
const { Product } = require("../models");
const router = express.Router();

const { getAllSeries } = require("../services/series");
const { getBrands } = require("../services/brands");
const { getShopProducts, getProductById } = require("../services/products");

router.get("/", checkIfAuthenticated, async (req, res) => {
  try {
    let products = (await getShopProducts(req.session.user.id)).toJSON();
    res.render("products/index", {
      products,
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
        });
      },
      empty: (form) => {
        res.render("products/add", {
          form: form.toHTML(bootstrapField),
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

    res.render("products/edit", {
      product,
      form: editProductForm.toHTML(bootstrapField),
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
        });
      },
      empty: (form) => {
        res.render("products/edit", {
          form: form.toHTML(bootstrapField),
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
