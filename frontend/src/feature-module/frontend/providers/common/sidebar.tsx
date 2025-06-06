import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Scrollbars } from 'react-custom-scrollbars-2';
import { useDispatch, useSelector } from 'react-redux';
import { set_mouseoversidebar_data } from '../../../../core/data/redux/action';
import { all_routes } from '../../../../core/data/routes/all_routes';
import { AppState } from '../../../../core/models/interface';
import { LayoutGrid, Car, MessageSquareWarning, Calendar, Settings, LogOut, ChevronRight } from 'lucide-react';

const ProviderSidebar = () => {
  const routes = all_routes;

  const location = useLocation();
  const toggle_data = useSelector((state: AppState) => state.mouseOverSidebar);
  const dispatch = useDispatch();
  const [subdroptoggle, setsubdroptoggle] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };
  const activeRouterPath = (link: string) => {
    return link === location.pathname;
  };
  const activeRouterPath2 = () => {
    return location.pathname.includes('settings');
  };
  const activeRouterPath3 = () => {
    return location.pathname.includes('staff');
  };
  const activeRouterPath4 = () => {
    return location.pathname.includes('customer');
  };

  const toogle = () => {
    dispatch(set_mouseoversidebar_data(true));
  };
  const toogle2 = () => {
    dispatch(set_mouseoversidebar_data(false));
  };

  const logout = () => {
    localStorage.clear();
    window.location.href = '/home';
  };

  return (
    <div onMouseEnter={toogle} onMouseLeave={toogle2} className="sidebar" id="sidebar">
      <Scrollbars style={{ width: '100%', height: '100%' }}>
        <div className="sidebar-inner slimscroll" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div id="sidebar-menu" className="sidebar-menu" style={{ flex: '1 1 auto' }}>
            <ul>
              <li className={activeRouterPath('/providers/dashboard') ? 'active' : ''}>
                <Link to="/providers/dashboard" className="menu-item">
                  <LayoutGrid size={18} /> <span>Dashboard</span>
                </Link>
              </li>
              <li className={activeRouterPath('/providers/cars') ? 'active' : ''}>
                <Link to="/providers/cars" className="menu-item">
                  <Car size={18} /> <span>Cars</span>
                </Link>
              </li>
              <li className={activeRouterPath('/providers/booking') ? 'active' : ''}>
                <Link to="/providers/booking" className="menu-item">
                  <Calendar size={18} /> <span>Bookings</span>
                </Link>
              </li>
              <li className={activeRouterPath('/providers/claims') ? 'active' : ''}>
                <Link to="/providers/claims" className="menu-item">
                  <MessageSquareWarning size={18} /> <span>Claims</span>
                </Link>
              </li>

              {/* Settings Menu */}
              <li className="submenu">
                <Link
                  to="#"
                  onClick={() => setsubdroptoggle(!subdroptoggle)}
                  className={`menu-item ${subdroptoggle ? 'subdrop' : ''} ${activeRouterPath2() ? 'active' : ''}`}
                >
                  <Settings size={18} /> <span>Settings</span> <span className="menu-arrow" />
                </Link>
                <ul style={{ display: subdroptoggle ? 'block' : 'none' }}>
                  <li>
                    <Link to="/providers/settings/provider-profile-settings" className={activeRouterPath(routes.providerProfileSettings) ? 'active' : ''}>
                      <ChevronRight size={16} /> Account
                    </Link>
                  </li>
                  <li>
                    <Link to="/providers/settings/provider-security-settings" className={activeRouterPath('/providers/settings/provider-security-settings') ? 'active' : ''}>
                      <ChevronRight size={16} /> Security
                    </Link>
                  </li>
                </ul>
              </li>
              {/* Logout Button */}

            </ul>
          </div>
          <div style={{ padding: '10px', borderTop: '1px solid #e0e0e0' }}>
            <button onClick={logout} className="btn btn-linear-primary menu-item" style={{ width: '100%' }}>
              <LogOut size={18} /> <span>Logout</span>
            </button>
          </div>
        </div>
      </Scrollbars>
    </div>
  );
};

export default ProviderSidebar;