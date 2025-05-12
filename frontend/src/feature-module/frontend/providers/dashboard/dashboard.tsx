import React, { useState, useEffect } from 'react';
import ImageWithBasePath from '../../../../core/img/ImageWithBasePath';
import { all_routes } from '../../../../core/data/routes/all_routes';
import { Link } from 'react-router-dom';
import ReactApexChart from 'react-apexcharts';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import 'react-datepicker/dist/react-datepicker.css';
import Calendar from 'react-calendar';
import { FaShieldAlt, FaTrophy, FaCrown } from 'react-icons/fa'; // Icons for badges

interface Reservation {
  _id: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  parkingId: string;
  status: string;
  parkingSpot: string;
  parking: {
    nom: string;
    image: string;
    adresse: string;
  } | null;
  parkingS: {
    numero: string;
  } | null;
}

interface Parking {
  _id: string;
  nom: string;
  adresse: string;
  nbr_place: number;
  tarif_horaire: number;
  disponibilite: boolean;
  latitude: number;
  longitude: number;
  averageRating: number;
  createdAt: string;
  updatedAt: string;
}

interface Review {
  _id: string;
  parkingId: {
    nom: string;
    image: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

interface Badge {
  _id: string;
  name: string;
  discountPercentage: number;
}

const getBadgeStyle = (badgeName: string) => {
  switch (badgeName) {
    case 'Bronze':
      return { background: 'linear-gradient(145deg, #cd7f32, #a56727)', color: 'white' };
    case 'Silver':
      return { background: 'linear-gradient(145deg, #c0c0c0, #a9a9a9)', color: 'black' };
    case 'Gold':
      return { background: 'linear-gradient(145deg, #ffd700, #e6c200)', color: 'black' };
    default:
      return { background: 'linear-gradient(145deg, #e0e0e0, #c7c7c7)', color: 'black' };
  }
};

const getBadgeIcon = (badgeName: string) => {
  switch (badgeName) {
    case 'Bronze':
      return FaShieldAlt;
    case 'Silver':
      return FaTrophy;
    case 'Gold':
      return FaCrown;
    default:
      return FaShieldAlt;
  }
};

const getBadgeMessage = (badgeName: string) => {
  switch (badgeName) {
    case 'Bronze':
      return "You're on your way! Unlock more perks by making more reservations.";
    case 'Silver':
      return "Amazing progress! Enjoy better discounts with your Silver badge.";
    case 'Gold':
      return "You're a VIP! Enjoy maximum savings with your Gold badge.";
    default:
      return "Start your journey! Make reservations to earn badges and discounts.";
  }
};

const badgeTiers = [
  { name: 'Silver', discount: 10, requirement: '10 reservations', icon: FaTrophy },
  { name: 'Gold', discount: 20, requirement: '20 reservations', icon: FaCrown },
];

const ProviderDashboard = () => {
  const routes = all_routes;
  const [showModal, setShowModal] = useState(false);
  const [value, onChange] = useState(new Date());
  const [latestReviews, setLatestReviews] = useState<Review[]>([]);
  const [parkings, setParkings] = useState<Parking[]>([]);
  const [Topparkings, setTopParkings] = useState<Parking[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [reservation, setReservation] = useState<Reservation[]>([]);
  const [badge, setBadge] = useState<Badge | null>(null);
  const [userInfo, setUserInfo] = useState({
    _id: '',
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    badge: '',
  });
  const [reservationCount, setReservationCount] = useState({
    Monday: 0,
    Tuesday: 0,
    Wednesday: 0,
    Thursday: 0,
    Friday: 0,
    Saturday: 0,
    Sunday: 0,
    totalReservations: 0,
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        if (storedUser.startsWith('{')) {
          const user = JSON.parse(storedUser);
          setUserInfo({
            _id: user._id || '',
            firstname: user.firstname || '',
            lastname: user.lastname || '',
            email: user.email || '',
            phone: user.phone || '',
            badge: user.badge || '',
          });
        } else {
          const decoded: any = jwtDecode(storedUser);
          setUserInfo({
            _id: decoded._id || '',
            firstname: decoded.firstname || '',
            lastname: decoded.lastname || '',
            email: decoded.email || '',
            phone: decoded.phone || '',
            badge: decoded.badge || '',
          });
        }
      } catch (err) {
        console.error('Error processing stored user:', err);
      }
    }
  }, []);

  useEffect(() => {
    const fetchBadge = async () => {
      if (userInfo.badge) {
        try {
          const response = await axios.get(`http://localhost:4000/api/badges/${userInfo.badge}`);
          setBadge(response.data);
        } catch (error) {
          console.error('Error fetching badge:', error);
          setBadge(null);
        }
      }
    };
    fetchBadge();
  }, [userInfo.badge]);

  useEffect(() => {
    const fetchLatestReviews = async () => {
      if (userInfo._id) {
        try {
          const res = await axios.get(`http://localhost:4000/api/reviews/user/${userInfo._id}`);
          setLatestReviews(res.data.slice(0, 3));
        } catch (error) {
          console.error('Failed to fetch latest reviews:', error);
        }
      }
    };

    fetchLatestReviews();
  }, [userInfo._id]);

  useEffect(() => {
    const fetchWeeklyReservationCount = async () => {
      if (userInfo._id) {
        try {
          const res = await axios.get(`http://localhost:4000/api/reservations/countweek/${userInfo._id}`);
          const data = res.data.data;
          const totalReservations = Object.values(data).reduce((acc: number, val: any) => acc + val, 0);

          setReservationCount({
            ...data,
            totalReservations,
          });
        } catch (error) {
          console.error('Failed to fetch weekly reservation count:', error);
        }
      }
    };

    fetchWeeklyReservationCount();
  }, [userInfo._id]);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = async (date: Date) => {
    onChange(date);

    if (userInfo._id && date) {
      try {
        const formattedDate = formatDate(date);
        const res = await axios.get(`http://localhost:4000/api/reservations/userdate`, {
          params: {
            userId: userInfo._id,
            startDate: formattedDate,
          },
        });

        setReservation(res.data.data);
      } catch (error) {
        console.error('Failed to fetch reservations for selected date:', error);
        setReservation([]);
      }
    }
  };

  useEffect(() => {
    const fetchParkings = async () => {
      try {
        const response = await axios.get<Parking[]>('http://localhost:4000/api/parking');
        setParkings(response.data);
      } catch (error) {
        console.error('Error fetching parkings:', error);
      }
    };

    fetchParkings();
  }, []);

  useEffect(() => {
    const fetchTopParkings = async () => {
      try {
        const response = await axios.get<Parking[]>('http://localhost:4000/api/parking/top-rated');
        setTopParkings(response.data);
      } catch (error) {
        console.error('Error fetching parkings:', error);
      }
    };

    fetchTopParkings();
  }, []);

  useEffect(() => {
    const fetchReservations = async () => {
      if (userInfo._id) {
        try {
          const res = await axios.get(`http://localhost:4000/api/reservations/by-user/${userInfo._id}`);
          setReservations(res.data.data);
        } catch (error) {
          console.error('Failed to fetch reservations:', error);
        }
      }
    };

    fetchReservations();
  }, [userInfo._id]);

  const countReservationsByStatus = (reservations: Reservation[]) => {
    const counts = {
      pending: 0,
      confirmed: 0,
      over: 0,
    };

    reservations.forEach((reservation) => {
      if (reservation.status === 'pending') {
        counts.pending += 1;
      } else if (reservation.status === 'confirmed') {
        counts.confirmed += 1;
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

  const chartOptions = {
    chart: {
      type: 'bar',
      height: 140,
    },
    colors: ['#4A00E5'],
    plotOptions: {
      bar: {
        borderRadius: 5,
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
    },
  };

  const chartData = {
    series: [
      {
        name: 'Reservations',
        data: [
          reservationCount.Monday,
          reservationCount.Tuesday,
          reservationCount.Wednesday,
          reservationCount.Thursday,
          reservationCount.Friday,
          reservationCount.Saturday,
          reservationCount.Sunday,
        ],
      },
    ],
  };

  const handleClose = () => {
    setShowModal(false);
  };

  const handelOpen = () => {
    setShowModal(true);
  };

  const [sCol] = useState<any>({
    series: [
      {
        name: 'Tasks',
        data: [12, 19, 15, 20, 14],
      },
    ],
    chart: {
      type: 'bar',
      height: 140,
    },
    colors: ['#4A00E5'],
    plotOptions: {
      bar: {
        borderRadius: 5,
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: ['M', 'T', 'W', 'T', 'F'],
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 300,
          },
          legend: {
            position: 'bottom',
          },
          plotOptions: {
            bar: {
              borderRadius: 3,
            },
          },
        },
      },
    ],
  });

  useEffect(() => {
    const fetchTopLocationsData = async () => {
      if (!userInfo._id) return;
      try {
        const res = await axios.get(`http://localhost:4000/api/reservations/reservation/parkuser/${userInfo._id}`);
        const data = res.data.data;

        const transformedData = Object.entries(data).map(([parkingName, count]: any) => ({
          x: parkingName,
          y: count,
        }));

        setTopLocationChart({
          ...topLocationChart,
          series: [
            {
              name: 'Reservations',
              data: transformedData,
            },
          ],
        });
      } catch (error) {
        console.error('Error fetching top location chart data:', error);
      }
    };

    fetchTopLocationsData();
  }, [userInfo._id]);

  const [topLocationChart, setTopLocationChart] = useState<any>({
    series: [],
    options: {
      chart: {
        type: 'bar',
        height: 260,
      },
      plotOptions: {
        bar: {
          borderRadiusApplication: 'around',
          columnWidth: '40%',
        },
      },
      colors: ['#00918E'],
      xaxis: {
        type: 'category',
        labels: {
          style: {
            fontSize: '12px',
          },
        },
      },
    },
  });

  return (
    <>
      <div className="page-wrapper">
        <div className="content container-fluid pb-0">
          <div className="row justify-content-center">
            <div className="col-xxl-3 col-md-6">
              <div className="row flex-fill">
                <div className="col-12">
                  <div className="card prov-widget h-48">
                    <div className="card-body p-3">
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="mb-1">
                          <p className="mb-0 text-sm">Pending Reservations</p>
                          <h5 className="text-lg">
                            <span className="counter">{reservationCounts.pending}</span>+
                          </h5>
                        </div>
                        <span className="prov-icon bg-warning w-8 h-8 flex justify-center items-center rounded">
                          <i className="ti ti-calendar-check text-sm" />
                        </span>
                      </div>
                      <p className="fs-12">
                        <span className="text-warning me-1">
                          {percentagePending}% <i className="ti ti-arrow-badge-up-filled text-xs" />
                        </span>
                        from All
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-12">
                  <div className="card prov-widget h-48">
                    <div className="card-body p-3">
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="mb-1">
                          <p className="mb-0 text-sm">Completed Reservations</p>
                          <h5 className="text-lg">
                            <span className="counter">{reservationCounts.confirmed}</span>+
                          </h5>
                        </div>
                        <span className="prov-icon bg-success w-8 h-8 flex justify-center items-center rounded">
                          <i className="ti ti-calendar-check text-sm" />
                        </span>
                      </div>
                      <p className="fs-12">
                        <span className="text-success me-1">
                          {percentageConfirmed}% <i className="ti ti-arrow-badge-down-filled text-xs" />
                        </span>
                        from All
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-12">
                  <div className="card prov-widget h-48">
                    <div className="card-body p-3">
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="mb-1">
                          <p className="mb-0 text-sm">Canceled Reservations</p>
                          <h5 className="text-lg">
                            <span className="counter">{reservationCounts.over}</span>+
                          </h5>
                        </div>
                        <span className="prov-icon bg-danger w-8 h-8 flex justify-center items-center rounded">
                          <i className="ti ti-calendar-check text-sm" />
                        </span>
                      </div>
                      <p className="fs-12">
                        <span className="text-danger me-1">{percentageOver}%</span> from All
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xxl-3 col-md-6">
              <div className="card flex-fill">
                <div className="card-body">
                  <div>
                    <div className="d-flex justify-content-center flex-column mb-3">
                      <h5 className="text-center">
                        {reservationCount.totalReservations}{' '}
                        <span className="text-success">
                          <i className="ti ti-arrow-badge-up-filled" />
                        </span>
                      </h5>
                      <p className="fs-12 text-center">Total Reservations this week</p>
                    </div>
                    <div id="daily-chart">
                      <ReactApexChart options={chartOptions} series={chartData.series} type="bar" height={140} />
                    </div>
                    <div className="d-flex justify-content-center flex-column">
                      <span className="text-success text-center fs-12 mb-4">Performance is 30% better last month</span>
                      <Link to={routes.providerBooking} className="btn btn-dark">
                        View All Reservations
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xxl-6 d-flex">
              <div className="card flex-fill h-48">
                <div className="card-body p-3">
                  <h6 className="mb-2 text-base font-semibold">Your Badge</h6>
                  <div className="bg-white rounded-lg shadow p-2">
                    {badge ? (
                      <div className="text-center">
                        <div className="relative mb-1">
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg border-2 border-white transform transition hover:scale-105"
                            style={getBadgeStyle(badge.name)}
                          >
                            {React.createElement(getBadgeIcon(badge.name), { className: 'text-xl' })}
                          </div>
                          <div className="absolute inset-0 rounded-full border-2 border-green-400 opacity-50 animate-pulse" />
                        </div>
                        <h5 className="text-lg font-bold mb-1">{badge.name} Badge</h5>
                        <p className="text-sm text-green-600 mb-1">
                          Enjoy <span className="font-semibold">{badge.discountPercentage}% OFF</span> on all reservations!
                        </p>
                        <p className="text-xs text-gray-500 mb-2">{getBadgeMessage(badge.name)}</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mb-1">
                          <FaShieldAlt className="text-xl text-gray-400" />
                        </div>
                        <h5 className="text-lg font-bold mb-1">No Badge Yet</h5>
                        <p className="text-xs text-gray-500 mb-2">{getBadgeMessage('')}</p>
                        <Link
                          to={routes.bookings}
                          className="btn bg-blue-600 text-white text-xs px-2 py-1 rounded"
                        >
                          Start Booking
                        </Link>
                      </div>
                    )}
                    <div className="space-y-1">
                      {badgeTiers.map((tier, index) => (
                        <div key={index} className="flex items-center p-1">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center mr-1"
                            style={getBadgeStyle(tier.name)}
                          >
                            {React.createElement(tier.icon, { className: 'text-sm' })}
                          </div>
                          <div>
                            <h6 className="text-sm font-medium">{tier.name} Badge</h6>
                            <p className="text-xs text-green-600">
                              <span className="font-semibold">{tier.discount}% OFF</span> | Unlock with {tier.requirement}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xxl-4 col-md-6 d-flex">
              <div className="card flex-fill">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6>Top Parkings</h6>
                    <Link to={routes.map} className="btn border">
                      View All
                    </Link>
                  </div>
                  {parkings.map((parking) => (
                    <div
                      key={parking._id}
                      className="d-flex justify-content-between align-items-center mb-2"
                    >
                      <div className="d-flex">
                        <Link to={`/parkings/parking-details/${parking._id}`} className="avatar avatar-lg me-2">
                          <ImageWithBasePath
                            src="assets/img/parking.jpg"
                            className="rounded-circle"
                            alt="Parking"
                          />
                        </Link>
                        <div>
                          <Link to={`/parkings/parking-details/${parking._id}`} className="fw-medium mb-0">
                            {parking.nom}
                          </Link>
                          <div className="d-flex justify-content-between align-items-center" style={{ width: '100%' }}>
                            <span className="text-truncate me-2" style={{ maxWidth: '150px' }}>
                              {parking.adresse}
                            </span>
                            <div className="d-flex align-items-center gap-2">
                              <span className="text-xs">{parking.nbr_place} spots</span>
                              <span className="text-xs">
                                <i className="ti ti-star-filled text-warning me-1" />
                                {parking.averageRating}/5
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Link to={`/parkings/parking-details/${parking._id}`}>
                        <i className="ti ti-chevron-right" />
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="col-xxl-4 col-md-6 d-flex">
              <div className="card flex-fill">
                <div className="card-body reactcal-full">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6>Bookings</h6>
                    <Link to={routes.bookings} className="btn border">
                      View All
                    </Link>
                  </div>
                  <div id="datetimepickershow" className="h-48">
                    <Calendar onChange={handleDateChange} value={value} />
                  </div>
                  <div className="book-crd">
                    {reservation.length > 0 ? (
                      reservation.map((reservation) => (
                        <div className="card" key={reservation._id}>
                          <div className="card-body p-2">
                            <div className="d-flex justify-content-between align-items-center">
                              <div className="d-flex align-items-center">
                                <Link
                                  to={routes.bookingDetails}
                                  className="avatar avatar-sm flex-shrink-0 me-1"
                                >
                                  <ImageWithBasePath
                                    src="assets/img/parking.jpg"
                                    className="rounded-circle"
                                    alt="Img"
                                  />
                                </Link>
                                <div>
                                  <Link to={routes.bookingDetails} className="fw-medium text-sm">
                                    {reservation.parking?.nom || 'Parking'}
                                  </Link>
                                  <span className="d-block text-xs">
                                    <i className="ti ti-clock me-1" />
                                    {new Date(reservation.startDate).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}{' '}
                                    -{' '}
                                    {new Date(reservation.endDate).toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                    })}
                                  </span>
                                </div>
                              </div>
                              <div className="d-flex align-items-center">
                                <Link to={routes.bookingDetails}>
                                  <i className="ti ti-chevron-right" />
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs">No reservations for this date.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xxl-4 col-md-6 d-flex">
              <div className="card flex-fill">
                <div className="card-body">
                  <h6 className="mb-3">Top Locations</h6>
                  <div id="deals-chart">
                    <ReactApexChart
                      options={topLocationChart.options}
                      series={topLocationChart.series}
                      type="bar"
                      height={275}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6 d-flex">
              <div className="card flex-fill">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="mb-0">Your Latest Reviews</h6>
                  </div>
                  {latestReviews.length === 0 ? (
                    <p className="text-muted text-sm">You havent posted any reviews yet.</p>
                  ) : (
                    latestReviews.map((review) => (
                      <div key={review._id} className="border-bottom pb-2 mb-2">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex">
                            <Link to="#" className="avatar avatar-sm flex-shrink-0 me-1">
                              <ImageWithBasePath
                                src="assets/img/parking.jpg"
                                className="rounded-circle"
                                alt="Parking"
                              />
                            </Link>
                            <div>
                              <h6 className="fw-medium text-sm mb-0">{review.parkingId.nom}</h6>
                              <p className="text-xs mb-0">{review.comment}</p>
                              <small className="text-xs text-muted">{new Date(review.createdAt).toLocaleDateString()}</small>
                            </div>
                          </div>
                          <div className="d-flex align-items-center">
                            <span className="text-warning text-xs me-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <i
                                  key={star}
                                  className={`ti ti-star${review.rating >= star ? '-filled filled' : ''}`}
                                />
                              ))}
                            </span>
                            <span className="text-xs">{review.rating.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            <div className="col-md-6 d-flex">
              <div className="card flex-fill">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6>Highly Rated Parkings</h6>
                    <Link to="#" className="btn border" onClick={handelOpen}>
                      View All
                    </Link>
                  </div>
                  {Topparkings.map((parking) => (
                    <div
                      key={parking._id}
                      className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-2"
                    >
                      <div className="d-flex">
                        <Link to={routes.map} className="avatar avatar-sm me-1">
                          <ImageWithBasePath
                            src="assets/img/parking.jpg"
                            className="rounded-circle"
                            alt="Parking"
                          />
                        </Link>
                        <div>
                          <Link to={routes.map} className="fw-medium text-sm">
                            {parking.nom}
                          </Link>
                          <div className="text-xs d-flex align-items-center gap-1">
                            <span className="pe-1 border-end">{parking.adresse}</span>
                            <span>
                              <i className="ti ti-star-filled text-warning me-1" />
                              {parking.nbr_place} Spots
                            </span>
                          </div>
                        </div>
                      </div>
                      <span className="badge badge-info text-xs d-flex align-items-center gap-1">
                        <i className="ti ti-star-filled text-warning" />
                        {parking.averageRating.toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProviderDashboard;