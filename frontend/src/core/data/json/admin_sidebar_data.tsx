import React from 'react';
import * as Icon from 'react-feather';
import { all_routes } from '../routes/all_routes';
const routes = all_routes;
const handleLogout = () => {
  // Ajoute ici la logique pour déconnecter l'utilisateur
  console.log("User logged out");
  // Exemple : localStorage.clear(); ou appel API de déconnexion
  window.location.href = "/login"; // Redirige vers la page de connexion
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
        hasSubRoute: true,
        showSubRoute: false,
        icon: <Icon.User className="react-feather-icon" />,
        subMenus: [
          {
            menuValue: 'Users',
            route: routes.users,
          },
          /* {
            menuValue: 'Customers',
            route: routes.userCustomer,
          },
          {
            menuValue: 'Providers',
            route: routes.userProviders,
          }, */
        ],
      },
      /* {
        menuValue: 'Roles & Permissions',
        hasSubRoute: false,
        showSubRoute: false,
        route: routes.roles,
        icon: <Icon.File className="react-feather-icon" />,
      }, */
      /* {
        menuValue: 'Delete Account Requests',
        hasSubRoute: false,
        showSubRoute: false,
        route: routes.deleteaccountrequests,
        icon: <Icon.Trash2 className="react-feather-icon" />,
      }, */
      /* {
        menuValue: 'Verification Requests',
        hasSubRoute: false,
        showSubRoute: false,
        route: routes.verificationRequest,
        icon: <Icon.DollarSign className="react-feather-icon" />,
      }, */
    ],
  },

  {
    tittle: 'Services',
    showAsTab: false,
    separateRoute: false,
    menu: [
      {
        menuValue: 'Parkings',
        hasSubRoute: true,
        showSubRoute: false,
        route: routes.services,
        icon: <Icon.MapPin className="react-feather-icon" />,
        subMenus: [
          //{
            //menuValue: 'Add Parking',
            //route: routes.addServices,
          //},
          {
            menuValue: 'Parkings',
            route: routes.allServices,
          },
          //{
            //menuValue: 'Parking Settings',
            //route: routes.serviceSettings,
          //},
        ],
      },
      /* {
        menuValue: 'Categories',
        hasSubRoute: false,
        showSubRoute: false,
        route: routes.categoriesList,
        icon: <Icon.FileText className="react-feather-icon" />,
      }, */
      /* {
        menuValue: 'Sub Categories',
        hasSubRoute: false,
        showSubRoute: false,
        route: routes.subCategories,
        icon: <Icon.Clipboard className="react-feather-icon" />,
      }, */
      {
        menuValue: 'Claims',
        hasSubRoute: true,
        showSubRoute: false,
        icon: <Icon.AlertCircle className="react-feather-icon" />, // Icône mise à jour
        subMenus: [
          {
            menuValue: 'Claim Type',
            route: routes.reviewType,
          },
          {
            menuValue: 'Claims',
            route: routes.review,
          },
        ],
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
    tittle: '',
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
