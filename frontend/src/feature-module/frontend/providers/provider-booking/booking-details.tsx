import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import ImageWithBasePath from '../../../../core/img/ImageWithBasePath';
import { all_routes } from '../../../../core/data/routes/all_routes';
import BreadCrumb from '../../common/breadcrumb/breadCrumb';
import BookingModals from '../../customers/common/bookingModals';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

interface Reservation {
  _id: string;
  userId: string;
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
    tarif_horaire: number;
  } | null;
  parkingS: {
    numero: string;
  } | null;
}

const BookingDetails = () => {
  const routes = all_routes;
  const { id } = useParams();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [reviews, setReviews] = useState([]);
  const [userInfo, setUserInfo] = useState({
    _id: '',
    firstname: '',
    lastname: '',
    email: '',
    phone: ''
  });
  const [userReview, setUserReview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    parkingId: '',
    rating: 5,
    comment: '',
  });
  const [reviewMessage, setReviewMessage] = useState('');

  useEffect(() => {
    AOS.init({
      duration: 2000,
      once: false,
    });
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
          const decoded = jwtDecode(storedUser);
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
    const fetchAllDetails = async () => {
      try {
        const reservationRes = await axios.get(`http://localhost:4000/api/reservations/${id}`);
        const reservationData = reservationRes.data.data;

        const parkingRes = await axios.get(`http://localhost:4000/api/parking/${reservationData.parkingId}`);
        const parkingData = parkingRes.data;

        const parkingSpotRes = await axios.get(`http://localhost:4000/api/parking-spots/${reservationData.parkingSpot}`);
        const parkingSpotData = parkingSpotRes.data.data;

        const userRes = await axios.get(`http://localhost:4000/api/users/${reservationData.userId}`);
        const userData = userRes.data;

        const enrichedReservation = {
          ...reservationData,
          parking: parkingData,
          parkingS: parkingSpotData,
        };

        setReservation(enrichedReservation);
        setUserInfo(userData);
        setReviewForm({ ...reviewForm, parkingId: reservationData.parkingId });
      } catch (error) {
        console.error('Failed to fetch reservation or related data:', error);
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

          const enrichedReservations = await Promise.all(
            data.slice(0, 3).map(async (reservation: any) => {
              try {
                const parkingRes = await axios.get(`http://localhost:4000/api/parking/${reservation.parkingId}`);
                return {
                  ...reservation,
                  parking: parkingRes.data,
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

  useEffect(() => {
    if (reservation?.parkingId) {
      axios
        .get(`http://localhost:4000/api/reviews/parking/${reservation.parkingId}`)
        .then((response) => {
          setReviews(response.data);
          const existingReview = response.data.find(
            (review) => review.userId?._id === userInfo._id
          );
          if (existingReview) {
            setUserReview(existingReview);
            setReviewForm({
              parkingId: reservation.parkingId,
              rating: existingReview.rating,
              comment: existingReview.comment,
            });
          }
        })
        .catch((error) => {
          console.error('Erreur lors du chargement des avis:', error);
        });
    }
  }, [reservation?.parkingId, userInfo._id]);

  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setReviewForm({ ...reviewForm, [name]: value });
  };

  const handleStarClick = (rating) => {
    setReviewForm({ ...reviewForm, rating });
  };

  const handleOpenReviewModal = () => {
    if (userReview) {
      setIsEditing(true);
      setReviewForm({
        parkingId: reservation?.parkingId || '',
        rating: userReview.rating,
        comment: userReview.comment,
      });
    } else {
      setIsEditing(false);
      setReviewForm({ parkingId: reservation?.parkingId || '', rating: 5, comment: '' });
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewMessage('');

    try {
      if (isEditing && userReview) {
        const response = await axios.put(
          `http://localhost:4000/api/reviews/${userReview._id}`,
          {
            parkingId: reviewForm.parkingId,
            rating: Number(reviewForm.rating),
            comment: reviewForm.comment,
            userId: userInfo._id,
          }
        );

        setReviewMessage('Avis modifié avec succès !');
        setReviews(
          reviews.map((review) =>
            review._id === userReview._id ? response.data : review
          )
        );
      } else {
        const response = await axios.post(
          'http://localhost:4000/api/reviews',
          {
            parkingId: reviewForm.parkingId,
            rating: Number(reviewForm.rating),
            comment: reviewForm.comment,
            userId: userInfo._id,
          }
        );

        setReviewMessage('Avis soumis avec succès !');
        setReviews([...reviews, response.data]);
      }

      setReviewForm({ parkingId: reservation?.parkingId || '', rating: 5, comment: '' });
      setIsEditing(false);

      setTimeout(() => {
        document.getElementById('add-review')?.classList.remove('show');
        document.body.classList.remove('modal-open');
        const modalBackdrop = document.querySelector('.modal-backdrop');
        if (modalBackdrop) modalBackdrop.remove();
        window.location.reload();
      }, 2000);
    } catch (error) {
      setReviewMessage(
        error.response?.data?.message || "Erreur lors de la soumission de l'avis"
      );
      console.error('Erreur:', error);
    }
  };

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
      : 0;

  // Select up to 3 reviews, prioritizing the user's review
  const displayedReviews = (() => {
    const userRev = reviews.find((review) => review.userId?._id === userInfo._id);
    const otherReviews = reviews
      .filter((review) => review.userId?._id !== userInfo._id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, userRev ? 2 : 3);
    return userRev ? [userRev, ...otherReviews] : otherReviews;
  })();

  return (
    <>
      <BreadCrumb title="Reservation Details" item1="Pages" item2="Reservation Details" />
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
                        {new Date(reservation?.startDate ?? '').toLocaleDateString()}{' '}
                        {new Date(reservation?.startDate ?? '').toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
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
                    </div>
                  </div>
                </div>
                <div className="slot-box mt-3">
                  <div className="row">
                    <div className="col-md-3">
                      <div className="slot-booked">
                        <h6>Reservation Spot</h6>
                        <ul>
                          <li className="fs-12 d-flex align-items-center mb-2">
                            <i className="feather icon-calendar me-1" />
                            {new Date(reservation?.startDate ?? '').toLocaleDateString()}{' '}
                            {new Date(reservation?.startDate ?? '').toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </li>
                          <li className="fs-12 d-flex align-items-center">
                            <i className="feather icon-clock me-1" /> {reservation?.parkingS?.numero}
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
                                to="#"
                                className="btn btn-sm btn-dark d-flex align-items-center"
                                data-bs-toggle="modal"
                                data-bs-target="#add-review"
                                onClick={handleOpenReviewModal}
                              >
                                <i className="ti ti-message me-1" /> {userReview ? 'Edit Review' : 'Add Review'}
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="slot-action">
                        <h6>Reservation Status</h6>
                        <span className="badge badge-success-100 p-2 me-3">{reservation?.status}</span>
                        <span className="badge badge-skyblue p-2">Paid</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="payment-summary">
                  <div className="row">
                    <div className="col-md-6 order-summary">
                      <h6 className="order-title">Payment Summary</h6>
                      <div className="ord-summary">
                        <div className="order-amt">
                          <div className="order-info">
                            <div className="order-img">
                              <ImageWithBasePath
                                src={reservation?.parking?.image || 'assets/img/parking.jpg'}
                                alt="Parking Image"
                              />
                            </div>
                          </div>
                        </div>
                        <ul>
                          <li>
                            Reservation start date
                            <span className="ord-amt">
                              {new Date(reservation?.startDate ?? '').toLocaleDateString()}{' '}
                              {new Date(reservation?.startDate ?? '').toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </li>
                          <li>
                            <p className="ord-code mb-0">
                              Duration{' '}
                              <span className="ms-2 p-2 badge badge-info-transparent">per hour</span>
                            </p>{' '}
                            <span className="ord-amt">
                              {reservation?.startDate && reservation?.endDate
                                ? `${Math.round(
                                  (new Date(reservation.endDate).getTime() -
                                    new Date(reservation.startDate).getTime()) /
                                  (1000 * 60 * 60)
                                )} hour(s)`
                                : 'N/A'}
                            </span>
                          </li>
                          <li>
                            Reservation end date
                            <span className="ord-amt">
                              {new Date(reservation?.endDate ?? '').toLocaleDateString()}{' '}
                              {new Date(reservation?.endDate ?? '').toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </li>
                          <li className="ord-total mb-0">
                            Total price <span className="ord-amt">{reservation?.totalPrice}$</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className="col-md-6 service-location">
                      <h6 className="order-title">User Contact & Details</h6>
                      <div className="slot-address">
                        <ul>
                          <li>
                            <span>
                              <i className="ti ti-map-pin" />
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
                        <p>Payment</p>
                        <span className="fs-14">
                          Flouci **** **** **** **56{' '}
                          <ImageWithBasePath src="assets/img/icons/visa.svg" alt="Img" />
                        </span>
                      </div>
                    </div>
                    <div className="row booking">
                      <div className="col-md-6">
                        <h6 className="order-title">Reservation History</h6>
                        <div className="book-history">
                          <ul>
                            {reservations.map((reservation) => (
                              <li key={reservation._id}>
                                <h6>{reservation.parking?.nom}</h6>
                                <p>
                                  <i className="ti ti-calendar me-1" />
                                  {new Date(reservation?.startDate ?? '').toLocaleDateString()}{' '}
                                  {new Date(reservation?.startDate ?? '').toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </p>
                                <p>
                                  <i className="ti ti-check-circle me-1" /> Status: {reservation.status}
                                </p>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="order-reviews">
                          <div className="row align-items-center mb-4">
                            <div className="col-5">
                              <h6 className="order-title">Parking Reviews</h6>
                              <p className="mb-1 fs-12">{reservation?.parking?.nom}</p>
                              <div className="rating">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <span
                                    key={star}
                                    style={{
                                      fontSize: '16px', // Adjust size to match popup
                                      marginRight: '5px',
                                      color: star <= Math.round(averageRating) ? '#f5c518' : '#d3d3d3',
                                    }}
                                  >
                                    ★
                                  </span>
                                ))}
                                <span className="ms-2">({averageRating} / 5.0)</span> {/* Optional: Keep the numeric display if desired */}
                              </div>
                            </div>
                            <div className="col-7 text-end d-flex justify-content-end">
                              {userInfo._id ? (
                                <Link
                                  to="#"
                                  className="btn btn-sm d-flex align-items-center btn-dark"
                                  data-bs-toggle="modal"
                                  data-bs-target="#add-review"
                                  onClick={handleOpenReviewModal}
                                >
                                  <i className="feather icon-plus-circle me-2" />
                                  {userReview ? 'Edit Review' : 'Add Review'}
                                </Link>
                              ) : (
                                <p>
                                  <Link to="/login" className="text-primary">
                                    Connectez-vous
                                  </Link>{' '}
                                  pour écrire un avis.
                                </p>
                              )}
                            </div>
                          </div>
                          {displayedReviews.length > 0 ? (
                            displayedReviews.map((review) => (
                              <ul key={review._id}>
                                <li>
                                  <div
                                    className="order-comment"
                                    style={{
                                      backgroundColor: review.userId?._id === userInfo._id ? '#e6f7ff' : 'transparent',
                                      padding: review.userId?._id === userInfo._id ? '10px' : '0',
                                      borderRadius: review.userId?._id === userInfo._id ? '5px' : '0',
                                    }}
                                  >
                                    {review.userId?._id === userInfo._id && (
                                      <span className="badge bg-primary mb-2">Your Review</span>
                                    )}
                                    <h6>{`${review.userId?.firstname || 'Utilisateur'} ${review.userId?.lastname || ''}`}</h6>
                                    <div className="rating">
                                      {[1, 2, 3, 4, 5].map((star) => (
                                        <i
                                          key={star}
                                          className={`ti ti-star-filled ${star <= review.rating ? 'text-warning' : 'text-gray'}`}
                                        />
                                      ))}
                                    </div>
                                    <p>{review.comment}</p>
                                    <p>
                                      <i className="fa-solid fa-calendar-days me-1" />{' '}
                                      {new Date(review.createdAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                </li>
                              </ul>
                            ))
                          ) : (
                            <p>Aucun avis pour ce parking.</p>
                          )}
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
      <div
        className="modal fade"
        id="add-review"
        tabIndex={-1}
        aria-labelledby="addReviewLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="addReviewLabel">
                {isEditing ? 'Modifier un avis' : 'Soumettre un avis'}
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              {reviewMessage && (
                <div
                  className={`alert ${reviewMessage.includes('succès') ? 'alert-success' : 'alert-danger'
                    }`}
                >
                  {reviewMessage}
                </div>
              )}
              <form onSubmit={handleReviewSubmit}>
                <div className="mb-3">
                  <label htmlFor="rating" className="form-label">
                    Note (1 à 5)
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        onClick={() => handleStarClick(star)}
                        style={{
                          cursor: 'pointer',
                          fontSize: '24px',
                          marginRight: '5px',
                          color: star <= reviewForm.rating ? '#f5c518' : '#d3d3d3',
                        }}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="comment" className="form-label">
                    Commentaire
                  </label>
                  <textarea
                    className="form-control"
                    id="comment"
                    name="comment"
                    value={reviewForm.comment}
                    onChange={handleReviewChange}
                    rows={4}
                    required
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="btn"
                  style={{
                    backgroundColor: '#d32f2f',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                  }}
                >
                  {isEditing ? 'Modifier' : 'Soumettre'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <BookingModals />
    </>
  );
};

export default BookingDetails;