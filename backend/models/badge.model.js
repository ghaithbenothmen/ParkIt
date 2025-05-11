const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  name: {
    type: String,
    enum: ['Bronze', 'Silver', 'Gold'],
    required: true,
    unique: true
  },
  minPoints: {
    type: Number,
    required: true
  },
  maxPoints: {
    type: Number,
    required: true
  },
  discountPercentage: {
    type: Number,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Badge', badgeSchema);
