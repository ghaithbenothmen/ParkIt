import React from 'react';
import * as Icon from 'react-feather';
import { all_routes } from '../routes/all_routes';
const routes = all_routes;

const handleLogout = () => {
  // Nettoyer complètement le localStorage
  localStorage.clear();
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  
  // Rediriger vers la page de login
  window.location.href = '/home';
};

export const adminSidebar = [
  {
    tittle: 'Home',
    showAsTab: false,
    separateRoute: false,
    menu: [
      {
        menuValue: 'Dashboard',
        hasSubRoute: false,
        showSubRoute: false,
        route: routes.dashboard,
        icon: <Icon.Grid className="react-feather-icon" />,
      },
    ],
  },
  {
    tittle: 'USER MANAGEMENT',
    showAsTab: false,
    separateRoute: false,
    menu: [
      {
        menuValue: 'Users',
        hasSubRoute: false,
        showSubRoute: false,
        route: routes.users,
        icon: <Icon.User className="react-feather-icon" />,
      },
    ],
  },

  {
    tittle: 'Services',
    showAsTab: false,
    separateRoute: false,
    menu: [
      {
        menuValue: 'Parkings',
        hasSubRoute: false,
        showSubRoute: false,
        route: routes.allServices,
        icon: <Icon.MapPin className="react-feather-icon" />,
      },
      {
        menuValue: 'Claims',
        hasSubRoute: false,
        showSubRoute: false,
        route: routes.claims,
        icon: <Icon.AlertCircle className="react-feather-icon" />,
      },
    ],
  },
  {
    tittle: 'Reviews',
    showAsTab: false,
    separateRoute: false,
    menu: [
      {
        menuValue: 'Reviews',
        hasSubRoute: false,
        showSubRoute: false,
        route: routes.reviews,
        icon: <Icon.Calendar className="react-feather-icon" />, // Icône mise à jour
      },
    ],
  },
  
    {
      tittle: 'Booking',
      showAsTab: false,
      separateRoute: false,
      menu: [
        {
          menuValue: 'Bookings',
          hasSubRoute: false,
          showSubRoute: false,
          route: routes.booking,
          icon: <Icon.Calendar className="react-feather-icon" />, // Icône mise à jour
        },
      ],
    },
  // Bouton Logout
  {
    tittle: 'Account',
    showAsTab: false,
    separateRoute: true,
    menu: [
      {
        menuValue: 'Logout',
        hasSubRoute: false,
        showSubRoute: false,
        route: '#',
        icon: <Icon.LogOut className="react-feather-icon" />,
        onClick: handleLogout, // Ajout de l'événement onClick
      },
    ],
  },

  
 
  
  ];
