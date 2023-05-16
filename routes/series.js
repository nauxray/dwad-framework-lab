const express = require("express");
const router = express.Router();

const { Series } = require("../models");
const { bootstrapField, createSeriesForm } = require("../forms");
const { checkIfAuthenticated } = require("../middlewares/auth");

router.get("/add", checkIfAuthenticated, async (req, res) => {
  try {
    const seriesForm = createSeriesForm();
    res.render("series/add", { form: seriesForm.toHTML(bootstrapField) });
  } catch (err) {
    console.log(err);
    req.flash("error_messages", "Something went wrong!");
    res.redirect("/");
  }
});

router.post("/add", checkIfAuthenticated, async (req, res) => {
  try {
    const seriesForm = createSeriesForm();

    seriesForm.handle(req, {
      success: async (form) => {
        const newSeries = new Series();
        newSeries.set({ ...form.data });
        await newSeries.save();
        res.redirect("/");
      },
      error: (form) => {
        res.render("series/add", { form: form.toHTML(bootstrapField) });
      },
      empty: (form) => {
        res.render("series/add", { form: form.toHTML(bootstrapField) });
      },
    });
  } catch (err) {
    req.flash("error_messages", "Something went wrong!");
    res.redirect("/");
  }
});

module.exports = router;
