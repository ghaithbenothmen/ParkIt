const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");

router.get("/", userController.getAllUsers);
router.get("/:id", userController.getUserById);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);
router.get("/users/count", userController.totalUser);

router.post("/check", userController.checkUser);
router.post("/update-phone", userController.updatePhone);

module.exports = router;