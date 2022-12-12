// IMPORT CRYPTO TO HELP WITH RESET TOKEN
const crypto = require("crypto");

// IMPORT UTIL NODE MODULE TO HELP WITH TOKEN VERIFICATION
const util = require("util");

// IMPORT JSONWEBTOKEN TO HELP WITH AUTHENTICATION/AUTHORIZATION
const jwt = require("jsonwebtoken");

// IMPORT USER MODEL
const User = require("../models/userModel");

// IMPORT CATCH ASYNC
const catchAsync = require("../utils/catchAsyncFn");

// IMPORT ERROR CLASS
const ApplicationError = require("../utils/applicationError");

// IMPORT THE EMAIL FUNCTION
const sendEmail = require("./../utils/sendEmail");

// IMPORT FILTER REQUEST BODY FUNCTION
const filterReqBody = require("./../utils/filterReqBodyFn");

// IMPORT FUNCTION TO SIGN JWT TOKENS
const signToken = require("./../utils/signTokenFn");

// Create a function to sign token and send token
const createAndSendToken = (res, user, statusCode) => {
  // Sign token
  const token = signToken(user._id);

  // Prevent password from showing into the input
  user.password = undefined;

  // Remove the admin and active status from showing in the response
  user.active = undefined;
  user.isAdmin = undefined;

  // Remove email from output
  user.email = undefined;

  // Define cookie options
  const cookieOptions = {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    cookieOptions.secure = true;
  }

  // Send cookie
  res.cookie("jwt", token, cookieOptions);

  // Send response
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

// Create user route handler
exports.signup = catchAsync(async (req, res, next) => {
  // Create user
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  // Automatically login users after they sign up
  createAndSendToken(res, newUser, 201);
});

// Create a route handler to allow user to login
exports.login = catchAsync(async (req, res, next) => {
  // 1. Retrieve email and password from user
  const { email, password } = req.body;

  // Assuming email or password was not provided
  if (!email || !password) {
    // Create a instance of an application error
    const applicationError = new ApplicationError(
      "Email and password are required",
      400
    );

    // Pass the error to express global error handling middleware
    next(applicationError);

    // Break out of the request/response cycle
    return;
  }

  // 2. Create a instance method to compare password
  // Use the email to find the current user
  const user = await User.findOne({ email }).select("+password");

  // Call the instance method on the user
  if (!user || !(await user.comparePasswords(password, user.password))) {
    // Create an instance of an application error
    const applicationError = new ApplicationError(
      "Invalid email or password. Try again!",
      400
    );

    // Pass the error to express global error handling middleware
    next(applicationError);

    // Break out of the request/response cycle
    return;
  }

  // 3. Create jwt token
  createAndSendToken(res, user, 200);
});

// Create a function to allow user the ability to logout
exports.logout = (req, res, next) => {
  // Replace the existing cookie with some dummy text
  res.cookie("jwt", "", {
    expires: new Date(Date.now() - 2000),
    httpOnly: true,
  });

  // Send response
  res.status(200).json({
    status: "success",
  });
};

// Create a middleware used to protect certain routes
exports.protect = catchAsync(async (req, res, next) => {
  // 1. Create a variable to hold user's token
  let token;

  // 2. Verify that jwt token was sent with the request
  if (req.cookies.jwt) {
    token = req.cookies.jwt;
  } else if (req.headers && req.headers.authorization.startsWith("Bearer")) {
    // Retrieve token
    token = req.headers.authorization.split(" ")[1];
  }

  // 3. Assuming no token was found, send back an error
  else if (!token) {
    // Create an instance of an application error
    const applicationError = new ApplicationError(
      "You are not logged in. Please log in and try again.",
      401
    );

    // Pass the error to express global error handling middleware
    next(applicationError);
  }

  // 4. Verify token and retrieve the decoded payload
  const decodedPayload = await util.promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET_KEY
  );

  // TOKEN EXPIRED ERROR
  // JsonWebToken ERROR

  // 5. Verify that user still exist and was not deleted after token was sent
  const user = await User.findById(decodedPayload.id);

  if (!user) {
    // Create an instance of an application error
    const applicationError = new ApplicationError(
      "This user was deleted and no longer exist.",
      401
    );

    // Pass the error to express global error handling middleware
    next(applicationError);
  }

  // 6. Verify that the password was not changed after token was sent
  if (user.wasPasswordChanged(decodedPayload.iat)) {
    // Create an instance of an application error
    const applicationError = new ApplicationError(
      "Your password was recently changed. Please log back in",
      401
    );

    // Pass the error to express global error handling middleware
    next(applicationError);
  }

  // 7. Add the current user to the request object
  req.user = user;

  // Call the next middleware in the stack
  next();
});

// Create a route handler to protect specific routes
exports.isLoggedIn = catchAsync(async (req, res, next) => {
  if (req.cookies.jwt) {
    // Reading token sent via cookies
    token = req.cookies.jwt;

    // 3. Retrieve the decodedPayload
    const decodedPayload = await util.promisify(jwt.verify)(
      token,
      process.env.JWT_SECRET_KEY
    );

    // JSONWEBTOKENERROR
    // TOKENEXPIREDERROR

    // 4. Verify that the user that owns the token still exists
    const currentUser = await User.findById(decodedPayload.id);

    if (!currentUser) {
      // Pass the error to express global error handling middleware
      next();

      // Return early
      return;
    }

    // 5. Verify that the password was not changed
    if (currentUser.wasPasswordChanged(decodedPayload.iat)) {
      // Pass the error to express global error handling middleware
      next();

      // Return early
      return;
    }

    // 6. Add the current user to the request object
    // response.locals.user = currentUser;
    res.loggedInUser = currentUser;
    return next();
  }
  // 7. Call the next middleware in the middleware stack
  res.loggedInUser = null;
  next();
});

// Create a function to send response on the loggin status of a user
exports.logginStatus = (req, res, next) => {
  res.status(200).json({
    status: "success",
    loggedInUser: res.loggedInUser,
  });
};

// Create a function to restrict user's actions
exports.restrictToAdmin = (req, res, next) => {
  if (!req.user.isAdmin) {
    // Create an instance of an application error
    const applicationError = new ApplicationError(
      "You do not have permission to access to this resource or perform this action.",
      403
    );

    // Pass the error to express global error handling middleware
    next(applicationError);

    // Break out of the request/response cycle
    return;
  }

  // If the user is an admin user then call the next middleware in the stack
  next();
};

// Create a function to initialize the password reset
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // 1. Retrieve email from user
  const { email } = req.body;

  // Assuming no email was provided
  if (!email) {
    // Create an instance of an application error
    const applicationError = new ApplicationError(
      "Email is required to reset your password"
    );

    // Pass the error to express global error handling middleware
    next(applicationError);

    // Break out of the request/response cycle
    return;
  }

  // 2. Use email to find current user
  const user = await User.findOne({ email });

  // Assuming no user was found with that email
  if (!user) {
    // Create an instance of an application error
    const applicationError = new ApplicationError(
      "No user was found with that email. Try again.",
      404
    );

    // Pass the error to express global error handling middleware
    next(applicationError);

    // Break out of the request/response cycle
    return;
  }

  // 3. Create an instance method to create a password reset token
  // Call the instance method on the current user
  const resetToken = user.generateResetToken();

  // Reset token url
  const resetTokenURL = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/reset/password/${resetToken}`;

  // Create password reset message
  const message = `Forgot Password? Please use the link below to reset your password.\nPassword Reset URL:${resetTokenURL}\nIf you did not request a password reset, ignore this message`;

  // Save the changes to the user
  user.save({ validateBeforeSave: false });

  // 4. Send password reset token via email
  try {
    // Send email to user
    await sendEmail({
      email: user.email,
      subject: "Forgot Password?",
      message,
    });

    // Send response
    res.status(200).json({
      status: "success",
      message: "A password reset token was sent to the email address on file!",
    });
  } catch (error) {
    // Remove reset token
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpirationDate = undefined;

    // Save changes
    user.save({ validateBeforeSave: false });

    // Send response
    res.status(500).json({
      status: "error",
      message:
        "Something went wrong while sending email. Please try again later.",
    });
  }
});

// Create a function to allow user to update their passwords
exports.resetPassword = catchAsync(async (req, res, next) => {
  // 1. Retrieve the reset token from url
  const resetToken = req.params.resetToken;

  // 2. Hash token using the same algorithm to compare to the one in our db
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // 3. Find user based on reset token and expiration date
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpirationDate: { $gte: Date.now() },
  });

  // Assuming no user was found
  if (!user) {
    // Create an instance of an application error
    const applicationError = new ApplicationError(
      "Invalid or expired password reset token. Try again.",
      401
    );

    // Pass the error to express global error handling middleware
    next(applicationError);

    // Break out of the request/response cycle
    return;
  }

  // Retrieve the new password and password confirm
  const { password, passwordConfirm } = req.body;

  // 4. Remove reset token and expiration date in the db
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpirationDate = undefined;

  user.password = password;
  user.passwordConfirm = passwordConfirm;

  // 5. Save changes
  await user.save();

  // Create a login token
  createAndSendToken(res, user, 200);
});

// Create a route to allow users to update password
exports.updatePassword = catchAsync(async (req, res, next) => {
  // 1. Retrieve current password, new password and new password confirm
  const { currentPassword, newPassword, newPasswordConfirm } = req.body;

  // Assuming one of the data was not provided
  if (!currentPassword || !newPassword || !newPasswordConfirm) {
    // Create an instance of an application error
    const applicationError = new ApplicationError(
      "All fields are required to update your password",
      400
    );

    // Pass the error to express global error handling middleware
    next(applicationError);

    // Break out of the request/response cycle
    return;
  }

  // Add the password back to the user data
  const user = await User.findById(req.user._id).select("+password");

  // 2. Verify that the current password is correct
  if (!(await user.comparePasswords(currentPassword, user.password))) {
    // Create an instance of an application error
    const applicationError = new ApplicationError(
      "The password you provided does not match the one we have on file. Try again",
      401
    );

    // Pass the error to express global error handling middleware
    next(applicationError);

    // Break out of the request/response cycle
    return;
  }

  // 3. Update the password
  user.password = newPassword;
  user.passwordConfirm = newPasswordConfirm;

  await user.save();

  // 4. Send a login token
  createAndSendToken(res, user, 200);
});

// Create a function to allow users to update their information
exports.updateUserInfo = catchAsync(async (req, res, next) => {
  // Assuming the user submitted a password or password confirm
  if (req.body.password || req.body.passwordConfirm) {
    // Create an instance of an application error
    const applicationError = new ApplicationError(
      "Use '/update/password/' if you are trying to update your password",
      400
    );

    // Pass the error to express global error handling middleware
    next(applicationError);

    // Break out of the request/response cycle
    return;
  }

  // 3. Create the list of allowed parameters
  const allowedParameters = filterReqBody(req.body, "name", "email");

  // 4. Update user info
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    allowedParameters,
    {
      runValidators: true,
      new: true,
    }
  );

  // Send response
  res.status(200).json({
    status: "success",
    data: {
      updatedUser,
    },
  });
});

// Create a function to allow users to delete their account
exports.deleteAccount = catchAsync(async (req, res, next) => {
  // Find the user to delete
  await User.findByIdAndUpdate(req.user._id, { active: false });

  // Send response
  res.status(204).json({
    status: "success",
  });
});
