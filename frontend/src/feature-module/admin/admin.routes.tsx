import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import CompletedBooking from './bookings/completedbooking';

import Booking from './bookings/booking';
import CancelledBooking from './bookings/cancelled-booking';


import Dashboard from './dashboard/dashboard';

import InprogressBooking from './bookings/inprogress-booking';
import PendingBooking from './bookings/pending-booking';



import Claims from './claims/claims';



import AllService from './services/all-service';
import ParkingPreview from './services/parking-preview';

import AdminSignin from './authentication/signin';
import AdminSignup from './authentication/signup';
import ForgetPassword from './authentication/forget-password';

import Users from './users/users';


import Reviews from './review/review';

const AdminRoutes = () => {
  const all_admin_routes = [
   
    
    {
      path: '/claims',
      name: 'Claims',
      element: <Claims />,
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
      path: '/booking/inprogress-booking',
      name: 'inprogress-booking',
      element: <InprogressBooking />,
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
      path: '/services/live-preview/:id',
      name: 'live-preview',
      element: <ParkingPreview />,
      route: Route,
    },
  


    {
      path: '/signin',
      name: 'signin',
      element: <AdminSignin />,
      route: Route,
    },

    {
      path: '/signup',
      name: 'signup',
      element: <AdminSignup />,
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
      path: '/forget-password',
      name: 'forget-password',
      element: <ForgetPassword />,
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
