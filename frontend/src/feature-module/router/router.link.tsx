import React from 'react';
import { Navigate, Route } from 'react-router-dom';
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

import { element } from 'prop-types';
import GoogleCallback from '../admin/authentication/GoogleCallback';
import {api} from "../../api"

import EmailForgetPassword from '../frontend/pages/authentication/emailForgetPassword';
import path from 'path';
import ActivationSuccess from '../frontend/home/new-home/ActivationSuccess';
import Map from '../frontend/pages/map/Map';
import Parking from '../frontend/pages/parking/parking';

const routes = all_routes;

const publicRoutes = [
  {
    path: routes.homeOne,
    name: 'home-one',
    element: <HomeOne />,
    route: Route,
  },

  {
    path: routes.activationSuccess,
    name: 'activation-success',
    element: <ActivationSuccess />,
    route: Route,
  },
  {
    path: routes.activationError,
    name: 'activation-error',
    element: <Error404 />,
    route: Route,
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
    path: routes.index,
    name: 'Home',
    element: <NewHome />,
    route: Route,
  },
 
  {
    path: '/',
    name: 'Root',
    element: <Navigate to="/home" />,
    route: Route,
  },
  {
    path: '*',
    name: 'NotFound',
    element: <Navigate to="/home" />,
    route: Route,
  },

  // pages module's path
  {
    path: routes.booking1,
    name: 'booking-1',
    element: <Booking1 />,
    route: Route,
  },
 
  // {
  //   path: routes.booking2,
  //   name: 'booking-2',
  //   element: <Booking2 />,
  //   route: Route,
  // },
  // {
  //   path: routes.bookingDone,
  //   name: 'booking-done',
  //   element: <BookingDone />,
  //   route: Route,
  // },
  // {
  //   path: routes.bookingPayment,
  //   name: 'booking-payment',
  //   element: <BookingPayment />,
  //   route: Route,
  // },



  // provider module's path

  {
    path: routes.paymentSetting,
    name: 'payment-setting',
    element: <PaymentSetting />,
    route: Route,
  },

  //customer module's path

  // blog module's path
  // service path

  {
    path: routes.pages,
    name: 'pages',
    element: <Pages />,
    route: Route,
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
    route: Route,
  },
  {
    path: routes.blog,
    name: 'blog',
    element: <Blog />,
    route: Route,
  },
  {
    path: routes.providers,
    name: 'providers',
    element: <Providers />,
    route: Route,
  },
  
  // Admin Module Path
  {
    path: routes.admin,
    name: 'admin',
    element: <Admin />,
    route: Route,
  },
  {
    path: 'admin',
    name: 'Root',
    element: <Navigate to="/admin/dashboard" />,
    route: Route,
  },
];
export const authRoutes = [
  {
    path: '/authentication/reset-password',
    name: 'reset-password',
    element: <ResetPassword />,
    route: Route,
  },
  {
    path: routes.passwordRecovery,
    name: 'password-recovery',
    element: <PasswordRecovery />,
    route: Route,
  },
  
  {
    path: '/authentication/login',
    name: 'login',
    element: <Login/>,
    route: Route,
  },
  {
    path: '/authentication/login-phone1',
    name: 'login-phone1',
    element: <LoginPhone1/>,
    route: Route,
  },
  {
    path: '/authentication/phone-otp',
    name: 'Phone-Otp',
    element: <PhoneOtp/>,
    route: Route,
  },
  {
    path: '/authentication/email-otp',
    name: 'email-Otp',
    element: <EmailOtp/>,
    route: Route,
  },
  {
    path: '/authentication/choose-signup',
    name: 'choose-signup',
    element: <ChooseSignup/>,
    route: Route,
  },
  {
    path: '/authentication/user-signup',
    name: 'user-signup',
    element: <UserSignup />,
    route: Route,
  },
  {
    path: routes.providerSignup,
    name: 'Provider-signup',
    element: <ProviderRegister />,
    route: Route,
  },
  {
    path: '/authentication/success',
    name: 'success',
    element: <Success />,
    route: Route,
  },
  {
    path: '/authentication/free-trail',
    name: 'free-trial',
    element: <FreeTrail />,
    route: Route,
  },
  {
    path: '/authentication/error-404',
    name: 'Error404',
    element: <Error404 />,
    route: Route,
  },
  {
    path: '/authentication/error-500',
    name: 'Error500',
    element: <Error500 />,
    route: Route,
  },
  {
    path: '/authentication/emailForgetPassword',
    name: 'emailForgetPassword',
    element: <EmailForgetPassword />,
    route: Route,
  },
]
export { publicRoutes };
