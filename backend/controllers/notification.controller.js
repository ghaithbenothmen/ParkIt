const Notification = require('../models/notification.model.js');
const User = require('../models/user.model.js'); // Ajouter cette ligne

exports.createNotification = async (reservation) => {
    try {
        // Récupérer les informations de l'utilisateur
        const user = await User.findById(reservation.userId);
        const userName = user ? `${user.firstname} ${user.lastname}` : 'Unknown user';

        // Créer la notification avec le nom de l'utilisateur
        const notification = new Notification({
            userId: reservation.userId,
            userName: userName, // Ajouter le nom de l'utilisateur
            startDate: reservation.startDate,
            endDate: reservation.endDate,
            reservationId: reservation._id,
            type: 'creation',
            message: `${userName} created a reservation`,
            createdAt: new Date()
        });
        await notification.save();

        // Rappels programmés avec setInterval pour plus de fiabilité
        const checkAndSendReminders = async () => {
            const now = new Date();
            const startDate = new Date(reservation.startDate);
            const endDate = new Date(reservation.endDate);
            
            // Calculer les temps restants en minutes
            const minutesUntilStart = Math.floor((startDate.getTime() - now.getTime()) / (1000 * 60));
            const minutesUntilEnd = Math.floor((endDate.getTime() - now.getTime()) / (1000 * 60));

            // Rappel de début (15 minutes avant)
            if (minutesUntilStart <= 15 && minutesUntilStart > 14) {
                const startReminder = new Notification({
                    userId: reservation.userId,
                    userName: userName, // Ajouter le nom de l'utilisateur
                    startDate: reservation.startDate,
                    endDate: reservation.endDate,
                    reservationId: reservation._id,
                    type: 'start_reminder',
                    message: `${userName}, your reservation starts in 15 minutes`,
                    createdAt: new Date()
                });
                await startReminder.save();
                if (global.io) {
                    global.io.emit('reminderNotification', startReminder.toObject());
                }
            }

            // Rappel de fin (15 minutes avant)
            if (minutesUntilEnd <= 15 && minutesUntilEnd > 14) {
                const endReminder = new Notification({
                    userId: reservation.userId,
                    userName: userName, // Ajouter le nom de l'utilisateur
                    startDate: reservation.startDate,
                    endDate: reservation.endDate,
                    reservationId: reservation._id,
                    type: 'end_reminder',
                    message: `${userName}, your reservation ends in 15 minutes`,
                    createdAt: new Date()
                });
                await endReminder.save();
                if (global.io) {
                    global.io.emit('reminderNotification', endReminder.toObject());
                }
            }
        };

        // Vérifier toutes les minutes
        const checkInterval = setInterval(checkAndSendReminders, 60000);

        // Arrêter les vérifications après la fin de la réservation
        setTimeout(() => {
            clearInterval(checkInterval);
        }, new Date(reservation.endDate).getTime() - new Date().getTime() + 900000); // +15 minutes pour être sûr

        // Émettre la notification de création
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
