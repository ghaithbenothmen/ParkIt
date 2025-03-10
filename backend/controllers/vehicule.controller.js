const User = require("../models/user.model.js");
const Vehicule = require("../models/vehicule.model.js");

exports.ajouterVehicule = async (req, res) => {
    try {
        const { marque, modele, couleur, immatriculation } = req.body;

        const userId = req.user.id;
        // Vérifier si l'utilisateur existe
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "Utilisateur non trouvé" });
        }

        // Créer un nouveau véhicule
        const vehicule = new Vehicule({ marque, modele, couleur, immatriculation, user: userId });
        await vehicule.save();

        // Ajouter l'ID du véhicule à la liste des véhicules de l'utilisateur
        await User.findByIdAndUpdate(userId, { $push: { vehicules: vehicule._id } });

        res.status(201).json({ message: "Véhicule ajouté avec succès", vehicule });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getAllVehiculesByUser = async (req, res) => {
    try {
      const userId = req.params.userId; // Récupérer l'ID de l'utilisateur depuis les paramètres
  
      // Vérifier si l'utilisateur existe
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }
  
      // Trouver tous les véhicules appartenant à cet utilisateur
      const vehicules = await Vehicule.find({ user: userId });
  
      if (!vehicules.length) {
        return res.status(404).json({ message: "Aucun véhicule trouvé pour cet utilisateur" });
      }
  
      res.status(200).json({ vehicules });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };


exports.getAllVehicules = async (req, res) => {
    try {
        // Trouver tous les véhicules dans la base de données
        const vehicules = await Vehicule.find({});

        if (!vehicules.length) {
            return res.status(404).json({ message: "Aucun véhicule trouvé" });
        }

        res.status(200).json({ vehicules });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



exports.modifierVehicule = async (req, res) => {
    try {
        const vehiculeId = req.params.id;
        const updates = req.body;

        // Vérifier si le véhicule existe
        const vehicule = await Vehicule.findById(vehiculeId);
        if (!vehicule) {
            return res.status(404).json({ message: "Véhicule non trouvé" });
        }

        // Mettre à jour les informations du véhicule
        const vehiculeModifie = await Vehicule.findByIdAndUpdate(vehiculeId, updates, { new: true });

        res.status(200).json({ message: "Véhicule modifié avec succès", vehicule: vehiculeModifie });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};




exports.deleteVehicule = async (req, res) => {
    try {
        const vehiculeId = req.params.id;

        // Vérifier si le véhicule existe
        const vehicule = await Vehicule.findById(vehiculeId);
        if (!vehicule) {
            return res.status(404).json({ message: "Véhicule non trouvé" });
        }

        // Supprimer le véhicule
        await Vehicule.findByIdAndDelete(vehiculeId);

        // Retirer le véhicule de la liste des véhicules de l'utilisateur
        await User.findByIdAndUpdate(vehicule.user, { $pull: { vehicules: vehiculeId } });

        res.status(200).json({ message: "Véhicule supprimé avec succès" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getVehiculeById = async (req, res) => {
    try {
      const vehiculeId = req.params.id;
      const userId = req.user.id; // Supposons que l'ID de l'utilisateur est disponible dans req.user
  
      const vehicule = await Vehicule.findOne({ _id: vehiculeId, user: userId });
  
      if (!vehicule) {
        return res.status(404).json({ message: "Véhicule non trouvé ou non autorisé" });
      }
  
      res.status(200).json({ vehicule });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };