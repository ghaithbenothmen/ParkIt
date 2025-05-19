const Badge = require('../models/badge.model');

exports.createBadge = async (req, res) => {
  try {
    const { name, minPoints, maxPoints, discountPercentage } = req.body;

    const badge = new Badge({ name, minPoints, maxPoints, discountPercentage });
    await badge.save();

    res.status(201).json({ message: 'Badge created successfully', data: badge });
  } catch (error) {
    res.status(500).json({ message: 'Error creating badge', error: error.message });
  }
};

exports.getAllBadges = async (req, res) => {
  try {
    const badges = await Badge.find().sort({ minPoints: 1 }); // Sorted from Bronze to Gold
    res.status(200).json({ data: badges });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching badges', error: error.message });
  }
};
exports.getBadgeById = async (req, res) => {
    try {
      const { id } = req.params; // Get the badge ID from the URL parameter
      const badge = await Badge.findById(id);
  
      if (!badge) {
        return res.status(404).json({ message: 'Badge not found' });
      }
  
      res.status(200).json(badge);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching badge', error: error.message });
    }
  };
