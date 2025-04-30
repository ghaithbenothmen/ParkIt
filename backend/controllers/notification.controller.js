const Notification = require('../models/notification.model.js');

exports.createNotification = async (reservation) => {
    try {
        const notification = new Notification({
            userId: reservation.userId,
            startDate: reservation.startDate,
            endDate: reservation.endDate
        });
        await notification.save();
        
        // Calculer le moment du rappel (15 minutes avant startDate)
        const reminderTime = new Date(reservation.startDate);
        reminderTime.setMinutes(reminderTime.getMinutes() - 15);
        
        // Programmer le rappel
        const now = new Date();
        const timeUntilReminder = reminderTime.getTime() - now.getTime();
        
        if (timeUntilReminder > 0) {
            setTimeout(() => {
                if (global.io) {
                    global.io.emit('reminderNotification', {
                        ...notification.toObject(),
                        message: "Rappel: Votre réservation commence dans 15 minutes",
                        type: 'reminder'
                    });
                }
            }, timeUntilReminder);
        }

        // Émettre la notification immédiate
        if (global.io) {
            global.io.emit('newNotification', {
                ...notification.toObject(),
                createdAt: new Date()
            });
        }
        
        console.log('Notification created and broadcasted successfully');
        return notification;
    } catch (error) {
        console.error('Error creating notification:', error.message);
        throw error;
    }
};

exports.getAllNotifications = async () => {
    try {
        const notifications = await Notification.find()
            .populate('userId', 'username email') // Ajoutez les champs d'utilisateur que vous voulez récupérer
            .sort({ createdAt: -1 }); // Trie par date de création décroissante
        return notifications;
    } catch (error) {
        console.error('Error fetching notifications:', error.message);
        throw error;
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
