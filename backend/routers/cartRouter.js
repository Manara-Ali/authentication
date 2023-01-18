// IMPORT EXPRESS IN ORDER TO CREATE ROUTERS
const express = require("express");

// IMPORT CART CONTROLLER
const cartController = require("./../controllers/cartController");

// Use express to create routers
const router = express.Router();

router
  .route("/")
  .get(cartController.getCartItems)
  .post(cartController.createCartItem);

router.route("/empty-cart").get(cartController.emptyCartItems);

// EXPORT ROUTER TO BE USED IN OTHER PARTS OF OUR APPLICATION
module.exports = router;
