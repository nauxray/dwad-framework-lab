const forms = require("forms");

const fields = forms.fields;
const validators = forms.validators;
const widgets = forms.widgets;

var bootstrapField = function (name, object) {
  if (!Array.isArray(object.widget.classes)) {
    object.widget.classes = [];
  }

  if (object.widget.classes.indexOf("form-control") === -1) {
    object.widget.classes.push("form-control");
  }

  var validationclass = object.value && !object.error ? "is-valid" : "";
  validationclass = object.error ? "is-invalid" : validationclass;
  if (validationclass) {
    object.widget.classes.push(validationclass);
  }

  var label = object.labelHTML(name);
  var error = object.error
    ? '<div class="invalid-feedback">' + object.error + "</div>"
    : "";

  var widget = object.widget.toHTML(name, object);
  return '<div class="form-group">' + label + widget + error + "</div>";
};

// // if allCategories is null, it will be an empty array
// // if allTags is null, it will be an empty array
// const createProductForm = (allCategories = [], allTags = []) => {
//   // use forms.create to create a new form object
//   return forms.create({
//     name: fields.string({
//       required: true,
//       errorAfterField: true,
//     }),
//     cost: fields.number({
//       required: true,
//       errorAfterField: true,
//       // indicate the field must be an integeer
//       // IMPORTANT: note the function call
//       // in the array
//       validators: [validators.integer()],
//     }),
//     description: fields.string({
//       required: true,
//       errorAfterField: true,
//     }),
//     category_id: fields.string({
//       label: "Category",
//       required: true,
//       errorAfterField: true,

//       // indicate that we want to display as select dropdown
//       widget: widgets.select(),
//       // choices must be an array of array
//       // each inner array must have 2 elements
//       // - index 0: the ID of the choice
//       // - index 1: the display value of the choice
//       choices: allCategories,
//     }),
//     tags: fields.string({
//       required: true,
//       errorAfterField: true,
//       widget: widgets.multipleSelect(),
//       choices: allTags,
//     }),
//     image_url: fields.string({
//       widget: widgets.hidden(), // this creates a hidden form field
//     }),
//   });
// };

const createSignUpForm = () => {
  return forms.create({
    username: fields.string({
      required: true,
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

const createEditProfileForm = function (categories = [], tags = []) {
  return forms.create({
    username: fields.string({
      required: true,
    }),
    email: fields.email({
      required: true,
    }),
    old_password: fields.password({
      required: true,
    }),
    new_password: fields.password({
      required: true,
    }),
    confirm_new_password: fields.password({
      required: true,
      validators: [validators.matchField("password")],
    }),
  });
};

// const createSearchForm = function (categories = [], tags = []) {
//   return forms.create({
//     name: fields.string({
//       required: false, // required is false because all search criteria are optional
//     }),
//     // using `fields.number` instead of `fields.string` means the textbox
//     // only accept numbers on the browser.
//     // the value in the form is still a string (all values sent to the server
//     // will always be a string)
//     min_cost: fields.number({
//       required: false,
//       validators: [validators.integer()],
//       widget: widgets.number(),
//     }),
//     max_cost: fields.number({
//       required: false,
//       validators: [validators.integer()],
//       widget: widgets.number(),
//     }),
//     category_id: fields.string({
//       label: "Category",
//       required: false,
//       widget: widgets.select(), // use the select dropdown
//       choices: categories, // `categories` is one of the parameters passed to the function
//     }),
//     tags: fields.string({
//       required: false,
//       widget: widgets.multipleSelect(),
//       choices: tags, // `tags` is one of the parameters passed to the function
//     }),
//   });
// };

module.exports = {
  bootstrapField,
  //   createProductForm,
  createSignUpForm,
  createLoginForm,
  createEditProfileForm,
  // createSearchForm,
};
