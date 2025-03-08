const express = require('express');
const router = express.Router();
const parkingSpotController = require('../controllers/parkingSpot.controller');

// Routes pour les opérations CRUD
router.post('/', parkingSpotController.createParkingSpot);
router.get('/', parkingSpotController.getAllParkingSpots);
router.get('/:id', parkingSpotController.getParkingSpotById);
router.put('/:id', parkingSpotController.updateParkingSpot);
router.delete('/:id', parkingSpotController.deleteParkingSpot);
router.get('/by-parking/:parkingId', parkingSpotController.getAllParkingSpotsByParking);

module.exports = router;