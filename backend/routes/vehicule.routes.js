const express = require("express");
const router = express.Router();
const vehiculeController = require("../controllers/vehicule.controller");
const authMiddleware = require("../middleware/auth");

router.get("/:userId",  vehiculeController.getAllVehiculesByUser);
router.post("/", authMiddleware, vehiculeController.ajouterVehicule);
router.put("/:id", vehiculeController.modifierVehicule);
router.delete("/:id", vehiculeController.deleteVehicule );
router.get('/', vehiculeController.getAllVehicules);

module.exports = router;