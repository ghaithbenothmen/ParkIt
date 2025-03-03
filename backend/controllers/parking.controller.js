const Parking = require("../models/parking.model");


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

