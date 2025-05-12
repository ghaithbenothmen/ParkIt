import React from 'react';

import { Navigate, Route, Routes } from 'react-router-dom';


import CreateCar from './car/create-car';
import ProvidersCars from '../providers/cars/provider-cars'
import CreateClaim from './claim/create-claim';

const ServicesRoutes = () => {
  const all_services_routes = [
    {
      path: '/create-car',
      name: 'create-car',
      element: <CreateCar />,
      route: Route,
    },
    {
      path: '/create-claim',
      name: 'create-claim',
      element: <CreateClaim />,
      route: Route,
    },

    {
      path: '/provider-service',
      name: 'provider-service',
      element: <ProvidersCars />,
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
          {all_services_routes.map((route, idx) => (
            <Route path={route.path} element={route.element} key={idx} />
          ))}
        </Route>
      </Routes>
    </>
  );
};

export default ServicesRoutes;
