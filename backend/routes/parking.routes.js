const express = require("express");
const router = express.Router();
const parkingController = require("../controllers/parking.controller");

router.get('/count', parkingController.getParkingCount);
router.get("/", parkingController.getAllParkings);
router.get("/:id", parkingController.getParkingById);

router.get("/parc/count", parkingController.totalParc);

router.put("/:id", parkingController.modifierParking);
router.delete("/:id", parkingController.supprimerParking );
router.post("/", parkingController.ajouterParking );



module.exports = router;