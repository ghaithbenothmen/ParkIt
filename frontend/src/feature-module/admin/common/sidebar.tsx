import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Scrollbars } from 'react-custom-scrollbars-2';
import * as Icon from 'react-feather';
import { useDispatch, useSelector } from 'react-redux';
import {
  set_mouseoversidebar_data,
  set_toggleSidebar_data_2,
} from '../../../core/data/redux/action';
import { all_routes } from '../../../core/data/routes/all_routes';
import ImageWithBasePath from '../../../core/img/ImageWithBasePath';
import { adminSidebar } from '../../../core/data/json/admin_sidebar_data';
import { AppState, SideBarData } from '../../../core/models/interface';

const AdminSidebar = () => {
  const routes = all_routes;
  const toggle_data = useSelector((state: AppState) => state.mouseOverSidebar);
  const toggle_data2 = useSelector((state: AppState) => state.toggleSidebar2);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarData, setSidebarData] = useState(adminSidebar);

  const toggle = () => {
    dispatch(set_toggleSidebar_data_2(toggle_data2 ? false : true));
  };

  const toogle = () => {
    dispatch(set_mouseoversidebar_data(toggle_data ? false : true));
  };

  const activeRouterPath = (route: string) => {
    return location.pathname === route;
  };

  const activeRouterMenu = (menu: string) => {
    return location.pathname.includes(menu.toLowerCase());
  };

  const expandSubMenus = (menu: SideBarData) => {
    sessionStorage.setItem('menuValue', menu.menuValue);
    const updatedAdminSidebar = sidebarData.map((section) => {
      const updatedSection = { ...section };
      updatedSection.menu = section.menu.map((menuItem) =>
        menu.menuValue !== menuItem.menuValue
          ? { ...menuItem, showSubRoute: false }
          : { ...menuItem, showSubRoute: !menu.showSubRoute }
      );
      return updatedSection;
    });
    setSidebarData(updatedAdminSidebar);
  };

  const handleLogout = () => {
    // Clear authentication data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');

    // Reset sidebar state in Redux
    dispatch(set_mouseoversidebar_data(false));
    dispatch(set_toggleSidebar_data_2(false));

    // Navigate to login page
    navigate(routes.login || '/login');
  };

  return (
    <div
      className="admin-sidebar"
      id="sidebar"
      onMouseEnter={toogle}
      onMouseLeave={toogle}
      style={{ height: '100vh', overflow: 'hidden' }}
    >
      <div className="admin-sidebar-header">
        <div className="admin-sidebar-logo">
          <Link to={routes.index}>
            <ImageWithBasePath
              src="assets/admin/img/full-parkit-dark.png"
              className="img-fluid logo"
              alt="Logo"
            />
          </Link>
          <Link to={routes.index}>
            <ImageWithBasePath
              src="assets/admin/img/logo-small.svg"
              className="img-fluid logo-small"
              alt="Logo"
            />
          </Link>
        </div>
        <div className="admin-siderbar-toggle">
          <Link to="#" onClick={toggle}>
            <label className="switch" id="toggle_btn">
              <input type="checkbox" />
              <span className="admin-slider round" />
            </label>
          </Link>
        </div>
      </div>
      <div className="admin-sidebar-inner slimscroll" style={{ height: 'calc(100vh - 60px)', overflow: 'hidden' }}>
        <Scrollbars
          autoHeight
          autoHeightMin="100%"
          autoHeightMax="calc(100vh - 60px)"
          autoHide
          style={{ width: '100%', height: '100%' }}
        >
          <div id="sidebar-menu" className="admin-sidebar-menu">
            <ul>
              {sidebarData.map((mainTittle: any, index: number) => (
                <React.Fragment key={index}>
                  <li className="menu-title">
                    <h6>{mainTittle.tittle}</h6>
                  </li>
                  {mainTittle.menu.map((menu: SideBarData, menuIndex: number) => (
                    <React.Fragment key={menuIndex}>
                      {menu.hasSubRoute === false ? (
                        <li>
                          <Link
                            to={menu.route}
                            onClick={menu.onClick ? handleLogout : undefined}
                            className={activeRouterPath(menu.route) ? 'active' : ''}
                          >
                            {menu.icon}
                            <span>{menu.menuValue}</span>
                          </Link>
                        </li>
                      ) : (
                        <li className="submenu">
                          <Link
                            to="#"
                            onClick={() => expandSubMenus(menu)}
                            className={`${menu.showSubRoute ? 'subdrop' : ''} ${
                              activeRouterMenu(menu.menuValue) ? 'active' : ''
                            }`}
                          >
                            {menu.icon}
                            <span>{menu.menuValue}</span>
                            <span className="menu-arrow">
                              {menu.showSubRoute ? (
                                <Icon.ChevronDown className="react-feather-custom" />
                              ) : (
                                <Icon.ChevronRight className="react-feather-custom" />
                              )}
                            </span>
                          </Link>
                          <ul style={{ display: menu.showSubRoute ? 'block' : 'none' }}>
                            {menu.subMenus.map((subMenu: any, subMenuIndex: number) => (
                              <li key={subMenuIndex}>
                                <Link
                                  to={subMenu.route}
                                  className={activeRouterPath(subMenu.route) ? 'active' : ''}
                                >
                                  {subMenu.menuValue}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </li>
                      )}
                    </React.Fragment>
                  ))}
                </React.Fragment>
              ))}
            </ul>
          </div>
        </Scrollbars>
      </div>
    </div>
  );
};

export default AdminSidebar;