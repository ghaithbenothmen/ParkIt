const express = require("express");
const router = express.Router();
const userController = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth");

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/profile", authMiddleware, userController.getProfile);
router.post("/logout", userController.logout);
router.get("/google", userController.googleAuth);
router.post("/google", userController.googleAuth);

module.exports = router;
