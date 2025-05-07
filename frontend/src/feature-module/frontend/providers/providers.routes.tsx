import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import ProviderAddon from './provider-addon/provider-addon';
import Verification from './settings/verification';
import ProviderEditService from './provider-edit-service/provider-edit-service';
import ProviderDeviceManagement from './settings/provider-device-management';
import ProviderLoginActivity from './settings/provider-login-activity';
import ProviderAvailability from './provider-availability/provider-availability';
import ProviderBookDetails from './provider-book-details/provider-book-details';
import ProviderBooking from './provider-booking/provider-booking';
import ProviderSecuritySettings from './settings/provider-security-settings';
import ProviderCars from './cars/provider-cars';
import ProviderServiceList from './provider-service-list/provider-service-list';
import ProviderSignup from './authentication/provider-signup';
import ProviderPlan from './settings/provider-plan';
import ProviderProfileSettings from './settings/provider-profile-settings';
import ProviderSocialProfile from './settings/provider-social-profile';
import ProviderDashboard from './dashboard/dashboard';
import ProviderSignupPayment from './authentication/provider-signup-payment';
import ProviderSignupSubscription from './authentication/provider-signup-subscription';
import CustomerDetails from './customer/customerDetails';
import CustomerList from './customer/customerList';
import CustomerGrid from './customer/customerGrid';
import CreateCar from '../services/car/create-car'; // Import the new page
import CreateClaim from '../services/claim/create-claim'; // Import the new page
import ParkingVisualization from './pickParkingSpot';
import ProtectedRoute from '../../router/ProtectedRoute';
import ProviderClaims from './claims/provider-claims';
import ClaimDetails from './claims/provider-claim-details';
import BookingDetails from './provider-booking/booking-details';


const ProvidersRoutes = () => {
  const all_providers_routes = [
    {
      path: '/provider-addon',
      name: 'providerAddon',
      element: <ProviderAddon />,
    },
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
      path: '/providers/provider-edit-service',
      name: 'provider-edit-service',
      element: <ProviderEditService />,
    },
    {
      path: '/settings/provider-login-activity',
      name: 'ProviderLoginActivity',
      element: <ProviderLoginActivity />,
    },
    {
      path: '/settings/verification',
      name: 'verification',
      element: <Verification />,
    },
    {
      path: '/settings/provider-device-management',
      name: 'ProviderDeviceManagement',
      element: <ProviderDeviceManagement />,
    },
    {
      path: '/settings/provider-profile-settings',
      name: 'provider-profile-settings',
      element: <ProviderProfileSettings />,
    },
    {
      path: '/settings/provider-plan',
      name: 'provider-plan',
      element: <ProviderPlan />,
    },
    {
      path: '/provider-availability',
      name: 'provider-availability',
      element: <ProviderAvailability />,
    },
    {
      path: '/provider-book-details',
      name: 'provider-book-details',
      element: <ProviderBookDetails />,
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
      path: '/authentication/provider-signup',
      name: 'provider-signup',
      element: <ProviderSignup />,
    },
    {
      path: '/authentication/provider-signup-payment',
      name: 'provider-signup-payment',
      element: <ProviderSignupPayment />,
    },
    {
      path: '/authentication/provider-signup-subscription',
      name: 'provider-signup-subscription',
      element: <ProviderSignupSubscription />,
    },
    {
      path: '/settings/provider-social-profile',
      name: 'provider-social-profile',
      element: <ProviderSocialProfile />,
    },
    {
      path: '/customer/customer-details',
      name: 'customer-details',
      element: <CustomerDetails />,
    },
    {
      path: '/customer/customer-list',
      name: 'customer-list',
      element: <CustomerList />,
    },
    {
      path: '/customer/customer-grid',
      name: 'customer-grid',
      element: <CustomerGrid />,
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
      path: '/provider-service-list',
      name: 'provider-service-list',
      element: <ProviderServiceList />,
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
