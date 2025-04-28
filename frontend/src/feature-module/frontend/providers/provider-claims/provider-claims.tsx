import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ImageWithBasePath from '../../../../core/img/ImageWithBasePath';
import { all_routes } from '../../../../core/data/routes/all_routes';
import BookingModals from '../../customers/common/bookingModals';
import { customerOption, serviceOption, staffOption } from '../../../../core/data/json/dropDownData';
import CustomDropdown from '../../common/dropdown/commonSelect';
import CommonDatePicker from '../../../../core/hooks/commonDatePicker';
import PaymentButton from '../../home/new-home/PaymentButton';
import { jwtDecode } from 'jwt-decode';

// adjust as needed
import axios from "axios";
interface Claim {
    _id: string;
    utilisateurId: string; // Reference to the user ID
    parkingId: {
        _id: string;
        nom: string; // Name of the parking
        adresse: string; // Address of the parking
      };    claimType: 'Place Occupée' | 'Problème Paiement' | 'Sécurité' | 'Autre'; // Enum values for the claim type
    photoEvidence?: string; // Optional URL for photo evidence
    statut: 'Validée' | 'Pending' | 'Résolue' | 'Refusée'; // Enum values for the status
    dateSoumission: string; // Date of submission (ISO string)
    priorite: number; // Priority score
    message?: string; // Optional message from the user
    feedback?: string; // Optional feedback for the claim
  }
  
const ProviderClaims = () => {
  const routes = all_routes;
  const [selectedItems, setSelectedItems] = useState(Array(10).fill(false));
  const handleItemClick = (index: number) => {
    setSelectedItems((prevSelectedItems) => {
      const updatedSelectedItems = [...prevSelectedItems];
      updatedSelectedItems[index] = !updatedSelectedItems[index]; 
      return updatedSelectedItems;
    });
  };
  const [parkings, setParkings] = useState<Record<string, { nom: string; image: string; adresse: string }>>({});
  const [claims, setClaims] = useState<Claim[]>([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [userInfo, setUserInfo] = useState({
    _id: '',
    firstname: '',
    lastname: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        // Is it a JWT token or JSON object?
        if (storedUser.startsWith('{')) {
          // It's a JSON string (not a token)
          const user = JSON.parse(storedUser);
          console.log("Loaded user object from localStorage:", user);
          setUserInfo({
            _id: user._id || '',
            firstname: user.firstname || '',
            lastname: user.lastname || '',
            email: user.email || '',
            phone: user.phone || ''
          });
        } else {
          // It's probably a JWT token
          const decoded: any = jwtDecode(storedUser);
          console.log("Decoded user from JWT token:", decoded);
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
  /*const filteredReservations = reservations.filter(reservation => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'confirmed' && reservation.status === 'confirmed') return true;
    if (filterStatus === 'pending' && reservation.status === 'pending') return true;
    if (filterStatus === 'over' && reservation.status === 'over') return true;
    return false;
  });
*/
  useEffect(() => {
    const fetchClaims = async () => {
      if (userInfo._id) {
      try {
        const res = await axios.get(`http://localhost:4000/api/claims/by-user/${userInfo._id}`);
        console.log("Fetched reservations:", res.data);

        setClaims(res.data);  // Access the array inside 'data'
      } catch (error) {
        console.error("Failed to fetch claims:", error);
      }
    }
    };

    fetchClaims();
  }, [userInfo._id]);
 /* useEffect(() => {
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
  }, [reservations]);*/
 /* useEffect(() => {
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
  }, [reservations]);*/
  /*const countReservationsByStatus = (reservations: Reservation[]) => {
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
  };*/
  const [reservationCounts, setReservationCounts] = useState({
    confirmed: 0,
    pending: 0,
    over: 0,
  });

  /*useEffect(() => {
    // Calculate counts whenever reservations change
    if (reservations.length > 0) {
      const counts = countReservationsByStatus(reservations);
      setReservationCounts(counts);
    }
  }, [reservations]); // Only rerun when reservations change*/
  const percentagePending = Math.round((reservationCounts.pending / (reservationCounts.confirmed + reservationCounts.pending + reservationCounts.over)) * 100);
  const percentageConfirmed = Math.round((reservationCounts.confirmed / (reservationCounts.confirmed + reservationCounts.pending + reservationCounts.over)) * 100);
  const percentageOver = Math.round((reservationCounts.over / (reservationCounts.confirmed + reservationCounts.pending + reservationCounts.over)) * 100);


  return (
    <>
      {/* Page Wrapper */}
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
                        <p className="mb-1">Pending Reservation</p>
                        <h5>
                          <span className="counter">{reservationCounts.pending}</span>+
                        </h5>
                      </div>
                      <span className="prov-icon bg-info d-flex justify-content-center align-items-center rounded">
                        <i className="ti ti-calendar-check" />
                      </span>
                    </div>
                    <p className="fs-12">
                      <span className="text-info me-2">
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
          <h4>Claim List</h4>
          <div className="d-flex align-items-center flex-wrap row-gap-3">
            <span className="fs-14 me-2">Sort With Status</span>
            <div className="dropdown me-2">
              <Link to="#" className="dropdown-toggle" data-bs-toggle="dropdown">
                All
              </Link>
              <div className="dropdown-menu">
                <Link to="#" className="dropdown-item" onClick={() => setFilterStatus('all')}>
                  All
                </Link>
                <Link to="#" className="dropdown-item" onClick={() => setFilterStatus('confirmed')}>
                  Confirmed
                </Link>
                <Link to="#" className="dropdown-item" onClick={() => setFilterStatus('pending')}>
                  Pending
                </Link>
                <Link to="#" className="dropdown-item" onClick={() => setFilterStatus('over')}>
                  Expired
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
        </div>
        <div className="row justify-content-center">
          <div className="col-xxl-12 col-lg-12">
            {claims.length > 0 ? (
              claims.map((claim) => (
                <div key={claim._id} className="card shadow-none booking-list">
                  <div className="card-body d-md-flex align-items-center">
                    <div className="booking-widget d-sm-flex align-items-center row-gap-3 flex-fill mb-3 mb-md-0">
                      <div className="booking-img me-sm-3 mb-3 mb-sm-0">
                        <Link to={routes.map2} className="avatar">
                          <ImageWithBasePath
                            src={"assets/img/" + claim.photoEvidence}
                            alt="Photo Evidence"
                          />
                        </Link>
                      </div>

                      <div className="booking-det-info">
                        <h6 className="mb-3">
                                                <Link to={`${routes.claimDetails}/${claim._id}`}>
                                                    {claim.parkingId.nom || "Parking"}
                                                  </Link>
                                              
                                                </h6>
                       

                        <ul className="booking-details">
                          <li className="d-flex align-items-center mb-2">
                            <span className="book-item">Claim Submission Date</span>
                            <small className="me-2">: </small>
                            {new Date(claim.dateSoumission).toLocaleDateString()}{" "}
                            {new Date(claim.dateSoumission).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{" "}
                          </li>
                          <li className="d-flex align-items-center mb-2">
                         
                          </li>

                          <li className="d-flex align-items-center mb-2">
                            <span className="book-item">Location</span>
                            <small className="me-2">: </small>
                            {claim.parkingId.nom || "Unknown"}
                          </li>
                          <li className="d-flex align-items-center mb-2">
                            <span className="book-item">Parking Spot</span>
                            <small className="me-2">: </small>
                            {claim.statut || "Unknown"}
                          </li>
                        </ul>
                      </div>
                    </div>

               
                  </div>
                </div>
              ))
            ) : (
              <p>No claims available.</p>
            )}
          </div>
        </div>


        <div className="d-flex justify-content-between align-items-center flex-wrap row-gap-3">
          <div className="value d-flex align-items-center">
            <span>Show</span>
            <select>
              <option>7</option>
            </select>
            <span>entries</span>
          </div>
          <div className="d-flex align-items-center justify-content-center">
            <span className="me-2 text-gray-9">1 - 07 of 10</span>
            <nav aria-label="Page navigation">
              <ul className="paginations d-flex justify-content-center align-items-center">
                <li className="page-item me-2">
                  <Link
                    className="page-link-1 active d-flex justify-content-center align-items-center "
                    to="#"
                  >
                    1
                  </Link>
                </li>
                <li className="page-item me-2">
                  <Link
                    className="page-link-1 d-flex justify-content-center align-items-center "
                    to="#"
                  >
                    2
                  </Link>
                </li>
                <li className="page-item ">
                  <Link
                    className="page-link-1 d-flex justify-content-center align-items-center "
                    to="#"
                  >
                    3
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
{/* /Page Wrapper */ }
    </>

  );
};

export default ProviderClaims;
