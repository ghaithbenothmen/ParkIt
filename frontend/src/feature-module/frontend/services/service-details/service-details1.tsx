import React, { useEffect, useRef, useState } from 'react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import ImageWithBasePath from '../../../../core/img/ImageWithBasePath';
import { Link } from 'react-router-dom';
import { all_routes } from '../../../../core/data/routes/all_routes';
import BreadCrumb from '../../common/breadcrumb/breadCrumb';
import VideoModal from '../../../../core/hooks/video-modal';
import StickyBox from 'react-sticky-box';

const ServiceDetails1 = () => {
  const routes = all_routes;
  const [nav1, setNav1] = useState(null);
  const [nav2, setNav2] = useState(null);
  const sliderRef1 = useRef(null);
  const sliderRef2 = useRef(null);

  const [showModal, setShowModal] = useState(false);
  const videoUrl = 'https://www.youtube.com/watch?v=Vdp6x7Bibtk';
  const handleOpenModal = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);
  const [open, setOpen] = React.useState(false);

  const two = {
    dots: false,
    autoplay: false,
    slidesToShow: 6,
    speed: 500,
    responsive: [
      {
        breakpoint: 992,
        settings: {
          slidesToShow: 6,
        },
      },
      {
        breakpoint: 800,
        settings: {
          slidesToShow: 6,
        },
      },
      {
        breakpoint: 776,
        settings: {
          slidesToShow: 3,
        },
      },
      {
        breakpoint: 567,
        settings: {
          slidesToShow: 3,
        },
      },
    ],
  };
  const settings1 = {
    dots: false,
    arrows: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    asNavFor: nav2 || undefined, // Link to the second slider
    ref: (slider: any) => (sliderRef1.current = slider), // Assign the slider ref
  };

  const settings2 = {
    dots: false,
    arrows: true,
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,
    focusOnSelect: true,
    asNavFor: nav1 || undefined, // Link to the first slider
    ref: (slider: any) => (sliderRef2.current = slider), // Assign the slider ref
  };
  useEffect(() => {
    setNav1(sliderRef1.current);
    setNav2(sliderRef2.current);
  }, []);
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
                        <h3 className="mb-2">Lighting Services</h3>
                        <span className="badge badge-purple-transparent mb-2">
                          <i className="ti ti-calendar-check me-1" />
                          6000+ Bookings
                        </span>
                      </div>
                      <div className="d-flex align-items-center justify-content-between flex-wrap mb-2">
                        <div className="d-flex align-items-center flex-wrap">
                          <p className="me-3 mb-2">
                            <i className="ti ti-map-pin me-2" />
                            18 Boon Lay Way, Singapore{' '}
                            <Link
                              to="#"
                              className="link-primary text-decoration-underline"
                            >
                              View Location
                            </Link>
                          </p>
                          <p className="mb-2">
                            <i className="ti ti-star-filled text-warning me-2" />
                            <span className="text-gray-9">4.9</span>(255
                            reviews)
                          </p>
                        </div>
                        <div className="d-flex align-items-center flex-wrap">
                          <Link to="javscript:void(0);" className="me-3 mb-2">
                            <i className="ti ti-eye me-2" />
                            3050 Views
                          </Link>
                          <Link to="javscript:void(0);" className="me-3 mb-2">
                            <i className="ti ti-heart me-2" />
                            Add to Wishlist
                          </Link>
                          <Link to="javscript:void(0);" className="me-3 mb-2">
                            <i className="ti ti-share me-2" />
                            Share Now
                          </Link>
                        </div>
                      </div>
                    </div>
                    {/* Slider */}
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
                        <Link
                          to="#"
                          onClick={() => setOpen(true)}

                          className="btn btn-white btn-sm view-btn"
                        >
                          <i className="feather icon-image me-1" />
                          View all 20 Images
                        </Link>
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
                    {/* /Slider */}
                    <div className="accordion service-accordion">
                      <div className="accordion-item mb-4">
                        <h2 className="accordion-header">
                          <button
                            className="accordion-button p-0"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#overview"
                            aria-expanded="false"
                          >
                            Service Overview
                          </button>
                        </h2>
                        <div
                          id="overview"
                          className="accordion-collapse collapse show"
                        >
                          <div className="accordion-body border-0 p-0 pt-3">
                            <div className="more-text">
                              <p>
                                Provides reliable and professional electrical
                                solutions for residential and commercial
                                clients. Our licensed electricians are dedicated
                                to delivering top-quality service, ensuring
                                safety, and meeting all your electrical needs.
                                Committed to providing high-quality electrical
                                solutions with a focus on safety and customer
                                satisfaction. Our team of licensed electricians
                                is equipped to handle both residential and
                                commercial projects with expertise and care.
                              </p>
                           
                            </div>


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
                              Haircut &amp; Hair Styles
                            </p>
                            <p className="d-inline-flex align-items-center mb-2 me-4">
                              <i className="feather icon-check-circle text-success me-2" />
                              Shampoo &amp; Conditioning
                            </p>
                            <p className="d-inline-flex align-items-center mb-2 me-4">
                              <i className="feather icon-check-circle text-success me-2" />
                              Beard Trim/Shave
                            </p>
                            <p className="d-inline-flex align-items-center mb-2 me-4">
                              <i className="feather icon-check-circle text-success me-2" />
                              Neck Shave
                            </p>
                            <p className="d-inline-flex align-items-center mb-2 me-4">
                              <i className="feather icon-check-circle text-success me-2" />
                              Hot Towel Treatment
                            </p>
                          </div>
                        </div>
                      </div>
                  </div>
                </div>
              </div>
              <div className="card border-0 mb-xl-0 mb-4">
                <div className="card-body">
                  <div className="d-flex align-items-center justify-content-between flex-wrap">
                    <h4 className="mb-3">Reviews (45)</h4>
                    <Link
                      to="#"
                      data-bs-toggle="modal"
                      data-bs-target="#add-review"
                      className="btn btn-dark btn-sm mb-3"
                    >
                      Write a Review
                    </Link>
                  </div>
                  <div className="row align-items-center">
                    <div className="col-md-5">
                      <div className="rating-item bg-light-500 text-center mb-3">
                        <h5 className="mb-3">
                          Customer Reviews &amp; Ratings
                        </h5>
                        <div className="d-inline-flex align-items-center justify-content-center">
                          <i className="ti ti-star-filled text-warning me-1" />
                          <i className="ti ti-star-filled text-warning me-1" />
                          <i className="ti ti-star-filled text-warning me-1" />
                          <i className="ti ti-star-filled text-warning me-1" />
                          <i className="ti ti-star-filled text-warning" />
                        </div>
                        <p className="mb-3">(4.9 out of 5.0)</p>
                        <p className="text-gray-9">Based On 2,459 Reviews</p>
                      </div>
                    </div>
                    <div className="col-md-7">
                      <div className="rating-progress mb-3">
                        <div className="d-flex align-items-center mb-2">
                          <p className="me-2 text-nowrap mb-0">
                            5 Star Ratings
                          </p>
                          <div
                            className="progress w-100"
                            role="progressbar"
                            aria-valuenow={90}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          >
                            <div
                              className="progress-bar bg-warning"
                              style={{ width: '90%' }}
                            />
                          </div>
                          <p className="progress-count ms-2">2,547</p>
                        </div>
                        <div className="d-flex align-items-center mb-2">
                          <p className="me-2 text-nowrap mb-0">
                            4 Star Ratings
                          </p>
                          <div
                            className="progress mb-0 w-100"
                            role="progressbar"
                            aria-valuenow={80}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          >
                            <div
                              className="progress-bar bg-warning"
                              style={{ width: '80%' }}
                            />
                          </div>
                          <p className="progress-count ms-2">1,245</p>
                        </div>
                        <div className="d-flex align-items-center mb-2">
                          <p className="me-2 text-nowrap mb-0">
                            3 Star Ratings
                          </p>
                          <div
                            className="progress mb-0 w-100"
                            role="progressbar"
                            aria-valuenow={70}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          >
                            <div
                              className="progress-bar bg-warning"
                              style={{ width: '70%' }}
                            />
                          </div>
                          <p className="progress-count ms-2">600</p>
                        </div>
                        <div className="d-flex align-items-center mb-2">
                          <p className="me-2 text-nowrap mb-0">
                            2 Star Ratings
                          </p>
                          <div
                            className="progress mb-0 w-100"
                            role="progressbar"
                            aria-valuenow={90}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          >
                            <div
                              className="progress-bar bg-warning"
                              style={{ width: '60%' }}
                            />
                          </div>
                          <p className="progress-count ms-2">560</p>
                        </div>
                        <div className="d-flex align-items-center">
                          <p className="me-2 text-nowrap mb-0">
                            1 Star Ratings
                          </p>
                          <div
                            className="progress mb-0 w-100"
                            role="progressbar"
                            aria-valuenow={40}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          >
                            <div
                              className="progress-bar bg-warning"
                              style={{ width: '40%' }}
                            />
                          </div>
                          <p className="progress-count ms-2">400</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="card review-item mb-3">
                    <div className="card-body p-3">
                      <div className="review-info">
                        <div className="d-flex align-items-center justify-content-between flex-wrap">
                          <div className="d-flex align-items-center mb-2">
                            <span className="avatar avatar-lg me-2 flex-shrink-0">
                              <ImageWithBasePath
                                src="assets/img/profiles/avatar-01.jpg"
                                className="rounded-circle"
                                alt="img"
                              />
                            </span>
                            <div>
                              <h6 className="fs-16 fw-medium">
                                Adrian Hendriques
                              </h6>
                              <div className="d-flex align-items-center flex-wrap date-info">
                                <p className="fs-14 mb-0">2 days ago</p>
                                <p className="fs-14 mb-0">
                                  Excellent service!
                                </p>
                              </div>
                            </div>
                          </div>
                          <span className="badge bg-success d-inline-flex align-items-center mb-2">
                            <i className="ti ti-star-filled me-1" />5
                          </span>
                        </div>
                        <p className="mb-2">
                          The electricians were prompt, professional, and
                          resolved our issues quickly.did a fantastic job
                          upgrading our electrical panel. Highly recommend
                          them for any electrical work.
                        </p>
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
                              45
                            </Link>
                            <Link
                              to="#"
                              className="d-inline-flex align-items-center me-2"
                            >
                              <i className="ti ti-thumb-down me-2" />
                              21
                            </Link>
                          </div>
                        </div>
                      </div>
                      <div className="review-info reply mt-2 p-3">
                        <div className="d-flex align-items-center justify-content-between flex-wrap">
                          <div className="d-flex align-items-center mb-2">
                            <span className="avatar avatar-lg me-2 flex-shrink-0">
                              <ImageWithBasePath
                                src="assets/img/profiles/avatar-02.jpg"
                                className="rounded-circle"
                                alt="img"
                              />
                            </span>
                            <div>
                              <h6 className="fs-16 fw-medium">
                                Stephen Vance
                              </h6>
                              <div className="d-flex align-items-center flex-wrap date-info">
                                <p className="fs-14 mb-0">2 days ago</p>
                                <p className="fs-14 mb-0">
                                  Excellent service!
                                </p>
                              </div>
                            </div>
                          </div>
                          <span className="badge bg-success d-inline-flex align-items-center mb-2">
                            <i className="ti ti-star-filled me-1" />4
                          </span>
                        </div>
                        <p className="mb-2">
                          Thank You!!! For Your Appreciation!!!
                        </p>
                        <div className="d-flex align-items-center justify-content-between flex-wrap like-info">
                          <div className="d-inline-flex align-items-center flex-wrap">
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
                              45
                            </Link>
                            <Link
                              to="#"
                              className="d-inline-flex align-items-center me-2"
                            >
                              <i className="ti ti-thumb-down me-2" />
                              20
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="card review-item mb-3">
                    <div className="card-body p-3">
                      <div className="review-info">
                        <div className="d-flex align-items-center justify-content-between flex-wrap">
                          <div className="d-flex align-items-center mb-2">
                            <span className="avatar avatar-lg me-2 flex-shrink-0">
                              <ImageWithBasePath
                                src="assets/img/profiles/avatar-03.jpg"
                                className="rounded-circle"
                                alt="img"
                              />
                            </span>
                            <div>
                              <h6 className="fs-16 fw-medium">Don Rosales</h6>
                              <div className="d-flex align-items-center flex-wrap date-info">
                                <p className="fs-14 mb-0">2 days ago</p>
                                <p className="fs-14 mb-0">Great Service!</p>
                              </div>
                            </div>
                          </div>
                          <span className="badge bg-danger d-inline-flex align-items-center mb-2">
                            <i className="ti ti-star-filled me-1" />1
                          </span>
                        </div>
                        <p className="mb-2">
                          The quality of work was exceptional, and they left
                          the site clean and tidy. I was impressed by their
                          attention to detail and commitment to safety
                          standards. Highly recommend their services!
                        </p>
                        <div className="d-flex align-items-center justify-content-between flex-wrap like-info">
                          <div className="d-inline-flex align-items-center flex-wrap">
                            <Link
                              to="#"
                              className="d-inline-flex align-items-center me-2"
                            >
                              <i className="ti ti-thumb-up me-2" />
                              Reply
                            </Link>
                          </div>
                          <div className="d-inline-flex align-items-center">
                            <Link
                              to="#"
                              className="d-inline-flex align-items-center me-2"
                            >
                              <i className="ti ti-thumb-up me-2" />
                              15
                            </Link>
                            <Link
                              to="#"
                              className="d-inline-flex align-items-center me-2"
                            >
                              <i className="ti ti-thumb-down me-2" />1
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="card review-item mb-3">
                    <div className="card-body p-3">
                      <div className="review-info">
                        <div className="d-flex align-items-center justify-content-between flex-wrap">
                          <div className="d-flex align-items-center mb-2">
                            <span className="avatar avatar-lg me-2 flex-shrink-0">
                              <ImageWithBasePath
                                src="assets/img/profiles/avatar-04.jpg"
                                className="rounded-circle"
                                alt="img"
                              />
                            </span>
                            <div>
                              <h6 className="fs-16 fw-medium">Paul Bronk</h6>
                              <div className="d-flex align-items-center flex-wrap date-info">
                                <p className="fs-14 mb-0">2 days ago</p>
                                <p className="fs-14 mb-0">
                                  Reliable and Trustworthy!
                                </p>
                              </div>
                            </div>
                          </div>
                          <span className="badge bg-success d-inline-flex align-items-center mb-2">
                            <i className="ti ti-star-filled me-1" />1
                          </span>
                        </div>
                        <p className="mb-2">
                          The quality of work was exceptional, and they left
                          the site clean and tidy. I was impressed by their
                          attention to detail and commitment to safety
                          standards. Highly recommend their services!
                        </p>
                        <div className="d-flex align-items-center justify-content-between flex-wrap like-info">
                          <div className="d-inline-flex align-items-center flex-wrap">
                            <Link
                              to="#"
                              className="d-inline-flex align-items-center me-2"
                            >
                              <i className="ti ti-thumb-up me-2" />
                              Reply
                            </Link>
                          </div>
                          <div className="d-inline-flex align-items-center">
                            <Link
                              to="#"
                              className="d-inline-flex align-items-center me-2"
                            >
                              <i className="ti ti-thumb-up me-2" />
                              10
                            </Link>
                            <Link
                              to="#"
                              className="d-inline-flex align-items-center me-2"
                            >
                              <i className="ti ti-thumb-down me-2" />2
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
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
                            <span className="display-6 fw-bold">57Dt/Hr</span>
                          
                          </h4>
                        </div>
                      </div>
                      <span className="badge bg-success mb-3 d-inline-flex align-items-center fw-medium">
                        <i className="ti ti-circle-percentage me-1" />
                        Availble
                      </span>
                    </div>
                    <Link
                      to={routes.booking}
                      className="btn btn-lg btn-primary w-100 d-flex align-items-center justify-content-center mb-3"
                    >
                      <i className="ti ti-calendar me-2" />
                      Book Parking
                    </Link>
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
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <h6 className="fs-16 fw-medium mb-0">Monday</h6>
                      <p>9:30 AM - 7:00 PM</p>
                    </div>
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <h6 className="fs-16 fw-medium mb-0">Tuesday</h6>
                      <p>9:30 AM - 7:00 PM</p>
                    </div>
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <h6 className="fs-16 fw-medium mb-0">Wednesday</h6>
                      <p>9:30 AM - 7:00 PM</p>
                    </div>
             
                  </div>
                </div>
                <div className="card border-0">
                  <div className="card-body">
                    <h4 className="mb-3">Location</h4>
                    <div className="map-wrap">
                      <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6509170.989457427!2d-123.80081967108484!3d37.192957227641294!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x808fb9fe5f285e3d%3A0x8b5109a227086f55!2sCalifornia%2C%20USA!5e0!3m2!1sen!2sin!4v1669181581381!5m2!1sen!2sin"
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className="contact-map"
                      />
                      <div className="map-location bg-white d-flex align-items-center">
                        <div className="d-flex align-items-center me-2">
                          <span className="avatar avatar-lg flex-shrink-0">
                            <ImageWithBasePath
                              src="assets/img/services/service-thumb-01.jpg"
                              alt="img"
                              className="br-10"
                            />
                          </span>
                          <div className="ms-2 overflow-hidden">
                            <p className="two-line-ellipsis">
                              12301 Lake Underhill Rd, Suite 126, Orlando, 32828
                            </p>
                          </div>
                        </div>
                        <span>
                          <i className="feather icon-send fs-16" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <Link to="#" className="text-danger fs-14">
                  <i className="ti ti-pennant-filled me-2" />
                  Report Provider
                </Link>
              </StickyBox>
            </div>
          </div>
        </div>
      </div>
    </div >
 
    </>
  );
};

export default ServiceDetails1;
