import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import CustomerProfile from './customer-profile/customer-profile';


const CustomersRoutes = () => {
  const all_customers_routes = [
   
    {
      path: '/settings/customer-profile',
      name: 'customer-profile',
      element: <CustomerProfile />,
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
          {all_customers_routes.map((route, idx) => (
            <Route path={route.path} element={route.element} key={idx} />
          ))}
        </Route>
      </Routes>
    </>
  );
};

export default CustomersRoutes;
