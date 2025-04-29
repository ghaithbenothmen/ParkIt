import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import CompletedBooking from './bookings/completedbooking';

import Customers from './users/customers';





import Booking from './bookings/booking';
import CancelledBooking from './bookings/cancelled-booking';


import Dashboard from './dashboard/dashboard';

import InprogressBooking from './bookings/inprogress-booking';
import PendingBooking from './bookings/pending-booking';
import InactiveServices from './services/inactive-services';
import PendingServices from './services/pending-services';


import CategoriesList from './categories/categories-list';
import SubCategoriesList from './categories/subcategories-list';

import Review from './services/review';
import ReviewType from './services/review-type';


import AllService from './services/all-service';
import Providers from './users/providers';

import AdminSignin from './authentication/signin';
import AdminSignup from './authentication/signup';
import ForgetPassword from './authentication/forget-password';

import Users from './users/users';

import DeletedServices from './services/deleted-services';




import CacheSystem from './management/cachesystem';
import CreateMenu from './management/create-menu';
import EmailTemplate from './management/email-template';
import WebsiteSettings from './management/website-settings';

import MenuManagement from './management/menu-management';
import SmsTemplate from './management/sms-template';
import EditManagement from './management/editManagement';
import DeviceManagementSettting from './management/device-management';
import PluginManager from './management/plugin-manager';
import DeleteAccountrequests from './user-management/deleteAccountrequests';
import AddService from './services/add-service';
import EditService from './services/edit-service';
import Reviews from './review/review';

const AdminRoutes = () => {
  const all_admin_routes = [
    
   
    {
      path: '/management/menu-management',
      name: 'menu-management',
      element: <MenuManagement />,
      route: Route,
    },
 
    {
      path: '/booking/completed-booking',
      name: 'completedbooking',
      element: <CompletedBooking />,
      route: Route,
    },
    {
      path: '/pending-booking',
      name: 'pending-booking',
      element: <PendingBooking />,
      route: Route,
    },
    {
      path: '/booking',
      name: 'Booking',
      element: <Booking />,
      route: Route,
    },
    {
      path: '/bookings/cancelled-booking',
      name: 'CancelledBooking',
      element: <CancelledBooking />,
      route: Route,
    },

    {
      path: '/management/cachesystem',
      name: 'CacheSystem',
      element: <CacheSystem />,
      route: Route,
    },

    {
      path: '/management/create-menu',
      name: 'create-menu',
      element: <CreateMenu />,
      route: Route,
    },
    {
      path: '/users/customers',
      name: 'customers',
      element: <Customers />,
      route: Route,
    },
    {
      path: '/users',
      name: 'users',
      element: <Users />,
      route: Route,
    },
    {
      path: '/reviews',
      name: 'reviews',
      element: <Reviews />,
      route: Route,
    },
 
  
    {
      path: '/delete-account-requests',
      name: 'delete-account-requests',
      element: <DeleteAccountrequests />,
      route: Route,
    },
    
    {
      path: '/services/inactive-services',
      name: 'inactive-services',
      element: <InactiveServices />,
      route: Route,
    },
    {
      path: '/booking/inprogress-booking',
      name: 'inprogress-booking',
      element: <InprogressBooking />,
      route: Route,
    },
    {
      path: '/services/pending-services',
      name: 'pending-services',
      element: <PendingServices />,
      route: Route,
    },
    {
      path: '/management/sms-template',
      name: 'sms-template',
      element: <SmsTemplate />,
      route: Route,
    },
    
    {
      path: '/categories/categories-list',
      name: 'categories',
      element: <CategoriesList />,
      route: Route,
    },
 
    {
      path: '*',
      name: 'NotFound',
      element: <Navigate to="/" />,
      route: Route,
    },
   
    {
      path: '/services/all-services',
      name: 'all-services',
      element: <AllService />,
      route: Route,
    },
   
    {
      path: '/services/add-service',
      name: 'add-services',
      element: <AddService />,
      route: Route,
    },
 
    {
      path: '/services/deleted-services',
      name: 'deleted-services',
      element: <DeletedServices />,
      route: Route,
    },
    
    {
      path: '/edit-management',
      name: 'edit-management',
      element: <EditManagement />,
      route: Route,
    },


    {
      path: '/device-management',
      name: 'device-management',
      element: <DeviceManagementSettting />,
      route: Route,
    },
   
    {
      path: '/edit-service',
      name: 'edit-service',
      element: <EditService />,
      route: Route,
    },
   

    {
      path: '/sub-categories',
      name: 'SubcategoriesList',
      element: <SubCategoriesList />,
      route: Route,
    },
  

  
    {
      path: '/management/email-templates',
      name: 'email-templates',
      element: <EmailTemplate />,
      route: Route,
    },
 

    {
      path: '/signin',
      name: 'signin',
      element: <AdminSignin />,
      route: Route,
    },
    {
      path: '/management/website-settings',
      name: 'website-settings',
      element: <WebsiteSettings />,
      route: Route,
    },
    {
      path: '/signup',
      name: 'signup',
      element: <AdminSignup />,
      route: Route,
    },
 


    {
      path: '/review',
      name: 'review',
      element: <Review />,
      route: Route,
    },
    {
      path: '/review-type',
      name: 'review-type',
      element: <ReviewType />,
      route: Route,
    },

   
    {
      path: '/dashboard',
      name: 'dashboard',
      element: <Dashboard />,
      route: Route,
    },

  ];

  const settingssidebarmodule = [
   
    {
      path: '/users/providers',
      name: 'footer-settings',
      element: <Providers />,
      route: Route,
    },
   
    {
      path: '/forget-password',
      name: 'forget-password',
      element: <ForgetPassword />,
      route: Route,
    },
  
    
    {
      path: '/user/customers',
      name: 'customers',
      element: <Customers />,
      route: Route,
    },
    {
      path: '/user/customers',
      name: 'customers',
      element: <Customers />,
      route: Route,
    },
    
    {
      path: '/management/plugin-manager',
      name: 'plugin-manager',
      element: <PluginManager />,
      route: Route,
    },
  ];

  return (
    <>
      <Routes>
        <Route>
          {all_admin_routes.map((route, idx) => (
            <Route path={route.path} element={route.element} key={idx} />
          ))}
          {settingssidebarmodule.map((route, idx) => (
            <Route path={route.path} element={route.element} key={idx} />
          ))}

          {/* <Route path="/device-management" element={DeviceManagement} /> */}
        </Route>
      </Routes>
    </>
  );
};

export default AdminRoutes;
