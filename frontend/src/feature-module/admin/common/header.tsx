import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ImageWithBasePath from '../../../core/img/ImageWithBasePath';
import * as Icon from 'react-feather';
import { set_is_mobile_sidebar } from '../../../core/data/redux/action';
import { useDispatch } from 'react-redux';
import { all_routes } from '../../../core/data/routes/all_routes';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';

const AdminHeader = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      // Request fullscreen
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }

    // Toggle the state
    setIsFullscreen(!isFullscreen);
  };

  const handleLogout = async () => {
    try {
      // Clear localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      
      // Redirect to home page instead of login
      navigate('/');
      
      // Optional: reload the page to ensure all states are reset
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const dispatch = useDispatch();
  const routes = all_routes
  return (
    <div className="admin-header">
      <div className="header-left">
        <Link to="index" className="logo">
          <ImageWithBasePath
            src="assets/img/logo.svg"
            alt="Logo"
            width={30}
            height={30}
          />
        </Link>
        <Link to="index" className=" logo-small">
          <ImageWithBasePath
            src="assets/admin/img/logo-small.svg"
            alt="Logo"
            width={30}
            height={30}
          />
        </Link>
      </div>
      <Link
        className="mobile_btn"
        id="mobile_btn"
        to="#"
        onClick={() => {
          dispatch(set_is_mobile_sidebar(true));
        }}
      >
        <i className="fas fa-align-left" />
      </Link>
      <div className="header-split">
        <div className="page-headers">
          
        </div>
        <ul className="nav admin-user-menu">
          {/* Notifications */}
          <li className="nav-item">
            <Link to={routes.index} target='_blank' className="viewsite">
              <Icon.Globe className="react-feather-custom me-2"></Icon.Globe>
              View Site
            </Link>
          </li>
          <li className="nav-item dropdown has-arrow dropdown-heads flag-nav">
            <Link
              className="nav-link"
              data-bs-toggle="dropdown"
              to="#"
              role="button"
            >
              <ImageWithBasePath
                src="assets/admin/img/flags/us1.png"
                alt="Flag"
                height={20}
              />
            </Link>
            <div className="dropdown-menu dropdown-menu-right">
              <Link to="#" className="dropdown-item">
                <ImageWithBasePath
                  src="assets/admin/img/flags/us.png"
                  className="me-2"
                  alt="Flag"
                  height={16}
                />{' '}
                English
              </Link>
              <Link to="#" className="dropdown-item">
                <ImageWithBasePath
                  src="assets/admin/img/flags/fr.png"
                  className="me-2"
                  alt="Flag"
                  height={16}
                />{' '}
                French
              </Link>
              <Link to="#" className="dropdown-item">
                <ImageWithBasePath
                  src="assets/admin/img/flags/es.png"
                  className="me-2"
                  alt="Flag"
                  height={16}
                />{' '}
                Spanish
              </Link>
              <Link to="#" className="dropdown-item">
                <ImageWithBasePath
                  src="assets/admin/img/flags/de.png"
                  className="me-2"
                  alt="Flag"
                  height={16}
                />{' '}
                German
              </Link>
            </div>
          </li>
          <li className="nav-item  has-arrow dropdown-heads ">
            <Link to="#" className="toggle-switch header-feather-icons">
              <Icon.Moon className="react-feather-custom"></Icon.Moon>
            </Link>
          </li>
          <li className="nav-item dropdown has-arrow dropdown-heads ">
            <Link
              to="#"
              data-bs-toggle="dropdown"
              className="header-feather-icons"
            >
              <Icon.Bell className="react-feather-custom "></Icon.Bell>
            </Link>
            <div className="dropdown-menu notifications">
              <div className="topnav-dropdown-header">
                <span className="notification-title">Notifications</span>
                <Link to="#" className="clear-noti">
                  {' '}
                  Clear All{' '}
                </Link>
              </div>
              <div className="noti-content">
                <ul className="notification-list">
                  <li className="notification-message">
                    <Link to="notifications">
                      <div className="media d-flex">
                        <span className="avatar avatar-sm flex-shrink-0">
                          <ImageWithBasePath
                            className="avatar-img rounded-circle"
                            alt="user"
                            src="assets/admin/img/provider/provider-01.jpg"
                          />
                        </span>
                        <div className="media-body flex-grow-1">
                          <p className="noti-details">
                            <span className="noti-title">
                              Thomas Herzberg have been subscribed
                            </span>
                          </p>
                          <p className="noti-time">
                            <span className="notification-time">
                              15 Sep 2020 10:20 PM
                            </span>
                          </p>
                        </div>
                      </div>
                    </Link>
                  </li>
                  <li className="notification-message">
                    <Link to="notifications">
                      <div className="media d-flex">
                        <span className="avatar avatar-sm flex-shrink-0">
                          <ImageWithBasePath
                            className="avatar-img rounded-circle"
                            alt="user"
                            src="assets/admin/img/provider/provider-02.jpg"
                          />
                        </span>
                        <div className="media-body flex-grow-1">
                          <p className="noti-details">
                            <span className="noti-title">
                              Matthew Garcia have been subscribed
                            </span>
                          </p>
                          <p className="noti-time">
                            <span className="notification-time">
                              13 Sep 2020 03:56 AM
                            </span>
                          </p>
                        </div>
                      </div>
                    </Link>
                  </li>
                  <li className="notification-message">
                    <Link to="notifications">
                      <div className="media d-flex">
                        <span className="avatar avatar-sm flex-shrink-0">
                          <ImageWithBasePath
                            className="avatar-img rounded-circle"
                            alt="user"
                            src="assets/admin/img/provider/provider-03.jpg"
                          />
                        </span>
                        <div className="media-body flex-grow-1">
                          <p className="noti-details">
                            <span className="noti-title">
                              Yolanda Potter have been subscribed
                            </span>
                          </p>
                          <p className="noti-time">
                            <span className="notification-time">
                              12 Sep 2020 09:25 PM
                            </span>
                          </p>
                        </div>
                      </div>
                    </Link>
                  </li>
                  <li className="notification-message">
                    <Link to="notifications">
                      <div className="media d-flex">
                        <span className="avatar avatar-sm flex-shrink-0">
                          <ImageWithBasePath
                            className="avatar-img rounded-circle"
                            alt="User Image"
                            src="assets/admin/img/provider/provider-04.jpg"
                          />
                        </span>
                        <div className="media-body flex-grow-1">
                          <p className="noti-details">
                            <span className="noti-title">
                              Ricardo Flemings have been subscribed
                            </span>
                          </p>
                          <p className="noti-time">
                            <span className="notification-time">
                              11 Sep 2020 06:36 PM
                            </span>
                          </p>
                        </div>
                      </div>
                    </Link>
                  </li>
                  <li className="notification-message">
                    <Link to="notifications">
                      <div className="media d-flex">
                        <span className="avatar avatar-sm flex-shrink-0">
                          <ImageWithBasePath
                            className="avatar-img rounded-circle"
                            alt="User Image"
                            src="assets/admin/img/provider/provider-05.jpg"
                          />
                        </span>
                        <div className="media-body flex-grow-1">
                          <p className="noti-details">
                            <span className="noti-title">
                              Maritza Wasson have been subscribed
                            </span>
                          </p>
                          <p className="noti-time">
                            <span className="notification-time">
                              10 Sep 2020 08:42 AM
                            </span>
                          </p>
                        </div>
                      </div>
                    </Link>
                  </li>
                  <li className="notification-message">
                    <Link to="notifications">
                      <div className="media d-flex">
                        <span className="avatar avatar-sm flex-shrink-0">
                          <ImageWithBasePath
                            className="avatar-img rounded-circle"
                            alt="User Image"
                            src="assets/admin/img/provider/provider-06.jpg"
                          />
                        </span>
                        <div className="media-body flex-grow-1">
                          <p className="noti-details">
                            <span className="noti-title">
                              Marya Ruiz have been subscribed
                            </span>
                          </p>
                          <p className="noti-time">
                            <span className="notification-time">
                              9 Sep 2020 11:01 AM
                            </span>
                          </p>
                        </div>
                      </div>
                    </Link>
                  </li>
                  <li className="notification-message">
                    <Link to="notifications">
                      <div className="media d-flex">
                        <span className="avatar avatar-sm flex-shrink-0">
                          <ImageWithBasePath
                            className="avatar-img rounded-circle"
                            alt="User Image"
                            src="assets/admin/img/provider/provider-07.jpg"
                          />
                        </span>
                        <div className="media-body flex-grow-1">
                          <p className="noti-details">
                            <span className="noti-title">
                              Richard Hughes have been subscribed
                            </span>
                          </p>
                          <p className="noti-time">
                            <span className="notification-time">
                              8 Sep 2020 06:23 AM
                            </span>
                          </p>
                        </div>
                      </div>
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="topnav-dropdown-footer">
                <Link to="notifications">View all Notifications</Link>
              </div>
            </div>
          </li>
          <li className="nav-item  has-arrow dropdown-heads ">
            <Link
              onClick={toggleFullscreen}
              to="#"
              className="win-maximize header-feather-icons"
            >
              <Icon.Maximize className="react-feather-custom "></Icon.Maximize>
            </Link>
          </li>
          {/* User Menu */}
          <li className="nav-item dropdown">
            <Link
              to="#"
              className="user-link nav-link dropdown-toggle" 
              id="userDropdown"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <span className="user-img">
                <ImageWithBasePath
                  className="rounded-circle"
                  src={user?.image || "assets/admin/img/user.jpg"}
                  width={40}
                  alt="Admin"
                />
                <span className="animate-circle" />
              </span>
              <span className="user-content">
                <span className="user-name">{user ? `${user.firstname} ${user.lastname}` : 'Guest'}</span>
                <span className="user-details">{user?.role || 'User'}</span>
              </span>
            </Link>
            <ul className="dropdown-menu menu-drop-user" aria-labelledby="userDropdown">
              <li className="user-details">
                <Link to="account" className="dropdown-item">
                  <ImageWithBasePath
                    src={user?.image || "assets/admin/img/user.jpg"}
                    alt="img"
                    className="profilesidebar"
                  />
                  <div className="profile-content">
                    <span>{user ? `${user.firstname} ${user.lastname}` : 'Guest'}</span>
                    <span>{user?.email || 'guest@example.com'}</span>
                  </div>
                </Link>
              </li>
              <li><Link to="account-settings" className="dropdown-item">Profile</Link></li>
              <li><Link to="localization" className="dropdown-item">Settings</Link></li>
              <li>
                <Link 
                  to="#" 
                  className="dropdown-item text-danger"
                  onClick={handleLogout}
                >
                  Log Out
                </Link>
              </li>
            </ul>
          </li>
          {/* /User Menu */}
        </ul>
      </div>
    </div>
  );
};

export default AdminHeader;
