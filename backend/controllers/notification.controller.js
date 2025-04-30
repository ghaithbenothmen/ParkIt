const Notification = require('../models/notification.model.js');

exports.createNotification = async (reservation) => {
    try {
        // Notification de création
        const notification = new Notification({
            userId: reservation.userId,
            startDate: reservation.startDate,
            endDate: reservation.endDate,
            reservationId: reservation._id,
            type: 'creation',
            message: "Your reservation has been created successfully",
            createdAt: new Date()
        });
        await notification.save();
        
        // Calculer les temps de rappel
        const startReminderTime = new Date(reservation.startDate);
        startReminderTime.setMinutes(startReminderTime.getMinutes() - 15);
        
        const endReminderTime = new Date(reservation.endDate);
        endReminderTime.setMinutes(endReminderTime.getMinutes() - 15);
        
        const now = new Date();
        const timeUntilStartReminder = startReminderTime.getTime() - now.getTime();
        const timeUntilEndReminder = endReminderTime.getTime() - now.getTime();
        
        // Rappel pour le début
        if (timeUntilStartReminder > 0) {
            setTimeout(async () => {
                const startReminder = new Notification({
                    userId: reservation.userId,
                    startDate: reservation.startDate,
                    endDate: reservation.endDate,
                    reservationId: reservation._id,
                    type: 'start_reminder',
                    message: "Reminder: Your reservation starts in 15 minutes",
                    createdAt: new Date()
                });
                await startReminder.save();
                
                if (global.io) {
                    global.io.emit('reminderNotification', startReminder.toObject());
                }
            }, timeUntilStartReminder);
        }

        // Rappel pour la fin
        if (timeUntilEndReminder > 0) {
            setTimeout(async () => {
                const endReminder = new Notification({
                    userId: reservation.userId,
                    startDate: reservation.startDate,
                    endDate: reservation.endDate,
                    reservationId: reservation._id,
                    type: 'end_reminder',
                    message: "Reminder: Your reservation ends in 15 minutes",
                    createdAt: new Date()
                });
                await endReminder.save();
                
                if (global.io) {
                    global.io.emit('reminderNotification', endReminder.toObject());
                }
            }, timeUntilEndReminder);
        }

        // Émettre la notification immédiate
        if (global.io) {
            global.io.emit('newNotification', notification.toObject());
        }
        
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error.message);
        throw error;
    }
};

exports.getAllNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find()
            .sort({ createdAt: -1 });
        // Ajout de read dans la réponse
        res.status(200).json(notifications.map(notif => ({
            ...notif.toObject(),
            read: notif.read || false
        })));
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Error fetching notifications', error: error.message });
    }
};

exports.deleteNotification = async (notificationId) => {
    try {
        const notification = await Notification.findByIdAndDelete(notificationId);
        if (!notification) {
            throw new Error('Notification not found');
        }
        return notification;
    } catch (error) {
        console.error('Error deleting notification:', error.message);
        throw error;
    }
};

exports.markAllAsRead = async (req, res) => {
    try {
        // Mettre à jour toutes les notifications non lues
        const result = await Notification.updateMany(
            { read: { $ne: true } }, // Seulement celles qui ne sont pas déjà lues
            { $set: { read: true } }
        );
        
        // Récupérer les notifications mises à jour
        const updatedNotifications = await Notification.find().sort({ createdAt: -1 });
        
        res.status(200).json({
            message: 'All notifications marked as read',
            notifications: updatedNotifications
        });
    } catch (error) {
        console.error('Error marking notifications as read:', error);
        res.status(500).json({ message: 'Error marking notifications as read', error: error.message });
    }
};
