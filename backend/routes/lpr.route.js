const express = require("express");
const router = express.Router();
const lprController = require("../controllers/lpr.controller");

router.post("/check-vehicle", lprController.checkPlate);

module.exports = router;
