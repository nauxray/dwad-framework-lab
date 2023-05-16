const express = require("express");
const { createAddProductForm, bootstrapField } = require("../forms");
const { checkIfAuthenticated } = require("../middlewares/auth");
const { Product } = require("../models");
const router = express.Router();

const { getAllSeries } = require("../dal/series");
const { getBrands } = require("../dal/brands");
const { getProductById, getShopProducts } = require("../dal/products");
const { handleProductsSearchForm } = require("../middlewares/forms");
const { getShop } = require("../dal/shop");
const { getTags } = require("../dal/tags");

const cloudinaryName = process.env.CLOUDINARY_NAME;
const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY;
const cloudinaryPreset = process.env.CLOUDINARY_UPLOAD_PRESET;
const cloudinary = { cloudinaryName, cloudinaryApiKey, cloudinaryPreset };

router.get(
  "/",
  checkIfAuthenticated,
  handleProductsSearchForm,
  async (req, res) => {
    try {
      const shopId = (await getShop(req.session.user.id)).get("id");
      const shopProducts = (await getShopProducts(shopId)).toJSON();

      switch (res.locals.status) {
        case "success":
          res.render("products/index", {
            products: res.locals.products,
            form: res.locals.form,
          });
          break;
        case "error":
        case "empty":
          res.render("products/index", {
            products: shopProducts,
            form: res.locals.form,
          });
          break;
      }
    } catch (err) {
      req.flash("error_messages", "Something went wrong!");
      res.redirect("/");
    }
  }
);

router.get("/add", checkIfAuthenticated, async (req, res) => {
  try {
    const brands = await getBrands();
    const allSeries = await getAllSeries();
    const tags = await getTags();
    const addProductForm = createAddProductForm(brands, allSeries, tags);
    res.render("products/add", {
      form: addProductForm.toHTML(bootstrapField),
      ...cloudinary,
    });
  } catch (err) {
    req.flash("error_messages", "Something went wrong!");
    res.redirect("/");
  }
});

router.post("/add", checkIfAuthenticated, async (req, res) => {
  try {
    const brands = await getBrands();
    const allSeries = await getAllSeries();
    const tags = await getTags();
    const addProductForm = createAddProductForm(brands, allSeries, tags);
    const shopId = (await getShop(req.session.user.id)).get("id");

    addProductForm.handle(req, {
      success: async (form) => {
        const newProd = new Product();
        const { tags, ...data } = form.data;
        newProd.set({
          ...data,
          sales: 0,
          created_at: new Date(),
          shop_id: shopId,
        });

        await newProd.save();
        if (tags) {
          await newProd.tags().attach(tags.split(","));
        }

        res.redirect("/products");
      },
      error: (form) => {
        res.render("products/add", {
          form: form.toHTML(bootstrapField),
          ...cloudinary,
        });
      },
      empty: (form) => {
        res.render("products/add", {
          form: form.toHTML(bootstrapField),
          ...cloudinary,
        });
      },
    });
  } catch (err) {
    req.flash("error_messages", "Something went wrong!");
    res.redirect("/");
  }
});

router.get("/edit/:id", checkIfAuthenticated, async (req, res) => {
  try {
    const product = await getProductById(req.params.id);
    const brands = await getBrands();
    const allSeries = await getAllSeries();
    const tags = await getTags();
    const editProductForm = createAddProductForm(brands, allSeries, tags);

    editProductForm.fields.name.value = product.get("name");
    editProductForm.fields.price.value = product.get("price");
    editProductForm.fields.quantity.value = product.get("quantity");
    editProductForm.fields.description.value = product.get("description");
    editProductForm.fields.brand_id.value = product.get("brand");
    editProductForm.fields.series_id.value = product.get("series");
    editProductForm.fields.img_url.value = product.get("img_url");
    const selectedTags = await product.related("tags").pluck("id");
    editProductForm.fields.tags.value = selectedTags;

    res.render("products/edit", {
      product: product.toJSON(),
      form: editProductForm.toHTML(bootstrapField),
      ...cloudinary,
    });
  } catch (err) {
    res.sendStatus(500);
  }
});

router.post("/edit/:id", checkIfAuthenticated, async (req, res) => {
  try {
    const brands = await getBrands();
    const allSeries = await getAllSeries();
    const tags = await getTags();
    const editProductForm = createAddProductForm(brands, allSeries, tags);

    editProductForm.handle(req, {
      success: async (form) => {
        const updated = await getProductById(req.params.id);
        const { tags, ...data } = form.data;
        updated.set({
          ...data,
          sales: updated.get("sales"),
          created_at: updated.get("created_at"),
          shop_id: updated.get("shop_id"),
        });

        await updated.save();

        const tagIds = tags.split(",");
        const existingTagIds = await updated.related("tags").pluck("id");
        const toRemove = existingTagIds.filter((id) => !tagIds.includes(id));

        await updated.tags().detach(toRemove);
        await updated.tags().attach(tagIds);
        res.redirect("/products");
      },
      error: (form) => {
        res.render("products/edit", {
          form: form.toHTML(bootstrapField),
          ...cloudinary,
        });
      },
      empty: (form) => {
        res.render("products/edit", {
          form: form.toHTML(bootstrapField),
          ...cloudinary,
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
    req.flash("error_messages", "Something went wrong!");
    res.redirect("/");
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
