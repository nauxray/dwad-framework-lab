const forms = require("forms");
const { statuses } = require("../utils/constant");

const fields = forms.fields;
const validators = forms.validators;
const widgets = forms.widgets;

const bootstrapField = (name, object) => {
  if (!Array.isArray(object.widget.classes)) {
    object.widget.classes = [];
  }

  if (object.widget.classes.indexOf("form-control") === -1) {
    object.widget.classes.push("form-control");
  }

  let validationclass = object.value && !object.error ? "is-valid" : "";
  validationclass = object.error ? "is-invalid" : validationclass;
  if (validationclass) {
    object.widget.classes.push(validationclass);
  }

  const label = object.labelHTML(name);
  const error = object.error
    ? '<div class="invalid-feedback">' + object.error + "</div>"
    : "";

  const widget = object.widget.toHTML(name, object);
  return '<div class="form-group">' + label + widget + error + "</div>";
};

const createSignUpForm = () => {
  return forms.create({
    username: fields.string({
      required: true,
      validators: [validators.alphanumeric("Username must be alphanumeric!")],
    }),
    email: fields.email({
      required: true,
    }),
    password: fields.password({
      required: true,
    }),
    confirm_password: fields.password({
      required: true,
      validators: [validators.matchField("password")],
    }),
  });
};

const createLoginForm = () => {
  return forms.create({
    email: fields.email({
      required: true,
    }),
    password: fields.password({
      required: true,
    }),
  });
};

const createAddProductForm = (brands = [], series = []) => {
  return forms.create({
    name: fields.string({
      required: true,
      errorAfterField: true,
    }),
    price: fields.number({
      required: true,
      errorAfterField: true,
      validators: [validators.integer()],
    }),
    quantity: fields.number({
      required: true,
      errorAfterField: true,
      validators: [validators.integer()],
    }),
    description: fields.string({
      required: true,
      errorAfterField: true,
      validators: [validators.maxlength(500), validators.minlength(0)],
      widget: widgets.textarea(),
    }),
    brand_id: fields.string({
      label: "Brand",
      required: true,
      errorAfterField: true,
      widget: widgets.select(),
      choices: brands.map((brnd) => [brnd.id, brnd.name]),
    }),
    series_id: fields.string({
      label: "Series",
      required: true,
      errorAfterField: true,
      widget: widgets.select(),
      choices: series.map((item) => [item.id, item.name]),
    }),
    img_url: fields.string({
      widget: widgets.hidden(),
    }),
  });
};

const createSearchForm = (brands = [], series = []) => {
  return forms.create({
    name: fields.string({
      required: false,
      errorAfterField: true,
    }),
    min_price: fields.string({
      required: false,
      errorAfterField: true,
      validators: [validators.integer(), validators.max()],
    }),
    max_price: fields.string({
      required: false,
      errorAfterField: true,
      validators: [validators.integer()],
    }),
    brand_id: fields.string({
      label: "Brand",
      required: false,
      errorAfterField: true,
      widget: widgets.select(),
      choices: brands,
    }),
    series_id: fields.string({
      label: "Series",
      required: false,
      errorAfterField: true,
      widget: widgets.select(),
      choices: series,
    }),
  });
};

const createOrderSearchForm = (brands = [], series = []) => {
  return forms.create({
    order_id: fields.string({
      label: "Order Id",
      required: false,
      errorAfterField: true,
      validators: [validators.integer()],
    }),
    product_name: fields.string({
      required: false,
      errorAfterField: true,
    }),
    brand_id: fields.string({
      label: "Brand",
      required: false,
      errorAfterField: true,
      widget: widgets.select(),
      choices: brands,
    }),
    series_id: fields.string({
      label: "Series",
      required: false,
      errorAfterField: true,
      widget: widgets.select(),
      choices: series,
    }),
    status: fields.string({
      required: false,
      errorAfterField: true,
      widget: widgets.select(),
      choices: [["", "----"], ...statuses.map((i) => [i, i])],
    }),
  });
};

module.exports = {
  bootstrapField,
  createSignUpForm,
  createLoginForm,
  createAddProductForm,
  createSearchForm,
  createOrderSearchForm,
};
