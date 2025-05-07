import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ImageWithBasePath from '../../../core/img/ImageWithBasePath';
import ReactApexChart from 'react-apexcharts';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { all_routes } from '../../../core/data/routes/all_routes';
import { BookingInterface } from '../../../core/models/interface';

import {
  AdminDashboardInterface,
  AdminDashboardOne,
  AdminDashboardTwo,
} from '../../../core/models/interface';
import { AdminDashboardThree } from '../../../core/data/json/admin-dashboard3';

interface Reservation {
  _id: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  parkingId: string;  // Parking ID
  status: string;
  parkingSpot: string;
  parking: {
    nom: string;
    image: string;
    adresse: string;
  } | null; // parking details will be populated later
  parkingS: {
    numero: string;
  } | null;
  userId: string;  // User ID field added
  user?: {
    firstname: string;
    email: string;
  }; // User details will be added here // parking details will be populated later
}
const Dashboard = () => {
  const routes = all_routes;


  const [userCount, setUserCount] = useState(null); // Initialize as null
  const [parcCount, setParcCount] = useState(null);
  const [reservationStat, setReservationStat] = useState(null);
  const [reservationSummary, setReservationSummary] = useState(null);
  const [resCount, setResCount] = useState(null);
  const [resCountTot, setResCountTot] = useState(null);
  const [topUsers, setTopUsers] = useState(null);
  const [topParkings, setTopParkings] = useState(null);
  const [reservationWeekendStat, setReservationWeekendStat] = useState<number | null>(null);
  const reservationTypeLegend = [
    { color: '#4B49AC', label: 'Weekday' },
    { color: '#FFC107', label: 'Weekend' },
  ];
  const [weekChartData,setWeekChartData] = useState({
    series:[],
    options: {
      chart: {
        width: 700,
        type: 'pie',
      },
      labels: ['Weekday', 'Weekend'],
      legend: {
        position: 'bottom',
      },
      colors: ['#4B49AC', '#FFC107'],
    },
  });
  const [bookChartData, setBookChartData] = useState({
    series: [],
    options: {
      chart: {
        width: 700,
        type: 'pie',
      },
      labels: ['Confirmed', 'Canceled', 'Pending'], // Match your legend
      colors: ['#1BA345', '#FF0000', '#FEC001'],
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 200,
            },
            legend: {
              position: 'bottom',
            },
          },
        },
      ],
    },
  });
  const [parkings, setParkings] = useState<Record<string, { nom: string; image: string; adresse: string }>>({});
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredReservations = reservations.filter(reservation => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'confirmed' && reservation.status === 'confirmed') return true;
    if (filterStatus === 'pending' && reservation.status === 'pending') return true;
    if (filterStatus === 'over' && reservation.status === 'over') return true;
    return false;
  });
  const fetchResCountTot = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/reservations/total'); // Replace with your API endpoint
      setResCountTot(response.data.totalPrice); // Assuming your API response has a `count` field
    } catch (error) {
      console.error('Error fetching user count:', error);
    }
  };

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/api/reservations`);
        console.log("Fetched reservations:", res.data);

        setReservations(res.data.data);  // Access the array inside 'data'
      } catch (error) {
        console.error("Failed to fetch reservations:", error);
      }
    };

    fetchReservations();
  }, []);
  useEffect(() => {
    const fetchParkings = async () => {
      const updatedReservations = [...reservations]; // Copy of reservations state

      for (let i = 0; i < updatedReservations.length; i++) {
        const reservation = updatedReservations[i];
        if (reservation.parkingId && !reservation.parking) {
          try {
            const parkingRes = await axios.get(`http://localhost:4000/api/parking/${reservation.parkingId}`);
            updatedReservations[i].parking = parkingRes.data;  // Assuming parking details come with nom, image, adresse
          } catch (error) {
            console.error('Error fetching parking details for reservation:', reservation._id, error);
          }
        }
      }

      setReservations(updatedReservations); // Update the state with parking details
    };

    if (reservations.length > 0) {
      fetchParkings();
    }
  }, [reservations]);
  const fetchReservationWeekendStat = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/reservations/weekend');
      // Assuming response.data.count is a number or array
      console.log('Weekend Reservations:', response.data);
      const data = response.data.count; // Make sure this is an array like [30, 40, 50]
      setReservationWeekendStat(data); // You’ll define this in useState

      setWeekChartData((prev) => ({
        ...prev,
        series: data,
      }));
    } catch (error) {
      console.error('Error fetching weekend reservation statistics:', error);
    }
  };

  useEffect(() => {
    const fetchParkingSpots = async () => {
      const updatedReservations = [...reservations];

      for (let i = 0; i < updatedReservations.length; i++) {
        const reservation = updatedReservations[i];

        if (reservation.parkingSpot && !reservation.parkingS) {
          try {
            console.log(`Fetching parking spot for ID: ${reservation.parkingSpot}`);
            const spotRes = await axios.get(`http://localhost:4000/api/parking-spots/${reservation.parkingSpot}`);
            console.log("Parking spot fetched:", spotRes.data);
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
  const statusButton = (rowData: BookingInterface) => {
    if (rowData.status === 'Completed') {
      return <span className="badge-delete">{rowData.status}</span>;
    } else if (rowData.status === 'Canceleld') {
      return <span className="badge-inactive">{rowData.status}</span>;
    }
    else if (rowData.status === 'Pending') {
      return <span className="badge-pending">{rowData.status}</span>;
    } else {
      return rowData.status;
    }
  };
  const renderStatusBadge = (rowData: Reservation) => {
    let badgeClass = '';
    const label = rowData.status;

    switch (rowData.status.toLowerCase()) {
      case 'confirmed':
        badgeClass = 'badge bg-success'; // Green
        break;
      case 'pending':
        badgeClass = 'badge bg-primary'; // Blue
        break;
      case 'over':
        badgeClass = 'badge bg-danger'; // Red
        break;
      default:
        badgeClass = 'badge bg-secondary'; // Gray fallback
    }

    return <span className={badgeClass}>{label}</span>;
  };
  useEffect(() => {
    const fetchUserDetails = async () => {
      const updatedReservations = [...reservations]; // Copy of reservations state

      for (let i = 0; i < updatedReservations.length; i++) {
        const reservation = updatedReservations[i];
        if (reservation.userId && !reservation.user) {
          try {
            const userRes = await axios.get(`http://localhost:4000/api/users/${reservation.userId}`);
            updatedReservations[i].user = {
              firstname: userRes.data.firstname,
              email: userRes.data.email,
            };
          } catch (error) {
            console.error('Error fetching user details for reservation:', reservation._id, error);
          }
        }
      }

      setReservations(updatedReservations); // Update the state with user details
    };

    if (reservations.length > 0) {
      fetchUserDetails();
    }
  }, [reservations]);

  const renderUserDetails = (rowData: Reservation) => {
    return rowData.user ? (
      <div>
        <div>{rowData.user.firstname}</div>
        <div>{rowData.user.email}</div>
      </div>
    ) : (
      '—' // Fallback if user details are not available yet
    );
  };

  // Function to fetch user count from API
  const fetchUserCount = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/users/users/count'); // Replace with your API endpoint
      setUserCount(response.data.count); // Assuming your API response has a `count` field
    } catch (error) {
      console.error('Error fetching user count:', error);
    }
  };


  const fetchParkingCount = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/parking/parc/count'); // Replace with your API endpoint
      setParcCount(response.data.count); // Assuming your API response has a `count` field
    } catch (error) {
      console.error('Error fetching parc count:', error);
    }
  };

  const fetchReservationSummary = async () => {
    const response = await axios.get('http://localhost:4000/api/reservations/reservation-summary');
    setReservationSummary(response.data.count);
  };
  const fetchResCount = async () => {
    try {
      const response = await axios.get('http://localhost:4000/api/reservations/count'); // Replace with your API endpoint
      setResCount(response.data.count); // Assuming your API response has a `count` field
    } catch (error) {
      console.error('Error fetching user count:', error);
    }
  };

  const fetchReservationStat = async () => {
    try {
      const response = await axios.get(
        'http://localhost:4000/api/reservations/reservation-statistics'
      );

      const data = response.data.count; // Make sure this is an array like [30, 40, 50]
      setReservationStat(data);

      // Update chart data here
      setBookChartData((prev) => ({
        ...prev,
        series: data,
      }));
    } catch (error) {
      console.error('Error fetching reservation statistics:', error);
    }
  };

  useEffect(() => {
    const fetchTopUsers = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/reservations/top-users');
        setTopUsers(response.data.topUsers);
      } catch (error) {
        console.error('Error fetching top users:', error);
      }
    };

    fetchTopUsers();
  }, []);
  useEffect(() => {
    const fetchTopParkings = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/reservations/top-parkings');
        setTopParkings(response.data.topParkings);
      } catch (error) {
        console.error('Error fetching top users:', error);
      }
    };

    fetchTopParkings();
  }, []);


  useEffect(() => {
    fetchReservationWeekendStat();
  }, []);

  useEffect(() => {
    fetchUserCount(); // Fetch user count on component mount
  }, []);

  useEffect(() => {
    fetchResCount(); // Fetch user count on component mount
  }, []);
  useEffect(() => {
    fetchResCountTot(); // Fetch user count on component mount
  }, []);

  useEffect(() => {
    fetchParkingCount(); // Fetch user count on component mount
  }, []);
  useEffect(() => {
    fetchReservationSummary(); // Fetch user count on component mount
  }, []);

  useEffect(() => {
    fetchReservationStat();
  }, []);
  console.log(reservationStat);

  const serviceImage1 = (rowData: AdminDashboardInterface) => {
    const [service] = rowData.service.split('\n');
    return (
      <Link to={routes.viewServices} className="table-imgname">
        <ImageWithBasePath src={rowData.img} className="me-2" alt="img" />
        <span>{service}</span>
      </Link>
    );
  };
  const serviceImage2 = (rowData: AdminDashboardInterface) => {
    const [providerName] = rowData.providerName.split('\n');
    return (
      <Link to={routes.viewServices} className="table-imgname">
        <ImageWithBasePath src={rowData.img} className="me-2" alt="img" />
        <span>{providerName}</span>
      </Link>
    );
  };
  const serviceImage3 = (rowData: AdminDashboardInterface) => {
    const [service] = rowData.service.split('\n');
    return (
      <Link to={routes.viewServices} className="table-imgname">
        <ImageWithBasePath
          src={rowData.serviceImg}
          className="me-2"
          alt="img"
        />
        <span>{service}</span>
      </Link>
    );
  };
  const userImage = (rowData: AdminDashboardInterface) => {
    const [user] = rowData.user.split('\n');
    return (
      <Link to={routes.viewServices} className="table-imgname">
        <ImageWithBasePath src={rowData.userImg} className="me-2" alt="img" />
        <span>{user}</span>
      </Link>
    );
  };
  const providerImage = (rowData: AdminDashboardInterface) => {
    const [provider] = rowData.provider.split('\n');
    return (
      <Link to={routes.viewServices} className="table-imgname">
        <ImageWithBasePath
          src={rowData.providerImg}
          className="me-2"
          alt="img"
        />
        <span>{provider}</span>
      </Link>
    );
  };

  const data1 = useSelector(
    (state: AdminDashboardOne) => state.admin_dashboard_1,
  );
  const data2 = useSelector(
    (state: AdminDashboardTwo) => state.admin_dashboard_2,
  );
  const data3 = useSelector(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    (state: AdminDashboardThree) => state.admin_dashboard_3,
  );

  const Revenue = {
    series: [
      {
        name: 'series1',
        data: [11, 32, 45, 32, 34, 52, 41],
        colors: [' #4169E1'],
      },
      {
        name: 'series2',
        colors: [' #4169E1'],
        data: [31, 40, 28, 51, 42, 109, 100],
      },
    ],
    chart: {
      height: 350,
      type: 'area',
    },
    fill: {
      colors: [' #4169E1', '#4169E1'],
      type: 'gradient',
      gradient: {
        shade: 'dark',
        type: 'horizontal',
        shadeIntensity: 0.1,
        gradientToColors: undefined,
        inverseColors: true,
        opacityFrom: 0.5,
        opacityTo: 0.5,
        stops: [0, 50, 100],
        colorStops: [],
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: 1,
      curve: 'smooth',
      dashArray: [0, 8, 5],
      opacityFrom: 0.5,
      opacityTo: 0.5,
      colors: [' #4169E1'],
    },
    xaxis: {
      type: 'month',
      categories: ['jan', 'feb', 'march', 'april', 'may', 'june', 'july'],
    },
    tooltip: {},
  };
  const book = {
    series: reservationStat,
    chart: {
      width: 700,
      type: 'pie',
    },
    labels: ['Team A', 'Team B', 'Team C'],
    color: ['#1BA345', '#0081FF', ' #FEC001'],
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200,
          },
          legend: {
            position: 'bottom',
          },
        },
      },
    ],
  };


  const chartOptions = {
    colors: ['#4169E1'],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        endingShape: 'rounded',
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent'],
    },
    xaxis: {
      categories: [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
      ],
    },
    yaxis: {
      title: {
        text: '$ (thousands)',
      },
    },
    fill: {
      opacity: 1,
    },
    legend: {
      width: 400,
    },
    chart: {
      type: 'bar',
      height: 350,
      toolbar: {
        show: false,
      },
    },
  };

  const chartSeries = [
    {
      name: 'Received',
      type: 'column',
      data: reservationSummary ?? [], // make sure it's not null or undefined
    },
    {
      name: 'Revenue',
      data: [], // Replace with actual numbers
    },
    {
      name: 'Free Cash Flow',
      data: [], // Replace with actual numbers
    },
  ];


  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="row">

          <div className="col-lg-3 col-sm-6 col-12 d-flex widget-path widget-service">
            <div className="card">
              <div className="card-body">
                <div className="home-user">
                  <div className="home-userhead">
                    <div className="home-usercount">
                      <span>
                        <ImageWithBasePath
                          src="assets/admin/img/icons/user.svg"
                          alt="img"
                        />
                      </span>
                      <h6>Total User</h6>
                    </div>
                    <div className="home-useraction">
                      <Link
                        className="delete-table bg-white"
                        to="#"
                        data-bs-toggle="dropdown"
                        aria-expanded="true"
                      >
                        <i className="fa fa-ellipsis-v" aria-hidden="true" />
                      </Link>
                      <ul
                        className="dropdown-menu"
                        data-popper-placement="bottom-end"
                      >
                        <li>
                          <Link to="#" className="dropdown-item">
                            {' '}
                            View
                          </Link>
                        </li>
                        <li>
                          <Link to="#" className="dropdown-item">
                            {' '}
                            Edit
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="home-usercontent">
                    <div className="home-usercontents">
                      <div className="home-usercontentcount">
                        <ImageWithBasePath
                          src="assets/admin/img/icons/arrow-up.svg"
                          alt="img"
                          className="me-2"
                        />
                        <span className="counters" data-count={30}>
                          {userCount !== null ? userCount : 'Loading...'}
                        </span>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>




          <div className="col-lg-3 col-sm-6 col-12 d-flex widget-path widget-service">
            <div className="card">
              <div className="card-body">
                <div className="home-user home-service">
                  <div className="home-userhead">
                    <div className="home-usercount">
                      <span>
                        <i className="fas fa-parking"></i>
                      </span>
                      <h6>Parking</h6>
                    </div>
                    <div className="home-useraction">
                      <Link
                        className="delete-table bg-white"
                        to="#"
                        data-bs-toggle="dropdown"
                        aria-expanded="true"
                      >
                        <i className="fa fa-ellipsis-v" aria-hidden="true" />
                      </Link>
                      <ul
                        className="dropdown-menu"
                        data-popper-placement="bottom-end"
                      >
                        <li>
                          <Link
                            to={routes.allServices}
                            className="dropdown-item"
                          >
                            {' '}
                            View
                          </Link>
                        </li>
                        <li>
                          <Link
                            to={routes.editService}
                            className="dropdown-item"
                          >
                            {' '}
                            Edit
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="home-usercontent">
                    <div className="home-usercontents">
                      <div className="home-usercontentcount">
                        <ImageWithBasePath
                          src="assets/admin/img/icons/arrow-up.svg"
                          alt="img"
                          className="me-2"
                        />
                        <span className="counters" data-count={30}>
                          {parcCount !== null ? parcCount : 'Loading...'}
                        </span>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-sm-6 col-12 d-flex widget-path widget-service">
            <div className="card">
              <div className="card-body">
                <div className="home-user home-subscription">
                  <div className="home-userhead">
                    <div className="home-usercount">
                      <span>
                        <ImageWithBasePath
                          src="assets/admin/img/icons/money.svg"
                          alt="img"
                        />
                      </span>
                      <h6>Income</h6>
                    </div>
                    <div className="home-useraction">
                      <Link
                        className="delete-table bg-white"
                        to="#"
                        data-bs-toggle="dropdown"
                        aria-expanded="true"
                      >
                        <i className="fa fa-ellipsis-v" aria-hidden="true" />
                      </Link>
                      <ul
                        className="dropdown-menu"
                        data-popper-placement="bottom-end"
                      >
                        <li>
                          <Link
                            to={routes.membership}
                            className="dropdown-item"
                          >
                            {' '}
                            View
                          </Link>
                        </li>
                        <li>
                          <Link to="#" className="dropdown-item">
                            {' '}
                            Edit
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="home-usercontent">
                    <div className="home-usercontents">
                      <div className="home-usercontentcount">
                        <ImageWithBasePath
                          src="assets/admin/img/icons/arrow-up.svg"
                          alt="img"
                          className="me-2"
                        />
                        <span className="counters" data-count={650}>
                          ${resCountTot !== null ? resCountTot : 'Loading...'}
                        </span>
                      </div>

                    </div>

                  </div>

                </div>

              </div>
            </div>
          </div>
          <div className="col-lg-3 col-sm-6 col-12 d-flex widget-path widget-service">
            <div className="card">
              <div className="card-body">
                <div className="home-user home-service">
                  <div className="home-userhead">
                    <div className="home-usercount">
                      <span>
                        <i className="fas fa-parking"></i>
                      </span>
                      <h6>Total Reservations</h6>
                    </div>
                    <div className="home-useraction">
                      <Link
                        className="delete-table bg-white"
                        to="#"
                        data-bs-toggle="dropdown"
                        aria-expanded="true"
                      >
                        <i className="fa fa-ellipsis-v" aria-hidden="true" />
                      </Link>
                      <ul
                        className="dropdown-menu"
                        data-popper-placement="bottom-end"
                      >
                        <li>
                          <Link
                            to={routes.booking}
                            className="dropdown-item"
                          >
                            {' '}
                            View
                          </Link>
                        </li>
                        <li>
                          <Link
                            to={routes.editService}
                            className="dropdown-item"
                          >
                            {' '}
                            Edit
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="home-usercontent">
                    <div className="home-usercontents">
                      <div className="home-usercontentcount">
                        <ImageWithBasePath
                          src="assets/admin/img/icons/arrow-up.svg"
                          alt="img"
                          className="me-2"
                        />
                        <span className="counters" data-count={30}>
                          {resCount !== null ? resCount : 'Loading...'}
                        </span>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="px-3">
            <div className="row justify-content-between">
              <div className="col-lg-4 col-sm-12 d-flex widget-path mb-4">
                <div className="card">
                  <div className="card-body">
                    <div className="home-user">
                      <div className="home-head-user home-graph-header">
                        <h2>Time of Reservation</h2>
                        <Link to={routes.booking} className="btn btn-viewall">
                          View All
                          <ImageWithBasePath
                            src="assets/admin/img/icons/arrow-right.svg"
                            className="ms-2"
                            alt="img"
                          />
                        </Link>
                      </div>
                      <div className="chartgraph">
                        <div className="row align-items-center">
                          <div className="col-lg-7 col-sm-6">
                            <ReactApexChart
                              options={weekChartData.options}
                              series={weekChartData.series}
                              type="pie"
                              height={350}
                              width={200}
                            />
                          </div>
                          <div className="col-lg-5 col-sm-6">
                            <div className="bookingstatus">
                              <ul>
                                {reservationTypeLegend.map((item, index) => (
                                  <li key={index}>
                                    <span style={{ backgroundColor: item.color }} />
                                    <h6>{item.label}</h6>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>


              <div className="col-lg-4 col-sm-12 d-flex widget-path mb-4">
                <div className="card">
                  <div className="card-body">
                    <div className="home-user">
                      <div className="home-head-user home-graph-header">
                        <h2>Reservation Statistics</h2>
                        <Link to={routes.booking} className="btn btn-viewall">
                          View All
                          <ImageWithBasePath
                            src="assets/admin/img/icons/arrow-right.svg"
                            className="ms-2"
                            alt="img"
                          />
                        </Link>
                      </div>
                      <div className="chartgraph">
                        <div className="row align-items-center">
                          <div className="col-lg-7 col-sm-6">
                            <ReactApexChart
                              options={bookChartData.options}
                              series={bookChartData.series}
                              type="pie"
                              height={350}
                              width={200}
                            />
                          </div>
                          <div className="col-lg-5 col-sm-6">
                            <div className="bookingstatus">
                              <ul>
                                <li>
                                  <span style={{ backgroundColor: '#1BA345' }} />
                                  <h6>Confirmed</h6>
                                </li>
                                <li>
                                  <span style={{ backgroundColor: '#FEC001' }} />
                                  <h6>Pending</h6>
                                </li>
                                <li>
                                  <span style={{ backgroundColor: '#FF4C4C' }} />
                                  <h6>Canceled</h6>
                                </li>
                              </ul>

                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-lg-4 col-sm-12 d-flex widget-path mb-4">
                <div className="card">
                  <div className="card-body">
                    <div className="home-user">
                      <div className="home-head-user home-graph-header">
                        <h2>Reservation Statistics</h2>
                        <Link to={routes.booking} className="btn btn-viewall">
                          View All
                          <ImageWithBasePath
                            src="assets/admin/img/icons/arrow-right.svg"
                            className="ms-2"
                            alt="img"
                          />
                        </Link>
                      </div>
                      <div className="chartgraph">
                        <div className="row align-items-center">
                          <div className="col-lg-7 col-sm-6">
                            <ReactApexChart
                              options={bookChartData.options}
                              series={bookChartData.series}
                              type="pie"
                              height={350}
                              width={200}
                            />
                          </div>
                          <div className="col-lg-5 col-sm-6">
                            <div className="bookingstatus">
                              <ul>
                                <li>
                                  <span style={{ backgroundColor: '#1BA345' }} />
                                  <h6>Confirmed</h6>
                                </li>
                                <li>
                                  <span style={{ backgroundColor: '#FEC001' }} />
                                  <h6>Pending</h6>
                                </li>
                                <li>
                                  <span style={{ backgroundColor: '#FF4C4C' }} />
                                  <h6>Canceled</h6>
                                </li>
                              </ul>

                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-lg-6 col-sm-6 col-12 d-flex  widget-path">
            <div className="card">
              <div className="card-body">
                <div className="home-user">
                  <div className="home-head-user">
                    <h2>Income</h2>
                    <div className="home-select">
                      <div className="dropdown">
                        <button
                          className="btn btn-action btn-sm dropdown-toggle"
                          type="button"
                          data-bs-toggle="dropdown"
                          aria-expanded="false"
                        >
                          Monthly
                        </button>
                        <ul
                          className="dropdown-menu"
                          data-popper-placement="bottom-end"
                        >
                          <li>
                            <Link to="#" className="dropdown-item">
                              Weekly
                            </Link>
                          </li>
                          <li>
                            <Link to="#" className="dropdown-item">
                              Monthly
                            </Link>
                          </li>
                          <li>
                            <Link to="#" className="dropdown-item">
                              Yearly
                            </Link>
                          </li>
                        </ul>
                      </div>
                      <div className="dropdown">
                        <Link
                          className="delete-table bg-white"
                          to="#"
                          data-bs-toggle="dropdown"
                          aria-expanded="true"
                        >
                          <i className="fa fa-ellipsis-v" aria-hidden="true" />
                        </Link>
                        <ul
                          className="dropdown-menu"
                          data-popper-placement="bottom-end"
                        >
                          <li>
                            <Link to="#" className="dropdown-item">
                              {' '}
                              View
                            </Link>
                          </li>
                          <li>
                            <Link to="#" className="dropdown-item">
                              {' '}
                              Edit
                            </Link>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="chartgraph">
                    <ReactApexChart
                      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                      // @ts-expect-error
                      options={Revenue}
                      series={Revenue.series}
                      type="area"
                      height={350}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-6 col-sm-6 col-12 d-flex  widget-path">
            <div className="card">
              <div className="card-body">
                <div className="home-user">
                  <div className="home-head-user">
                    <h2>Reservation Summary</h2>
                    <div className="home-select">
                      <div className="dropdown">

                        <ul
                          className="dropdown-menu"
                          data-popper-placement="bottom-end"
                        >
                          <li>
                            <Link to="#" className="dropdown-item">
                              Weekly
                            </Link>
                          </li>
                          <li>
                            <Link to="#" className="dropdown-item">
                              Monthly
                            </Link>
                          </li>
                          <li>
                            <Link to="#" className="dropdown-item">
                              Yearly
                            </Link>
                          </li>
                        </ul>
                      </div>
                      <div className="dropdown">
                        <Link
                          className="delete-table bg-white"
                          to="#"
                          data-bs-toggle="dropdown"
                          aria-expanded="true"
                        >
                          <i className="fa fa-ellipsis-v" aria-hidden="true" />
                        </Link>
                        <ul
                          className="dropdown-menu"
                          data-popper-placement="bottom-end"
                        >
                          <li>
                            <Link to="#" className="dropdown-item">
                              {' '}
                              View
                            </Link>
                          </li>
                          <li>
                            <Link to="#" className="dropdown-item">
                              {' '}
                              Edit
                            </Link>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="chartgraph">

                    <ReactApexChart
                      options={chartOptions}
                      series={chartSeries}
                      type="bar"
                      height={350}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-lg-6 col-sm-12 d-flex widget-path">
            <div className="card">
              <div className="card-body">
                <div className="home-user">
                  <div className="home-head-user home-graph-header">
                    <h2>Top Parking</h2>
                    <Link to={routes.allServices} className="btn btn-viewall">
                      View All
                      <ImageWithBasePath
                        src="assets/admin/img/icons/arrow-right.svg"
                        className="ms-2"
                        alt="img"
                      />
                    </Link>
                  </div>
                  <div className="table-responsive datatable-nofooter">
                    <table className="table datatable">
                      <DataTable
                        value={topParkings}
                        paginator
                        rows={5}
                        paginatorTemplate="RowsPerPageDropdown CurrentPageReport PrevPageLink PageLinks NextPageLink"
                        currentPageReportTemplate="{first} to {last} of {totalRecords}"
                      >
                        <Column
                          header="#"
                          body={(rowData, { rowIndex }) => rowIndex + 1}
                          style={{ width: '50px' }}
                        />
                        <Column field="name" header="Name" sortable />
                        <Column field="adresse" header="Adress" sortable />
                        <Column field="totalReservations" header="Reservations" sortable />
                      </DataTable>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-6 col-sm-12 d-flex widget-path">
            <div className="card">
              <div className="card-body">
                <div className="home-user">
                  <div className="home-head-user home-graph-header">
                    <h2>Top Users</h2>
                    <Link to={routes.users} className="btn btn-viewall">
                      View All
                      <ImageWithBasePath
                        src="assets/admin/img/icons/arrow-right.svg"
                        className="ms-2"
                        alt="img"
                      />
                    </Link>
                  </div>
                  <div className="table-responsive datatable-nofooter">
                    <table className="table datatable">
                      <DataTable
                        value={topUsers}
                        paginator
                        rows={5}
                        paginatorTemplate="RowsPerPageDropdown CurrentPageReport PrevPageLink PageLinks NextPageLink"
                        currentPageReportTemplate="{first} to {last} of {totalRecords}"
                      >
                        <Column
                          header="#"
                          body={(rowData, { rowIndex }) => rowIndex + 1}
                          style={{ width: '50px' }}
                        />
                        <Column field="name" header="Name" sortable />
                        <Column field="email" header="Email" sortable />
                        <Column field="totalReservations" header="Reservations" sortable />
                      </DataTable>
                    </table>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row">

        </div>
        <div className="row">
          <div className="col-lg-12 widget-path">
            <div className="card mb-0">
              <div className="card-body">
                <div className="home-user">
                  <div className="home-head-user home-graph-header">
                    <h2>Recent Booking</h2>
                    <Link to={routes.booking} className="btn btn-viewall">
                      View All
                      <ImageWithBasePath
                        src="assets/admin/img/icons/arrow-right.svg"
                        className="ms-2"
                        alt="img"
                      />
                    </Link>
                  </div>
                  <div className="table-responsive datatable-nofooter">
                    <table className="table datatable">
                      <DataTable
                        paginatorTemplate="RowsPerPageDropdown CurrentPageReport PrevPageLink PageLinks NextPageLink  "
                        currentPageReportTemplate="{first} to {last} of {totalRecords}"
                        value={filteredReservations}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        tableStyle={{ minWidth: '50rem' }}
                      >
                        <Column header="User" body={renderUserDetails} />
                        <Column field="startDate" header="Start Date" sortable />
                        <Column field="endDate" header="End Date" sortable />
                        <Column field="totalPrice" header="Total Price" sortable />
                        <Column header="Parking" body={(rowData) => rowData.parking?.nom || '—'} />
                        <Column header="Address" body={(rowData) => rowData.parking?.adresse || '—'} />
                        <Column header="Spot" body={(rowData) => rowData.parkingS?.numero || '—'} />
                        <Column field="status" header="Status" body={renderStatusBadge} sortable />

                      </DataTable>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;