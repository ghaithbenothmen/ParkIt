import React, { useEffect } from 'react';
import AdminRoutes from './admin.routes';
import AdminHeader from './common/header';
import AdminSidebar from './common/sidebar';
import { useLocation } from 'react-router-dom';
// import '../../style/admin/css/admin.css'
const Admin = () => {
  const location = useLocation();

  useEffect(() => {
    window.location.pathname.includes("/admin")
      ? import("../../style/admin/css/admin.css")
      : import("../../style/scss/main.scss");
  }, [location.pathname]);

  return (
    <>
      {location.pathname == '/admin/signin' ||
      location.pathname == '/admin/signup' ||
      location.pathname == '/admin/forget-password' ||
      location.pathname == '/admin/wallet-history' ? (
        <></>
      ) : (
        <>
          <AdminHeader />
          <AdminSidebar />
        </>
      )}
      <AdminRoutes />
    </>
  );
};

export default Admin;
