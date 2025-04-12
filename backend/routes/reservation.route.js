const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservation.controller');

// Routes pour les opérations CRUD

router.get('/success',reservationController.paymentSuccess);
router.get('/fail',reservationController.paymentFail);
router.post('/:id/payment',reservationController.reservationPayment);
router.post('/', reservationController.createReservation);
router.get('/confirmed', reservationController.getConfirmedReservations);
router.get('/pending', reservationController.getPendingReservations);
router.get('/over', reservationController.getOverReservations);
router.get('/', reservationController.getAllReservations);
router.get('/:id', reservationController.getReservationById);
router.put('/:id', reservationController.updateReservation);
router.delete('/:id', reservationController.deleteReservation);
router.get('/by-user/:userId', reservationController.getAllReservationsByUser);
router.get('/by-parking/:parkingId', reservationController.getAllReservationsByParking);
router.get('/by-parking-spot/:parkingSpotId', reservationController.getAllReservationsByParkingSpot);



module.exports = router;