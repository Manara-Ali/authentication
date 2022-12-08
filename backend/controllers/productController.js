// IMPORT PRODUCT MODEL TO MANIPULATE DATA ON THE DATABASE LEVEL
const Product = require("./../models/productModel");

// IMPORT CATCH ASYNC FUNCTION
const catchAsync = require("./../utils/catchAsyncFn");

// IMPORT ERROR CLASS
const ApplicationError = require("./../utils/applicationError");

// Create product route handlers
exports.getAllProducts = catchAsync(async (req, res, next) => {
  // Retrieve all the product from the database
  const products = await Product.find();

  // Send response
  res.status(200).json({
    status: "success",
    results: products.length,
    loggedInUser: res.loggedInUser,
    data: {
      products,
    },
  });
});

// Define a route handler to create new products
exports.createProduct = catchAsync(async (req, res, next) => {
  const product = await Product.create(req.body);

  // Send response
  res.status(201).json({
    status: "success",
    data: {
      product,
    },
  });
});

// Create a route handler to find a single product
exports.getProduct = catchAsync(async (req, res, next) => {
  // Retrieve a product based on the id
  const product = await Product.findById(req.params.id);

  // Assuming no product was found with that id
  if (!product) {
    // Create an instance of an application error
    const applicationError = new ApplicationError(
      `No product found with id: '${req.params.id}'. Try again.`,
      404
    );

    // Pass the error to express global error handling middleware
    next(applicationError);

    // Break out of the request/response cycle
    return;
  }

  // Send response
  res.status(200).json({
    status: "success",
    data: {
      product,
    },
  });
});

// Create a route handler to update products
exports.updateProduct = catchAsync(async (req, res, next) => {
  // Find the product to update
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    runValidators: true,
    new: true,
  });

  // If no product was found send an error
  if (!product) {
    // Create an instance of an application error
    const applicationError = new ApplicationError(
      `No product found with id: ${req.params.id}`
    );

    // Pass the error to express global error handling middleware
    next(applicationError);

    // Break out of the request/response cycle
    return;
  }

  // Send response
  res.status(200).json({
    status: "success",
    data: {
      product,
    },
  });
});

// Create a function to delete products
exports.deleteProduct = catchAsync(async (req, res, next) => {
  // Retrieve the product to delete
  const product = await Product.findByIdAndDelete(req.params.id);

  // Assuming no product was found with the id
  if (!product) {
    // Create an instance of an application error
    const applicationError = new ApplicationError(
      `No product found with id: ${req.params.id}`,
      400
    );

    // Pass the error to express global error handling middleware
    next(applicationError);

    // Break out of the request/response cycle
    return;
  }

  // Send response
  res.status(204).json({
    status: "success",
  });
});
