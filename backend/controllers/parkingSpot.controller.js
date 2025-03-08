const ParkingSpot = require('../models/parkingSpot.model');

exports.createParkingSpot = async (req, res) => {
    try {
        const { parkingId, numero, disponibilite } = req.body;

        // Vérifier si la place de parking existe déjà
        const existingSpot = await ParkingSpot.findOne({ parkingId, numero });
        if (existingSpot) {
            return res.status(400).json({ message: 'Cette place de parking existe déjà.' });
        }

        // Créer une nouvelle place de parking
        const newParkingSpot = new ParkingSpot({ parkingId, numero, disponibilite });
        await newParkingSpot.save();

        res.status(201).json({ message: 'Place de parking créée avec succès', data: newParkingSpot });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la création de la place de parking', error: error.message });
    }
};

exports.getAllParkingSpots = async (req, res) => {
    try {
        const parkingSpots = await ParkingSpot.find().populate('parkingId'); // Populate pour obtenir les détails du parking
        res.status(200).json({ data: parkingSpots });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des places de parking', error: error.message });
    }
};

exports.getParkingSpotById = async (req, res) => {
    try {
        const { id } = req.params;
        const parkingSpot = await ParkingSpot.findById(id).populate('parkingId'); // Populate pour obtenir les détails du parking

        if (!parkingSpot) {
            return res.status(404).json({ message: 'Place de parking non trouvée.' });
        }

        res.status(200).json({ data: parkingSpot });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération de la place de parking', error: error.message });
    }
};

exports.updateParkingSpot = async (req, res) => {
    try {
        const { id } = req.params;
        const { numero, disponibilite } = req.body;

        const updatedParkingSpot = await ParkingSpot.findByIdAndUpdate(
            id,
            { numero, disponibilite },
            { new: true } // Retourne le document mis à jour
        );

        if (!updatedParkingSpot) {
            return res.status(404).json({ message: 'Place de parking non trouvée.' });
        }

        res.status(200).json({ message: 'Place de parking mise à jour avec succès', data: updatedParkingSpot });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la mise à jour de la place de parking', error: error.message });
    }
};

exports.deleteParkingSpot = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedParkingSpot = await ParkingSpot.findByIdAndDelete(id);

        if (!deletedParkingSpot) {
            return res.status(404).json({ message: 'Place de parking non trouvée.' });
        }

        res.status(200).json({ message: 'Place de parking supprimée avec succès' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la suppression de la place de parking', error: error.message });
    }
};

exports.getAllParkingSpotsByParking = async (req, res) => {
    try {
        const { parkingId } = req.params; // Récupérer l'ID du parking depuis les paramètres de la requête

        // Vérifier si le parking existe (optionnel, selon vos besoins)
        // const parking = await Parking.findById(parkingId);
        // if (!parking) {
        //     return res.status(404).json({ message: 'Parking non trouvé.' });
        // }

        // Récupérer toutes les places de parking associées à ce parking
        const parkingSpots = await ParkingSpot.find({ parkingId }).populate('parkingId'); // Populate pour obtenir les détails du parking

        if (parkingSpots.length === 0) {
            return res.status(404).json({ message: 'Aucune place de parking trouvée pour ce parking.' });
        }

        res.status(200).json({ data: parkingSpots });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des places de parking', error: error.message });
    }
};


module.exports = {
    createParkingSpot: exports.createParkingSpot,
    getAllParkingSpots: exports.getAllParkingSpots,
    getParkingSpotById: exports.getParkingSpotById,
    updateParkingSpot: exports.updateParkingSpot,
    deleteParkingSpot: exports.deleteParkingSpot,
    getAllParkingSpotsByParking: exports.getAllParkingSpotsByParking
};

