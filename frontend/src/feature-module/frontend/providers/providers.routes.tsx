import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import ProviderBooking from './provider-booking/provider-booking';
import ProviderSecuritySettings from './settings/provider-security-settings';
import ProviderCars from './cars/provider-cars';
import ProviderProfileSettings from './settings/provider-profile-settings';
import ProviderDashboard from './dashboard/dashboard';
import CreateCar from '../services/car/create-car'; // Import the new page
import CreateClaim from '../services/claim/create-claim'; // Import the new page
import ParkingVisualization from './pickParkingSpot';
import ProtectedRoute from '../../router/ProtectedRoute';
import ProviderClaims from './claims/provider-claims';
import ClaimDetails from './claims/provider-claim-details';
import BookingDetails from './provider-booking/booking-details';
import OverdueDetails from './provider-booking/OverdueDetails';



const ProvidersRoutes = () => {
  const all_providers_routes = [
    {
      path: '/claims',
      name: 'provider-claims',
      element: <ProviderClaims />,
      route: Route,
    },
      {
        path: '/claims/:id',
        name: 'provider-claim-details',
        element: <ClaimDetails />,
        route: Route,
      },
    {
      path: '/booking',
      name: 'provider-booking',
      element: <ProviderBooking />,
    },
    {
      path: '/booking/:id',
      name: 'provider-booking-details',
      element: <BookingDetails />,
    },
    {
      path: '/bookingdetails/:id',
      name: 'overdue-details',
      element: <OverdueDetails />,
    },
    {
      path: '/dashboard',
      name: 'provider-dashboard',
      element: <ProviderDashboard />,
    },
    {
      path: '/cars',
      name: 'provider-cars',
      element: <ProviderCars/>,
    },
    {
      path: '/settings/provider-profile-settings',
      name: 'provider-profile-settings',
      element: <ProviderProfileSettings />,
    },
    {
      path: '/settings/provider-security-settings',
      name: 'provider-security-settings',
      element: <ProviderSecuritySettings />,
    },
    {
      path: '/settings/payment-settings',
      name: 'provider-security-settings',
      element: <ProviderSecuritySettings />,
    },

    {
      path: '/provider-service/edit-vehicule/:id',
      name: 'edit-vehicule',
      element: <CreateCar />, // Même composant pour l'édition
      route: Route,
    },
    {
      path: '*',
      name: 'NotFound',
      element: <Navigate to="/" />,
    },
  ];

  return (
    <>
      <Routes>
        {all_providers_routes.map((route, idx) => (
          <Route
            key={idx}
            path={route.path}
            element={<ProtectedRoute element={route.element} />}
          />
        ))}
      </Routes>
    </>
  );
};

export default ProvidersRoutes;
