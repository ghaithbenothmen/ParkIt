import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AboutUs from './about-us/about-us';

import ContactUs from './contact-us/contact-us';

import Pricing from './pricing/pricing';

import Booking1 from './booking/booking-1';
import SessionExpired from './session-expired/session-expired';
import Error404 from './Error page/error404';
import Error500 from './Error page/error500';

import BookingDetails from './booking/booking-details';
import PaymentSetting from '../providers/settings/payment-setting';

import BookingWizard from './booking/booking-wizard';
import Invoice from '../customers/invoice/invoice';
import Map from './map/Map';
import ParkingDetails from './parking/parking-details/parking-details';



const PagesRoutes = () => {
  const all_pages_routes = [
    {
      path: '/about-us',
      name: 'about-us',
      element: <AboutUs />,
      route: Route,
    },

   
    {
      path: '/contact-us',
      name: 'contact-us',
      element: <ContactUs />,
      route: Route,
    },
  
    
    {
      path: '/invoice',
      name: 'invoice',
      element: <Invoice />,
      route: Route,
    },
    {
      path: '/parking-details/service-details1',
      name: 'parking-details',
      element: <ParkingDetails />,
      route: Route,
    },
    {
      path: '/pricing-plan',
      name: 'pricing',
      element: <Pricing />,
      route: Route,
    },
 
    {
      path: '/booking',
      name: 'booking',
      element: <BookingWizard />,
      route: Route,
    },
    {
      path: '/booking/booking-1',
      name: 'booking-1 ',
      element: <Booking1 />,
      route: Route,
    },
    {
      path: '/booking/booking-details',
      name: 'booking-details',
      element: <BookingDetails />,
      route: Route,
    },
    {
      path: '/session-expired',
      name: 'SessionExpired',
      element: <SessionExpired />,
      route: Route,
    },

    {
      path: '/payment-setting',
      name: 'payment-setting',
      element: <PaymentSetting />,
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
        <Route>
          {all_pages_routes.map((route, idx) => (
            <Route path={route.path} element={route.element} key={idx} />
          ))}
        </Route>
      </Routes>
    </>
  );
};

export default PagesRoutes;
