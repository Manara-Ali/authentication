// IMPORT EXPRESS TO CREATE AN EXPRESS APPLICATION
const express = require("express");

// IMPORT MORGAN
const morgan = require("morgan");

// IMPORT PRODUCTS ROUTER
const productRouter = require("./routers/productsRouter");

// IMPORT ERROR CONTROLLER
const errorController = require("./controllers/errorController");

// IMPORT APPLICATION ERROR
const ApplicationError = require("./utils/applicationError");

// CREATE A VARIABLE THAT REPRESENT OUR EXPRESS APPLICATION
const app = express();

// Define middleware to read data from the body
app.use(express.json());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Create routes
app.use("/api/v1/products", productRouter);

// Create a catch all route
app.use((req, res, next) => {
  // Create an instance of an application error
  const applicationError = new ApplicationError(
    `Cannot find ${req.originalUrl} on our servers...`,
    404
  );

  // Pass the error to express global error handling middleware
  next(applicationError);
});

// Create a global error handling middleware
app.use(errorController.globalErrorHandler);

// EXPORT APP TO BE USED IN OTHER PARTS OF OUR APPLICATION
module.exports = app;
