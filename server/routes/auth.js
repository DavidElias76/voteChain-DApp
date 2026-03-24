const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const { authenticate, requireAdmin } = require("../middleware/auth");

router.post("/register", [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").isEmail().normalizeEmail().withMessage("Valid email required"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters")
], authController.register);

router.post("/login", [
  body("email").isEmail().normalizeEmail(),
  body("password").notEmpty()
], authController.login);

router.post("/add-admin", authenticate, requireAdmin, authController.addAdmin);

router.get("/profile", authenticate, authController.getProfile);
router.put("/wallet", authenticate, authController.updateWallet);

module.exports = router;