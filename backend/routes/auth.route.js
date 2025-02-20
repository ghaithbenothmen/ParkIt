const express = require("express");
const router = express.Router();
const userController = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth");
const { send2FACode, verify2FA } = require("../controllers/auth.controller");

router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/profile", authMiddleware, userController.getProfile);
router.post("/logout", userController.logout);
router.post("/send-2fa", send2FACode);
router.post("/verify-2fa", verify2FA);

module.exports = router;
