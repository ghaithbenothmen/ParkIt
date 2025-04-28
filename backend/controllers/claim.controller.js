const mongoose = require('mongoose');
const Claim = require('../models/claim.model');
const Parking = require('../models/parking.model'); 

exports.createClaim = async (req, res) => {
  try {
    const { utilisateurId, parkingId, claimType, message, photoEvidence } = req.body;
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
    const claim = new Claim({ utilisateurId, parkingId, claimType, message, photoEvidence });
    await claim.save();
    const notificationMessage =
      claim.statut === 'Validée'
        ? 'Votre réclamation a été envoyée à l’administration.'
        : 'Votre réclamation nécessite une vérification manuelle.';
    res.status(201).json({ message: 'Réclamation créée avec succès.', claim, notification: notificationMessage });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création de la réclamation.', error });
  }
};

exports.getAllClaims = async (req, res) => {
  try {
    const claims = await Claim.find()
      .sort({ priorite: -1, dateSoumission: -1 })
      .populate('utilisateurId', 'firstname lastname role')
      .populate('parkingId', 'nom adresse'); 
      console.log("aaaaaaaaaaaaaaa");
    res.status(200).json(claims);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des réclamations.', error });
  }
};
exports.getClaimByUser = async (req, res) => {
  try {
    // Extract the user ID from the request parameters
    const { userId } = req.params;

    // Find claims that belong to the specified user
    const claims = await Claim.find({ utilisateurId: userId })
      .sort({ priorite: -1, dateSoumission: -1 })  // Optional sorting
      .populate('utilisateurId', 'firstname lastname role')
      .populate('parkingId', 'nom adresse');

    // Ensure claims is an array before checking its length
    if (!claims || claims.length === 0) {
      return res.status(404).json({ message: 'Aucune réclamation trouvée pour cet utilisateur.' });
    }

    // Return the found claims
    res.status(200).json(claims);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des réclamations de l\'utilisateur.', error });
  }
};

exports.getClaimById = async (req, res) => {
  try {
    // Extract the claim ID from the request parameters
    const { id } = req.params;

    // Find the claim by its ID
    const claim = await Claim.findById(id)
      .populate('utilisateurId', 'firstname lastname role')  // Populate user details (only specified fields)
      .populate('parkingId', 'nom adresse');  // Populate parking details (only specified fields)

    // If no claim is found with the provided ID, return a 404 error
    if (!claim) {
      return res.status(404).json({ message: 'Claim not found.' });
    }

    // Return the found claim
    res.status(200).json({data: claim});
  } catch (error) {
    res.status(500).json({ message: 'Error fetching the claim.', error });
  }
};





exports.getArchivedClaims = async (req, res) => {
  try {
    const archivedClaims = await Claim.find({ statut: 'Pending' })
      .sort({ dateSoumission: -1 })
      .populate('utilisateurId', 'firstname lastname role')
      .populate('parkingId', 'nom adresse'); 
    res.status(200).json(archivedClaims);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des réclamations archivées.', error });
  }
};

exports.updateClaimStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { statut, feedback, photoEvidence } = req.body;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid claim ID format.' });
    }

    // Validate statut
    const validStatuts = ['Validée', 'Pending', 'Résolue', 'Refusée'];
    if (statut && !validStatuts.includes(statut)) {
      return res.status(400).json({ message: `Invalid statut value. Must be one of: ${validStatuts.join(', ')}` });
    }

    // Find claim
    const claim = await Claim.findById(id);
    if (!claim) {
      return res.status(404).json({ message: 'Réclamation non trouvée.' });
    }

    // Update fields
    if (statut) {
      claim.statut = statut;
    }
    if (feedback) {
      claim.feedback = feedback;
    }
    if (photoEvidence) {
      claim.photoEvidence = photoEvidence;
    }

    // Save and re-fetch to ensure accurate state
    await claim.save();
    const updatedClaim = await Claim.findById(id); // Re-fetch to confirm

    // Generate notification based on saved statut
    let notificationMessage = '';
    if (updatedClaim.statut === 'Résolue') {
      notificationMessage = 'Votre réclamation a été résolue. Feedback: ' + (updatedClaim.feedback || 'N/A');
    } else if (updatedClaim.statut === 'Refusée') {
      notificationMessage = 'Votre réclamation a été refusée. Feedback: ' + (updatedClaim.feedback || 'N/A');
    } else if (updatedClaim.statut === 'Validée') {
      notificationMessage = 'Votre réclamation est en cours de traitement.';
    }

    res.status(200).json({
      message: 'Réclamation mise à jour avec succès.',
      claim: updatedClaim,
      notification: notificationMessage
    });
  } catch (error) {
    console.error('Error updating claim:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation error.', error: error.message });
    }
    res.status(500).json({ message: 'Erreur lors de la mise à jour de la réclamation.', error: error.message });
  }
};

exports.deleteClaim = async (req, res) => {
  try {
    const { id } = req.params;
    const claim = await Claim.findByIdAndDelete(id);
    if (!claim) {
      return res.status(404).json({ message: 'Réclamation non trouvée.' });
    }
    res.status(200).json({ message: 'Réclamation supprimée avec succès.' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression de la réclamation.', error });
  }
};