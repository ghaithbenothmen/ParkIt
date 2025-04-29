const Review = require('../models/review.model.js');
const Parking = require("../models/parking.model");

exports.createReview = async (req, res) => {
  try {
    console.log('Requête reçue:', req.body);

    const { parkingId, rating, comment } = req.body;

    console.log('Recherche du parking:', parkingId);
    const parking = await Parking.findById(parkingId);
    if (!parking) {
      console.log('Erreur: Parking non trouvé');
      return res.status(404).json({ message: 'Parking non trouvé' });
    }

    console.log('Création de l\'avis pour userId: 680e9954746064bff5609a4e');
    const review = new Review({
      parkingId,
      userId: '680e9954746064bff5609a4e',
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

// Ajouter les fonctions manquantes
exports.getReviewsByParking = async (req, res) => {
  try {
    const reviews = await Review.find({ parkingId: req.params.parkingId })
      .populate('userId', 'firstname lastname')
      .sort({ createdAt: -1 });
    res.status(200).json(reviews);
  } catch (error) {
    console.error('Erreur dans getReviewsByParking:', error.stack);
    res.status(500).json({ message: 'Erreur lors de la récupération des avis', error: error.message });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Utilisateur non authentifié' });
    }
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Avis non trouvé' });
    }
    if (review.userId.toString() !== req.user._id) {
      return res.status(403).json({ message: 'Non autorisé à modifier cet avis' });
    }
    review.rating = rating || review.rating;
    review.comment = comment || review.comment;
    await review.save();
    res.status(200).json(review);
  } catch (error) {
    console.error('Erreur dans updateReview:', error.stack);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'avis', error: error.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'Utilisateur non authentifié' });
    }
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ message: 'Avis non trouvé' });
    }
    if (review.userId.toString() !== req.user._id) {
      return res.status(403).json({ message: 'Non autorisé à supprimer cet avis' });
    }
    await review.deleteOne();
    res.status(200).json({ message: 'Avis supprimé' });
  } catch (error) {
    console.error('Erreur dans deleteReview:', error.stack);
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'avis', error: error.message });
  }
};