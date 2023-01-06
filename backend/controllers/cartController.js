// IMPORT UTIL
const util = require("util");

// IMPORT JSONWEBTOKEN
const jwt = require("jsonwebtoken");

// IMPORT USER MODEL
const User = require("../models/userModel");

// IMPORT CART MODEL
const CartItem = require("./../models/cartModel");

// IMPORT CATCH ASYNC
const catchAsyncFn = require("../utils/catchAsyncFn");

// Define a route to create new cart items
exports.createCartItem = catchAsyncFn(async (req, res, next) => {
  // Retrieve the user id
  const token = req.cookies.jwt;

  const userId = (
    await util.promisify(jwt.verify)(token, process.env.JWT_SECRET_KEY)
  ).id;

  // Add userId to the cart item
  const filteredReqBody = { ...req.body, ownerId: userId };

  const cartItems = await CartItem.create(filteredReqBody);

  res.status(200).json({
    status: "success",
    data: {
      cartItems,
    },
  });
});

// Create a function to retrieve the user cart from db
exports.getCartItems = catchAsyncFn(async (req, res, next) => {
  // 1. Find the logged in user Id
  const token = req.cookies.jwt;

  const userId = (
    await util.promisify(jwt.verify)(token, process.env.JWT_SECRET_KEY)
  ).id;

  // 2. Use the logged in user id to retrieve the user cart
  const cartItems = await CartItem.find({ ownerId: userId }).populate(
    "product"
  );

  // 4. Send a response
  res.status(200).json({
    status: "success",
    cartItems,
  });
});
