import React from 'react';
import { all_routes } from '../routes/all_routes';
import * as Icon from 'react-feather';

const routes = all_routes;

export const providersSidebar = [
  {
    menu: [
      {
        menuValue: 'Dashboard',
        route: routes.addSubscription,
        hasSubRoute: false,
        showSubRoute: false,
        icon: <Icon.Home className="react-feather-icon" />, // Icône de maison pour un tableau de bord
        subMenus: [],
      },
      {
        menuValue: 'Vehicules',
        route: routes.addSubscription,
        hasSubRoute: false,
        showSubRoute: false,
        icon: <Icon.Truck className="react-feather-icon" />, // Icône de camion pour les véhicules
        subMenus: [],
      },
      {
        menuValue: 'Bookings',
        route: routes.addSubscription,
        hasSubRoute: false,
        showSubRoute: false,
        icon: <Icon.Calendar className="react-feather-icon" />, // Icône de calendrier pour les réservations
        subMenus: [],
      },
      {
        menuValue: 'Payout',
        route: routes.addSubscription,
        hasSubRoute: false,
        showSubRoute: false,
        icon: <Icon.CreditCard className="react-feather-icon" />, // Carte de crédit pour les paiements
        subMenus: [],
      },
      {
        menuValue: 'Availability',
        route: routes.addSubscription,
        hasSubRoute: false,
        showSubRoute: false,
        icon: <Icon.Clock className="react-feather-icon" />, // Horloge pour disponibilité
        subMenus: [],
      },
      {
        menuValue: 'Holidays & Leave',
        route: routes.addSubscription,
        hasSubRoute: false,
        showSubRoute: false,
        icon: <Icon.Sun className="react-feather-icon" />, // Soleil pour congés et vacances
        subMenus: [],
      },
      {
        menuValue: 'Coupons',
        route: routes.addSubscription,
        hasSubRoute: false,
        showSubRoute: false,
        icon: <Icon.Tag className="react-feather-icon" />, // Étiquette pour les coupons
        subMenus: [],
      },
      {
        menuValue: 'Subscription',
        route: routes.addSubscription,
        hasSubRoute: false,
        showSubRoute: false,
        icon: <Icon.DollarSign className="react-feather-icon" />, // Icône dollar pour abonnements
        subMenus: [],
      },
      {
        menuValue: 'Offers',
        route: routes.addSubscription,
        hasSubRoute: false,
        showSubRoute: false,
        icon: <Icon.Percent className="react-feather-icon" />, // Pourcentage pour offres spéciales
        subMenus: [],
      },
      {
        menuValue: 'Reviews',
        route: routes.addSubscription,
        hasSubRoute: false,
        showSubRoute: false,
        icon: <Icon.Star className="react-feather-icon" />, // Étoile pour les avis
        subMenus: [],
      },
      {
        menuValue: 'Earnings',
        route: routes.addSubscription,
        hasSubRoute: false,
        showSubRoute: false,
        icon: <Icon.TrendingUp className="react-feather-icon" />, // Flèche ascendante pour revenus
        subMenus: [],
      },
      {
        menuValue: 'Chat',
        route: routes.addSubscription,
        hasSubRoute: false,
        showSubRoute: false,
        icon: <Icon.MessageCircle className="react-feather-icon" />, // Bulle de message pour le chat
        subMenus: [],
      },
    ],
  },
];
