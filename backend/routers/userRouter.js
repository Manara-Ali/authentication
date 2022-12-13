// IMPORT EXPRESS TO CREATE ROUTERS
const express = require("express");

// IMPORT USER CONTROLLER
const authController = require("../controllers/authController");

// IMPORT USER CONTROLLER
const userController = require("../controllers/userController");

// Use express to create router
const router = express.Router();

// Re-route users request based on the path
router.route("/signup").post(authController.signup);
router.route("/login").post(authController.login);
router.route("/logout").post(authController.logout);
router
  .route("/loggedin")
  .get(authController.isLoggedIn, authController.logginStatus);

// Re-route users request to reset password
router.route("/forgot/password").post(authController.forgotPassword);
router.route("/reset/password/:resetToken").post(authController.resetPassword);
router
  .route("/update/password")
  .post(authController.protect, authController.updatePassword);
router
  .route("/update/my-info")
  .post(authController.protect, authController.updateUserInfo);

router
  .route("/delete/my-account")
  .delete(authController.protect, authController.deleteAccount);

// Create routes to operate on users
router.use(authController.protect, authController.restrictToAdmin);

router.route("/").get(userController.getAllUsers);
router
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

// EXPORT ROUTER TO BE USED IN OTHER PARTS OF OUR APPLICATION
module.exports = router;
