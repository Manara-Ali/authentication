// IMPORT EXPRESS IN ORDER TO CREATE ROUTER
const express = require("express");

// IMPORT PRODUCTS CONTROLLER
const productController = require("./../controllers/productController");

// Use express module to create router
const router = express.Router();

router.route("/").get(productController.getAllProducts);
router.route("/:id").get(productController.getProduct);

// EXPORT ROUTER
module.exports = router;
