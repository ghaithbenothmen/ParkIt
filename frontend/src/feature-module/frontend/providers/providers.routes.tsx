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
import ProviderServices from './provider-service/provider-service';
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
import CreateVehicule from '../services/create-service/createServices'; // Importez la nouvelle page

const ProvidersRoutes = () => {
  const all_providers_routes = [
    {
      path: '/provider-addon',
      name: 'providerAddon',
      element: <ProviderAddon />,
      route: Route,
    },
    {
      path: '/providers/provider-edit-service',
      name: 'provider-edit-service',
      element: <ProviderEditService />,
      route: Route,
    },
    {
      path: '/settings/provider-login-activity',
      name: 'ProviderLoginActivity',
      element: <ProviderLoginActivity />,
      route: Route,
    },
    {
      path: '/settings/verification',
      name: 'verfication',
      element: <Verification />,
      route: Route,
    },
    {
      path: 'settings/provider-device-management',
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
      route: Route,
    },
    {
      path: '/provider-book-details',
      name: 'provider-book-details',
      element: <ProviderBookDetails />,
      route: Route,
    },
    {
      path: '/provider-booking',
      name: 'provider-booking',
      element: <ProviderBooking />,
      route: Route,
    },
    {
      path: '/dashboard',
      name: 'provider-dashboard',
      element: <ProviderDashboard />,
      route: Route,
    },
    {
      path: '/provider-service',
      name: 'provider-service',
      element: <ProviderServices />,
      route: Route,
    },
    {
      path: '/authentication/provider-signup',
      name: 'provider-signup',
      element: <ProviderSignup />,
      route: Route,
    },
    {
      path: '/authentication/provider-signup-payment',
      name: 'provider-signup-payment',
      element: <ProviderSignupPayment />,
      route: Route,
    },
    {
      path: '/authentication/provider-signup-subscription',
      name: 'provider-signup-subscription',
      element: <ProviderSignupSubscription />,
      route: Route,
    },
    {
      path: '/settings/provider-social-profile',
      name: 'provider-social-profile',
      element: <ProviderSocialProfile />,
      route: Route,
    },
    {
      path: '/customer/customer-details',
      name: 'customer-details',
      element: <CustomerDetails />,
      route: Route,
    },
    {
      path: '/customer/customer-list',
      name: 'customer-list',
      element: <CustomerList />,
      route: Route,
    },
    {
      path: '/customer/customer-grid',
      name: 'customer-grid',
      element: <CustomerGrid />,
      route: Route,
    },
    {
      path: '/settings/provider-security-settings',
      name: 'provider-security-settings',
      element: <ProviderSecuritySettings />,
      route: Route,
    },
    {
      path: '/settings/payment-settings',
      name: 'provider-security-settings',
      element: <ProviderSecuritySettings />,
      route: Route,
    },
    {
      path: '/provider-service',
      name: 'provider-service',
      element: <ProviderServices />,
      route: Route,
    },
    {
      path: '/provider-service-list',
      name: 'provider-service-list',
      element: <ProviderServiceList />,
      route: Route,
    },
    {
      path: '/settings/payment-settings',
      name: 'provider-security-settings',
      element: <ProviderSecuritySettings />,
      route: Route,
    },
    {
      path: '/provider-service/create-vehicule',
      name: 'create-vehicule',
      element: <CreateVehicule />, // Nouvelle route pour la création de véhicules
      route: Route,
    },
    {
      path: '/provider-service/edit-vehicule/:id',
      name: 'edit-vehicule',
      element: <CreateVehicule />, // Même composant pour l'édition
      route: Route,
    },
    {
      path: '*',
      name: 'NotFound',
      element: <Navigate to="/" />,
      route: Route,
    },
  ];

  return (
    <>
      <Routes>
        {all_providers_routes.map((route, idx) => (
          <Route path={route.path} element={route.element} key={idx} />
        ))}
      </Routes>
    </>
  );
};

export default ProvidersRoutes;