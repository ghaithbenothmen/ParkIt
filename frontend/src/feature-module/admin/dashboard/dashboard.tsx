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
import { format } from 'date-fns';
import TruncatedAddress from './TruncatedAddress';

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
  userId: string;
  user?: {
    firstname: string;
    email: string;
  };
}

const Dashboard = () => {
  const routes = all_routes;

  const [userCount, setUserCount] = useState(null);
  const [parcCount, setParcCount] = useState(null);
  const [reservationStat, setReservationStat] = useState(null);
  const [reservationSummary, setReservationSummary] = useState<number[]>(Array(12).fill(0));
  const [incomeSummary, setIncomeSummary] = useState<number[]>(Array(12).fill(0));
  const [resCount, setResCount] = useState(null);
  const [resCountTot, setResCountTot] = useState(null);
  const [topUsers, setTopUsers] = useState(null);
  const [topParkings, setTopParkings] = useState(null);
  const [reservationWeekendStat, setReservationWeekendStat] = useState<number | null>(null);
  const reservationTypeLegend = [
    { color: '#4169E1', label: 'Weekday' },
    { color: '#87CEEB', label: 'Weekend' },
  ];
  const [weekChartData, setWeekChartData] = useState({
    series: [],
    options: {
      chart: {
        width: 700,
        type: 'pie',
      },
      labels: ['Weekday', 'Weekend'],
      legend: {
        position: 'bottom',
      },
      colors: ['#4169E1', '#87CEEB'],
    },
  });
  const [bookChartData, setBookChartData] = useState({
    series: [],
    options: {
      chart: {
        width: 700,
        type: 'pie',
      },
      labels: ['Confirmed', 'Canceled', 'Pending'],
      colors: ['#1e4fdd', '#87CEEB', '#0a2b7b'],
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
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/reservations/total`);
      setResCountTot(response.data.totalPrice);
    } catch (error) {
      console.error('Error fetching total reservation amount:', error);
    }
  };

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/reservations`);
        console.log("Fetched reservations:", res.data);
        setReservations(res.data.data);
      } catch (error) {
        console.error("Failed to fetch reservations:", error);
      }
    };
    fetchReservations();
  }, []);

  useEffect(() => {
    const fetchParkings = async () => {
      const updatedReservations = [...reservations];
      let hasChanges = false;

      for (let i = 0; i < updatedReservations.length; i++) {
        const reservation = updatedReservations[i];
        if (reservation.parkingId && !reservation.parking) {
          try {
            const parkingRes = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/parking/${reservation.parkingId}`);
            updatedReservations[i].parking = parkingRes.data;
            hasChanges = true;
          } catch (error) {
            console.error('Error fetching parking details for reservation:', reservation._id, error);
          }
        }
      }

      if (hasChanges) {
        setReservations(updatedReservations);
      }
    };
    if (reservations.length > 0) {
      fetchParkings();
    }
  }, [reservations]);

  const fetchReservationWeekendStat = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/reservations/weekend`);
      console.log('Weekend Reservations:', response.data);
      const data = response.data.count;
      setReservationWeekendStat(data);
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
      let hasChanges = false;

      for (let i = 0; i < updatedReservations.length; i++) {
        const reservation = updatedReservations[i];
        if (reservation.parkingSpot && !reservation.parkingS) {
          try {
            console.log(`Fetching parking spot for ID: ${reservation.parkingSpot}`);
            const spotRes = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/parking-spots/${reservation.parkingSpot}`);
            console.log("Parking spot fetched:", spotRes.data);
            updatedReservations[i].parkingS = spotRes.data.data;
            hasChanges = true;
          } catch (error) {
            console.error('Error fetching parking spot for reservation:', reservation._id, error);
          }
        }
      }

      if (hasChanges) {
        setReservations(updatedReservations);
      }
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
    } else if (rowData.status === 'Pending') {
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
        badgeClass = 'badge bg-success';
        break;
      case 'pending':
        badgeClass = 'badge bg-primary';
        break;
      case 'over':
        badgeClass = 'badge bg-danger';
        break;
      default:
        badgeClass = 'badge bg-secondary';
    }
    return <span className={badgeClass}>{label}</span>;
  };

  useEffect(() => {
    const fetchUserDetails = async () => {
      const updatedReservations = [...reservations];
      const fetchedUserIds = new Set();
      let hasChanges = false;

      for (let i = 0; i < updatedReservations.length; i++) {
        const reservation = updatedReservations[i];
        if (reservation.userId && !reservation.user && !fetchedUserIds.has(reservation.userId)) {
          try {
            const userRes = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/users/${reservation.userId}`);
            updatedReservations[i].user = {
              firstname: userRes.data.firstname,
              email: userRes.data.email,
            };
            fetchedUserIds.add(reservation.userId);
            hasChanges = true;
          } catch (error) {
            console.error('Error fetching user details for reservation:', reservation._id, error);
          }
        }
      }

      if (hasChanges) {
        setReservations(updatedReservations);
      }
    };

    if (reservations.length > 0) {
      fetchUserDetails();
    }
  }, [reservations]);

  const fetchUserCount = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/users/users/count`);
      setUserCount(response.data.count);
    } catch (error) {
      console.error('Error fetching user count:', error);
    }
  };

  const fetchParkingCount = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/parking/parc/count`);
      setParcCount(response.data.count);
    } catch (error) {
      console.error('Error fetching parc count:', error);
    }
  };

  const fetchReservationSummary = () => {
    const counts = Array(12).fill(0);
    reservations.forEach(reservation => {
      const date = new Date(reservation.startDate);
      const month = date.getMonth();
      counts[month]++;
    });
    setReservationSummary(counts);
  };

  const fetchIncomeSummary = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/reservations/reservation-summary`);
      setIncomeSummary(response.data.count);
    } catch (error) {
      console.error('Error fetching income summary:', error);
    }
  };

  const fetchResCount = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/reservations/count`);
      setResCount(response.data.count);
    } catch (error) {
      console.error('Error fetching reservation count:', error);
    }
  };

  const fetchReservationStat = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/reservations/reservation-statistics`);
      const data = response.data.count;
      setReservationStat(data);
      console.log('Reservation Statistics:', data);
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
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/reservations/top-users`);
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
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/reservations/top-parkings`);
        setTopParkings(response.data.topParkings);
      } catch (error) {
        console.error('Error fetching top parkings:', error);
      }
    };
    fetchTopParkings();
  }, []);

  useEffect(() => {
    fetchReservationWeekendStat();
    fetchUserCount();
    fetchResCount();
    fetchResCountTot();
    fetchParkingCount();
    fetchReservationStat();
    fetchIncomeSummary();
  }, []);

  useEffect(() => {
    fetchReservationSummary();
  }, [reservations]);

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
        <ImageWithBasePath src={rowData.serviceImg} className="me-2" alt="img" />
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
        <ImageWithBasePath src={rowData.providerImg} className="me-2" alt="img" />
        <span>{provider}</span>
      </Link>
    );
  };

  const data1 = useSelector((state: AdminDashboardOne) => state.admin_dashboard_1);
  const data2 = useSelector((state: AdminDashboardTwo) => state.admin_dashboard_2);

  const Revenue = {
    series: [
      {
        name: 'series1',
        data: [11, 32, 45, 32, 34, 52, 41],
        colors: ['#4169E1'],
      },
      {
        name: 'series2',
        colors: ['#4169E1'],
        data: [31, 40, 28, 51, 42, 109, 100],
      },
    ],
    chart: {
      height: 350,
      type: 'area',
    },
    fill: {
      colors: ['#4169E1', '#4169E1'],
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
      colors: ['#4169E1'],
    },
    xaxis: {
      type: 'month',
      categories: ['jan', 'feb', 'march', 'april', 'may', 'june', 'july'],
    },
    tooltip: {},
  };

  const reservationChartOptions = {
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
        text: 'RESERVATIONS',
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

  const reservationChartSeries = [
    {
      name: 'Reservations',
      type: 'column',
      data: reservationSummary,
    },
  ];

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
        text: 'DINARS',
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
      data: incomeSummary,
    },
    {
      name: 'Revenue',
      data: [],
    },
    {
      name: 'Free Cash Flow',
      data: [],
    },
  ];

  const renderUserDetails = (rowData: Reservation) => {
    return rowData.user ? (
      <div>
        <div>{rowData.user.firstname}</div>
        <div>{rowData.user.email}</div>
      </div>
    ) : (
      '—'
    );
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'yyyy-MM-dd hha');
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

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
                        <ImageWithBasePath src="assets/admin/img/icons/user.svg" alt="img" />
                      </span>
                      <h6>Total User</h6>
                    </div>
                  </div>
                  <div className="home-usercontent">
                    <div className="home-usercontents">
                      <div className="home-usercontentcount">
                        <ImageWithBasePath src="assets/admin/img/icons/arrow-up.svg" alt="img" className="me-2" />
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
                      <span><i className="fas fa-parking"></i></span>
                      <h6>Parking</h6>
                    </div>
                  </div>
                  <div className="home-usercontent">
                    <div className="home-usercontents">
                      <div className="home-usercontentcount">
                        <ImageWithBasePath src="assets/admin/img/icons/arrow-up.svg" alt="img" className="me-2" />
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
                      <span><ImageWithBasePath src="assets/admin/img/icons/money.svg" alt="img" /></span>
                      <h6>Income</h6>
                    </div>
                  </div>
                  <div className="home-usercontent">
                    <div className="home-usercontents">
                      <div className="home-usercontentcount">
                        <ImageWithBasePath src="assets/admin/img/icons/arrow-up.svg" alt="img" className="me-2" />
                        <span className="counters" data-count={650}>
                          {resCountTot !== null ? resCountTot : 'Loading...'} DT
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
                      <span><i className="fas fa-parking"></i></span>
                      <h6>Total Reservations</h6>
                    </div>
                  </div>
                  <div className="home-usercontent">
                    <div className="home-usercontents">
                      <div className="home-usercontentcount">
                        <ImageWithBasePath src="assets/admin/img/icons/arrow-up.svg" alt="img" className="me-2" />
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
              <div className="col-lg-6 col-sm-12 d-flex widget-path mb-4">
                <div className="card" style={{ background: 'linear-gradient(135deg, #f0f4f8, #e0e7f0)', borderRadius: '15px' }}>
                  <div className="card-body p-4">
                    <div className="home-user">
                      <div className="home-head-user home-graph-header">
                        <h2 className="text-xl font-semibold text-gray-800">Time of Reservation</h2>
                        <Link to={routes.booking} className="btn btn-viewall text-white" style={{ backgroundColor: '#4169E1' }}>
                          View All
                          <i className="fas fa-arrow-right ms-2"></i>
                        </Link>
                      </div>
                      <div className="chartgraph">
                        <div className="row align-items-center">
                          <div className="col-lg-8 col-sm-6">
                            <ReactApexChart
                              options={weekChartData.options}
                              series={weekChartData.series}
                              type="pie"
                              height={300}
                              width={250}
                            />
                          </div>
                          <div className="col-lg-4 col-sm-6">
                            <div className="bookingstatus">
                              <ul className="space-y-2">
                                {reservationTypeLegend.map((item, index) => (
                                  <li key={index} className="flex items-center">
                                    <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }} />
                                    <h6 className="text-sm text-gray-700">{item.label}</h6>
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
              <div className="col-lg-6 col-sm-12 d-flex widget-path mb-4">
                <div className="card" style={{ background: 'linear-gradient(135deg, #f0f4f8, #e0e7f0)', borderRadius: '15px' }}>
                  <div className="card-body p-4">
                    <div className="home-user">
                      <div className="home-head-user home-graph-header">
                        <h2 className="text-xl font-semibold text-gray-800">Reservation Statistics</h2>
                        <Link to={routes.booking} className="btn btn-viewall text-white" style={{ backgroundColor: '#4169E1' }}>
                          View All
                          <i className="fas fa-arrow-right ms-2"></i>
                        </Link>
                      </div>
                      <div className="chartgraph">
                        <div className="row align-items-center">
                          <div className="col-lg-8 col-sm-6">
                            <ReactApexChart
                              options={bookChartData.options}
                              series={bookChartData.series}
                              type="pie"
                              height={300}
                              width={250}
                            />
                          </div>
                          <div className="col-lg-4 col-sm-6">
                            <div className="bookingstatus">
                              <ul className="space-y-2">
                                <li className="flex items-center"><span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: '#1e4fdd' }} /><h6 className="text-sm text-gray-700">Confirmed</h6></li>
                                <li className="flex items-center"><span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: '#87CEEB' }} /><h6 className="text-sm text-gray-700">Canceled</h6></li>
                                <li className="flex items-center"><span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: '#0a2b7b' }} /><h6 className="text-sm text-gray-700">Pending</h6></li>
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
          <div className="col-lg-6 col-sm-6 col-12 d-flex widget-path">
            <div className="card" style={{ background: 'linear-gradient(135deg, #f0f4f8, #e0e7f0)', borderRadius: '15px' }}>
              <div className="card-body p-4">
                <div className="home-user">
                  <div className="home-head-user">
                    <h2 className="text-xl font-semibold text-gray-800">Reservations Summary</h2>
                    <div className="home-select">
                    </div>
                  </div>
                  <div className="chartgraph">
                    <ReactApexChart
                      options={reservationChartOptions}
                      series={reservationChartSeries}
                      type="bar"
                      height={350}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-6 col-sm-6 col-12 d-flex widget-path">
            <div className="card" style={{ background: 'linear-gradient(135deg, #f0f4f8, #e0e7f0)', borderRadius: '15px' }}>
              <div className="card-body p-4">
                <div className="home-user">
                  <div className="home-head-user">
                    <h2 className="text-xl font-semibold text-gray-800">Income</h2>
                    <div className="home-select">
                      <div className="dropdown">
                        <ul className="dropdown-menu" data-popper-placement="bottom-end">
                          <li><Link to="#" className="dropdown-item">Weekly</Link></li>
                          <li><Link to="#" className="dropdown-item">Monthly</Link></li>
                          <li><Link to="#" className="dropdown-item">Yearly</Link></li>
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
            <div className="card" style={{ background: 'linear-gradient(135deg, #f0f4f8, #e0e7f0)', borderRadius: '15px' }}>
              <div className="card-body p-4">
                <div className="home-user">
                  <div className="home-head-user home-graph-header">
                    <h2 className="text-xl font-semibold text-gray-800">Top Parking</h2>
                    <Link to={routes.allServices} className="btn btn-viewall text-white" style={{ backgroundColor: '#4169E1' }}>
                      View All
                      <i className="fas fa-arrow-right ms-2"></i>
                    </Link>
                  </div>
                  <div className="table-responsive datatable-nofooter">
                    <table className="table datatable">
                      <DataTable
                        value={topParkings}
                        paginator
                        rows={5}
                        paginatorTemplate="RowsPerPageDropdown CurrentPageReport PrevPageLink PageLinks NextPageLink Instantiating"
                        currentPageReportTemplate="{first} to {last} of {totalRecords}"
                      >
                        <Column header="#" body={(rowData, { rowIndex }) => rowIndex + 1} style={{ width: '50px' }} />
                        <Column field="name" header="Name" sortable />
                        <Column
                          header="Address"
                          body={(rowData) => <TruncatedAddress address={rowData.adresse} />}
                          sortable
                        />
                        <Column field="totalReservations" header="Reservations" sortable />
                      </DataTable>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-6 col-sm-12 d-flex widget-path">
            <div className="card" style={{ background: 'linear-gradient(135deg, #f0f4f8, #e0e7f0)', borderRadius: '15px' }}>
              <div className="card-body p-4">
                <div className="home-user">
                  <div className="home-head-user home-graph-header">
                    <h2 className="text-xl font-semibold text-gray-800">Top Users</h2>
                    <Link to={routes.users} className="btn btn-viewall text-white" style={{ backgroundColor: '#4169E1' }}>
                      View All
                      <i className="fas fa-arrow-right ms-2"></i>
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
                        <Column header="#" body={(rowData, { rowIndex }) => rowIndex + 1} style={{ width: '50px' }} />
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
          <div className="col-lg-12 widget-path">
            <div className="card mb-0" style={{ background: 'linear-gradient(135deg, #f0f4f8, #e0e7f0)', borderRadius: '15px' }}>
              <div className="card-body p-4">
                <div className="home-user">
                  <div className="home-head-user home-graph-header">
                    <h2 className="text-xl font-semibold text-gray-800">Recent Booking</h2>
                    <Link to={routes.booking} className="btn btn-viewall text-white" style={{ backgroundColor: '#4169E1' }}>
                      View All
                      <i className="fas fa-arrow-right ms-2"></i>
                    </Link>
                  </div>
                  <div className="table-responsive datatable-nofooter">
                    <table className="table datatable">
                      <DataTable
                        paginatorTemplate="RowsPerPageDropdown CurrentPageReport PrevPageLink PageLinks NextPageLink"
                        currentPageReportTemplate="{first} to {last} of {totalRecords}"
                        value={filteredReservations}
                        paginator
                        rows={5}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        tableStyle={{ minWidth: '50rem' }}
                      >
                        <Column header="User" body={renderUserDetails} />
                        <Column
                          header="Start Date"
                          body={(rowData) => formatDate(rowData.startDate)}
                          sortable
                        />
                        <Column
                          header="End Date"
                          body={(rowData) => formatDate(rowData.endDate)}
                          sortable
                        />
                        <Column 
                          field="totalPrice" 
                          header="Total Price" 
                          sortable
                          body={(rowData) => `${rowData.totalPrice} DT`}
                        />
                        <Column header="Parking" body={(rowData) => rowData.parking?.nom || '—'} />
                        <Column
                          header="Address"
                          body={(rowData) => <TruncatedAddress address={rowData.parking?.adresse} />}
                        />
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