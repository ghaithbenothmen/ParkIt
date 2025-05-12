import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import ContactUs from './contact-us/contact-us';
import BookingDetails from '../providers/provider-booking/booking-details';


import Map from './map/Map';
import ParkingDetails from './parking/parking-details/parking-details';



const PagesRoutes = () => {
  const all_pages_routes = [
 

   
    {
      path: '/contact-us',
      name: 'contact-us',
      element: <ContactUs />,
      route: Route,
    },
  
   
    {
      path: '/parking-details/service-details1',
      name: 'parking-details',
      element: <ParkingDetails />,
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
