const mongoose = require('mongoose');

// Définir le schéma de la notification
const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Référence au modèle User
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    }
}, { timestamps: true });

// Exporter le modèle
module.exports = mongoose.model('Notification', notificationSchema);
