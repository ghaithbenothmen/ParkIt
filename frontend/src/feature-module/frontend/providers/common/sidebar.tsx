import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Scrollbars } from 'react-custom-scrollbars-2';
import { useDispatch, useSelector } from 'react-redux';
import { set_mouseoversidebar_data } from '../../../../core/data/redux/action';
import { all_routes } from '../../../../core/data/routes/all_routes';
import { AppState } from '../../../../core/models/interface';

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
  // useEffect(() => {
  //   activeRouterPath
  // }, [])

  const toogle = () => {
    dispatch(set_mouseoversidebar_data( true));
  };
  const toogle2 = () => {
    dispatch(set_mouseoversidebar_data(false));
  };


const logout = () => {

  localStorage.removeItem('token');


  window.location.href = '/home'; 
};

  return (
    <>
    <div
      onMouseEnter={toogle}
      onMouseLeave={toogle2}
      className="sidebar"
      id="sidebar"
    >
        <Scrollbars style={{ width: "100%", height: "100%" }}>
      <div className="sidebar-inner slimscroll">
          <div id="sidebar-menu" className="sidebar-menu">
            <ul>
              <li
                className={`${
                  activeRouterPath('/providers/dashboard') ? 'active' : ''
                }`}
              >
                <Link to="/providers/dashboard">
                <i className="ti ti-layout-grid"/>{' '}
                  <span>Dashboard</span>
                </Link>
              </li>
              <li
                className={`${
                  activeRouterPath('/providers/provider-service')
                    ? 'active'
                    : ''
                }`}
              >
                <Link to="/providers/provider-service">
                <i className="ti ti-briefcase"/>{' '}
                  <span>My Services</span>
                </Link>
              </li>
              <li
                className={`${
                  activeRouterPath('/providers/provider-booking')
                    ? 'active'
                    : ''
                }`}
              >
                <Link to="/providers/provider-booking">
                <i className="ti ti-calendar-month"/>{' '}
                  <span>Bookings </span>
                </Link>
              </li>
              
              <li className={`submenu `}>
                <Link
                  to="#"
                  onClick={() => setsubdroptoggle(!subdroptoggle)}
                  className={`${subdroptoggle ? 'subdrop' : ''} ${activeRouterPath2() ? 'active' : ''}`}
                >
                  <i className="ti ti-settings" />{' '}
                  <span>Settings</span> <span className="menu-arrow" />
                </Link>
                <ul style={{ display: subdroptoggle ? 'block' : 'none' }}>
                 
                  <li>
                    <Link to="/providers/settings/provider-profile-settings" 
                    className={`${
                      activeRouterPath(routes.providerProfileSettings)
                        ? 'active'
                        : ''
                    }`}
                  >
                    <i className="ti ti-chevrons-right me-2"/> Account 
                    </Link>
                  </li>
                  
                  <li>
                    <Link to="/providers/settings/provider-security-settings"
                    className={`${
                      activeRouterPath(
                        '/providers/settings/provider-security-settings',
                      )
                        ? 'active'
                        : ''
                    }`}
                  >
                    <i className="ti ti-chevrons-right me-2"/> Security 
                    </Link>
                  </li>
                  <li>
                    <Link to="/providers/settings/provider-plan"
                    className={`${
                      activeRouterPath('/providers/settings/provider-plan')
                        ? 'active'
                        : ''
                    }`}
                  >
                    <i className="ti ti-chevrons-right me-2"/> Plan &amp; Billings
                    </Link>
                  </li>
                  <li>
                    <Link to="/providers/settings/payment-setting"
                    className={`${
                      activeRouterPath('/providers/settings/payment-setting')
                        ? 'active'
                        : ''
                    }`}
                  >
                    <i className="ti ti-chevrons-right me-2"/> Payment
                    </Link>
                  </li>
              
                  <li>
                    <Link to="/providers/settings/verification"
                    className={`${
                      activeRouterPath(
                        '/providers/settings/provider-appointment-settings',
                      )
                        ? 'active'
                        : ''
                    }`}
                  >
                    <i className="ti ti-chevrons-right me-2"/> Profile Verification
                    </Link>
                  </li>
                  <li>
                    <Link to="#" data-bs-toggle="modal" data-bs-target="#del-account"><i className="ti ti-chevrons-right me-2"/>Delete Account</Link>
                  </li>
                </ul>
              </li>
              <li>
               
              <button onClick={logout} className="btn btn-linear-primary">
                  <i className="ti ti-logout" /> <span>Logout</span>
                </button>
              </li>
              
            </ul>
            
          </div>
       
      </div>
        </Scrollbars>
    </div>
      {/* Delete Account */}
  <div className="modal fade custom-modal" id="del-account">
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-header d-flex align-items-center justify-content-between border-bottom">
          <h5 className="modal-title">Delete Account</h5>
          <a
            href="#"
            data-bs-dismiss="modal"
            aria-label="Close"
          >
            <i className="ti ti-circle-x-filled fs-20" />
          </a>
        </div>
        <form>
          <div className="modal-body">
            <p className="mb-3">
              Are you sure you want to delete This Account? To delete your
              account, Type your password.
            </p>
            <div className="mb-0">
              <label className="form-label">Password</label>
              <div className="pass-group">
                <input
                  type={passwordVisible?'text':'password'}
                  className="form-control pass-input"
                  placeholder="*************"
                />
                <span onClick={togglePasswordVisibility} className={`toggle-password feather  ${passwordVisible?'icon-eye' : 'icon-eye-off'}`} />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <a
              href="#"
              className="btn btn-light me-2"
              data-bs-dismiss="modal"
            >
              Cancel
            </a>
            <button type="button" data-bs-dismiss="modal" className="btn btn-dark">
              Delete Account
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  {/* /Delete Account */}
  </>
  );
};

export default ProviderSidebar;
