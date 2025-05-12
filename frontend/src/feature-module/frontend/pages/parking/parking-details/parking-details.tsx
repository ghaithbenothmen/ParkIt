import React, { useEffect, useRef, useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import ImageWithBasePath from '../../../../../core/img/ImageWithBasePath';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { all_routes } from '../../../../../core/data/routes/all_routes';
import BreadCrumb from '../../../common/breadcrumb/breadCrumb';
import StickyBox from 'react-sticky-box';
import { Parking } from '../parking.model';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const ParkingDetails = () => {
  const routes = all_routes;
  const { id } = useParams();
  const [parking, setParking] = useState<Parking | null>(null);
  const [reviews, setReviews] = useState([]);
  const [nav1, setNav1] = useState(null);
  const [nav2, setNav2] = useState(null);
  const sliderRef1 = useRef(null);
  const sliderRef2 = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const user = localStorage.getItem('user');
  const [userInfo, setUserInfo] = useState({
    _id: '',
    firstname: '',
    lastname: '',
    email: '',
    phone: ''
  });
  const navigate = useNavigate();

  // Custom icon for the parking marker
  const parkingIcon = new L.Icon({
    iconUrl: "/parking.png",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });

  // State to track if the user has already reviewed this parking
  const [userReview, setUserReview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        if (storedUser.startsWith('{')) {
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
          const decoded = jwtDecode(storedUser);
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

  const [reviewForm, setReviewForm] = useState({
    parkingId: id,
    rating: 5,
    comment: '',
  });
  const [reviewMessage, setReviewMessage] = useState('');

  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setReviewForm({ ...reviewForm, [name]: value });
  };

  const handleStarClick = (rating) => {
    setReviewForm({ ...reviewForm, rating });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewMessage('');

    try {
      if (isEditing && userReview) {
        // Update existing review
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
        // Create new review
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

      setReviewForm({ parkingId: id, rating: 5, comment: '' });
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
  const ratingCounts = [0, 0, 0, 0, 0];
  reviews.forEach((review) => {
    if (review.rating >= 1 && review.rating <= 5) {
      ratingCounts[review.rating - 1]++;
    }
  });

  useEffect(() => {
    axios
      .get(`http://localhost:4000/api/parking/${id}`)
      .then((response) => {
        setParking(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching parking details:', error);
        setError('Erreur lors du chargement des détails du parking');
        setLoading(false);
      });

    axios
      .get(`http://localhost:4000/api/reviews/parking/${id}`)
      .then((response) => {
        setReviews(response.data);
        // Check if the current user has already reviewed this parking
        const existingReview = response.data.find(
          (review) => review.userId?._id === userInfo._id
        );
        if (existingReview) {
          setUserReview(existingReview);
          setReviewForm({
            parkingId: id,
            rating: existingReview.rating,
            comment: existingReview.comment,
          });
        }
      })
      .catch((error) => {
        console.error('Erreur lors du chargement des avis:', error);
      });
  }, [id, userInfo._id]);

  useEffect(() => {
    setNav1(sliderRef1.current);
    setNav2(sliderRef2.current);
  }, []);

  // Handle opening the modal for editing
  const handleOpenReviewModal = () => {
    if (userReview) {
      setIsEditing(true);
      setReviewForm({
        parkingId: id,
        rating: userReview.rating,
        comment: userReview.comment,
      });
    } else {
      setIsEditing(false);
      setReviewForm({ parkingId: id, rating: 5, comment: '' });
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  const defaultImages = ['assets/img/parking.jpg'];
  const defaultDescription = 'Parking sécurisé avec caméras et service 24h.';
  const defaultReviewCount = 0;

  const settings1 = {
    dots: false,
    arrows: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    asNavFor: nav2 || undefined,
    ref: (slider) => (sliderRef1.current = slider),
  };

  const settings2 = {
    dots: false,
    arrows: true,
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,
    focusOnSelect: true,
    asNavFor: nav1 || undefined,
    ref: (slider) => (sliderRef2.current = slider),
  };

  return (
    <>
      <BreadCrumb
        title="Parking Details"
        item1="Parkings"
        item2="Parking Details"
      />
      <div className="page-wrapper">
        <div className="content">
          <div className="container">
            <div className="row">
              <div className="col-xl-8">
                <div className="card border-0">
                  <div className="card-body">
                    <div className="service-head mb-2">
                      <div className="d-flex align-items-center justify-content-between flex-wrap">
                        <h3 className="mb-2">{parking?.nom}</h3>
                        <span className="badge badge-purple-transparent mb-2">
                          <i className="ti ti-calendar-check me-1" />
                          {defaultReviewCount}+ Bookings
                        </span>
                      </div>
                      <div className="d-flex align-items-center justify-content-between flex-wrap mb-2">
                        <div className="d-flex align-items-center flex-wrap">
                          <p className="me-3 mb-2">
                            <i className="ti ti-map-pin me-2" />
                            {parking?.adresse}{' '}
                            <Link
                              to="#"
                              className="link-primary text-decoration-underline"
                              onClick={() =>
                                navigate(routes.map, {
                                  state: {
                                    location: parking.adresse,
                                    currentPosition: [parking.latitude, parking.longitude],
                                  },
                                })
                              }
                            >
                              View Location
                            </Link>
                          </p>
                          <p className="mb-2">
                            <i className="ti ti-star-filled text-warning me-2" />
                            <span className="text-gray-9">{averageRating}</span> (
                            {reviews.length} reviews)
                          </p>
                        </div>
                        <div className="d-flex align-items-center flex-wrap"></div>
                      </div>
                    </div>
                    <div className="service-wrap mb-4">
                      <div className="slider-wrap">
                        <Slider
                          {...settings1}
                          className="owl-carousel reactslick service-carousel nav-center mb-3"
                        >
                          <div className="service-img">
                            <ImageWithBasePath
                              src="assets/img/parking.jpg"
                              className="img-fluid"
                              alt="Slider Img"
                            />
                          </div>
                          <div className="service-img">
                            <ImageWithBasePath
                              src="assets/img/parking.jpg"
                              className="img-fluid"
                              alt="Slider Img"
                            />
                          </div>
                          <div className="service-img">
                            <ImageWithBasePath
                              src="assets/img/parking.jpg"
                              className="img-fluid"
                              alt="Slider Img"
                            />
                          </div>
                          <div className="service-img">
                            <ImageWithBasePath
                              src="assets/img/parking.jpg"
                              className="img-fluid"
                              alt="Slider Img"
                            />
                          </div>
                          <div className="service-img">
                            <ImageWithBasePath
                              src="assets/img/parking.jpg"
                              className="img-fluid"
                              alt="Slider Img"
                            />
                          </div>
                          <div className="service-img">
                            <ImageWithBasePath
                              src="assets/img/parking.jpg"
                              className="img-fluid"
                              alt="Slider Img"
                            />
                          </div>
                        </Slider>
                      </div>
                      <Slider
                        {...settings2}
                        className="owl-carousel slider-nav-thumbnails reactslick nav-center"
                      >
                        <div>
                          <ImageWithBasePath
                            src="assets/img/parking.jpg"
                            className="img-fluid"
                            alt="Slider Img"
                          />
                        </div>
                        <div>
                          <ImageWithBasePath
                            src="assets/img/parking.jpg"
                            className="img-fluid"
                            alt="Slider Img"
                          />
                        </div>
                        <div>
                          <ImageWithBasePath
                            src="assets/img/parking.jpg"
                            className="img-fluid"
                            alt="Slider Img"
                          />
                        </div>
                        <div>
                          <ImageWithBasePath
                            src="assets/img/parking.jpg"
                            className="img-fluid"
                            alt="Slider Img"
                          />
                        </div>
                        <div>
                          <ImageWithBasePath
                            src="assets/img/parking.jpg"
                            className="img-fluid"
                            alt="Slider Img"
                          />
                        </div>
                        <div>
                          <ImageWithBasePath
                            src="assets/img/parking.jpg"
                            className="img-fluid"
                            alt="Slider Img"
                          />
                        </div>
                      </Slider>
                    </div>
                    <div className="accordion service-accordion">
                      <div className="accordion-item mb-4">
                        <h2 className="accordion-header">
                          <button
                            className="accordion-button p-0"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#overview"
                            aria-expanded="true"
                          >
                            Parking Overview
                          </button>
                        </h2>
                        <div
                          id="overview"
                          className="accordion-collapse collapse show"
                        >
                          <div className="accordion-body border-0 p-0 pt-3">
                            <div className="more-text">
                              <p>{defaultDescription}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="accordion-item mb-4">
                        <h2 className="accordion-header">
                          <button
                            className="accordion-button p-0"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#include"
                            aria-expanded="false"
                          >
                            Includes
                          </button>
                        </h2>
                        <div
                          id="include"
                          className="accordion-collapse collapse show"
                        >
                          <div className="accordion-body border-0 p-0 pt-3">
                            <div className="bg-light-200 p-3 pb-2 br-10">
                              <p className="d-inline-flex align-items-center mb-2 me-4">
                                <i className="feather icon-check-circle text-success me-2" />
                                Camera
                              </p>
                              <p className="d-inline-flex align-items-center mb-2 me-4">
                                <i className="feather icon-check-circle text-success me-2" />
                                Security
                              </p>
                              <p className="d-inline-flex align-items-center mb-2 me-4">
                                <i className="feather icon-check-circle text-success me-2" />
                                24h service
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                   
                  </div>
                </div>
                <div className="card border-0 mb-xl-0 mb-4">
                  <div className="card-body">
                    <div className="d-flex align-items-center justify-content-between flex-wrap">
                      <h4 className="mb-3">Reviews ({reviews.length})</h4>
                      {user ? (
                        <Link
                          to="#"
                          data-bs-toggle="modal"
                          data-bs-target="#add-review"
                          className="btn btn-dark btn-sm mb-3"
                          onClick={handleOpenReviewModal}
                        >
                          {userReview ? 'Edit Review' : 'Write a Review'}
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
                    <div className="row align-items-center">
                      <div className="col-md-5">
                        <div className="rating-item bg-light-500 text-center mb-3">
                          <h5 className="mb-3">Customer Reviews & Ratings</h5>
                          <div className="d-inline-flex align-items-center justify-content-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span
                                key={star}
                                style={{
                                  fontSize: '24px',
                                  marginRight: '5px',
                                  color: star <= Math.round(averageRating) ? '#f5c518' : '#d3d3d3',
                                }}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                          <p className="mb-3">({averageRating} out of 5.0)</p>
                          <p className="text-gray-9">Based On {reviews.length} Reviews</p>
                        </div>
                      </div>
                      <div className="col-md-7">
                        <div className="rating-progress mb-3">
                          {[5, 4, 3, 2, 1].map((star) => (
                            <div className="d-flex align-items-center mb-2" key={star}>
                              <p className="me-2 text-nowrap mb-0">{star} Star Ratings</p>
                              <div
                                className="progress w-100"
                                role="progressbar"
                                aria-valuenow={
                                  reviews.length > 0
                                    ? (ratingCounts[star - 1] / reviews.length) * 100
                                    : 0
                                }
                                aria-valuemin={0}
                                aria-valuemax={100}
                              >
                                <div
                                  className="progress-bar bg-warning"
                                  style={{
                                    width: `${
                                      reviews.length > 0
                                        ? (ratingCounts[star - 1] / reviews.length) * 100
                                        : 0
                                    }%`,
                                  }}
                                />
                              </div>
                              <p className="progress-count ms-2">{ratingCounts[star - 1]}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    {reviews.length > 0 ? (
                      reviews.map((review) => (
                        <div className="card review-item mb-3" key={review._id}>
                          <div className="card-body p-3">
                            <div className="review-info">
                              <div className="d-flex align-items-center justify-content-between flex-wrap">
                                <div className="d-flex align-items-center mb-2">
                                  <span className="avatar avatar-lg me-2 flex-shrink-0">
                                    <img
                                      src={
                                        review.userId?.image
                                          ? review.userId.image.startsWith("//")
                                            ? `https:${review.userId.image}`
                                            : review.userId.image
                                          : "assets/img/user.jpg" // Default image
                                      }
                                      alt="User"
                                      className="rounded-circle"
                                      style={{ width: "50px", height: "50px", objectFit: "cover" }}
                                      onError={(e) => (e.currentTarget.src = "assets/img/user.jpg")} // Fallback to default image
                                    />
                                  </span>
                                  <div>
                                    <h6 className="fs-16 fw-medium">
                                      {review.userId?.firstname || "Utilisateur"}
                                    </h6>
                                    <div className="d-flex align-items-center flex-wrap date-info">
                                      <p className="fs-14 mb-0">
                                        {new Date(review.createdAt).toLocaleDateString()}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <span
                                  className={`badge bg-${
                                    review.rating >= 4 ? "success" : "danger"
                                  } d-inline-flex align-items-center mb-2`}
                                >
                                  <span style={{ marginRight: "5px" }}>★</span>
                                  {review.rating}
                                </span>
                              </div>
                              <p className="mb-2">{review.comment}</p>
                              <div className="d-flex align-items-center justify-content-between flex-wrap like-info">
                                <div className="d-inline-flex align-items-center">
                                  <Link
                                    to="#"
                                    className="d-inline-flex align-items-center me-2"
                                  >
                                    <i className="ti ti-thumb-up me-2" />
                                    Reply
                                  </Link>
                                  <Link
                                    to="#"
                                    className="d-inline-flex align-items-center me-2"
                                  >
                                    <i className="ti ti-thumb-up me-2" />
                                    Like
                                  </Link>
                                  <Link
                                    to="#"
                                    className="d-inline-flex align-items-center"
                                  >
                                    <i className="ti ti-thumb-down me-2" />
                                    Dislike
                                  </Link>
                                </div>
                                <div className="d-inline-flex align-items-center">
                                  <Link
                                    to="#"
                                    className="d-inline-flex align-items-center me-2"
                                  >
                                    <i className="ti ti-thumb-up me-2" />
                                    0
                                  </Link>
                                  <Link
                                    to="#"
                                    className="d-inline-flex align-items-center me-2"
                                  >
                                    <i className="ti ti-thumb-down me-2" />
                                    0
                                  </Link>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p>Aucun avis pour ce parking.</p>
                    )}
                    <div className="text-center">
                      <Link to="#" className="btn btn-light btn-sm">
                        Load More
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-xl-4 theiaStickySidebar">
                <StickyBox>
                  <div className="card border-0">
                    <div className="card-body">
                      <div className="d-flex align-items-center justify-content-between border-bottom mb-3">
                        <div className="d-flex align-items-center">
                          <div className="mb-3">
                            <p className="fs-14 mb-0">Starts From</p>
                            <h4>
                              <span className="display-6 fw-bold">
                                {parking?.tarif_horaire}Dt/Hr
                              </span>
                            </h4>
                          </div>
                        </div>
                        <span
                          className={`badge mb-3 d-inline-flex align-items-center fw-medium ${
                            parking?.disponibilite ? 'bg-success' : 'bg-danger'
                          }`}
                        >
                          <i className="ti ti-circle-percentage me-1" />
                          {parking?.disponibilite ? 'Available' : 'Not Available'}
                        </span>
                      </div>
                      {user ? (
                        <Link
                          to={`/parkings/booking-parking/${parking?._id}`}
                          className="btn btn-lg btn-primary w-100 d-flex align-items-center justify-content-center mb-3"
                        >
                          <i className="ti ti-calendar me-2" />
                          Book A Parking Spot
                        </Link>
                      ) : (
                        <div className="alert alert-warning text-center mt-3">
                          You need to be connected to access this page.{' '}
                          <Link to="/login" className="alert-link">
                            Sign in here
                          </Link>
                          .
                        </div>
                      )}
                      <Link
                        to="#"
                        data-bs-toggle="modal"
                        data-bs-target="#add-enquiry"
                        className="btn btn-lg btn-outline-light d-flex align-items-center justify-content-center w-100"
                      >
                        <i className="ti ti-mail me-2" />
                        Send Enquiry
                      </Link>
                    </div>
                  </div>
                  <div className="card border-0">
                    <div className="card-body">
                      <h4 className="mb-3">Business Hours</h4>
                      <div className="text-center bg-light p-4 rounded">
                        <h5 className="mb-2 text-primary">Open 24/7</h5>
                        <p className="mb-0 text-muted">
                          <i className="ti ti-clock me-2"></i>24 hours a day, 7 days a week
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="card border-0">
                    <div className="card-body">
                      <h4 className="mb-3">Location</h4>
                      <div className="map-wrap">
                         <MapContainer
                        center={[parking.latitude, parking.longitude]}
                        zoom={15}
                        style={{ height: "300px", width: "100%" }}
                      >
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <Marker
                          position={[parking.latitude, parking.longitude]}
                          icon={parkingIcon}
                        >
                          <Popup>{parking.nom}</Popup>
                        </Marker>
                      </MapContainer>
                      </div>
                    </div>
                  </div>
                 
                </StickyBox>
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
                  className={`alert ${
                    reviewMessage.includes('succès') ? 'alert-success' : 'alert-danger'
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
    </>
  );
};

export default ParkingDetails;