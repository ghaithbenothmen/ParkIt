import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import ImageWithBasePath from '../../../../core/img/ImageWithBasePath';
import { all_routes } from '../../../../core/data/routes/all_routes';
import BreadCrumb from '../../common/breadcrumb/breadCrumb';
import BookingModals from '../../customers/common/bookingModals';
import { useParams } from 'react-router-dom';
// adjust as needed
import axios from "axios";
interface Reservation {
  _id: string;
  userId: string;
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
    tarif_horaire: number;
  } | null; // parking details will be populated later
  parkingS: {
    numero: string;
  } | null; // parking details will be populated later
}

const BookingDetails = () => {
  const routes = all_routes;
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [parkings, setParkings] = useState<Record<string, { nom: string; image: string; adresse: string }>>({});
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [userInfo, setUserInfo] = useState({
    _id: '',
    firstname: '',
    lastname: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    AOS.init({
      duration: 2000,
      once: false,
    });
  }, []);
  const { id } = useParams(); // id will be your reservation._id
  useEffect(() => {
    const fetchAllDetails = async () => {
      try {
        // Step 1: Fetch reservation
        const reservationRes = await axios.get(`http://localhost:4000/api/reservations/${id}`);
        const reservationData = reservationRes.data.data;

        // Step 2: Fetch parking
        const parkingRes = await axios.get(`http://localhost:4000/api/parking/${reservationData.parkingId}`);
        const parkingData = parkingRes.data;

        // Step 3: Fetch parking spot
        const parkingSpotRes = await axios.get(`http://localhost:4000/api/parking-spots/${reservationData.parkingSpot}`);
        const parkingSpotData = parkingSpotRes.data.data;

        // Step 4: Fetch user
        const userRes = await axios.get(`http://localhost:4000/api/users/${reservationData.userId}`);
        const userData = userRes.data;

        // Inject related data into reservation
        const enrichedReservation = {
          ...reservationData,
          parking: parkingData,
          parkingS: parkingSpotData,
        };

        setReservation(enrichedReservation);
        setUserInfo(userData);
      } catch (error) {
        console.error("Failed to fetch reservation or related data:", error);
      }
    };

    fetchAllDetails();
  }, [id]);
  useEffect(() => {
    const fetchReservations = async () => {
      if (userInfo._id) {
        try {
          const res = await axios.get(`http://localhost:4000/api/reservations/by-user/${userInfo._id}`);
          const data = res.data.data;

          // Fetch parking details for each reservation
          const enrichedReservations = await Promise.all(
            data.slice(0, 3).map(async (reservation: any) => {
              try {
                const parkingRes = await axios.get(`http://localhost:4000/api/parking/${reservation.parkingId}`);
                return {
                  ...reservation,
                  parking: parkingRes.data, // assuming parkingRes.data is the full parking object
                };
              } catch (parkingErr) {
                console.error(`Failed to fetch parking for reservation ${reservation._id}:`, parkingErr);
                return {
                  ...reservation,
                  parking: null,
                };
              }
            })
          );

          setReservations(enrichedReservations);
        } catch (error) {
          console.error('Failed to fetch reservations:', error);
        }
      }
    };

    fetchReservations();
  }, [userInfo._id]);





  return (
    <>
      <BreadCrumb title='Reservation Details' item1='Pages' item2='Reservation Details' />
      {/* /Breadcrumb */}
      {/* Page Wrapper */}
      <div className="page-wrapper">
        <div className="content">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-10 mx-auto">
                <div className="breadcrumb">
                  <nav aria-label="breadcrumb" className="page-breadcrumb">
                    <ol className="breadcrumb mb-4">
                      <li className="breadcrumb-item">
                        <Link to={routes.index}>Home</Link>
                      </li>
                      <li className="breadcrumb-item" aria-current="page">
                        Reservations
                      </li>
                      <li className="breadcrumb-item" aria-current="page">
                        {reservation?.parking?.nom}
                      </li>
                    </ol>
                  </nav>
                </div>
                <div className="row booking-details">
                  <div className="col-md-4">
                    <div>
                      <h4 className="mb-2">Reservation: {reservation?.parking?.nom}</h4>
                      <p className="fs-12">
                        <i className="feather icon-calendar me-1" />
                        {new Date(reservation?.startDate ?? '').toLocaleDateString()}{" "}
                        {new Date(reservation?.startDate ?? '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="col-md-8">
                    <div className="d-flex gap-3 justify-content-end">
                      <Link
                        to={routes.providerBooking}
                        className="btn btn-light d-flex align-items-center justify-content-center"
                      >
                        <i className="ti ti-current-location me-1" />
                        LiveTrack
                      </Link>
                      <Link
                        to="#"
                        className="btn btn-light d-flex align-items-center justify-content-center"
                      >
                        <i className="ti ti-printer me-1" />
                        Print
                      </Link>
                    </div>
                  </div>
                </div>
                {/* Slot Booked */}
                <div className="slot-box mt-3">
                  <div className="row">
                    <div className="col-md-3">
                      <div className="slot-booked">
                        <h6>Reservation Spot</h6>
                        <ul>
                          <li className="fs-12 d-flex align-items-center mb-2">
                            <i className="feather icon-calendar me-1" />
                            {new Date(reservation?.startDate ?? '').toLocaleDateString()}{" "}
                            {new Date(reservation?.startDate ?? '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </li>
                          <li className="fs-12 d-flex align-items-center">
                            <i className="feather icon-clock  me-1" /> {reservation?.parkingS?.numero}
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="slot-user">
                        <h6>Parking Details</h6>
                        <div className="slot-chat">
                          <div className="slot-user-img d-flex align-items-center">
                            <div className="slot-user-info">
                              <p className="mb-1 fs-12">{reservation?.parking?.nom}</p>
                              <p className="mb-0 fs-12">{reservation?.parking?.adresse}</p>
                            </div>
                          </div>
                          <div className="chat-item d-flex align-items-center">
                            <div>
                              <Link
                                to={routes.customerChat}
                                className="btn btn-sm btn-dark d-flex align-items-center"
                              >
                                {" "}
                                <i className="ti ti-message me-1" /> Add review
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="slot-action">
                        <h6>Reservation Status</h6>
                        <span className="badge badge-success-100 p-2 me-3">
                          {reservation?.status}
                        </span>
                        <span className="badge badge-skyblue p-2">Paid</span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* /Slot Booked */}
                <div className="payment-summary">
                  <div className="row">
                    {/* Service Location */}
                    <div className="col-md-6 order-summary">
                      <h6 className="order-title">Payement Summary</h6>
                      <div className="ord-summary">
                        <div className="order-amt">
                          <div className="order-info">
                            <div className="order-img">
                              <ImageWithBasePath
                                src={reservation?.parking?.image || "assets/img/parking.jpg"}
                                alt="Parking Image"
                              />
                            </div>
                            <div className="order-profile">

                            </div>
                          </div>

                        </div>
                        <ul>
                          <li>
                            Reservation start date
                            <span className="ord-amt">
                              {new Date(reservation?.startDate ?? '').toLocaleDateString()}{" "}
                              {new Date(reservation?.startDate ?? '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </li>
                          <li>
                            <p className="ord-code mb-0">
                              {" "}
                              Duration{" "}
                              <span className=" ms-2 p-2 badge badge-info-transparent">
                                per hour
                              </span>
                            </p>{" "}
                            <span className="ord-amt">
                              {reservation?.startDate && reservation?.endDate
                                ? `${Math.round(
                                  (new Date(reservation.endDate).getTime() - new Date(reservation.startDate).getTime()) / (1000 * 60 * 60)
                                )} hour(s)`
                                : 'N/A'}
                            </span>
                          </li>
                          <li>
                            Reservation end date
                            <span className="ord-amt">
                              {new Date(reservation?.endDate ?? '').toLocaleDateString()}{" "}
                              {new Date(reservation?.endDate ?? '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </li>
                          <li className="ord-total mb-0">
                            Total price to paid <span className="ord-amt">{reservation?.totalPrice}</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className="col-md-6 service-location">
                      <h6 className="order-title">
                        User Contact &amp; Details
                      </h6>
                      <div className="slot-address">
                        <ul>
                          <li>
                            <span>
                              <i className=" ti ti-map-pin" />
                            </span>
                            <div>
                              <h6>First Name</h6>
                              {userInfo?.firstname && <p>{userInfo.firstname}</p>}
                            </div>
                          </li>
                          <li>
                            <span>
                              <i className="ti ti-mail" />
                            </span>
                            <div>
                              <h6>Email</h6>
                              {userInfo?.email && <p>{userInfo.email}</p>}
                            </div>
                          </li>
                          <li>
                            <span>
                              <i className="ti ti-phone" />
                            </span>
                            <div>
                              <h6>Phone</h6>
                              {userInfo?.phone && <p>{userInfo.phone}</p>}
                            </div>
                          </li>
                        </ul>
                      </div>
                      <div className="slot-pay">
                        <p> Payment</p>
                        <span className="fs-14">
                          Flouci **** **** **** **42{" "}
                          <ImageWithBasePath src="assets/img/icons/visa.svg" alt="Img" />
                        </span>
                      </div>
                    </div>
                    {/* /Service Location */}
                    {/* Order Summary */}

                    {/* /Order Summary */}
                    <div className="row booking">
                      {/* Booking History */}
                      <div className="col-md-6">
                        <h6 className="order-title">Resrvation History</h6>
                        <div className="book-history">
                          <ul>
                            {reservations.map((reservation) => (
                              <li key={reservation._id}>
                                <h6>{reservation.parking?.nom}</h6>
                                <p>
                                  <i className="ti ti-calendar me-1" />
                                  {new Date(reservation?.startDate ?? '').toLocaleDateString()}{" "}
                                  {new Date(reservation?.startDate ?? '').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                                <p>
                                  <i className="ti ti-check-circle me-1" /> Status: {reservation.status}
                                </p>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      {/* /Booking History */}
                      {/* Reviews */}
                      <div className="col-md-6">
                        <div className="order-reviews">
                          <div className="row align-items-center mb-4">
                            <div className="col-5">
                              <h6 className="order-title">Reviews</h6>
                            </div>
                            <div className="col-7 text-end d-flex justify-content-end">
                              <Link
                                to="#"
                                className="btn btn-sm d-flex align-items-center btn-dark"
                                data-bs-toggle="modal"
                                data-bs-target="#add-review"
                              >
                                <i className="feather icon-plus-circle me-2" />
                                Add Review
                              </Link>
                            </div>
                          </div>
                          <ul>
                            <li>
                              <div className="order-comment">
                                <div className="rating">
                                  <i className="ti ti-star-filled text-warning" />
                                  <i className="ti ti-star-filled text-warning" />
                                  <i className="ti ti-star-filled text-warning" />
                                  <i className="ti ti-star-filled text-warning" />
                                  <i className="ti ti-star-filled text-warning" />
                                </div>
                                <h6>A wonderful experience was all the help...</h6>
                                <p>
                                  <i className="fa-solid fa-calendar-days me-1" />{" "}
                                  September 5, 2023
                                </p>
                              </div>
                            </li>
                          </ul>
                        </div>
                      </div>
                      {/* /Reviews */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Page Wrapper */}
      <BookingModals />
    </>
  );
};

export default BookingDetails;
