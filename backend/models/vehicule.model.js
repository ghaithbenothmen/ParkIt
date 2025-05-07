const mongoose = require("mongoose");

const VehiculeSchema = new mongoose.Schema({
    marque: {
        type: String,
        required: [true, "Brand is required"],
        trim: true
    },
    modele: {
        type: String,
        required: [true, "Model is required"],
        trim: true
    },
    couleur: {
        type: String,
        required: [true, "Color is required"],
        trim: true
    },
    immatriculation: {
        type: String,
        required: [true, "Registration number is required"],
        unique: true,
        validate: {
            validator: function(v) {
                return /^\d{1,3} Tunisia \d{1,4}$/.test(v);
            },
            message: props => `${props.value} is not a valid registration number! Format should be: (1-3 digits) Tunisia (1-4 digits)`
        }
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