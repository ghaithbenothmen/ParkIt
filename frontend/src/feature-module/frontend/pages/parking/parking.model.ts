export interface Parking {
  _id: string;
  nom: string;
  adresse: string;
  nbr_place: number;
  tarif_horaire: number;
  disponibilite: boolean;
  latitude: number;
  longitude: number;
  images?: string[]; // Tableau optionnel de chemins d'images
  description?: string; // Description optionnelle
  reviewCount?: number; // Compteur optionnel de réservations
}