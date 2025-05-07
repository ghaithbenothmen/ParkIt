const express = require("express");
const router = express.Router();
const lprController = require("../controllers/lpr.controller");

router.post("/check-vehicle", lprController.checkPlate);
router.post('/check-exit-vehicle', lprController.checkExitVehicle); 

module.exports = router;
