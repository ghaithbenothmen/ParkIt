import React from 'react';
import HomeHeader from '../../home/header/home-header';
import NewFooter from '../../home/footer/newFooter';
import ParkingRoutes from './parking.routes';

const Parking = () => {
  return (
    <>
      {/* <HomeHeader type={1} /> */}
      <HomeHeader type={2}/>
      <ParkingRoutes />
      <NewFooter />
    </>
  );
};

export default Parking;
