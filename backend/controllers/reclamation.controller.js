const mongoose = require('mongoose');
const Reclamation = require('../models/reclamation.model');
const Parking = require('../models/parking.model'); 

exports.createReclamation = async (req, res) => {
  try {
    const { utilisateurId, parkingId, typeReclamation, message, photoEvidence } = req.body;
    // Validate ObjectId format
 console.log(utilisateurId);
 console.log(photoEvidence);
    // Validate existence of User and Parking
    const user = await mongoose.model('User').findById(utilisateurId);
    const parking = await Parking.findById(parkingId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    if (!parking) {
      return res.status(404).json({ message: 'Parking not found.' });
    }
    const reclamation = new Reclamation({ utilisateurId, parkingId, typeReclamation, message, photoEvidence });
    await reclamation.save();
    const notificationMessage =
      reclamation.statut === 'Validée'
        ? 'Votre réclamation a été envoyée à l’administration.'
        : 'Votre réclamation nécessite une vérification manuelle.';
    res.status(201).json({ message: 'Réclamation créée avec succès.', reclamation, notification: notificationMessage });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création de la réclamation.', error });
  }
};

exports.getAllReclamations = async (req, res) => {
  try {
    const reclamations = await Reclamation.find()
      .sort({ priorite: -1, dateSoumission: -1 })
      .populate('utilisateurId', 'firstname lastname role')
      .populate('parkingId', 'nom adresse'); 
      console.log("aaaaaaaaaaaaaaa");
    res.status(200).json(reclamations);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des réclamations.', error });
  }
};

exports.getArchivedReclamations = async (req, res) => {
  try {
    const archivedReclamations = await Reclamation.find({ statut: 'Pending' })
      .sort({ dateSoumission: -1 })
      .populate('utilisateurId', 'firstname lastname role')
      .populate('parkingId', 'nom adresse'); 
    res.status(200).json(archivedReclamations);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des réclamations archivées.', error });
  }
};

exports.updateReclamationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { statut, feedback } = req.body;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid reclamation ID format.' });
    }

    // Validate statut
    const validStatuts = ['Validée', 'Pending', 'Résolue', 'Refusée'];
    if (statut && !validStatuts.includes(statut)) {
      return res.status(400).json({ message: `Invalid statut value. Must be one of: ${validStatuts.join(', ')}` });
    }

    // Find reclamation
    const reclamation = await Reclamation.findById(id);
    if (!reclamation) {
      return res.status(404).json({ message: 'Réclamation non trouvée.' });
    }

    // Update fields
    if (statut) {
      reclamation.statut = statut;
    }
    if (feedback) {
      reclamation.feedback = feedback;
    }

    // Save and re-fetch to ensure accurate state
    await reclamation.save();
    const updatedReclamation = await Reclamation.findById(id); // Re-fetch to confirm

    // Generate notification based on saved statut
    let notificationMessage = '';
    if (updatedReclamation.statut === 'Résolue') {
      notificationMessage = 'Votre réclamation a été résolue. Feedback: ' + (updatedReclamation.feedback || 'N/A');
    } else if (updatedReclamation.statut === 'Refusée') {
      notificationMessage = 'Votre réclamation a été refusée. Feedback: ' + (updatedReclamation.feedback || 'N/A');
    } else if (updatedReclamation.statut === 'Validée') {
      notificationMessage = 'Votre réclamation est en cours de traitement.';
    }

    res.status(200).json({
      message: 'Réclamation mise à jour avec succès.',
      reclamation: updatedReclamation,
      notification: notificationMessage
    });
  } catch (error) {
    console.error('Error updating reclamation:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error.', error: error.message });
    }
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la réclamation.', error: error.message });
  }
};

exports.deleteReclamation = async (req, res) => {
  try {
    const { id } = req.params;
    const reclamation = await Reclamation.findByIdAndDelete(id);
    if (!reclamation) {
      return res.status(404).json({ message: 'Réclamation non trouvée.' });
    }
    res.status(200).json({ message: 'Réclamation supprimée avec succès.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression de la réclamation.', error });
  }
};