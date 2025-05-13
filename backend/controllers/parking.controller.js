const Parking = require("../models/parking.model");
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ParkingSpot = require("../models/parkingSpot.model");
const Reservation = require("../models/reservation.model");

// Configuration de Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, '../uploads/parkings/');
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Seules les images (jpeg, jpg, png, gif) sont autorisées'));
    }
}).array('images', 5); // 'images' est le nom du champ, 5 est le nombre max de fichiers

exports.ajouterParking = async (req, res) => {
    try {
        upload(req, res, async function (err) {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({ message: err.message });
            } else if (err) {
                return res.status(400).json({ message: err.message });
            }

            const parkingData = req.body;
            
            if (req.files && req.files.length > 0) {
                parkingData.images = req.files.map(file => 
                    `/uploads/parkings/${file.filename}`
                );
            }

            const newParking = new Parking(parkingData);
            const parking = await newParking.save();
            
            res.status(201).json({ 
                message: "Parking ajouté avec succès", 
                parking: {
                    ...parking.toObject(),
                    images: parking.images.map(img => `/uploads/parkings/${path.basename(img)}`)
                }
            });
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.modifierParking = async (req, res) => {
    try {
        upload(req, res, async function (err) {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({ message: err.message });
            } else if (err) {
                return res.status(400).json({ message: err.message });
            }

            const updateData = req.body;
            const parkingId = req.params.id;
            
            // Récupérer le parking existant
            const existingParking = await Parking.findById(parkingId);
            if (!existingParking) {
                return res.status(404).json({ message: "Parking non trouvé" });
            }

            // Gérer les images existantes
            let existingImages = [];
            if (updateData.existingImages) {
                existingImages = Array.isArray(updateData.existingImages) 
                    ? updateData.existingImages 
                    : [updateData.existingImages];
                
                // Supprimer les images qui ne sont plus dans existingImages
                existingParking.images.forEach(image => {
                    if (!existingImages.includes(image)) {
                        const fullPath = path.join(__dirname, '../', image);
                        if (fs.existsSync(fullPath)) {
                            fs.unlinkSync(fullPath);
                        }
                    }
                });
            }

            // Ajouter les nouvelles images
            if (req.files && req.files.length > 0) {
                updateData.images = [
                    ...existingImages,
                    ...req.files.map(file => `/uploads/parkings/${file.filename}`)
                ];
            } else {
                updateData.images = existingImages;
            }

            const updatedParking = await Parking.findByIdAndUpdate(
                parkingId, 
                updateData, 
                { new: true }
            );
            
            if (!updatedParking) {
                return res.status(404).json({ message: "Parking non trouvé" });
            }
            
            res.status(200).json({ 
                message: "Parking modifié avec succès", 
                parking: {
                    ...updatedParking.toObject(),
                    images: updatedParking.images.map(img => `/uploads/parkings/${path.basename(img)}`)
                }
            });
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllParkings = async (req, res) => {
    try {
        const parkings = await Parking.find();
        
        // Modifier les chemins des images pour inclure le chemin complet
        const parkingsWithCorrectImagePaths = parkings.map(parking => ({
            ...parking.toObject(),
            images: parking.images.map(img => `/uploads/parkings/${path.basename(img)}`)
        }));
        
        res.status(200).json(parkingsWithCorrectImagePaths);
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
        
        // Modifier les chemins des images pour inclure le chemin complet
        const parkingWithCorrectImagePaths = {
            ...parking.toObject(),
            images: parking.images.map(img => `/uploads/parkings/${path.basename(img)}`)
        };
        
        res.status(200).json(parkingWithCorrectImagePaths);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.supprimerParking = async (req, res) => {
    try {
        // Trouver le parking pour obtenir les chemins des images
        const parking = await Parking.findById(req.params.id);
        if (!parking) {
            return res.status(404).json({ message: "Parking non trouvé" });
        }

        // Supprimer les images associées
        if (parking.images && parking.images.length > 0) {
            parking.images.forEach(imagePath => {
                const fullPath = path.join(__dirname, '../', imagePath);
                if (fs.existsSync(fullPath)) {
                    fs.unlinkSync(fullPath);
                }
            });
        }

        // Supprimer le parking de la base de données
        await Parking.findByIdAndDelete(req.params.id);
        
        res.status(200).json({ message: "Parking supprimé avec succès" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.totalParc = async (req, res) => {
    try {
        const parkCount = await Parking.countDocuments();
        return res.status(200).json({ count: parkCount });
    } catch (err) {
        console.error('Erreur lors du comptage des parkings:', err);
        return res.status(500).json({ error: 'Une erreur est survenue lors du comptage des parkings.' });
    }
};

exports.available = async (req, res) => {
    try {
        const { parkingId, startDate, endDate } = req.body;

        // Trouver toutes les places de parking pour le parkingId donné
        const parkingSpots = await ParkingSpot.find({ parkingId });

        // Trouver toutes les réservations pour les places de parking pendant la période sélectionnée
        const reservedSpots = await Reservation.find({
            parkingSpot: { $in: parkingSpots.map(spot => spot._id) },
            $or: [
                { startDate: { $lt: endDate }, endDate: { $gt: startDate } }
            ]
        }).select('parkingSpot');

        // Marquer les places qui ne sont pas disponibles
        const unavailableSpotIds = reservedSpots.map(reservation => reservation.parkingSpot.toString());

        // Retourner les places avec leur statut de disponibilité
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
        const count = await Parking.estimatedDocumentCount();
        res.status(200).json({ count });
    } catch (error) {
        console.error("Count error:", error);
        res.status(500).json({
            message: "Error counting parkings",
            error: error.message
        });
    }
};

exports.getTopRatedParkings = async (req, res) => {
    try {
        const topParkings = await Parking.find()
            .sort({ averageRating: -1 })
            .limit(3);

        // Modifier les chemins des images pour inclure le chemin complet
        const topParkingsWithCorrectImagePaths = topParkings.map(parking => ({
            ...parking.toObject(),
            images: parking.images.map(img => `/uploads/parkings/${path.basename(img)}`)
        }));
            
        res.status(200).json(topParkingsWithCorrectImagePaths);
    } catch (error) {
        console.error("Error fetching top rated parkings:", error);
        res.status(500).json({ 
            message: "Erreur lors de la récupération des meilleurs parkings", 
            error: error.message 
        });
    }
};