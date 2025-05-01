const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');

// Routes CRUD pour les avis
router.post('/', reviewController.createReview); // Créer un avis
router.get('/', reviewController.getAllReviews); // No JWT required
router.get('/user/:userId', reviewController.getReviewsByUser);
router.get('/parking/:parkingId', reviewController.getReviewsByParking); // Lire les avis pour un parking
router.get('/stats', reviewController.getReviewStats); // Obtenir les statistiques des reviews
router.put('/:id', reviewController.updateReview); // Mettre à jour un avis
router.delete('/:id', reviewController.deleteReview); // Supprimer un avis

module.exports = router;