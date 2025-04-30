const express = require('express');
const router = express.Router();
const NotificationController = require('../controllers/notification.controller.js');

// Route pour créer une notification
router.post('/create', async (req, res) => {
    try {
        const { reservation } = req.body;
        await NotificationController.createNotification(reservation);
        res.status(201).json({ message: 'Notification créée avec succès' });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la création de la notification', error: error.message });
    }
});

router.get('/all', async (req, res) => {
    try {
        const notifications = await NotificationController.getAllNotifications();
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ 
            message: 'Erreur lors de la récupération des notifications', 
            error: error.message 
        });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await NotificationController.deleteNotification(req.params.id);
        res.status(200).json({ message: 'Notification supprimée avec succès' });
    } catch (error) {
        res.status(error.message === 'Notification not found' ? 404 : 500).json({
            message: 'Erreur lors de la suppression de la notification',
            error: error.message
        });
    }
});

module.exports = router;
