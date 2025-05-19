const express = require("express");
const router = express.Router();
const parkingController = require("../controllers/parking.controller");

// Routes pour les parkings
router.post("/", parkingController.ajouterParking);
router.get("/", parkingController.getAllParkings);
router.get("/count", parkingController.getParkingCount);
router.get("/top-rated", parkingController.getTopRatedParkings);
router.get("/parc/count", parkingController.totalParc);
router.post("/available", parkingController.available);
router.get("/:id", parkingController.getParkingById);
router.put("/:id", parkingController.modifierParking);
router.delete("/:id", parkingController.supprimerParking);

// Routes supplémentaires


module.exports = router;