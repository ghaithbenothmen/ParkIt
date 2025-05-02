const mongoose = require("mongoose");

const ParkingSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true
    },
    adresse: {
        type: String,
        required: true
    },
    nbr_place: {
        type: Number,
        required: true,
        min: 0
    },
    tarif_horaire: {
        type: Number,
        required: true,
        min: 0
    },
    disponibilite: {
        type: Boolean,
        default: true
    },
    latitude: {
        type: Number,
        required: true
    },
    longitude: {
        type: Number,
        required: true
    },
    averageRating: { 
        type: Number,
        default: 0 
    },
    reviewCount: {
         type: Number, 
         default: 0 
    },
}, { timestamps: true });

// Convertir tarif_horaire, latitude et longitude en float avant d'enregistrer
ParkingSchema.pre("save", function (next) {
    this.tarif_horaire = parseFloat(this.tarif_horaire);
    this.latitude = parseFloat(this.latitude);
    this.longitude = parseFloat(this.longitude);
    next();
});

module.exports = mongoose.model("Parking", ParkingSchema);
