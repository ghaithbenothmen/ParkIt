const mongoose = require("mongoose");

const VehiculeSchema = new mongoose.Schema({
    marque: {
        type: String,
        required: true
    },
    modele: {
        type: String,
        required: true
    },
    couleur: {
        type: String,
        required: true
    },
    immatriculation: {
        type: String,
        required: true,
        unique: true
    },
    date_ajout: {
        type: Date,
        default: Date.now
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
});

module.exports = mongoose.model("Vehicule", VehiculeSchema);