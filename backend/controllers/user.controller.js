const User = require("../models/user.model.js");


exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password"); 
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateUser = async (req, res) => {
    try {
        const { firstname, lastname, phone, email,role,isActive } = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,

            { firstname, lastname, phone, email,role,isActive },

            { new: true, runValidators: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.deleteUser = async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }


};


exports.totalUser = async (req, res) => {
    try {
        // Compter le nombre total d'utilisateurs dans la collection User
        const userCount = await User.countDocuments();

        // Retourner le nombre d'utilisateurs en JSON
        return res.status(200).json({ count: userCount });
    } catch (err) {
        console.error('Erreur lors du comptage des utilisateurs:', err);
        return res.status(500).json({ error: 'Une erreur est survenue lors du comptage des utilisateurs.' });
    }
};