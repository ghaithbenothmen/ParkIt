import axios from 'axios';

// Créez une instance Axios avec une URL de base
export const api = axios.create({
    baseURL: "http://localhost:4000/api/", // URL de base de votre backend
    // withCredentials: true, // Décommentez si vous utilisez des cookies pour l'authentification
});

// Fonction pour l'authentification Google
export const googleAuth = (code) => api.get(`auth/google?code=${code}`);

// Fonction pour récupérer les véhicules de l'utilisateur connecté
export const getVehiculesByUser = async (userId) => {
    try {
        const response = await axios.get(`http://localhost:4000/api/vehicules/user/${userId}`);
        return response.data.vehicules; // Assurez-vous que le backend renvoie bien `vehicules`
    } catch (error) {
        console.error("Erreur lors de la récupération des véhicules :", error);
        throw error;
    }
};

// Fonction pour ajouter un véhicule
export const addVehicule = async (vehiculeData) => {
    try {
        const response = await api.post("vehicules", vehiculeData); // Appel à l'API backend
        return response.data; // Retourne le véhicule ajouté
    } catch (error) {
        console.error("Erreur lors de l'ajout du véhicule", error);
        throw error;
    }
};

// Fonction pour supprimer un véhicule
export const deleteVehicule = async (vehiculeId) => {
    try {
        const response = await api.delete(`vehicules/${vehiculeId}`); // Appel à l'API backend
        return response.data; // Retourne la réponse du backend
    } catch (error) {
        console.error("Erreur lors de la suppression du véhicule", error);
        throw error;
    }
};