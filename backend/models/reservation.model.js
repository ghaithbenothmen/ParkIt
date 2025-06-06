const mongoose = require('mongoose');

// Définir le schéma de la réservation
const reservationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Référence au modèle User
        required: true
    },
    parkingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Parking', // Référence au modèle Parking
        required: true
    },
    vehicule: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicule',
        required: true
    },
    parkingSpot: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ParkingSpot', // Référence au modèle ParkingSpot
        required: true
    },
    startDate: {
        type: Date,
        
    },
    endDate: {
        type: Date,
        validate: {
            validator: function (value) {
                // Vérifier que endDate est après startDate
                return value > this.startDate;
            },
            message: 'La date de fin doit être après la date de début.'
        }
    },
    status: {
        type: String,
        enum: ['confirmed', 'pending', 'checked-in', 'overdue', 'no-show', 'completed'], // Add 'no-show' and 'checked-in'
        default: 'pending'
    },
    checkedInTime: {
        type: Date, // Tracks when the user checked in
        default: null
    },
    totalPrice: {
        type: Number,
        required: true,
        min: 0 // Le prix total ne peut pas être négatif
    },
    exitTime: {
        type: Date
    },
    additionalFee: {
        type: Number,
        default: 0,
        min: 0
    },
    additionalPaymentStatus: {
        type: String,
        enum: ['pending', 'confirmed', 'failed'],
        default: 'pending'
    },
    extendedEndDate: {
        type: Date, // Nouvelle date de fin après paiement des frais supplémentaires
        default: null
    }
}, { timestamps: true }); // Ajouter les champs createdAt et updatedAt

// Exporter le modèle
module.exports = mongoose.model('Reservation', reservationSchema);