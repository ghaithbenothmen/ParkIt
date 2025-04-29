const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservation.controller');

// Routes pour les opérations CRUD
router.get('/reservation-summary', reservationController.getReservationSummary);
router.get('/reservation-statistics', reservationController.getReservationStatistics);
router.get('/top-users', reservationController.getTopUsers);
router.get('/top-parkings', reservationController.getTopParkings);
router.get('/weekend', reservationController.getWeekendReservationStats);
router.get('/userdate', reservationController.getReservationsByUserAndStartDate);
router.get('/countweek/:userId', reservationController.getWeeklyReservationCountsByUser);
// Dans votre fichier de routes (reservation.routes.js)
router.get('/count', reservationController.getReservationCount);
router.get('/success', reservationController.paymentSuccess);
router.get('/fail', reservationController.paymentFail);
router.post('/', reservationController.createReservation);
router.get('/confirmed', reservationController.getConfirmedReservations);
router.get('/pending', reservationController.getPendingReservations);
router.get('/over', reservationController.getOverReservations);
router.get('/total', reservationController.getTotalPriceOfAllReservations);
router.get('/by-user/:userId', reservationController.getAllReservationsByUser);
router.get('/by-parking/:parkingId', reservationController.getAllReservationsByParking);
router.get('/by-parking-spot/:parkingSpotId', reservationController.getAllReservationsByParkingSpot);
router.get('/', reservationController.getAllReservations);


// 👇 MUST BE LAST
router.get('/:id', reservationController.getReservationById);
router.put('/:id', reservationController.updateReservation);
router.delete('/:id', reservationController.deleteReservation);
router.post('/:id/payment', reservationController.reservationPayment);


module.exports = router;