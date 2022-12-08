// IMPORT EXPRESS IN ORDER TO CREATE ROUTER
const express = require("express");

// IMPORT PRODUCTS CONTROLLER
const productController = require("./../controllers/productController");

// Use express module to create router
const router = express.Router();

router.route("/").get(productController.getAllProducts);

// EXPORT ROUTER
module.exports = router;
