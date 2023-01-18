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

// Create a function to retrieve the user cart from db
exports.getCartItems = catchAsyncFn(async (req, res, next) => {
  // 1. Find the logged in user Id
  const token = req.cookies.jwt;

  const userId = (
    await util.promisify(jwt.verify)(token, process.env.JWT_SECRET_KEY)
  ).id;

  // 2. Use the logged in user id to retrieve the user cart
  let cartItems = await CartItem.find({
    ownerId: userId,
  }).populate("product");

  // 4. Send a response
  res.status(200).json({
    status: "success",
    results: cartItems.length,
    cartItems,
  });
});

exports.createCartItem = catchAsyncFn(async (req, res, next) => {
  let cartItems = [];
  const cartIds = [];

  // Retrieve the user id
  const token = req.cookies.jwt;

  // Retrieve the user id
  const userId = (
    await util.promisify(jwt.verify)(token, process.env.JWT_SECRET_KEY)
  ).id;

  // Find all existing carts from this user if any already exist
  let existingCart = await CartItem.find({ ownerId: userId });

  // Add userId to the cart item
  const filteredReqBody = { ...req.body, ownerId: userId };

  // If the cart was originally empty, create new cart items inside db
  if (!existingCart.length) {
    cartItems = await CartItem.create(filteredReqBody);
  }

  console.log(existingCart, "existing cart");

  if (existingCart.length && filteredReqBody) {
    existingCart.forEach(async (element) => {
      console.log("🔥", element);
      await CartItem.findByIdAndDelete(element._id);
    });

    cartItems = await CartItem.create(filteredReqBody);
  }

  res.status(200).json({
    status: "success",
    data: {
      cartItems,
    },
  });
});

exports.emptyCartItems = catchAsyncFn(async (req, res, next) => {
  // Retrieve the user id
  const token = req.cookies.jwt;

  // Retrieve the user id
  const userId = (
    await util.promisify(jwt.verify)(token, process.env.JWT_SECRET_KEY)
  ).id;

  // Find all existing carts from this user if any already exist
  let existingCart = await CartItem.find({ ownerId: userId });

  existingCart.forEach(async (element) => {
    await CartItem.findByIdAndDelete(element._id);
  });

  res.status(200).json({
    status: "success",
  });
});

// // Define a route to create new cart items
// exports.createCartItem = catchAsyncFn(async (req, res, next) => {
//   // Retrieve the user id
//   const token = req.cookies.jwt;

//   // Retrieve the user id
//   const userId = (
//     await util.promisify(jwt.verify)(token, process.env.JWT_SECRET_KEY)
//   ).id;

//   // Find all existing carts from this user if any already exist
//   let existingCart = await CartItem.find({ ownerId: userId });

//   // Retrieve the ids of all the existing cart items
//   const existingCartIds = [];

//   // Store the product id of all the existing cart items
//   const existingCartProductIds = [];

//   // Store all the existing items inside the existing cart array
//   existingCart = existingCart.map((element) => {
//     // Assuming the product Id is the same as that of the incoming req.body product
//     if (element.product.toHexString() === req.body.product) {
//       // Update the quantity of the existing product to match the req.body quantty
//       element.qty = req.body.qty;

//       // Store the id of all the existing carts for the logged in user
//       existingCartIds.push(element._id.toHexString());

//       // Store the product Id of all the existing cart items
//       existingCartProductIds.push(element.product.toHexString());
//     } else {
//       // console.log(element.product);
//       // Assuming a new product was add to the cart. Then add it to the existing cart
//       existingCart = [...existingCart, req.body];
//     }

//     return element;
//   });

//   //////////////// EXISTING CART PRODUCT IDS KNOWS WHICH ELEMENT WAS DELETED
//   if (existingCartProductIds) {
//     existingCart.forEach(async (element) => {
//       if (element.product.toHexString() === existingCartProductIds[0]) {
//         console.log(element.product.toHexString());
//         console.log("id", existingCartProductIds[0]);
//         await CartItem.findByIdAndUpdate(
//           element._id,
//           { toDelete: false },
//           { new: true, runValidators: true }
//         );
//       }
//     });
//   }

//   // Add userId to the cart item
//   const filteredReqBody = { ...req.body, ownerId: userId };

//   let cartItems = [];

//   // If the cart was originally empty, create new cart items inside db
//   if (!existingCart.length) {
//     cartItems = await CartItem.create(filteredReqBody);
//   } else {
//     if (!existingCartProductIds.includes(req.body.product)) {
//       cartItems = await CartItem.create({ ...req.body, ownerId: userId });
//     }
//   }

//   // Assuming user already add existing items inside his cart
//   if (existingCartIds) {
//     // Loop through these items id
//     existingCartIds.forEach(async (element, index) => {
//       // Find which items they correspond to
//       const product = await CartItem.findById(element);

//       // Assuming the quantity of that product was changed
//       if (product.qty !== req.body.qty) {
//         // Update the product quantity to reflect that change
//         await CartItem.findByIdAndUpdate(element, req.body, {
//           new: true,
//           runValidators: true,
//         });
//       }
//     });
//   }

//   res.status(200).json({
//     status: "success",
//     data: {
//       cartItems,
//     },
//   });
// });
