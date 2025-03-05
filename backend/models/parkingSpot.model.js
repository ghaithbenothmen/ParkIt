const mongoose = require('mongoose');

const parkingSpotSchema = new mongoose.Schema({
    parkingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Parking',  // Référence au modèle Parking
        required: true
    },
    numero: {
        type: String,
        required: true
    },
    disponibilite: {
        type: Boolean,
        default: true,  // Par défaut, la place est disponible
    }
});

const ParkingSpot = mongoose.model('ParkingSpot', parkingSpotSchema);

module.exports = ParkingSpot;