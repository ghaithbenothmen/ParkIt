import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { all_routes } from '../../../../core/data/routes/all_routes';
import ImageWithBasePath from '../../../../core/img/ImageWithBasePath';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as bootstrap from 'bootstrap';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import {
  set_header_data,
  set_toggleSidebar_data,
} from '../../../../core/data/redux/action';
import * as Icon from 'react-feather';
import { AppState, Header } from '../../../../core/models/interface';
import { header } from '../../../../core/data/json/header';
import AuthModals from '../new-home/authModals';

type props = {
  type: number;
};

const HomeHeader: React.FC<props> = ({ type }) => {
  const routes = all_routes;
  const location = useLocation();
  const toggle_data = useSelector((state: AppState) => state.toggleSidebar);
  const [scrollYPosition, setScrollYPosition] = useState<number>(0);
  const [close, setClose] = useState<boolean>(true);
  const [imageUrl, setImageUrl] = useState({
    logo: '',
    logoSmall: '',
    logoSvg: '',
  });
  const dispatch = useDispatch();
  const toogle = () => {
    dispatch(set_toggleSidebar_data(toggle_data ? false : true));
  };

  const activeRouterPath = (routesArray: any[] | undefined) => {
    if (!Array.isArray(routesArray)) return false;
    
    const all_routes: string[] = routesArray
      .filter(item => item && item.routes)
      .map(item => item.routes);
    
    return all_routes.includes(location.pathname);
  };

  // useEffect(() => {
  // }, [header_data]);

  const setHeaderData = () => {
    dispatch(set_header_data([]));
  };

  const handleScroll = () => {
    setScrollYPosition(scrollY);
  };
  useEffect(() => {
    // Select all 'submenu' elements
    const submenus = document.querySelectorAll('.has-submenu')
    // Loop through each 'submenu'
    submenus.forEach((submenu) => {
      // Find all 'li' elements within the 'submenu'
      const listItems = submenu.querySelectorAll('li')
      const listItems2 = submenu.querySelectorAll('.single-demo')
      submenu.classList.remove('active')
      // Check if any 'li' has the 'active' class
      listItems.forEach((item) => {
        if (item.classList.contains('active')) {
          // Add 'active' class to the 'submenu'
          submenu.classList.add('active')
          return
        }
      })
      listItems2.forEach((item) => {
        if (item.classList.contains('active')) {
          // Add 'active' class to the 'submenu'
          submenu.classList.add('active')
          return
        }
      })
    })

  }, [location.pathname])
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  const routerPath = (pathType: number) => {
    switch (pathType) {
      case 1:
        return { path: routes.homeOne, className: 'header-new' };
        break;
      case 2:
        return { path: routes.homeOne, className: 'header-one' };
        break;

      default:
        return { path: routes.homeOne, className: 'header-one' };
        break;
    }
  };

  const [user, setUser] = useState<any>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error("No token found in localStorage");
          return;
        }

        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          console.error("Failed to fetch user data");
          return;
        }

        const userData = await response.json();
        setUser(userData);

        // Ensure the image URL is correctly formatted
        if (userData.image) {
          setImagePreview(userData.image.startsWith("//") ? `https:${userData.image}` : userData.image);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUser();
  }, []);

  // Determine which header data to use based on user role
  const header_data = header;

  const handleLogout = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
  
      if (response.ok) {
        // Supprimer toutes les données liées à l'utilisateur du localStorage
        localStorage.clear(); // Cela supprimera tout le localStorage, y compris le rôle
        setUser(null);
        window.location.href = '/';
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };
  
  const renderButtons = (pathType: number) => {
    if (user && user.email) {
      return (
        <ul className="nav header-navbar-rht">
          <li className="nav-item dropdown">
            <Link
              className="nav-link dropdown-toggle d-flex align-items-center"
              to="#"
              id="userDropdown"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
               <span className="user-email me-2">{user.email}</span> 
              <span className="user-img">
                <img
                  src={imagePreview || 'assets/img/user.jpg'} // Use user image or default
                  alt="User"
                  className="rounded-circle"
                  width={40}
                  height={40}
                  onError={(e) => (e.currentTarget.src = 'assets/img/user.jpg')} // Fallback to default image
                />
              </span>
            </Link>
            <ul className="dropdown-menu dropdown-menu-end p-3 shadow" style={{ minWidth: '250px' }}>
              <li className="text-center mb-3">
                <img
                  src={imagePreview || 'assets/img/user.jpg'} // Use user image or default
                  alt="User"
                  className="rounded-circle mb-2"
                  style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                  onError={(e) => (e.currentTarget.src = 'assets/img/user.jpg')} // Fallback to default image
                />
                <h6 className="mb-0">{user.firstname || 'Guest'} {user.lastname || ''}</h6>
                <small className="text-muted">{user.role || 'User'}</small>
              </li>
             <li>
                <Link 
                  className="dropdown-item" 
                  to={user.role === 'admin' ? routes.dashboard : '/providers/dashboard'}
                >
                  <i className="ti ti-dashboard me-2"></i> Dashboard
                </Link>
              </li>
              
              <li>
                <Link className="dropdown-item text-danger" to="#" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt me-2"></i> Log Out
                </Link>
              </li>
            </ul>
          </li>
        </ul>
      );
    } else {
      // User is not logged in - modified version
      return (
        <ul className="nav header-navbar-rht">
          <li className="nav-item pe-1">
            <Link 
              className="nav-link btn btn-light" 
              to="#"
              onClick={(e) => {
                e.preventDefault();
                const loginModal = document.getElementById('login-modal');
                if (loginModal) {
                  const bsModal = new bootstrap.Modal(loginModal);
                  bsModal.show();
                }
              }}
            >
              <i className="ti ti-lock me-2" />Sign In
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              className="nav-link btn btn-linear-primary"
              to="#"
              onClick={(e) => {
                e.preventDefault();
                const registerModal = document.getElementById('register-modal');
                if (registerModal) {
                  const bsModal = new bootstrap.Modal(registerModal);
                  bsModal.show();
                }
              }}
            >
              <i className="ti ti-user-filled me-2" />Join Us
            </Link>
          </li>
        </ul>
      );
    }
  };

  const [showAuthAlert, setShowAuthAlert] = useState(false);

  const handleUnauthorizedClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      setShowAuthAlert(true);
      setTimeout(() => setShowAuthAlert(false), 3000); // Hide after 3 seconds
    }
  };

  const handleSubMenuClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      setShowAuthAlert(true);
      setTimeout(() => setShowAuthAlert(false), 3000);
    }
  };

  const isPublicPage = (menuTitle: string) => {
    return menuTitle === 'Home' || menuTitle === 'Pages';
  };

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else if (window.location.pathname !== '/') {
      window.location.href = '/#' + sectionId;
    }
  };

  useEffect(() => {
    type == 1 || type == 4 || type == 10
      ? setImageUrl({
          logo: 'assets/img/full-parkit.png',
          logoSmall: 'assets/img/full-parkit.png',
          logoSvg: 'assets/img/full-parkit.png',
        })
      : setImageUrl({
          logo: 'assets/img/full-parkit.png',
          logoSmall: 'assets/img/full-parkit.png',
          logoSvg: 'assets/img/full-parkit.png',
        });
  }, [type]);

  return (
    <>
      {/* Add alert popup */}
      {showAuthAlert && (
        <div 
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            backgroundColor: '#f8d7da',
            color: '#721c24',
            padding: '1rem',
            borderRadius: '4px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
        >
          Please login to access this feature!
        </div>
      )}
      <div className={` top-bar ${type != 3 || !close ? 'd-none' : ''}`}>
        <h6>50% OFF on Christmas</h6>
        <ul>
          <li>2</li>
          <li>15</li>
          <li>33</li>
          <li>32</li>
        </ul>
        <Link to="#" className="top-close" onClick={() => setClose(false)}>
          <Icon.X />
        </Link>
      </div>
      <header
        className={`header ${routerPath(type).className} ${scrollYPosition > 200 ? 'fixed' : ''}`}
      >
        <div className={` ${type == 4 || type == 1 ? 'container-fluid' : 'container'}`}>
          <nav className="navbar navbar-expand-lg header-nav">
            <div className="navbar-header">
              <Link onClick={toogle} id="mobile_btn" to="#">
                <span className="bar-icon">
                  <span />
                  <span />
                  <span />
                </span>
              </Link>
              <Link to={routes.index} className="navbar-brand logo" onClick={(e) => {
                e.preventDefault();
                window.location.href = routes.index;
              }}>
                <ImageWithBasePath
                  src="assets/img/full-parkit.png"
                  className="img-fluid"
                  alt="Logo"
                />
              </Link>
              <Link
                to={routes.index}
                className="navbar-brand logo-small"
              >
                <ImageWithBasePath
                  src="assets/img/full-parkit.png"
                  className="img-fluid"
                  alt="Logo"
                />
              </Link>
            </div>
            <div className="main-menu-wrapper">
              <div className="menu-header">
                <Link to={routerPath(type).path} className="menu-logo">
                  <ImageWithBasePath
                    src="assets/img/full-parkit.png"
                    className="img-fluid"
                    alt="Logo"
                  />
                </Link>
                <Link
                  onClick={toogle}
                  id="menu_close"
                  className="menu-close"
                  to="#"
                >
                  {' '}
                  <i className="fas fa-times" />
                </Link>
              </div>
              <ul className="main-nav align-items-lg-center">
                {Array.isArray(header_data) && header_data.map((item: any, index: number) => {
                  if (!item) return null;

                  // Handle both direct route items and items with menus
                  if (item.routes || item.tittle === 'Home') {
                    return (
                      <li key={`route-${index}`}>
                        <Link 
                          to={item.routes || '/'} 
                          onClick={(e) => {
                            if (item.routes === '/#parkings') {
                              scrollToSection(e, 'parkings');
                            } else if (item.routes === '/#reviews') {
                              scrollToSection(e, 'reviews');
                            } else if (item.routes === '/#about') {
                              scrollToSection(e, 'about');
                            } else if (item.routes === '/#works') {
                              scrollToSection(e, 'works');
                            } else if (!isPublicPage(item.tittle)) {
                              handleUnauthorizedClick(e);
                            }
                          }}
                        >
                          {item.tittle}
                        </Link>
                      </li>
                    );
                  }

                  if (!item.separateRoute && item.menu) {
                    return (
                      <li
                        key={`menu-${index}`}
                        className={`has-submenu ${activeRouterPath(item.menu) ? 'active' : ''}`}
                      >
                        <Link 
                          to="#" 
                          onClick={(e) => {
                            e.preventDefault();
                            if (!user && !isPublicPage(item.tittle)) {
                              handleUnauthorizedClick(e);
                              return;
                            }
                            const newHeaderData = [...header_data];
                            newHeaderData[index] = {
                              ...newHeaderData[index],
                              showAsTab: !item.showAsTab
                            };
                            dispatch(set_header_data(newHeaderData));
                          }}
                        >
                          {item.tittle}
                          <i className="fas fa-chevron-down" />
                        </Link>
                        {item.menu && Array.isArray(item.menu) && (
                          <ul className={`submenu ${item.showAsTab ? 'show-sub-menu' : ''}`}>
                            {item.menu.map((menu: any, menuIndex: number) => {
                              if (!menu) return null;
                              return (
                                <React.Fragment key={`submenu-${menuIndex}`}>
                                  {menu.hasSubRoute == false &&
                                    item.tittle != 'Home' && (
                                      <li className={menu.routes == location.pathname ? 'active' : ''} key={menuIndex + 1}>
                                        <Link 
                                          to={menu.routes} 
                                          onClick={(e) => !isPublicPage(item.tittle) ? handleSubMenuClick(e) : undefined}
                                        >
                                          {menu.menuValue}
                                        </Link>
                                      </li>
                                    )}
                                  {menu.hasSubRoute == true && (
                                    <li
                                      key={menuIndex + 1}
                                      className="has-submenu"
                                    >
                                      <Link
                                        onClick={(e) => {
                                          e.preventDefault();
                                          if (!user && !isPublicPage(item.tittle)) {
                                            handleSubMenuClick(e);
                                            return;
                                          }
                                          menu.showSubRoute = !menu.showSubRoute;
                                        }}
                                        to={menu.routes}
                                      >
                                        {menu.menuValue}
                                      </Link>
                                      <ul
                                        className={`submenu ${menu.showSubRoute === true ? 'show-sub-menu' : ''}`}
                                      >
                                        {menu.subMenus.map(
                                          (
                                            subMenu: Header,
                                            subMenuIndex: number,
                                          ) => {
                                            return (
                                              <li className={subMenu.routes == location.pathname ? 'active' : ''} key={subMenuIndex + 1}>
                                                <Link to={subMenu.routes} onClick={handleSubMenuClick}>
                                                  {subMenu.menuValue}
                                                </Link>
                                              </li>
                                            );
                                          },
                                        )}
                                      </ul>
                                    </li>
                                  )}
                                  {menu.menuValue == 'Electrical Home' && (
                                    <li>
                                      <div className="megamenu-wrapper">
                                        <div className="row">
                                          {item.menu.map(
                                            (
                                              menu: Header,
                                              megaIndex: number,
                                            ) => {
                                              return (
                                                <div
                                                  className="col-lg-2"
                                                  key={megaIndex + 1}
                                                >
                                                  <div
                                                    className={`single-demo ${menu.routes ==
                                                      location.pathname
                                                        ? 'active'
                                                        : ''
                                                      }`}
                                                  >
                                                    <div className="demo-img">
                                                      <Link to={menu.routes}>
                                                        <ImageWithBasePath
                                                          src={menu.img}
                                                          className="img-fluid"
                                                          alt="img"
                                                        />
                                                      </Link>
                                                    </div>
                                                    <div className="demo-info">
                                                      <Link to={menu.routes}>
                                                        {menu.menuValue}
                                                      </Link>
                                                    </div>
                                                  </div>
                                                </div>
                                              );
                                            },
                                          )}
                                        </div>
                                      </div>
                                    </li>
                                  )}
                                </React.Fragment>
                              );
                            })}
                          </ul>
                        )}
                      </li>
                    );
                  }
                  return null;
                })}

              </ul>
            </div>
            {renderButtons(type)}
          </nav>
        </div>
      </header>
      <AuthModals />
    </>
  );
};

export default HomeHeader;