import React from 'react';
import * as Icon from 'react-feather';
import { all_routes } from '../routes/all_routes';
const routes = all_routes;
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
    tittle: 'Services',
    showAsTab: false,
    separateRoute: false,
    menu: [
      {
        menuValue: 'Services',
        hasSubRoute: true,
        showSubRoute: false,
        route: routes.services,
        icon: <Icon.Briefcase className="react-feather-icon" />,
        subMenus: [
          {
            menuValue: 'Add Service',
            route: routes.addServices,
          },
          {
            menuValue: 'Services',
            route: routes.allServices,
          },
          {
            menuValue: 'Service Settings',
            route: routes.serviceSettings,
          },
        ],
      },
      {
        menuValue: 'Categories',
        hasSubRoute: false,
        showSubRoute: false,
        route: routes.categoriesList,
        icon: <Icon.FileText className="react-feather-icon" />,
      },
      {
        menuValue: 'Sub Categories',
        hasSubRoute: false,
        showSubRoute: false,
        route: routes.subCategories,
        icon: <Icon.Clipboard className="react-feather-icon" />,
      },
      {
        menuValue: 'Review',
        hasSubRoute: true,
        showSubRoute: false,
        icon: <Icon.Star className="react-feather-icon" />,
        subMenus: [
          {
            menuValue: 'Review Type',
            route: routes.reviewType,
          },
          {
            menuValue: 'Review',
            route: routes.review,
          },
        ],
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
          {
            menuValue: 'Customers',
            route: routes.userCustomer,
          },
          {
            menuValue: 'Providers',
            route: routes.userProviders,
          },
        ],
      },
      {
        menuValue: 'Roles & Permissions',
        hasSubRoute: false,
        showSubRoute: false,
        route: routes.roles,
        icon: <Icon.File className="react-feather-icon" />,
      },
      {
        menuValue: 'Delete Account Requests',
        hasSubRoute: false,
        showSubRoute: false,
        route: routes.deleteaccountrequests,
        icon: <Icon.Trash2 className="react-feather-icon" />,
      },
      {
        menuValue: 'Verification Requests',
        hasSubRoute: false,
        showSubRoute: false,
        route: routes.verificationRequest,
        icon: <Icon.DollarSign className="react-feather-icon" />,
      },
    ],
  },
  ];
