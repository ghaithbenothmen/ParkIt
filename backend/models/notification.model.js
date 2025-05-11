const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    reservationId: { type: String },
    type: { type: String, enum: ['creation', 'start_reminder', 'end_reminder'] },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    message: { type: String },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    userName: { type: String } // Ajouter ce champ
  });

// Exporter le modèle
module.exports = mongoose.model('Notification', notificationSchema);
