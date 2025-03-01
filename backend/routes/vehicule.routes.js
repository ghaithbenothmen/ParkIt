const express = require("express");
const router = express.Router();
const vehiculeController = require("../controllers/vehicule.controller");

router.get("/:userId", vehiculeController.getAllVehiculesByUser);
router.post("/", vehiculeController.ajouterVehicule);
router.put("/:id", vehiculeController.modifierVehicule);
router.delete("/:id", vehiculeController.deleteVehicule );
module.exports = router;