import React from 'react';

import { Navigate, Route, Routes } from 'react-router-dom';

import ServiceDetails1 from './service-details/service-details1';


import ServiceGrid from './service-grid/service-grid';

import CreateCar from './car/create-car';
import ServiceRequest from './service-request/serviceRequest';
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
      path: '/service-details/service-details1',
      name: 'service-details-1',
      element: <ServiceDetails1 />,
      route: Route,
    },

 
    {
      path: '/service-grid',
      name: 'ServiceGrid',
      element: <ServiceGrid />,
      route: Route,
    },
 
    {
      path: '/service-request',
      name: 'service-request',
      element: <ServiceRequest />,
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
