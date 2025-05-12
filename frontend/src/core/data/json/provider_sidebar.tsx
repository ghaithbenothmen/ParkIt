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

   


 
  
    ],
  },
];
