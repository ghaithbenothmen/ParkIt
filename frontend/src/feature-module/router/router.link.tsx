import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { all_routes } from '../../core/data/routes/all_routes';
import HomeOne from '../frontend/home/home-one/home-one';
import Pages from '../frontend/pages/pages';
import Customers from '../frontend/customers/customers';
import Services from '../frontend/services/services';
import Blog from '../frontend/blog/blog';
import Providers from '../frontend/providers/providers';
import LoginPhone1 from '../frontend/pages/authentication/login-phone1';
import PhoneOtp from '../frontend/pages/authentication/phone-otp';
import Admin from '../admin/admin';
import Booking1 from '../frontend/pages/booking/booking-1';
import ChooseSignup from '../frontend/pages/authentication/choose-signup';
import Error404 from '../frontend/pages/Error page/error404';
import UserSignup from '../frontend/pages/authentication/user-signup';
import EmailOtp from '../frontend/pages/authentication/email-otp';
import Login from '../frontend/pages/authentication/login';
import PaymentSetting from '../frontend/providers/settings/payment-setting';
import ResetPassword from '../frontend/pages/authentication/reset-password';
import PasswordRecovery from '../frontend/pages/authentication/password-recovery';
import Success from '../frontend/pages/authentication/success';
import FreeTrail from '../frontend/pages/authentication/free-trail';
import NewHome from '../frontend/home/new-home';
import ProviderRegister from '../frontend/pages/authentication/provider-signup';
import Error500 from '../frontend/pages/Error page/error500';
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
    path: '/home-one',
    name: 'home-one',
    element: <HomeOne />,
  },
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
    path: routes.activationError,
    name: 'activation-error',
    element: <Error404 />,
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

  // pages module's path
  {
    path: routes.booking1,
    name: 'booking-1',
    element: <Booking1 />,
  },

  // provider module's path
  {
    path: routes.paymentSetting,
    name: 'payment-setting',
    element: <PaymentSetting />,
  },

  // customer module's path

  // blog module's path
  // service path
  {
    path: routes.pages,
    name: 'pages',
    element: <Pages />,
  },
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
    path: routes.blog,
    name: 'blog',
    element: <Blog />,
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
    path: '/authentication/login-phone1',
    name: 'login-phone1',
    element: <LoginPhone1 />,
  },
  {
    path: '/authentication/phone-otp',
    name: 'Phone-Otp',
    element: <PhoneOtp />,
  },
  {
    path: '/authentication/email-otp',
    name: 'email-Otp',
    element: <EmailOtp />,
  },
  {
    path: '/authentication/choose-signup',
    name: 'choose-signup',
    element: <ChooseSignup />,
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
    path: '/authentication/free-trail',
    name: 'free-trial',
    element: <FreeTrail />,
  },
  {
    path: '/authentication/error-404',
    name: 'Error404',
    element: <Error404 />,
  },
  {
    path: '/authentication/error-500',
    name: 'Error500',
    element: <Error500 />,
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
