import React from 'react';

import { Navigate, Route, Routes } from 'react-router-dom';
import ParkingDetails from './parking-details/parking-details';
import Parking2 from './parking-details/parking-2';
import BookingParking from './booking/booking-parking';


const ParkingRoutes = () => {
  const all_parkings_routes = [
    {
      path: '/parking-details/:id',
      name: 'parking-details',
      element: <ParkingDetails />,
      route: Route,
    },
   
    {
        path: '/booking-parking/:id',
        name: 'booking-parking',
        element: <BookingParking />,
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
          {all_parkings_routes.map((route, idx) => (
            <Route path={route.path} element={route.element} key={idx} />
          ))}
        </Route>
      </Routes>
    </>
  );
};

export default ParkingRoutes;
