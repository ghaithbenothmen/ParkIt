import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import ImageWithBasePath from '../../../../core/img/ImageWithBasePath';
import { all_routes } from '../../../../core/data/routes/all_routes';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

interface Reservation {
  _id: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  parkingId: string;
  status: string;
  parkingSpot: string;
  parking: {
    _id:string;
    nom: string;
    images?: string[]; // Updated to array of Cloudinary URLs
    adresse: string;
  } | null;
  parkingS: {
    numero: string;
  } | null;
}

const ProviderBooking = () => {
  const routes = all_routes;
  const [selectedItems, setSelectedItems] = useState(Array(10).fill(false));
  const handleItemClick = (index: number) => {
    setSelectedItems((prevSelectedItems) => {
      const updatedSelectedItems = [...prevSelectedItems];
      updatedSelectedItems[index] = !updatedSelectedItems[index];
      return updatedSelectedItems;
    });
  };
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [userInfo, setUserInfo] = useState({
    _id: '',
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
  });
  const RESERVATIONS_PER_PAGE = 5;
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'tomorrow' | 'week'>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Calculate filtered reservations
  const filteredReservations = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday

    return reservations.filter((reservation) => {
      const resDate = new Date(reservation.startDate);
      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'paid' && ['confirmed', 'checked-in', 'completed'].includes(reservation.status)) ||
        (filterStatus === 'not-paid' && ['pending', 'overdue', 'no-show'].includes(reservation.status)) ||
        reservation.status === filterStatus;
      const matchesDate =
        dateFilter === 'all' ||
        (dateFilter === 'today' && resDate.toDateString() === today.toDateString()) ||
        (dateFilter === 'tomorrow' && resDate.toDateString() === tomorrow.toDateString()) ||
        (dateFilter === 'week' && resDate >= startOfWeek && resDate <= endOfWeek);

      return matchesStatus && matchesDate;
    });
  }, [reservations, filterStatus, dateFilter]);

  // Get paginated reservations
  const paginatedReservations = useMemo(() => {
    const startIndex = (currentPage - 1) * RESERVATIONS_PER_PAGE;
    return filteredReservations.slice(startIndex, startIndex + RESERVATIONS_PER_PAGE);
  }, [currentPage, filteredReservations]);

  const totalPages = Math.ceil(filteredReservations.length / RESERVATIONS_PER_PAGE);

  // Pagination click handler
  const handlePageChange = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        if (storedUser.startsWith('{')) {
          const user = JSON.parse(storedUser);
          console.log('Loaded user object from localStorage:', user);
          setUserInfo({
            _id: user._id || '',
            firstname: user.firstname || '',
            lastname: user.lastname || '',
            email: user.email || '',
            phone: user.phone || '',
          });
        } else {
          const decoded: any = jwtDecode(storedUser);
          console.log('Decoded user from JWT token:', decoded);
          setUserInfo({
            _id: decoded._id || '',
            firstname: decoded.firstname || '',
            lastname: decoded.lastname || '',
            email: decoded.email || '',
            phone: decoded.phone || '',
          });
        }
      } catch (err) {
        console.error('Error processing stored user:', err);
      }
    }
  }, []);

  useEffect(() => {
    const fetchReservations = async () => {
      if (userInfo._id) {
        try {
          const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/reservations/by-user/${userInfo._id}`);
          console.log('Fetched reservations:', res.data);
          setReservations(res.data.data);
        } catch (error) {
          console.error('Failed to fetch reservations:', error);
        }
      }
    };

    fetchReservations();
  }, [userInfo._id]);

  useEffect(() => {
    const fetchParkings = async () => {
      const updatedReservations = [...reservations];

      for (let i = 0; i < updatedReservations.length; i++) {
        const reservation = updatedReservations[i];
        if (reservation.parkingId && !reservation.parking) {
          try {
            const parkingRes = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/parking/${reservation.parkingId}`);
            updatedReservations[i].parking = parkingRes.data;
          } catch (error) {
            console.error('Error fetching parking details for reservation:', reservation._id, error);
          }
        }
      }

      setReservations(updatedReservations);
    };

    if (reservations.length > 0) {
      fetchParkings();
    }
  }, [reservations]);

  useEffect(() => {
    const fetchParkingSpots = async () => {
      const updatedReservations = [...reservations];

      for (let i = 0; i < updatedReservations.length; i++) {
        const reservation = updatedReservations[i];

        if (reservation.parkingSpot && !reservation.parkingS) {
          try {
            console.log(`Fetching parking spot for ID: ${reservation.parkingSpot}`);
            const spotRes = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/parking-spots/${reservation.parkingSpot}`);
            console.log('Parking spot fetched:', spotRes.data);
            updatedReservations[i].parkingS = spotRes.data.data;
          } catch (error) {
            console.error('Error fetching parking spot for reservation:', reservation._id, error);
          }
        }
      }

      setReservations(updatedReservations);
    };

    if (reservations.length > 0) {
      fetchParkingSpots();
    }
  }, [reservations]);

  const countReservationsByStatus = (reservations: Reservation[]) => {
    const counts = {
      confirmed: 0,
      pending: 0,
      over: 0,
    };

    reservations.forEach((reservation) => {
      if (reservation.status === 'confirmed') {
        counts.confirmed += 1;
      } else if (reservation.status === 'pending') {
        counts.pending += 1;
      } else if (reservation.status === 'over') {
        counts.over += 1;
      }
    });

    return counts;
  };

  const [reservationCounts, setReservationCounts] = useState({
    confirmed: 0,
    pending: 0,
    over: 0,
  });

  useEffect(() => {
    if (reservations.length > 0) {
      const counts = countReservationsByStatus(reservations);
      setReservationCounts(counts);
    }
  }, [reservations]);

  const percentagePending = Math.round(
    (reservationCounts.pending / (reservationCounts.confirmed + reservationCounts.pending + reservationCounts.over)) * 100
  ) || 0;
  const percentageConfirmed = Math.round(
    (reservationCounts.confirmed / (reservationCounts.confirmed + reservationCounts.pending + reservationCounts.over)) * 100
  ) || 0;
  const percentageOver = Math.round(
    (reservationCounts.over / (reservationCounts.confirmed + reservationCounts.pending + reservationCounts.over)) * 100
  ) || 0;

  return (
    <>
      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="col-12">
            <div className="row flex-wrap">
              <div className="col-xxl-3 col-md-4 col-sm-6 mb-3">
                <div className="card prov-widget">
                  <div className="card-body">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="mb-2">
                        <p className="mb-1">Confirmed Reservations</p>
                        <h5>
                          <span className="counter">{reservationCounts.confirmed}</span>+
                        </h5>
                      </div>
                      <span className="prov-icon bg-success d-flex justify-content-center align-items-center rounded">
                        <i className="ti ti-calendar-check" />
                      </span>
                    </div>
                    <p className="fs-12">
                      <span className="text-success me-2">
                        {percentageConfirmed}% <i className="ti ti-arrow-badge-up-filled" />
                      </span>
                      from all reservations
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-xxl-3 col-md-4 col-sm-6 mb-3">
                <div className="card prov-widget">
                  <div className="card-body">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="mb-2">
                        <p className="mb-1">Pending Reservations</p>
                        <h5>
                          <span className="counter">{reservationCounts.pending}</span>+
                        </h5>
                      </div>
                      <span className="prov-icon bg-warning d-flex justify-content-center align-items-center rounded">
                        <i className="ti ti-calendar-check" />
                      </span>
                    </div>
                    <p className="fs-12">
                      <span className="text-warning me-2">
                        {percentagePending}% <i className="ti ti-arrow-badge-down-filled" />
                      </span>
                      from all reservations
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-xxl-3 col-md-4 col-sm-6 mb-3">
                <div className="card prov-widget">
                  <div className="card-body">
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="mb-2">
                        <p className="mb-1">Expired Reservations</p>
                        <h5>
                          <span className="counter">{reservationCounts.over}</span>+
                        </h5>
                      </div>
                      <span className="prov-icon bg-danger d-flex justify-content-center align-items-center rounded">
                        <i className="ti ti-calendar-check" />
                      </span>
                    </div>
                    <p className="fs-12">
                      <span className="text-danger me-2">{percentageOver}%</span> from all reservations
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3 mb-4">
              <h4>Reservation List</h4>
              <div className="d-flex align-items-center flex-wrap row-gap-3">
                <div className="btn-group me-2">
                  <button
                    className={`btn ${dateFilter === 'all' ? 'btn-primary' : 'btn-outline-primary'} ${dateFilter === 'all' ? 'active' : ''}`}
                    style={{ backgroundColor: dateFilter === 'all' ? '#ff6f61' : '', color: dateFilter === 'all' ? 'white' : '' }}
                    onClick={() => setDateFilter('all')}
                  >
                    All Dates
                  </button>
                  <button
                    className={`btn ${dateFilter === 'today' ? 'btn-primary' : 'btn-outline-primary'} ${dateFilter === 'today' ? 'active' : ''}`}
                    style={{ backgroundColor: dateFilter === 'today' ? '#ff6f61' : '', color: dateFilter === 'today' ? 'white' : '' }}
                    onClick={() => setDateFilter('today')}
                  >
                    Today
                  </button>
                  <button
                    className={`btn ${dateFilter === 'tomorrow' ? 'btn-primary' : 'btn-outline-primary'} ${dateFilter === 'tomorrow' ? 'active' : ''}`}
                    style={{ backgroundColor: dateFilter === 'tomorrow' ? '#ff6f61' : '', color: dateFilter === 'tomorrow' ? 'white' : '' }}
                    onClick={() => setDateFilter('tomorrow')}
                  >
                    Tomorrow
                  </button>
                  <button
                    className={`btn ${dateFilter === 'week' ? 'btn-primary' : 'btn-outline-primary'} ${dateFilter === 'week' ? 'active' : ''}`}
                    style={{ backgroundColor: dateFilter === 'week' ? '#ff6f61' : '', color: dateFilter === 'week' ? 'white' : '' }}
                    onClick={() => setDateFilter('week')}
                  >
                    This Week
                  </button>
                </div>
              </div>
              <div className="d-flex align-items-center flex-wrap row-gap-3">
                <span className="fs-14 me-2">Sort With Status</span>
                <div className="dropdown me-2">
                  <Link to="#" className="dropdown-toggle" data-bs-toggle="dropdown">
                    {filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
                  </Link>
                  <div className="dropdown-menu">
                    <Link to="#" className="dropdown-item" onClick={() => setFilterStatus('all')}>
                      All
                    </Link>
                    <Link to="#" className="dropdown-item" onClick={() => setFilterStatus('paid')}>
                      Paid
                    </Link>
                    <Link to="#" className="dropdown-item" onClick={() => setFilterStatus('not-paid')}>
                      Not Paid
                    </Link>
                    <Link to="#" className="dropdown-item" onClick={() => setFilterStatus('confirmed')}>
                      Confirmed
                    </Link>
                    <Link to="#" className="dropdown-item" onClick={() => setFilterStatus('pending')}>
                      Pending
                    </Link>
                    <Link to="#" className="dropdown-item" onClick={() => setFilterStatus('checked-in')}>
                      Checked-In
                    </Link>
                    <Link to="#" className="dropdown-item" onClick={() => setFilterStatus('overdue')}>
                      Overdue
                    </Link>
                    <Link to="#" className="dropdown-item" onClick={() => setFilterStatus('no-show')}>
                      No-Show
                    </Link>
                    <Link to="#" className="dropdown-item" onClick={() => setFilterStatus('completed')}>
                      Completed
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row justify-content-center">
            <div className="col-xxl-12 col-lg-12">
              {paginatedReservations.length > 0 ? (
                paginatedReservations.map((reservation) => (
                  <div key={reservation._id} className="card shadow-none booking-list position-relative">
                    <div className="card-body d-md-flex align-items-center">
                      <div className="booking-widget d-sm-flex align-items-center row-gap-3 flex-fill mb-3 mb-md-0">
                        <div className="booking-img me-sm-3 mb-3 mb-sm-0">
                          <Link to={`/providers/map2/${reservation.parking?._id}`} className="avatar">
                          
                            {reservation.parking?.images && reservation.parking.images.length > 0 ? (
                              <img
                                src={reservation.parking.images[0]}
                                className="avatar-img"
                                alt="Parking Image"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = 'assets/img/parking.jpg';
                                }}
                              />
                            ) : (
                              <ImageWithBasePath
                                src="assets/img/parking.jpg"
                                className="avatar-img"
                                alt="Parking Image"
                              />
                            )}
                          </Link>
                        </div>

                        <div className="booking-det-info">
                          <h6 className="mb-3">
                            <Link to={`${routes.providerBooking}/${reservation._id}`}>
                              {reservation.parking?.nom || 'Parking Spot'}
                            </Link>
                            <span
                              className={`badge ms-2 ${
                                reservation.status === 'confirmed' ||
                                reservation.status === 'checked-in' ||
                                reservation.status === 'completed'
                                  ? 'badge-soft-success'
                                  : reservation.status === 'pending' ||
                                    reservation.status === 'overdue' ||
                                    reservation.status === 'no-show'
                                  ? 'badge-soft-danger'
                                  : 'badge-soft-secondary'
                              }`}
                            >
                              {reservation.status}
                            </span>
                          </h6>

                          <ul className="booking-details">
                            <li className="d-flex align-items-center mb-2">
                              <span className="book-item">Reservation Date</span>
                              <small className="me-2">: </small>
                              {new Date(reservation.startDate).toLocaleDateString()}{' '}
                              {new Date(reservation.startDate).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}{' '}
                              -{' '}
                              {new Date(reservation.endDate).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </li>
                            <li className="d-flex align-items-center mb-2">
                              <span className="book-item">Amount</span>
                              <small className="me-2">:</small>{reservation.totalPrice.toFixed(2)} DT
                              <span
                                className={`badge ms-2 ${
                                  reservation.status === 'pending' ||
                                  reservation.status === 'overdue' ||
                                  reservation.status === 'no-show'
                                    ? 'badge-soft-danger'
                                    : 'badge-soft-success'
                                }`}
                              >
                                {reservation.status === 'pending' ||
                                reservation.status === 'overdue' ||
                                reservation.status === 'no-show'
                                  ? 'Not Paid'
                                  : 'Paid'}
                              </span>
                            </li>
                            <li className="d-flex align-items-center mb-2">
                              <span className="book-item">Location</span>
                              <small className="me-2">: </small>
                              {reservation.parking?.adresse || 'Unknown'}
                            </li>
                            <li className="d-flex align-items-center mb-2">
                              <span className="book-item">Parking Spot</span>
                              <small className="me-2">: </small>
                              {reservation.parkingS?.numero || 'Unknown'}
                            </li>
                          </ul>
                        </div>
                      </div>

                      {reservation.status === 'overdue' && (
                        <div
                          className="position-absolute top-50 end-40 translate-middle-y text-center"
                          style={{
                            right: '100px',
                            cursor: 'pointer',
                          }}
                          title="Click to view details and pay additional fees"
                          onClick={() =>
                            (window.location.href = `${routes.overdueDetailsBooking}/${reservation._id}`)
                          }
                        >
                          <i
                            className="fa-solid fa-triangle-exclamation text-danger"
                            style={{ fontSize: '24px' }}
                          ></i>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p>No reservations available.</p>
              )}
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center flex-wrap row-gap-3 mt-4">
            <div className="value d-flex align-items-center">
              <span>Show</span>
              <select value={RESERVATIONS_PER_PAGE} disabled>
                <option>{RESERVATIONS_PER_PAGE}</option>
              </select>
              <span>entries</span>
            </div>

            <div className="d-flex align-items-center justify-content-center">
              <span className="me-2 text-gray-9">
                {((currentPage - 1) * RESERVATIONS_PER_PAGE) + 1} -{' '}
                {Math.min(currentPage * RESERVATIONS_PER_PAGE, reservations.length)} of {reservations.length}
              </span>
              <nav aria-label="Page navigation">
                <ul className="paginations d-flex justify-content-center align-items-center">
                  {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
                    <li className="page-item me-2" key={pageNum}>
                      <button
                        className={`page-link-1 d-flex justify-content-center align-items-center ${
                          pageNum === currentPage ? 'active' : ''
                        }`}
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProviderBooking;