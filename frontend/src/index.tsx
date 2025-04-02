/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import '../node_modules/bootstrap/dist/js/bootstrap.bundle.js';
import { Provider } from 'react-redux';
import store from './core/data/redux/store';
/* import "../src/style/icon/tabler-icons/webfont/tabler-icons.css"; */
/* import "../src/style/icon/feather/css/iconfont.css"; */
import 'aos/dist/aos.css';
import { base_path } from './environment';
import AllRoutes from './feature-module/router/router';
import { GoogleOAuthProvider } from '@react-oauth/google';

import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY!);

const rootElement = document.getElementById('root');
// const location = window.location.pathname;

// useEffect(() => {
//   window.location.pathname.includes("/admin")
//   ? import("./style/admin/css/admin.css")
//   : import("./style/scss/main.scss");
// }, [location])


  

if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <GoogleOAuthProvider clientId={"198801170360-1m8sop4r23hle1a8de8v09fi8c053o56.apps.googleusercontent.com" }>
      <Provider store={store}>
        <BrowserRouter >
          <AllRoutes />
        </BrowserRouter>
      </Provider>
      </GoogleOAuthProvider>
    </React.StrictMode>,
  );
} else {
  console.error("Element with id 'root' not found.");
}
