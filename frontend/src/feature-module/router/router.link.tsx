import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { all_routes } from '../../core/data/routes/all_routes';


import Customers from '../frontend/customers/customers';
import Services from '../frontend/services/services';
import Providers from '../frontend/providers/providers';
import Admin from '../admin/admin';
import UserSignup from '../frontend/pages/authentication/user-signup';
import Login from '../frontend/pages/authentication/login';
import ResetPassword from '../frontend/pages/authentication/reset-password';
import PasswordRecovery from '../frontend/pages/authentication/password-recovery';
import Success from '../frontend/pages/authentication/success';
import NewHome from '../frontend/home/new-home';
import ProviderRegister from '../frontend/pages/authentication/provider-signup';
import GoogleCallback from '../admin/authentication/GoogleCallback';
import EmailForgetPassword from '../frontend/pages/authentication/emailForgetPassword';
import ActivationSuccess from '../frontend/home/new-home/ActivationSuccess';
import Map from '../frontend/pages/map/Map';
import Map2 from '../frontend/pages/map/Map2';
import Parking from '../frontend/pages/parking/parking';
import EmbeddedCheckoutForm from './EmbeddedCheckoutForm';
import PaymentSuccess from '../frontend/home/new-home/PaymentSuccess';
import PaymentError from '../frontend/home/new-home/PaymentError';
import ProtectedRoute from './ProtectedRoute';
import { useState, useEffect } from 'react';
import Dashboard from '../admin/dashboard/dashboard';

const routes = all_routes;

const publicRoutes = [
  {
    path: '/payment',
    name: 'payment',
    element: <EmbeddedCheckoutForm />,
  },
  {
    path: '/payment-success',
    name: 'payment-success',
    element: <PaymentSuccess />,
  },
  {
    path: routes.paymentError,
    name: 'payment-error',
    element: <PaymentError />,
  },
  {
    path: routes.activationSuccess,
    name: 'activation-success',
    element: <ActivationSuccess />,
  },
  {
    path: '/react/template/auth/google/callback',
    name:'google',
    element: <GoogleCallback/>,
    route: Route

  },
  {
    path: '/map',
    name: 'map',
    element: <Map />,
    route: Route,
  },
  {
    path: '/map2',
    name: 'map2',
    element: <Map2 />,
    route: Route,
  },
  
  {
    path: routes.index,
    name: 'Home',
    element: <NewHome />,
  },
  {
    path: '/',
    name: 'Root',
    element: <Navigate to="/home" />,
  },
  {
    path: '*',
    name: 'NotFound',
    element: <Navigate to="/home" />,
  },

  // customer module's path

  // blog module's path
  // service path
  {
    path: routes.customers,
    name: 'customers',
    element: <Customers />,
    route: Route,
  },
  {
    path: routes.parkings,
    name: 'parking',
    element: <Parking />,
    route: Route,
  },
  {
    path: routes.services,
    name: 'services',
    element: <Services />,
  },
  {
    path: routes.providers,
    name: 'providers',
    element: <ProtectedRoute element={<Providers />} />,
  },

  // Admin Module Path
  {
    path: routes.admin,
    name: 'admin',
    element: <ProtectedRoute element={<Admin />} />,
  },
  {
    path: 'admin',
    name: 'Root',
    element: <ProtectedRoute element={<Dashboard />} />,
  },
];

export const authRoutes = [
  {
    path: '/authentication/reset-password',
    name: 'reset-password',
    element: <ResetPassword />,
  },
  {
    path: routes.passwordRecovery,
    name: 'password-recovery',
    element: <PasswordRecovery />,
  },
  {
    path: '/authentication/login',
    name: 'login',
    element: <Login />,
  },
  {
    path: '/authentication/user-signup',
    name: 'user-signup',
    element: <UserSignup />,
  },
  {
    path: routes.providerSignup,
    name: 'Provider-signup',
    element: <ProtectedRoute element={<ProviderRegister />} />,
  },
  {
    path: '/authentication/success',
    name: 'success',
    element: <Success />,
  },
  {
    path: '/authentication/emailForgetPassword',
    name: 'emailForgetPassword',
    element: <EmailForgetPassword />,
  },
];

export const RoutesWrapper = () => {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        {publicRoutes.map((route, idx) => (
          <Route
            key={idx}
            path={route.path}
            element={<ProtectedRoute element={route.element} />}
          />
        ))}

        {/* Auth Routes */}
        {authRoutes.map((route, idx) => (
          <Route
            key={idx}
            path={route.path}
            element={route.element}
          />
        ))}
      </Routes>
    </>
  );
};

export { publicRoutes };
