const Parking = require("../models/parking.model");
const multer = require('multer');
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const path = require('path');
const fs = require('fs');
const ParkingSpot = require("../models/parkingSpot.model");
const Reservation = require("../models/reservation.model");

// Configure Cloudinary (reuse from auth.controller.js or move to a separate config file)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Cloudinary Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "parkings", // Different folder for parking images
    format: async (req, file) => path.extname(file.originalname).replace('.', ''), // Extract format from original file
    public_id: (req, file) => Date.now() + "-" + file.originalname.split('.')[0], // Unique public ID
  },
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
}).array('images', 5); // 'images' is the field name, 5 is the max number of files

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
        parkingData.images = req.files.map(file => file.path); // Cloudinary URL
      }

      const newParking = new Parking(parkingData);
      const parking = await newParking.save();
      
      res.status(201).json({ 
        message: "Parking ajouté avec succès", 
        parking: {
          ...parking.toObject(),
          images: parking.images // Cloudinary URLs are already correct
        }
      });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
exports.getParkingByName = async (req, res) => {
    try {
      const name = req.params.name.toLowerCase();
      const parking = await Parking.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
  
      if (!parking) {
        return res.status(404).json({ message: "Parking not found" });
      }
  
      res.status(200).json(parking);
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
      }

      // Ajouter les nouvelles images
      if (req.files && req.files.length > 0) {
        updateData.images = [
          ...existingImages,
          ...req.files.map(file => file.path) // Cloudinary URL
        ];
      } else {
        updateData.images = existingImages;
      }

      // Optionally delete old images from Cloudinary if they are no longer in existingImages
      if (existingParking.images) {
        const imagesToDelete = existingParking.images.filter(img => !existingImages.includes(img));
        if (imagesToDelete.length > 0) {
          for (const img of imagesToDelete) {
            const publicId = path.parse(img).name; // Extract public_id from URL
            await cloudinary.uploader.destroy(publicId);
          }
        }
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
          images: updatedParking.images // Cloudinary URLs
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
    
    res.status(200).json(parkings); // Cloudinary URLs are already stored
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
    
    res.status(200).json(parking); // Cloudinary URLs are already stored
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.supprimerParking = async (req, res) => {
  try {
    const parking = await Parking.findById(req.params.id);
    if (!parking) {
      return res.status(404).json({ message: "Parking non trouvé" });
    }

    // Delete images from Cloudinary
    if (parking.images && parking.images.length > 0) {
      for (const img of parking.images) {
        const publicId = path.parse(img).name; // Extract public_id from URL
        await cloudinary.uploader.destroy(publicId);
      }
    }

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

    const parkingSpots = await ParkingSpot.find({ parkingId });

    const reservedSpots = await Reservation.find({
      parkingSpot: { $in: parkingSpots.map(spot => spot._id) },
      $or: [
        { startDate: { $lt: endDate }, endDate: { $gt: startDate } }
      ]
    }).select('parkingSpot');

    const unavailableSpotIds = reservedSpots.map(reservation => reservation.parkingSpot.toString());

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

    res.status(200).json(topParkings); // Cloudinary URLs are already stored
  } catch (error) {
    console.error("Error fetching top rated parkings:", error);
    res.status(500).json({ 
      message: "Erreur lors de la récupération des meilleurs parkings", 
      error: error.message 
    });
  }
};  