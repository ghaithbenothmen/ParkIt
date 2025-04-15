const Parking = require("../models/parking.model");
const ParkingSpot = require('../models/parkingSpot.model');
const Reservation = require('../models/reservation.model');

exports.ajouterParking = async (req, res) => {
    try {
        const newParking = new Parking(req.body);
        const parking = await newParking.save();
        res.status(201).json({ message: "Parking ajouté avec succès", parking });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.getAllParkings = async (req, res) => {
    try {
        const parkings = await Parking.find();
        res.status(200).json(parkings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.getParkingById = async (req, res) => {
    try {
        const parking = await Parking.findById(req.params.id);
        if (!parking) {
            return res.status(404).json({ message: "Parking non trouvé" });
        }
        res.status(200).json(parking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.modifierParking = async (req, res) => {
    try {
        const updatedParking = await Parking.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedParking) {
            return res.status(404).json({ message: "Parking non trouvé" });
        }
        res.status(200).json({ message: "Parking modifié avec succès", parking: updatedParking });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.supprimerParking = async (req, res) => {
    try {
        const deletedParking = await Parking.findByIdAndDelete(req.params.id);
        if (!deletedParking) {
            return res.status(404).json({ message: "Parking non trouvé" });
        }
        res.status(200).json({ message: "Parking supprimé avec succès" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }};

    exports.totalParc = async (req, res) => {
        try {
            // Compter le nombre total d'utilisateurs dans la collection User
            const parkCount = await Parking.countDocuments();
    
            // Retourner le nombre d'utilisateurs en JSON
            return res.status(200).json({ count: parkCount });
        } catch (err) {
            console.error('Erreur lors du comptage des parking:', err);
            return res.status(500).json({ error: 'Une erreur est survenue lors du comptage des parking.' });
        }
    };

    exports.available =  async (req, res) => {
        try {
            const { parkingId, startDate, endDate } = req.body;
    
            // Find all parking spots for the given parkingId
            const parkingSpots = await ParkingSpot.find({ parkingId });
    
            // Find all reservations for the parking spots during the selected date range
            const reservedSpots = await Reservation.find({
                parkingSpot: { $in: parkingSpots.map(spot => spot._id) },
                $or: [
                    { startDate: { $lt: endDate }, endDate: { $gt: startDate } }
                ]
            }).select('parkingSpot'); // Only get the parking spot ids
    
            // Mark spots that are unavailable
            const unavailableSpotIds = reservedSpots.map(reservation => reservation.parkingSpot.toString());
    
            // Return spots with availability status
            const spotsWithAvailability = parkingSpots.map(spot => ({
                ...spot.toObject(),
                disponibilite: !unavailableSpotIds.includes(spot._id.toString())
            }));
    
            return res.json({ spots: spotsWithAvailability });
        } catch (error) {
            console.error('Error checking availability:', error);
            return res.status(500).json({ message: 'Error checking availability' });
        }
    };

    exports.getParkingCount = async (req, res) => {
        try {
          // Solution 1: Utilisation directe de countDocuments()
          const count = await Parking.estimatedDocumentCount(); // Méthode optimisée
          
          // OU Solution 2: Si vous avez besoin de filtrer
          // const count = await Parking.countDocuments({});
          
          res.status(200).json({ count });
        } catch (error) {
          console.error("Count error:", error);
          res.status(500).json({ 
            message: "Error counting parkings",
            error: error.message 
          });
        }
      };


