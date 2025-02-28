const express = require("express");
const router = express.Router();
const parkingController = require("../controllers/parking.controller");
router.get("/", parkingController.getAllParkings);
router.get("/:id", parkingController.getParkingById);
router.put("/:id", parkingController.modifierParking);
router.delete("/:id", parkingController.supprimerParking );
router.post("/", parkingController.ajouterParking );

module.exports = router;