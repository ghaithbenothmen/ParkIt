const Vehicule = require('../models/vehicule.model');
const Reservation = require('../models/reservation.model');

exports.checkPlate = async (req, res) => {
    // Add raw body logging for debugging
    console.log("Raw request body:", req.body);
    
    try {
        // Ensure proper JSON parsing
        if (typeof req.body !== 'object' || !req.body.immatriculation) {
            return res.status(400).json({ 
                message: "Invalid request format",
                expected: { immatriculation: "string" },
                received: req.body
            });
        }

        const { immatriculation } = req.body;
        console.log("Checking plate:", immatriculation);

        const vehicle = await Vehicule.findOne({ immatriculation });
        if (!vehicle) {
            return res.status(404).json({ message: "Véhicule non trouvé." });
        }

        const now = new Date();
        const activeReservation = await Reservation.findOne({
            vehicule: vehicle._id,
            startDate: { $lte: now },
            endDate: { $gte: now },
            status: { $in: ['pending', 'confirmed'] }
        });

        if (activeReservation) {
            return res.status(200).json({ 
                authorized: true, 
                message: "Accès autorisé",
                vehicle,
                reservation: activeReservation
            });
        } else {
            return res.status(200).json({ 
                authorized: false, 
                message: "Aucune réservation active.",
                currentTime: now
            });
        }
    } catch (error) {
        console.error("Error in checkPlate:", error);
        return res.status(500).json({ 
            message: "Erreur serveur", 
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};
