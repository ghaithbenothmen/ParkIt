const express = require("express");
const router = express.Router();
const userController = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth");

// Routes
router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/profile", authMiddleware, userController.getProfile);
router.post("/logout", userController.logout);
router.post("/verify-2fa", userController.verify2FA); // Use the existing verify2FA function

module.exports = router;