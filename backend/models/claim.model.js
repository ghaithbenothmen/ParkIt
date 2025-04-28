const mongoose = require('mongoose');

const ClaimSchema = new mongoose.Schema({
  userId: {
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
    enum: ['Spot Occupied', 'Payment Issue', 'Security', 'Other'],
    required: true,
  },
  image: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    enum: ['Valid', 'Pending', 'Resolved', 'Rejected'],
    default: 'Valid',
  },
  submissionDate: {
    type: Date,
    default: Date.now,
  },
  priority: {
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
  if (this.isNew) {
    let score = 0;

    // Claim type scoring
    switch (this.claimType) {
      case 'Security':
        score += 10;
        break;
      case 'Payment Issue':
        score += 8;
        break;
      case 'Spot Occupied':
        score += 6;
        break;
      case 'Other':
        score += 4;
        break;
    }

    // Similar claims for the same type
    const similarClaims = await mongoose.model('Claim').countDocuments({
      claimType: this.claimType,
      status: { $in: ['Valid', 'Pending'] },
    });
    if (similarClaims >= 3) {
      score += 5;
    }

    // Claims for the same parking
    const parkingClaims = await mongoose.model('Claim').countDocuments({
      parkingId: this.parkingId,
      status: { $in: ['Valid', 'Pending'] },
    });
    if (parkingClaims >= 3) {
      score += 3;
    }

    // User role
    const user = await mongoose.model('User').findById(this.userId);
    if (user && user.role === 'admin') {
      score += 3;
    }

    // Presence of an image
    if (this.image) {
      score += 2;
      this.status = 'Valid';
    } else {
      this.status = 'Pending';
    }

    this.priority = score;
  }
  next();
});

module.exports = mongoose.model('Claim', ClaimSchema);
