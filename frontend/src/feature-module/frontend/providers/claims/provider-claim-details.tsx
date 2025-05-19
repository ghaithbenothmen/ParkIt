import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import ImageWithBasePath from '../../../../core/img/ImageWithBasePath';
import { all_routes } from '../../../../core/data/routes/all_routes';
import BreadCrumb from '../../common/breadcrumb/breadCrumb';
import { useParams } from 'react-router-dom';
// adjust as needed
import axios from "axios";
interface Claim {
    _id: string;
    userId: {
      _id: string;
      firstname: string;
      lastname: string;
      role: string;
    };
    parkingId: {
      _id: string;
      nom: string;
      adresse: string;
    };
    claimType: 'Spot Occupied' |'Payment Issue' | 'Security'| 'Other';
    image?: string;
    status: 'Valid' | 'Pending' | 'Resolved' | 'Rejected';
    submissionDate: string;
    priority: number;
    message?: string;
    feedback?: string;
  }
  

const ClaimDetails = () => {
  const routes = all_routes;
  const [claim, setClaim] = useState<Claim | null>(null);
//  const [parkings, setParkings] = useState<Record<string, { nom: string; image: string; adresse: string }>>({});
  const [claims, setClaims] = useState<Claim[]>([]);
  const [userInfo, setUserInfo] = useState({
    _id: '',
    firstname: '',
    lastname: '',
    email: '',
    phone: ''
  });

  /*useEffect(() => {
    AOS.init({
      duration: 2000,
      once: false,
    });
  }, []);*/
  const { id } = useParams(); // id will be your reservation._id
  useEffect(() => {
    const fetchAllDetails = async () => {
      try {
        // Step 1: Fetch reservation
        const claimRes = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/claims/${id}`);
        const claimData = claimRes.data.data;
        console.log("hahaahhahahhahahaahha");
        console.log(claimData);

       /* // Step 2: Fetch parking
        const parkingRes = await axios.get(`http://localhost:4000/api/parking/${reservationData.parkingId}`);
        const parkingData = parkingRes.data;

        // Step 3: Fetch parking spot
        const parkingSpotRes = await axios.get(`http://localhost:4000/api/parking-spots/${reservationData.parkingSpot}`);
        const parkingSpotData = parkingSpotRes.data.data;
*/
        // Step 4: Fetch user
        const userRes = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/users/${claimData.userId._id}`);
        const userData = userRes.data;

        setClaim(claimData);
        setUserInfo(userData);
      } catch (error) {
        console.error("Failed to fetch reservation or related data:", error);
      }
    };

    fetchAllDetails();
  }, [id]);
  console.log("bbbbbbbbbbbbbbbbbbbbb");
  console.log(claim);
  /*useEffect(() => {
    const fetchClaims = async () => {
      if (userInfo._id) {
        try {
          const res = await axios.get(`http://localhost:4000/api/claims/${userInfo._id}`);
          const data = res.data;
  
          // Fetch parking details for each reservation
          const enrichedReservations = await Promise.all(
            data.slice(0, 3).map(async (reservation:any) => {
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
  
          setReservations(enrichedClaim);
        } catch (error) {
          console.error('Failed to fetch reservations:', error);
        }
      }
    };
  
    fetchReservations();
  }, [userInfo._id]);*/
  




  return (
    <>
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
                      <Link to={routes.providerClaims}>Claims</Link>
                      </li>
                      <li className="breadcrumb-item" aria-current="page">
                        {claim?.claimType}
                      </li>
                    </ol>
                  </nav>
                </div>
                <div className="row booking-details">
                  <div className="col-md-4">
                    <div>
                      <h4 className="mb-2">Claim: {claim?.claimType}</h4>
                      <p className="fs-12">
                        <i className="feather icon-calendar me-1" /> {claim?.submissionDate}
                      </p>
                    </div>
                  </div>
                  <div className="col-md-8">
                    <div className="d-flex gap-3 justify-content-end">
                      <Link
                        to={routes.providerClaims}
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
                    </div>
                    <div className="col-md-6">
                      <div className="slot-user">
                        <h6>Parking Details</h6>
                        <div className="slot-chat">
                          <div className="slot-user-img d-flex align-items-center">
                            <div className="slot-user-info">
                              <p className="mb-1 fs-12">{claim?.parkingId?.nom}</p>
                              <p className="mb-0 fs-12">{claim?.parkingId?.adresse}</p>
                            </div>
                          </div>
                          <div className="chat-item d-flex align-items-center">
                            <div>
                              <Link
                                to={routes.customerChat}
                                className="btn btn-sm btn-dark d-flex align-items-center"
                              >
                                {" "}
                                <i className="ti ti-message me-1" /> Chat
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="slot-action">
                        <h6>Claim Status</h6>
                        <span className={`badge ms-2 ${claim?.status === 'Resolved' ? 'badge-soft-success' :
                            claim?.status === 'Pending' ? 'badge-soft-warning' :
                            claim?.status === 'Valid' ? 'badge-soft-warning' :
                              claim?.status === 'Rejected' ? 'badge-soft-danger' :
                                'badge-soft-secondary'
                            }`}>
                            {claim?.status}
                          </span>
                      </div>
                    </div>
                  </div>
                </div>
                {/* /Slot Booked */}
                <div className="payment-summary">
                  <div className="row">
                    {/* Service Location */}
                    <div className="col-md-6 order-summary">
                      <h6 className="order-title">Claim Summary</h6>
                      <div className="ord-summary">
                        <div className="order-amt">
                          <div className="order-info">
                            <div className="order-img">
                            <img src={claim?.image} alt="Image" />

                            </div>
                            <div className="order-profile">

                            </div>
                          </div>
                          
                        </div>
                       
                      </div>
                    </div>
                    <div className="col-md-6 service-location">
                    <br />
                    <br />
                    <div className="row ">
                    {claim?.message && (
                    <div>
                      <h6 className="order-title">Complaint Details</h6>
                      <div className="col-xxl-12 col-lg-12">
                        <div className="card shadow-none">
                          <div className="card-body">
                            <div>
                              <p className="fs-14">
                                {claim?.message}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  
                                  {claim?.feedback && (
                  <div>
                    <h6 className="order-title">Admin Feedback</h6>
                    <div className="col-xxl-12 col-lg-12">
                      <div className="card shadow-none">
                        <div className="card-body">
                          <div>
                            <p className="fs-14">
                              {claim?.feedback}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                  </div>
                  </div>
                    {/* /Service Location */}
                    {/* Order Summary */}

                    {/* /Order Summary */}
                    <div className="row booking">
                      {/* Booking History */}
                      <div className="col-md-6">
                        <h6 className="order-title">Claim History</h6>
                        <div className="book-history">
                          
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
      
    </>
  );
};

export default ClaimDetails;