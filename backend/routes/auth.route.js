const express = require("express");
const router = express.Router();
const userController = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth");

// Routes
router.post("/register", userController.register);
router.post("/login", userController.login);
router.get("/profile", authMiddleware, userController.getProfile);
router.put("/profile", authMiddleware, userController.updateProfile);
router.post("/logout", userController.logout);
router.post("/register_face",userController.register_face_data);
router.get("/verify/:token", userController.verifyActivation); // Ensure this route exists
router.post("/login_face",userController.loginWithFace);
router.post("/verify-2fa", userController.verify2FA); 
router.post("/enable-2fa", userController.enable2FA); 
router.post("/disable-2fa", userController.disable2FA);

router.get("/google", userController.googleAuth);
router.post("/google", userController.googleAuth);

router.post("/request-reset", userController.requestPasswordReset);
router.post("/reset-password", userController.resetPassword);


router.post("/change-password", authMiddleware,userController.updatePassword);


module.exports = router;

