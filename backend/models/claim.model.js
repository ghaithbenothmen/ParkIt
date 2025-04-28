const mongoose = require('mongoose');

const ClaimSchema = new mongoose.Schema({
  utilisateurId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  parkingId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Parking',
  },
  claimType: {
    type: String,
    enum: ['Place Occupée', 'Problème Paiement', 'Sécurité', 'Autre'],
    required: true,
  },
  photoEvidence: {
    type: String,
    required: false,
  },
  statut: {
    type: String,
    enum: ['Validée', 'Pending', 'Résolue', 'Refusée'],
    default: 'Validée',
  },
  dateSoumission: {
    type: Date,
    default: Date.now,
  },
  priorite: {
    type: Number,
    default: 0,
  },
  message: {
    type: String,
    required: false,
  },
  feedback: {
    type: String,
    required: false,
  },
});

ClaimSchema.pre('save', async function (next) {
  // Only run priority and statut logic for new documents
  if (this.isNew) {
    let score = 0;
    // Type de réclamation
    switch (this.claimType) {
      case 'Sécurité':
        score += 10;
        break;
      case 'Problème Paiement':
        score += 8;
        break;
      case 'Place Occupée':
        score += 6;
        break;
      case 'Autre':
        score += 4;
        break;
    }
    // Nombre de signalements similaires pour le même type
    const similarClaims = await mongoose.model('Claim').countDocuments({
      claimType: this.claimType,
      statut: { $in: ['Validée', 'En Cours'] },
    });
    if (similarClaims >= 3) {
      score += 5;
    }
    // Nombre de réclamations pour le même parking
    const parkingClaims = await mongoose.model('Claim').countDocuments({
      parkingId: this.parkingId,
      statut: { $in: ['Validée', 'En Cours'] },
    });
    if (parkingClaims >= 3) {
      score += 3;
    }
    // Statut utilisateur
    const user = await mongoose.model('User').findById(this.utilisateurId);
    if (user && user.role === 'admin') {
      score += 3;
    }
    // Présence d’une photo
    if (this.photoEvidence) {
      score += 2;
      this.statut = 'Validée';
    } else {
      this.statut = 'Pending';
    }
    this.priorite = score;
  }
  next();
});

module.exports = mongoose.model('Claim', ClaimSchema);
