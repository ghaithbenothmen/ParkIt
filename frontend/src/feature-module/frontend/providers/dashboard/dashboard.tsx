import React, { useState, useEffect } from 'react';
import ImageWithBasePath from '../../../../core/img/ImageWithBasePath';
import { all_routes } from '../../../../core/data/routes/all_routes';
import { Link } from 'react-router-dom';
import ReactApexChart from 'react-apexcharts';
import { jwtDecode } from 'jwt-decode';
import axios from "axios";
import 'react-datepicker/dist/react-datepicker.css';

import Calendar from 'react-calendar';
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
  createdAt: string;
  updatedAt: string;
}


const ProviderDashboard = () => {
  const routes = all_routes;
  const [showModal, setShowModal] = useState(false);
  const [value, onChange] = useState(new Date());
  const [parkings, setParkings] = useState<Parking[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [reservation, setReservation] = useState<Reservation[]>([]);
  const [userInfo, setUserInfo] = useState({
    _id: '',
    firstname: '',
    lastname: '',
    email: '',
    phone: ''
  });
  const [reservationCount, setReservationCount] = useState({
    Monday: 0,
    Tuesday: 0,
    Wednesday: 0,
    Thursday: 0,
    Friday: 0,
    Saturday: 0,
    Sunday: 0,
    totalReservations: 0, // New field for the total reservations count
  });
  useEffect(() => {
    const fetchWeeklyReservationCount = async () => {
      if (userInfo._id) {
        try {
          const res = await axios.get(`http://localhost:4000/api/reservations/countweek/${userInfo._id}`);
          const data = res.data.data;

          const totalReservations = Object.values(data).reduce((acc, val) => acc + val, 0);

          setReservationCount({
            ...data,
            totalReservations,
          });
        } catch (error) {
          console.error("Failed to fetch weekly reservation count:", error);
        }
      }
    };

    fetchWeeklyReservationCount();
  }, [userInfo._id]);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;  // example: "2025-04-17"
  };

  const handleDateChange = async (date: Date) => {
    onChange(date); // update the calendar's selected date

    if (userInfo._id && date) {
      try {
        const formattedDate = formatDate(date); // '2025-04-16'
        const res = await axios.get(`http://localhost:4000/api/reservations/userdate`, {
          params: {
            userId: userInfo._id,
            startDate: formattedDate,
          },
        });

        setReservation(res.data.data); // update reservations for selected date
      } catch (error) {
        console.error('Failed to fetch reservations for selected date:', error);
        setReservation([]); // Clear reservations if error
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
            phone: user.phone || ''
          });
        } else {
          const decoded: any = jwtDecode(storedUser);
          setUserInfo({
            _id: decoded._id || '',
            firstname: decoded.firstname || '',
            lastname: decoded.lastname || '',
            email: decoded.email || '',
            phone: decoded.phone || ''
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
          const res = await axios.get(`http://localhost:4000/api/reservations/by-user/${userInfo._id}`);
          setReservations(res.data.data);
        } catch (error) {
          console.error("Failed to fetch reservations:", error);
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
    // Calculate counts whenever reservations change
    if (reservations.length > 0) {
      const counts = countReservationsByStatus(reservations);
      setReservationCounts(counts);
    }
  }, [reservations]); // Only rerun when reservations change
  const percentagePending = Math.round((reservationCounts.pending / (reservationCounts.confirmed + reservationCounts.pending + reservationCounts.over)) * 100);
  const percentageConfirmed = Math.round((reservationCounts.confirmed / (reservationCounts.confirmed + reservationCounts.pending + reservationCounts.over)) * 100);
  const percentageOver = Math.round((reservationCounts.over / (reservationCounts.confirmed + reservationCounts.pending + reservationCounts.over)) * 100);
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
    series: [{
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
    }],
  };
  const handleClose = () => {
    setShowModal(false);
  };
  const handelOpen = () => {
    setShowModal(true);
  };
  const [sCol] = useState<any>({
    series: [{
      name: 'Tasks',
      data: [12, 19, 15, 20, 14] // Example data for each day
    }],
    chart: {
      type: 'bar',
      height: 140
    },
    colors: ['#4A00E5'],
    plotOptions: {
      bar: {
        borderRadius: 5,
        // horizontal: false,
      },
    },
    dataLabels: {
      enabled: false
    },
    xaxis: {
      categories: ['M', 'T', 'W', 'T', 'F'],
    },

    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 300
        },
        legend: {
          position: 'bottom'
        },
        plotOptions: {
          bar: {
            borderRadius: 3,
          },
        },
      }
    }]
  })
  const [sCol2] = useState<any>({
    series: [{
      name: "sales",
      colors: ['#FFC38F'],
      data: [{
        x: 'Inpipeline',
        y: 400,

      }, {
        x: 'Follow Up',
        y: 130
      }, {
        x: 'Schedule',
        y: 248
      }, {
        x: 'Conversation',
        y: 470
      }, {
        x: 'Won',
        y: 470
      }, {
        x: 'Lost',
        y: 180
      }]
    }],
    chart: {
      type: 'bar',
      height: 260,
    },
    plotOptions: {
      bar: {
        borderRadiusApplication: 'around',
        columnWidth: '40%',
      }
    },
    colors: ['#00918E'],
    xaxis: {
      type: 'category',
      group: {
        style: {
          fontSize: '7px',
          fontWeight: 700,
        },
      }
    },
  })
  return (
    <>
      {/* Page Wrapper */}
      <div className="page-wrapper">
        <div className="content container-fluid pb-0">
          <div className="row justify-content-center">
            <div className="col-xxl-3 col-md-6">
              <div className="row flex-fill">
                <div className="col-12">
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
                          {percentagePending}% <i className="ti ti-arrow-badge-up-filled" />
                        </span>
                        from All Reservations
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-12">
                  <div className="card prov-widget">
                    <div className="card-body">
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="mb-2">
                          <p className="mb-1">Completed Reservations</p>
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
                          {percentageConfirmed}% <i className="ti ti-arrow-badge-down-filled" />
                        </span>
                        from All Reservations
                      </p>
                    </div>
                  </div>
                </div>
                <div className="col-12">
                  <div className="card prov-widget">
                    <div className="card-body">
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="mb-2">
                          <p className="mb-1">Canceled Reservations</p>
                          <h5>
                            <span className="counter">{reservationCounts.over}</span>+
                          </h5>
                        </div>
                        <span className="prov-icon bg-danger d-flex justify-content-center align-items-center rounded">
                          <i className="ti ti-calendar-check" />
                        </span>
                      </div>
                      <p className="fs-12">
                        <span className="text-danger me-2">{percentageOver}%</span>from All
                        Reservations
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
                        {reservationCount.totalReservations} <span className="text-success"><i className="ti ti-arrow-badge-up-filled" /></span>
                      </h5>
                      <p className="fs-12 text-center">
                        Total Reservations this week
                      </p>
                    </div>
                    <div id="daily-chart">
                      <ReactApexChart
                        options={chartOptions}
                        series={chartData.series}
                        type="bar"
                        height={140}
                      />
                    </div>
                    <div className="d-flex justify-content-center flex-column">
                      <span className="text-success text-center fs-12 mb-4">
                        Performance is 30% better last month
                      </span>
                      <Link
                        to={routes.providerBooking}
                        className="btn btn-dark"
                      >
                        View All Reservations
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xxl-6 d-flex">
              <div className="card flex-fill">
                <div className="card-body">
                  <h6 className="mb-3">Badge</h6>
                  <div className=" bg-light-300 rounded p-3 mb-3">
                    <div className="d-flex justify-content-between flex-wrap row-gap-2 mb-2">
                      <span className="badge badge-success">
                        <i className="ti ti-point-filled" />
                        Current Plan
                      </span>
                      <span className="badge bg-info-transparent">
                        Renewal Date : 14 Jan 2025
                      </span>
                    </div>
                    <div className="mb-2">
                      <p className="mb-0 text-dark fw-medium">Standard Plan</p>
                      <span>Our most popular plan for our users.</span>
                    </div>
                    <div className="d-flex mb-2">
                      <h5 className="me-2">$291</h5>
                      <span>Per user/Year</span>
                    </div>
                    <div className="">
                      <div className="row justify-content-between">
                        <div className="col-md-6">
                          <Link
                            to="#"
                            className="btn btn-dark w-100 mb-3 mb-md-0"
                          >
                            See Plans
                          </Link>
                        </div>
                        <div className="col-md-6">
                          <Link to="#" className="btn btn-white w-100">
                            Cancel Plan
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-light-500 rounded p-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <div className="">
                        <p className="mb-0 text-dark fw-medium">
                          Standard Plan
                        </p>
                        <span className="d-block mb-2">
                          Our most popular plan for small teams.
                        </span>
                        <Link
                          to={routes.providerSubscription}
                          className="text-info d-block"
                        >
                          View All Plans
                        </Link>
                      </div>
                      <div className="d-flex">
                        <h5>$291 </h5>
                        <span> /Year</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xxl-4 col-md-6 d-flex">
              <div className="card flex-fill">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h6>Top Parkings</h6>
                    <Link to={routes.map} className="btn border">
                      View All
                    </Link>
                  </div>

                  {/* List Parkings */}
                  {parkings.map((parking) => (
                    <div
                      key={parking._id}
                      className="d-flex justify-content-between align-items-center mb-3"
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
                            <span className="text-truncate me-3" style={{ maxWidth: '200px' }}>
                              {parking.adresse}
                            </span>
                            <div className="d-flex align-items-center gap-3">
                              <span>{parking.nbr_place} spots</span>
                              <span>
                                <i className="ti ti-star-filled text-warning me-1" />
                                4.9
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
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h6>Bookings</h6>
                    <Link to={routes.bookings} className="btn border">
                      View All
                    </Link>
                  </div>
                  <div id="datetimepickershow " >
                    <Calendar onChange={handleDateChange} value={value} />
                  </div>
                  <div className="book-crd">
                    {reservation.length > 0 ? (
                      reservation.map((reservation) => (
                        <div className="card" key={reservation._id}>
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center flex-wrap row-gap-2">
                              <div className="d-flex align-items-center">
                                <Link
                                  to={routes.bookingDetails}
                                  className="avatar avatar-lg flex-shrink-0 me-2"
                                >
                                  <ImageWithBasePath
                                    src="assets/img/parking.jpg"
                                    className="rounded-circle"
                                    alt="Img"
                                  />
                                </Link>
                                <div>
                                  <Link
                                    to={routes.bookingDetails}
                                    className="fw-medium"
                                  >
                                    {reservation.parking?.nom || 'Parking'}
                                  </Link>
                                  <span className="d-block fs-12">
                                    <i className="ti ti-clock me-1" />
                                    {new Date(reservation.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(reservation.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                      <p>No reservations for this date.</p>
                    )}
                  </div>

                </div>
              </div>
            </div>
            <div className="col-xxl-4 col-md-6 d-flex">
              <div className="card flex-fill">
                <div className="card-body">
                  <h6 className="mb-4">Top Locations</h6>
                  <div id="deals-chart" >
                    <ReactApexChart
                      options={sCol2}
                      series={sCol2.series}
                      type="bar"
                      height={275}
                    />
                  </div>
                  <div>
                    <p>Top Locations &amp; Users</p>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div className="d-flex">
                        <span className="avatar avatar-lg me-2">
                          <ImageWithBasePath
                            src="assets/img/icons/flag-01.svg"
                            className="rounded-circle "
                            alt="flag"
                          />
                        </span>
                        <div>
                          <p className="text-dark fw-medium mb-0">
                            Saudi Arabia
                          </p>
                          <span className="fs-12">California</span>
                        </div>
                      </div>
                      <span className="badge badge-info">
                        <i className="ti ti-point-filled" />
                        300 Bookings
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6 d-flex">
              <div className="card flex-fill">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h6>Latest Reviews</h6>
                    <Link to={routes.providerReview} className="btn border">
                      View All
                    </Link>
                  </div>
                  <div className=" border-bottom pb-3 mb-3">
                    <div className="d-flex justify-content-between align-items-center flex-wrap row-gap-2">
                      <div className="d-flex">
                        <Link
                          to="#"
                          className="avatar avatar-lg flex-shrink-0 me-2"
                        >
                          <ImageWithBasePath
                            src="assets/img/profiles/avatar-01.jpg"
                            className="rounded-circle"
                            alt="Img"
                          />
                        </Link>
                        <div>
                          <Link
                            to={routes.providerReview}
                            className="fw-medium"
                          >
                            Maude Rossi
                          </Link>
                          <div className="d-flex align-items-center">
                            <p className="fs-12 mb-0 pe-2 border-end">
                              For{' '}
                              <span className="text-info">
                                Plumbing installation
                              </span>
                            </p>
                            <span className="avatar avatar-sm mx-2">
                              <ImageWithBasePath
                                src="assets/img/user/user-03.jpg"
                                className="img-fluid rounded-circle"
                                alt="user"
                              />
                            </span>
                            <span className="fs-12">rebecca</span>
                          </div>
                        </div>
                      </div>
                      <div className="d-flex">
                        <span className="text-warning fs-10 me-1">
                          <i className="ti ti-star-filled filled" />
                          <i className="ti ti-star-filled filled" />
                          <i className="ti ti-star-filled filled" />
                          <i className="ti ti-star-filled filled" />
                          <i className="ti ti-star-filled filled" />
                        </span>
                        <span className="fs-12">4.9</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6 d-flex">
              <div className="card flex-fill">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center flex-wrap row-gap-2 mb-4">
                    <h6>Highly Rated Parkings</h6>
                    <Link to="#" className="btn border" onClick={handelOpen}>
                      View All
                    </Link>
                  </div>
                  <div className="d-flex justify-content-between align-items-center border-bottom flex-wrap row-gap-2 pb-3 mb-3">
                    <div className="d-flex">
                      <Link
                        to={routes.map}
                        className="avatar avatar-lg me-2"
                      >
                        <ImageWithBasePath
                          src="assets/img/profiles/avatar-20.jpg"
                          className="rounded-circle"
                          alt="Img"
                        />
                      </Link>
                      <div>
                        <Link to={routes.staffDetails} className="fw-medium">
                          Maude Rossi
                        </Link>
                        <div className="fs-12 d-flex align-items-center gap-2">
                          <span className="pe-2 border-end">Plumber</span>
                          <span>
                            <i className="ti ti-star-filled text-warning me-1" />
                            4.9
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className="badge badge-info">
                      <i className="ti ti-point-filled" />
                      300 Bookings
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Page Wrapper */}
    </>
  );
};

export default ProviderDashboard;
