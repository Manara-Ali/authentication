// IMPORT USER MODEL
const User = require("../models/userModel");

// IMPORT CATCH ASYNC FUNCTION
const catchAsync = require("../utils/catchAsyncFn");

// IMPORT ERROR CLASS
const ApplicationError = require("./../utils/applicationError");

// IMPORT FILTER REQUEST OBJ FUNCTION
const filterReqBody = require("./../utils/filterReqBodyFn");

// Create a route to retrieve all users from the database
exports.getAllUsers = catchAsync(async (req, res, next) => {
  // Retrieve all users from the database
  const users = await User.find();

  // Send response
  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
});

// Create a route to retrieve a single user from the database
exports.getUser = catchAsync(async (req, res, next) => {
  // Retrieve specific user based on the url parameter
  const user = await User.findById(req.params.id).populate({
    path: "cart",
  });

  // Assuming no user was found with that id
  if (!user) {
    // Create an instance of an application error
    const applicationError = new ApplicationError(
      `No user found with id: ${req.params.id}`,
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
      user,
    },
  });
});

// Create a route to retrieve a single user from the database
exports.updateUser = catchAsync(async (req, res, next) => {
  // Define the allowed parameters to update
  const allowedParameters = filterReqBody(req.body, "name", "email", "isAdmin");

  // Retrieve specific user based on the url parameter
  const user = await User.findByIdAndUpdate(req.params.id, allowedParameters, {
    runValidators: true,
    new: true,
  });

  // Assuming no user was found with that id
  if (!user) {
    // Create an instance of an application error
    const applicationError = new ApplicationError(
      `No user found with id: ${req.params.id}`,
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
      user,
    },
  });
});

// Create a route to retrieve a single user from the database
exports.deleteUser = catchAsync(async (req, res, next) => {
  // Retrieve specific user based on the url parameter
  const user = await User.findByIdAndDelete(req.params.id);

  // Assuming no user was found with that id
  if (!user) {
    // Create an instance of an application error
    const applicationError = new ApplicationError(
      `No user found with id: ${req.params.id}`,
      404
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
