import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { all_routes } from '../../../../core/data/routes/all_routes';
import ImageWithBasePath from '../../../../core/img/ImageWithBasePath';
import {
  set_header_data,
  set_toggleSidebar_data,
} from '../../../../core/data/redux/action';
import * as Icon from 'react-feather';
import { AppState, Header } from '../../../../core/models/interface';
import { header } from '../../../../core/data/json/header';

type props = {
  type: number;
};

const HomeHeader: React.FC<props> = ({ type }) => {
  const routes = all_routes;
  const location = useLocation();
  // const header_data = useSelector((state: Header) => state.header_data);
  const header_data = header;
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

  const activeRouterPath = (routesArray: Header) => {
    let checkActive = false;
    checkActive;
    header_data.map((mainMenus: { menu: any }) => {
      mainMenus.menu.map((menus: Header) => {
        checkActive = location.pathname == menus.routes ? true : false;
      });
    });
    const all_routes: string[] = [];
    routesArray.map((item: Header) => {
      all_routes.push(item.routes);
    });
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

  const [user, setUser] = useState<{ email: string } | null>(null);

  useEffect(() => {
    // Retrieve user data from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    // Remove user data from localStorage
    localStorage.removeItem('user');
    setUser(null); // Clear the user state
  };
  const renderButtons = (pathType: number) => {
    if (user && user.email) {
      // User is logged in
      return (
        <ul className="nav header-navbar-rht">
          <li className="nav-item dropdown">
          
            <Link
              className="nav-link dropdown-toggle"
              to="#"
              id="userDropdown"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i className="ti ti-user" />  {user.email}
            </Link>
            <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
              <li>
                <Link className="dropdown-item" to="/provider/dashboard">
                  <i className="ti ti-dashboard me-2"></i>Dashboard
                </Link>
              </li>
              <li>
                <Link className="dropdown-item" to="/logout" onClick={handleLogout}>
                  <i className="ti ti-logout me-2"></i>Logout
                </Link>
              </li>
            </ul>
          </li>
        </ul>
      );
    } else {
      // User is not logged in
      return (
        <ul className="nav header-navbar-rht">
          <li className="nav-item pe-1">
            <Link className="nav-link btn btn-light" to="#" data-bs-toggle="modal" data-bs-target="#login-modal">
              <i className="ti ti-lock me-2" />Sign In
            </Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link btn btn-linear-primary" to="#" data-bs-toggle="modal" data-bs-target="#register-modal">
              <i className="ti ti-user-filled me-2" />Join Us
            </Link>
          </li>
        </ul>
      );
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
        className={`header ${routerPath(type).className} ${scrollYPosition > 200 ? 'fixed' : ''
          }`}
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
              <Link to={routes.index} className="navbar-brand logo">
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


                {header_data.map((item: any, index: number) => {
                  return (
                    <>
                      {item.separateRoute == false && (
                        <li
                          key={index + 1}
                          className={`has-submenu ${item.tittle == 'Home' ? 'megamenu' : ''
                            } ${activeRouterPath(item.menu) ? 'active' : ''} `}
                        >
                          <Link
                            to={''}
                            onClick={() => (item.showAsTab = !item.showAsTab)}
                          >
                            {item.tittle}
                            {item.tittle !== 'Home' && <i className="fas fa-chevron-down" />}
                          </Link>
                          <ul
                            className={`submenu ${item.tittle == 'Home' ? 'mega-submenu' : ''
                              } ${item.showAsTab == true ? 'show-sub-menu' : ''}`}
                          >
                            {item.menu.map(
                              (menu: any, menuIndex: number) => {
                                return (
                                  <>
                                    {menu.hasSubRoute == false &&
                                      item.tittle != 'Home' && (
                                        <li className={menu.routes == location.pathname ? 'active' : ''} key={menuIndex + 1}>
                                          <Link to={menu.routes}>
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
                                          onClick={() =>
                                          (menu.showSubRoute =
                                            !menu.showSubRoute)
                                          }
                                          to={menu.routes}
                                        >
                                          {menu.menuValue}
                                        </Link>
                                        <ul
                                          className={`submenu ${menu.showSubRoute === true &&
                                            'show-sub-menu'
                                            }`}
                                        >
                                          {menu.subMenus.map(
                                            (
                                              subMenu: Header,
                                              subMenuIndex: number,
                                            ) => {
                                              return (
                                                <li className={subMenu.routes == location.pathname ? 'active' : ''} key={subMenuIndex + 1}>
                                                  <Link to={subMenu.routes}>
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
                                  </>
                                );
                              },
                            )}
                          </ul>
                        </li>
                      )}
                    </>
                  );
                })}

              </ul>
            </div>
            {renderButtons(type)}
          </nav>
        </div>
      </header>
    </>
  );
};

export default HomeHeader;