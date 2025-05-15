import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  set_dark_mode,
  set_is_mobile_sidebar,
  set_mouseoversidebar_data,
  set_toggleSidebar_data_2,
} from '../../../../core/data/redux/action';
import { useDispatch, useSelector } from 'react-redux';
import { all_routes } from '../../../../core/data/routes/all_routes';
import ImageWithBasePath from '../../../../core/img/ImageWithBasePath';
import { AppState } from '../../../../core/models/interface';
import io from 'socket.io-client';
import AiAssistantProvider from '../../common/voice-assistant/AiAssistantProvider';
import { AiAssistantButton } from '../../common/voice-assistant/AiAssistantButton';
import { Toast } from 'primereact/toast';

interface NotificationType {
  _id: string;
  userId: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  message?: string;
  type?: string;
  reservationId?: string;
  read?: boolean;  // Ajout de la propriété read
}

const ProviderHeader = () => {
  const routes = all_routes;
  const toggle_data = useSelector((state: AppState) => state.toggleSidebar2);
  const dispatch = useDispatch();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const toastRef = useRef<Toast>(null);
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
  const toogle = () => {
    dispatch(set_toggleSidebar_data_2(toggle_data ? false : true));
  };
  const mobileSidebar = useSelector((state: AppState) => state.mobileSidebar);

  const handleClick = () => {
    dispatch(set_is_mobile_sidebar(!mobileSidebar));
  };
  const toggle = () => {
    dispatch(set_mouseoversidebar_data(true));
  };
  const toggle2 = () => {
    dispatch(set_mouseoversidebar_data(false));
  };

  const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode"));
  const LayoutDark = () => {
    const htmlElement = document.documentElement;
    if (darkMode === "enabled") {
      localStorage.setItem("darkMode", "enabled");
      dispatch(set_dark_mode(true));
      setDarkMode("enabled");
      htmlElement.classList.add('dark');
    } else {
      localStorage.setItem("darkMode", "disabled");
      dispatch(set_dark_mode(false));
      setDarkMode("disabled");
      htmlElement.classList.remove('dark');
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/notifications/all');
      const data = await response.json();
      // S'assurer que les notifications sont triées par date décroissante
      const sortedNotifications = Array.isArray(data) ? 
        data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) : 
        [];
      setNotifications(sortedNotifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    }
  };

  useEffect(() => {
    setDarkMode(localStorage.getItem("darkMode"));
    LayoutDark();
  }, [darkMode]);

  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('today');

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

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
  };

  useEffect(() => {
    // Charger les notifications existantes au démarrage
    fetchNotifications();

    // Configurer Socket.IO pour les nouvelles notifications
    const socket = io('http://localhost:4000', {
      withCredentials: true,
      transports: ['websocket']
    });

    socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
    });

    socket.on('newNotification', (newNotification: NotificationType) => {
      console.log('New notification received:', newNotification);
      // Ajouter la nouvelle notification au début de la liste
      setNotifications(prev => [newNotification, ...prev]);
      
      if (Notification.permission === "granted") {
        new Notification("New Reservation", {
          body: newNotification.message || "Your reservation has been created successfully",
          icon: "/assets/img/full-parkit.png"
        });
      }
    });
    
    socket.on('reminderNotification', (reminder: NotificationType) => {
      console.log('Reminder received:', reminder);
      setNotifications(prev => [reminder, ...prev]);
      
      if (Notification.permission === "granted") {
        new Notification("Reservation Reminder", {
          body: reminder.message || "Reservation Reminder",
          icon: "/assets/img/full-parkit.png"
        });
      }
    });

    // Demander la permission pour les notifications système
    if (Notification.permission === "default") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          console.log("Notification permission granted");
        }
      });
    }

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Cleanup on component unmount
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

  const handleMarkAllAsRead = async () => {
    try {
        const response = await fetch('http://localhost:4000/api/notifications/mark-all-read', {
            method: 'POST',
        });
        
        if (response.ok) {
            const data = await response.json();
            // Mettre à jour l'état avec les notifications mises à jour depuis le serveur
            setNotifications(data.notifications);
            setFilteredNotifications(filterNotificationsByPeriod(data.notifications, selectedPeriod));
        }
    } catch (error) {
        console.error('Error marking notifications as read:', error);
    }
};

  // Fonction pour compter les notifications non lues
  const getUnreadCount = (notifications: NotificationType[]) => {
    return notifications.filter(notif => !notif.read).length;
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

        const response = await fetch('http://localhost:4000/api/auth/profile', {
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

  return (
        <AiAssistantProvider>
                    <Toast ref={toastRef} />


    <div className="header provider-header">
      {/* Logo */}
      <div className="header-left active" 
      onMouseEnter={toggle}
      onMouseLeave={toggle2}>
        <Link to={routes.index} className="logo logo-normal">
          <ImageWithBasePath src="assets/img/full-parkit.png" alt="Logo" />
        </Link>
        <Link to={routes.index} className="logo-small">
          <ImageWithBasePath src="assets/img/logo-small.svg" alt="Logo" />
        </Link>
        <Link id="toggle_btn" onClick={toogle} to="#">
          <i className="ti ti-menu-deep" />
        </Link>
      </div>
      {/* /Logo */}
      <Link id="mobile_btn" onClick={handleClick} className="mobile_btn" to="#sidebar">
        <span className="bar-icon">
          <span />
          <span />
          <span />
        </span>
      </Link>
      <div className="header-user">
        <div className="nav user-menu">
          {/* Search */}
          <div className="nav-item nav-search-inputs">
            <div className="top-nav-search">
            </div>
          </div>
          {/* /Search */}
          <div className="d-flex align-items-center">
            <div className="provider-head-links">
              <div>
                
                <Link
                  to="#"
                  id="dark-mode-toggle"
                  onClick={() => setDarkMode("enabled")}
                  className={`dark-mode-toggle me-2 ${darkMode === "disabled"  && 'activate' }`}
                >
                  <i className="fa-regular fa-moon" />
                </Link>
                <Link
                  to="#"
                  id="light-mode-toggle"
                  onClick={() => setDarkMode("disabled")}
                  className={`dark-mode-toggle me-2 ${darkMode === "enabled" && 'activate' }`}
                >
                  <i className="ti ti-sun-filled" />
                </Link>
              </div>
            </div>
            <div className="provider-head-links">
              <Link
                to="#"
                className="d-flex align-items-center justify-content-center me-2 dropdown-toggle notify-link"
                data-bs-toggle="dropdown"
                data-bs-auto-close="outside"
                aria-expanded="true"
              >
                <i className="ti ti-bell" style={{ fontSize: '22px', color: '#5F6980' }} />
                {getUnreadCount(notifications) > 0 && (
                  <span className="notification-indicator">
                    {getUnreadCount(notifications)}
                  </span>
                )}
              </Link>
              <div className="dropdown-menu dropdown-menu-end notification-dropdown p-3">
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
                            onClick={() => handlePeriodChange('today')}
                          >
                            Today
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="#"
                            className={`dropdown-item rounded-1 ${selectedPeriod === 'thisWeek' ? 'active' : ''}`}
                            onClick={() => handlePeriodChange('thisWeek')}
                          >
                            This Week
                          </Link>
                        </li>
                        <li>
                          <Link
                            to="#"
                            className={`dropdown-item rounded-1 ${selectedPeriod === 'lastWeek' ? 'active' : ''}`}
                            onClick={() => handlePeriodChange('lastWeek')}
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
                      className={`border-bottom mb-3 pb-3 ${notification.read ? 'opacity-50' : ''}`} // Ajouter une opacité réduite si lue
                      style={{ 
                        backgroundColor: notification.read ? '#f8f9fa' : 'white',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <Link to={routes.providerBooking}>  {/* Modification ici */}
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
                                {notification.type === 'creation' && (
                                  <>You created a reservation from </>
                                )}
                                {notification.type === 'start_reminder' && (
                                  <>Reminder: Your reservation starts in 15 minutes (from </>
                                )}
                                {notification.type === 'end_reminder' && (
                                  <>Reminder: Your reservation ends in 15 minutes (from </>
                                )}
                                <span className="text-primary">{formatDate(notification.startDate)}</span>
                                {' to '}
                                <span className="text-primary">{formatDate(notification.endDate)}</span>
                                {notification.type !== 'creation' && ')'}
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
                {/* Suppression des boutons Cancel et View All */}
              </div>
            </div>
            <div className="provider-head-links">
              <Link
              to="#"
              onClick={toggleFullscreen}
              className="d-flex align-items-center justify-content-center me-2"
              >
            <i className="fa fa-expand" aria-hidden="true"></i>
              </Link>
            </div>
            <div className="dropdown">
              <Link to="#" data-bs-toggle="dropdown">
                <div className="booking-user d-flex align-items-center">
                  <span className="user-img">
                    <img
                      src={imagePreview || "assets/img/user.jpg"}
                      alt="user"
                      className="rounded-circle"
                      onError={(e) => (e.currentTarget.src = "assets/img/user.jpg")} // Fallback to default image if loading fails
                    />
                  </span>
                </div>
              </Link>
              <ul className="dropdown-menu dropdown-menu-end p-3 shadow" style={{ minWidth: "250px" }}>
                <li className="text-center mb-3">
                  <img
                    src={imagePreview || "assets/img/user.jpg"}
                    alt="user"
                    className="rounded-circle mb-2"
                    style={{ width: "80px", height: "80px", objectFit: "cover" }}
                    onError={(e) => (e.currentTarget.src = "assets/img/user.jpg")} // Fallback to default image if loading fails
                  />
                  <h6 className="mb-0">{user?.firstname} {user?.lastname}</h6>
                  <small className="text-muted">{user?.role || "User"}</small>
                </li>
                <li>
                  <Link
                    className="dropdown-item d-flex align-items-center"
                    to={routes.providerProfileSettings}
                  >
                    <i className="ti ti-user me-2" />
                    Profile Account
                  </Link>
                </li>
                <li>
                  <Link
                    className="dropdown-item d-flex align-items-center text-danger"
                    to={routes.login}
                  >
                    <i className="ti ti-logout me-2" />
                    Logout
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
                          <AiAssistantButton currentState="STATE_IDLE" toastRef={toastRef} />


      {/* Mobile Menu */}
      <div className="dropdown mobile-user-menu">
        <Link
          to="#"
          className="nav-link dropdown-toggle"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <i className="fa fa-ellipsis-v" />
        </Link>
        <div className="dropdown-menu dropdown-menu-end">
         
          <Link className="dropdown-item" to={routes.login}>
            Logout
          </Link>
        </div>
      </div>
      {/* /Mobile Menu */}
    </div>
        </AiAssistantProvider>

  );
};

export default ProviderHeader;