const Review = require('../models/review.model.js');
const Parking = require("../models/parking.model");

exports.createReview = async (req, res) => {
  try {
    console.log('Requête reçue:', req.body);

    const { parkingId, rating, comment,userId } = req.body;

    console.log('Recherche du parking:', parkingId);
    const parking = await Parking.findById(parkingId);
    if (!parking) {
      console.log('Erreur: Parking non trouvé');
      return res.status(404).json({ message: 'Parking non trouvé' });
    }
    const review = new Review({
      parkingId,
      userId,
      rating,
      comment,
    });
    await review.save();
    console.log('Avis sauvegardé:', review);

    console.log('Mise à jour de la note moyenne pour parkingId:', parkingId);
    await updateParkingRating(parkingId);

    res.status(201).json(review);
  } catch (error) {
    console.error('Erreur dans createReview:', error.stack);
    console.error('Message d\'erreur:', error.message);
    res.status(500).json({ message: 'Erreur lors de la création de l\'avis', error: error.message });
  }
};
exports.getAllReviews = async (req, res) => {
  try {
    console.log('Récupération de tous les avis');
    const reviews = await Review.find()
      .populate('parkingId', 'nom')
      .populate('userId', 'firstname lastname')
      .sort({ createdAt: -1 });
    console.log('Avis récupérés:', reviews.length);
    res.status(200).json(reviews);
  } catch (error) {
    console.error('Erreur dans getAllReviews:', error.stack);
    res.status(500).json({ message: 'Erreur lors de la récupération des avis', error: error.message });
  }
};


// Get reviews by parking ID
exports.getReviewsByParking = async (req, res) => {
  try {
    console.log('Récupération des avis pour parkingId:', req.params.parkingId);
    const reviews = await Review.find({ parkingId: req.params.parkingId })
      .populate('userId', 'firstname lastname')
      .sort({ createdAt: -1 });
    console.log('Avis récupérés:', reviews.length);
    res.status(200).json(reviews);
  } catch (error) {
    console.error('Erreur dans getReviewsByParking:', error.stack);
    res.status(500).json({ message: 'Erreur lors de la récupération des avis', error: error.message });
  }
};

// Update a review
exports.updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    console.log('Recherche de l\'avis:', req.params.id);
    const review = await Review.findById(req.params.id);
    if (!review) {
      console.log('Erreur: Avis non trouvé');
      return res.status(404).json({ message: 'Avis non trouvé' });
    }
    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    await review.save();
    console.log('Avis mis à jour:', review);
    await updateParkingRating(review.parkingId);
    res.status(200).json(review);
  } catch (error) {
    console.error('Erreur dans updateReview:', error.stack);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'avis', error: error.message });
  }
};

// Delete a review
exports.deleteReview = async (req, res) => {
  try {
    console.log('Recherche de l\'avis:', req.params.id);
    const review = await Review.findById(req.params.id);
    if (!review) {
      console.log('Erreur: Avis non trouvé');
      return res.status(404).json({ message: 'Avis non trouvé' });
    }
    await review.deleteOne();
    console.log('Avis supprimé');
    await updateParkingRating(review.parkingId);
    res.status(200).json({ message: 'Avis supprimé' });
  } catch (error) {
    console.error('Erreur dans deleteReview:', error.stack);
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'avis', error: error.message });
  }
};

// Update parking rating and review count
const updateParkingRating = async (parkingId) => {
  try {
    console.log('Calcul de la note moyenne pour parkingId:', parkingId);
    const reviews = await Review.find({ parkingId });
    const averageRating = reviews.length
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;
    console.log('Note moyenne calculée:', averageRating, 'Nombre d\'avis:', reviews.length);
    await Parking.findByIdAndUpdate(parkingId, {
      averageRating,
      reviewCount: reviews.length,
    });
    console.log('Parking mis à jour');
  } catch (error) {
    console.error('Erreur dans updateParkingRating:', error.stack);
    throw error;
  }
};
// Get the latest 3 reviews by user ID
exports.getReviewsByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    console.log('Récupération des 3 derniers avis pour userId:', userId);

    const reviews = await Review.find({ userId })
      .populate('parkingId', 'nom adresse')
      .sort({ createdAt: -1 })
      .limit(3);

    console.log('Avis récupérés:', reviews.length);
    res.status(200).json(reviews);
  } catch (error) {
    console.error('Erreur dans getReviewsByUser:', error.stack);
    res.status(500).json({
      message: 'Erreur lors de la récupération des avis de l\'utilisateur',
      error: error.message,
    });
  }
};
