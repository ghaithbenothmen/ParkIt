import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ImageWithBasePath from '../../../core/img/ImageWithBasePath';
import * as Icon from 'react-feather';
import { set_is_mobile_sidebar } from '../../../core/data/redux/action';
import { useDispatch } from 'react-redux';
import { all_routes } from '../../../core/data/routes/all_routes';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import io from 'socket.io-client';

interface NotificationType {
  _id: string;
  userId: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  message?: string;
  type?: string;
  reservationId?: string;
  read?: boolean;
}

const AdminHeader = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('today');
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

  const fetchNotifications = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/notifications/all');
      const data = await response.json();
      const sortedNotifications = Array.isArray(data) ? 
        data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) : 
        [];
      setNotifications(sortedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    }
  };

  const filterNotificationsByPeriod = (notifications: NotificationType[], period: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(thisWeekStart.getDate() - 7);

    return notifications.filter(notification => {
      const notifDate = new Date(notification.createdAt);
      switch (period) {
        case 'today':
          return notifDate >= today;
        case 'thisWeek':
          return notifDate >= thisWeekStart;
        case 'lastWeek':
          return notifDate >= lastWeekStart && notifDate < thisWeekStart;
        default:
          return true;
      }
    });
  };

  const [filteredNotifications, setFilteredNotifications] = useState<NotificationType[]>([]);

  useEffect(() => {
    setFilteredNotifications(filterNotificationsByPeriod(notifications, selectedPeriod));
  }, [notifications, selectedPeriod]);

  const handlePeriodChange = (e: React.MouseEvent, period: string) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedPeriod(period);
  };

  useEffect(() => {
    fetchNotifications();

    const socket = io('http://localhost:4000', {
      withCredentials: true,
      transports: ['websocket']
    });

    socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });

    socket.on('newNotification', (newNotification: NotificationType) => {
      setNotifications(prev => [newNotification, ...prev]);
      
      if (Notification.permission === "granted") {
        new Notification("New Reservation", {
          body: newNotification.message || "A new reservation has been created",
          icon: "/assets/img/full-parkit.png"
        });
      }
    });

    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    return () => {
      socket.disconnect();
    };
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeDifference = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  const handleMarkAllAsRead = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const response = await fetch('http://localhost:4000/api/notifications/mark-all-read', {
        method: 'POST',
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        setFilteredNotifications(filterNotificationsByPeriod(data.notifications, selectedPeriod));
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const getUnreadCount = (notifications: NotificationType[]) => {
    return notifications.filter(notif => !notif.read).length;
  };

  const dispatch = useDispatch();
  const routes = all_routes

  // Ajouter ce style dans le composant
  const notificationStyles = {
    read: {
      backgroundColor: '#f5f5f5',
      color: '#666',
    },
    unread: {
      backgroundColor: 'white',
      color: 'black',
    }
  };

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
          <li className="nav-item dropdown has-arrow dropdown-heads ">
            <Link
              to="#"
              data-bs-toggle="dropdown"
              data-bs-auto-close="false"
              className="header-feather-icons"
            >
              <Icon.Bell className="react-feather-custom" />
              {getUnreadCount(notifications) > 0 && (
                <span className="notification-badge">
                  {getUnreadCount(notifications)}
                </span>
              )}
            </Link>
            <div className="dropdown-menu notifications">
              <div className="d-flex dropdown-body align-items-center justify-content-between border-bottom p-0 pb-3 mb-3">
                <h6 className="notification-title">
                  Notifications <span className="fs-16 text-gray"> ({getUnreadCount(filteredNotifications)})</span>
                </h6>
                <div className="d-flex align-items-center">
                  <Link 
                    to="#" 
                    className="text-primary fs-15 me-3 lh-1"
                    onClick={handleMarkAllAsRead}
                  >
                    Mark all as read
                  </Link>
                  <div className="dropdown">
                    <Link
                      to="#"
                      className="bg-white dropdown-toggle"
                      data-bs-toggle="dropdown"
                      data-bs-auto-close="outside"
                    >
                      <i className="ti ti-calendar-due me-1" />
                      {selectedPeriod === 'today' ? 'Today' : 
                      selectedPeriod === 'thisWeek' ? 'This Week' : 
                      selectedPeriod === 'lastWeek' ? 'Last Week' : 'Today'}
                    </Link>
                    <ul className="dropdown-menu mt-2 p-3">
                      <li>
                        <Link
                          to="#"
                          className={`dropdown-item rounded-1 ${selectedPeriod === 'today' ? 'active' : ''}`}
                          onClick={(e) => handlePeriodChange(e, 'today')}
                        >
                          Today
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="#"
                          className={`dropdown-item rounded-1 ${selectedPeriod === 'thisWeek' ? 'active' : ''}`}
                          onClick={(e) => handlePeriodChange(e, 'thisWeek')}
                        >
                          This Week
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="#"
                          className={`dropdown-item rounded-1 ${selectedPeriod === 'lastWeek' ? 'active' : ''}`}
                          onClick={(e) => handlePeriodChange(e, 'lastWeek')}
                        >
                          Last Week
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="noti-content" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <div className="d-flex flex-column">
                  {Array.isArray(filteredNotifications) && filteredNotifications.map((notification: NotificationType) => (
                    <div 
                      key={notification._id} 
                      className={`border-bottom mb-3 pb-3 ${notification.read ? 'opacity-50' : ''}`}
                      style={{ 
                        backgroundColor: notification.read ? '#f8f9fa' : 'white',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <Link to="#">
                        <div className="d-flex">
                          <span className="avatar avatar-lg me-2 flex-shrink-0">
                            <ImageWithBasePath
                              src="assets/img/user.jpg"
                              alt="Profile"
                              className="rounded-circle"
                            />
                          </span>
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center">
                              <p className={`mb-1 w-100 ${notification.read ? 'text-muted' : ''}`}>
                                <strong>{notification.userName || 'Unknown user'}</strong> created a reservation from{' '}
                                <span className="text-primary">{formatDate(notification.startDate)}</span>
                                {' to '}
                                <span className="text-primary">{formatDate(notification.endDate)}</span>
                              </p>
                              <span className="d-flex justify-content-end">
                                <i className={`ti ti-point-filled ${notification.read ? 'text-muted' : 'text-primary'}`} />
                              </span>
                            </div>
                            <span className={notification.read ? 'text-muted' : ''}>
                              {getTimeDifference(notification.createdAt)}
                            </span>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
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
                  src="assets/img/user.jpg"
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
                    src="assets/img/user.jpg"
                    alt="img"
                    className="profilesidebar"
                  />
                  <div className="profile-content">
                    <span>{user ? `${user.firstname} ${user.lastname}` : 'Guest'}</span>
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
