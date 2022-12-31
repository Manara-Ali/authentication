// IMPORT ERROR CLASS
const ApplicationError = require("./../utils/applicationError");

// Create a function that can handle CASTERROR
const handleCastError = (error) => {
  // Create an instance of an application error
  const applicationError = new ApplicationError(
    `Invalid id: '${error.value}'. Try again.`,
    400
  );

  // Return the error
  return applicationError;
};

// Create a function to handle token expired error
const handleTokenExpiredError = () => {
  // Create an instance of an application error
  const applicationError = new ApplicationError(
    "Your login token has expired. Please log back in",
    401
  );

  // Return error
  return applicationError;
};

// Create a function to handle JsonWebToken errors
const handleJsonWebTokenError = () => {
  // Create an instance of an application error
  const applicationError = new ApplicationError(
    "Invalid token. Please log back in",
    401
  );

  // Return the error
  return applicationError;
};

// Create a function to handle duplicate error
const handleDuplicateError = (error) => {
  // Retrieve duplicate object
  const duplicate = Object.keys(error.keyPattern)[0];
  // Retrieve duplicate
  const duplicateValue = error.keyValue?.email;
  // Create an instance of an application error
  const applicationError = new ApplicationError(
    `Duplicate Error: The ${duplicate}: "${duplicateValue}" already exist! Try again`,
    400
  );

  // Return error
  return applicationError;
};

// 2. VALIDATION ERROR
const handleValidationError = (error) => {
  // Retrieve the error values
  const errorValues = Object.values(error)[0];

  // Retrieve the error object
  const errorObj = Object.entries(errorValues)[0][1];

  // Retrieve the error message
  const errorMsg = errorObj.message;

  // Create a new instance of an application error
  const applicationError = new ApplicationError(errorMsg, 400);

  // Return the application error
  return applicationError;
};

// Create a function to send errors in development
const sendDevError = (error, res) => {
  // Send response
  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
    stack: error.stack,
    error,
  });
};

// Create a function to send error in production
const sendProdError = (error, res) => {
  // Assuming operational error
  if (error.isOperational) {
    // Send response
    res.status(error.statusCode).json({
      status: error.status,
      message: error.message,
    });
  } else {
    // Send response
    res.status(500).json({
      status: "error",
      message: "Something went wrong. Try again later...",
    });
  }
};

// Create a global error handling middleware
exports.globalErrorHandler = (error, req, res, next) => {
  // Assuming the error has a status code
  error.statusCode = error.statusCode || 500;

  // Assuming the error has a status
  error.status = error.status || "error";

  // Assuming the error has a message
  error.message = error.message;

  if (process.env.NODE_ENV === "development") {
    sendDevError(error, res);
  } else if (process.env.NODE_ENV === "production") {
    // Create a variable to hold the current error
    let mongooseError;

    // Duplicate Error
    if (error.code === 11000) {
      // Make a copy of the current error
      mongooseError = { ...error };

      // Create a function to handle duplicate errors
      mongooseError = handleDuplicateError(error);

      // Send response
      sendProdError(mongooseError, res);
    }

    // CASTERROR
    if (error.name === "CastError") {
      // Make a copy of the error
      mongooseError = { ...error };

      // Call a function that can handle the error
      mongooseError = handleCastError(mongooseError);

      // Send response
      sendProdError(mongooseError, res);
    }

    // VALIDATIONERROR
    if (error.name === "ValidationError") {
      // Make a copy of the current error
      mongooseError = { ...error };

      // Call the function responsible of handling the error
      mongooseError = handleValidationError(mongooseError);

      // Send response
      sendProdError(mongooseError, res);
    }

    if (error.name === "TokenExpiredError") {
      // Make a copy of the current error
      mongooseError = { ...error };

      // Call a function capable of handling the error
      mongooseError = handleTokenExpiredError();

      // Send response
      sendProdError(mongooseError, res);
    }

    if (error.name === "JsonWebTokenError") {
      // Make a copy of the error
      mongooseError = { ...error };

      // Call a function capable of handling the error
      mongooseError = handleJsonWebTokenError();

      // Send error in production
      sendProdError(mongooseError, res);
    }

    if (!mongooseError) {
      sendProdError(error, res);
    }
  }
};
