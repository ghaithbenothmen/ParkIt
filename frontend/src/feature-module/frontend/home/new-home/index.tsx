import React from 'react'
import QuoteModal from '../../common/modals/quote-modal'
import ImageWithBasePath from '../../../../core/img/ImageWithBasePath'
import BecomeProvider from '../../common/modals/provider-modal'
import { Link } from 'react-router-dom'
import { all_routes } from '../../../../core/data/routes/all_routes'
import FeatureSection from './feature-section'
import PopularSection from './popular-section'
import WorkSection from './workSection'
import CustomerSection from './customerSection'
import BlogAndJoinus from './blogAndJoinus'
import BussinessWithUs from './bussinessWithUs'
import HomeHeader from '../header/home-header'
import NewFooter from '../footer/newFooter'
import AuthModals from './authModals'

const NewHome = () => {
  const routes = all_routes
  return (
    <>
    <HomeHeader type={1}/>
    <>
  {/* Hero Section */}
  <section className="hero-section" id="home">
    <div className="hero-content position-relative overflow-hidden">
      <div className="container">
        <div className="row align-items-center">
          <div className="col-lg-6">
            <div
              className="wow fadeInUp"
              data-wow-duration="1s"
              data-wow-delay=".25s"
            >
              <h1 className="mb-2">
                Find the perfect parking{" "}
                <span className="typed" data-type-text="Carpenters" >spot</span>
              </h1>
              <p className="mb-3 sub-title">
                We can help you find the right spot, fast , effortless, save your
                time.
              </p>
              <div className="banner-form bg-white border mb-3">
                <form action="#">
                  <div className="d-md-flex align-items-center">
                    <div className="input-group mb-2">
                      <span className="input-group-text px-1">
                        <i className="ti ti-search" />
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search for Service"
                      />
                    </div>
                    <div className="input-group mb-2">
                      <span className="input-group-text px-1">
                        <i className="ti ti-map-pin" />
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter Location"
                      />
                    </div>
                    <div className="mb-2">
                      
                      <Link  to={routes.search} className="btn btn-linear-primary d-inline-flex align-items-center w-100">
												<i className="feather icon-search me-2"></i>
												Search
											</Link>
                    </div>
                  </div>
                </form>
                <ImageWithBasePath
                  src="assets/img/bg/bg-06.svg"
                  alt="img"
                  className="shape-06 round-animate"
                />
              </div>
              <div className="d-flex align-items-center flex-wrap">
                <h6 className="mb-2 me-2 fw-medium">Popular Searches</h6>
                <Link
                  to={routes.search}
                  className="badge badge-dark-transparent fs-14 fw-normal mb-2 me-2"
                >
                  Malls
                </Link>
                <Link
                  to={routes.search}
                  className="badge badge-dark-transparent fs-14 fw-normal mb-2 me-2"
                >
                  Hospitals
                </Link>
                <Link
                  to={routes.search}
                  className="badge badge-dark-transparent fs-14 fw-normal mb-2 me-2"
                >
                  Airports
                </Link>
              </div>
              <div className="d-flex align-items-center flex-wrap banner-info">
                <div className="d-flex align-items-center me-4 mt-4">
                  <ImageWithBasePath src="assets/img/icons/success-01.svg" alt="icon" />
                  <div className="ms-2">
                    <h6>215 +</h6>
                    <p>Verified Parkings</p>
                  </div>
                </div>
                <div className="d-flex align-items-center me-4 mt-4">
                  <ImageWithBasePath src="assets/img/icons/success-02.svg" alt="icon" />
                  <div className="ms-2">
                    <h6>90,000+</h6>
                    <p>Reservation Completed</p>
                  </div>
                </div>
                <div className="d-flex align-items-center me-4 mt-4">
                  <ImageWithBasePath src="assets/img/icons/success-03.svg" alt="icon" />
                  <div className="ms-2">
                    <h6>2,390,968 </h6>
                    <p>Reviews Globally</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div
            className="banner-img wow fadeInUp"
            data-wow-duration="1s"
            data-wow-delay=".25s"
          >
            <ImageWithBasePath
              src="assets/img/home-home.png"
              alt="img"
              className="img-fluid animation-float"
            />
          </div>
        </div>
      </div>
      <div className="hero-image">
        <div className="d-inline-flex bg-white p-2 rounded align-items-center shape-01 floating-x">
          <span className="avatar avatar-md bg-warning rounded-circle me-2">
            <i className="ti ti-star-filled" />
          </span>
          <span>
            4.9 / 5<small className="d-block">(255 reviews)</small>
          </span>
          <i className="border-edge" />
        </div>
        <div className="d-inline-flex bg-white p-2 rounded align-items-center shape-02 floating-x">
          <span className="me-2">
            <ImageWithBasePath src="assets/img/icons/tick-banner.svg" alt="" />
          </span>
          <p className="fs-12 text-dark mb-0">300 Reservation Completed</p>
          <i className="border-edge" />
        </div>
        <ImageWithBasePath src="assets/img/bg/bg-03.svg" alt="img" className="shape-03" />
        <ImageWithBasePath src="assets/img/bg/bg-04.svg" alt="img" className="shape-04" />
        <ImageWithBasePath src="assets/img/bg/bg-05.svg" alt="img" className="shape-05" />
      </div>
    </div>
  </section>
  {/* /Hero Section */}
  {/* Category Section */}
  <section className="section category-section">
    <div className="container">
      <div className="row justify-content-center">
        <div
          className="col-lg-6 text-center wow fadeInUp"
          data-wow-delay="0.2s"
        >
          <div className="section-header text-center">
            <h2 className="mb-1">
              Explore our{" "}
              <span className="text-linear-primary">Parkings</span>
            </h2>
            <p className="sub-title">
            Parking categories help organize and structure the available parking options on the app,
             making it easier for users to find a spot that suits their needs.
            </p>
          </div>
        </div>
      </div>
      <div className="row g-4 row-cols-xxl-6 row-cols-xl-6 row-cols-md-4 row-cols-sm-2 row-cols-1 justify-content-center">
        <div className="col d-flex">
          <div
            className="category-item text-center flex-fill wow fadeInUp"
            data-wow-delay="0.2s"
          >
            <div className="mx-auto mb-3">
              <ImageWithBasePath
                src="assets/img/icons/category-01.svg"
                className="img-fluid"
                alt="img"
              />
            </div>
            <h6 className="fs-14 mb-1">Street Parking</h6>
            <p className="fs-14 mb-0">900+</p>
            <Link
              to={routes.categories}
              className="link-primary text-decoration-underline fs-14"
            >
              View All
            </Link>
          </div>
        </div>
        <div className="col d-flex">
          <div
            className="category-item text-center flex-fill wow fadeInUp"
            data-wow-delay="0.2s"
          >
            <div className="mx-auto mb-3">
              <ImageWithBasePath
                src="assets/img/icons/category-02.svg"
                className="img-fluid"
                alt="img"
              />
            </div>
            <h6 className="fs-14 mb-1">Covered Parking</h6>
            <p className="fs-14 mb-0">787+</p>
            <Link
              to={routes.categories}
              className="link-primary text-decoration-underline fs-14"
            >
              View All
            </Link>
          </div>
        </div>
        <div className="col d-flex">
          <div
            className="category-item text-center flex-fill wow fadeInUp"
            data-wow-delay="0.2s"
          >
            <div className="mx-auto mb-3">
              <ImageWithBasePath
                src="assets/img/icons/category-13.svg"
                className="img-fluid"
                alt="img"
              />
            </div>
            <h6 className="fs-14 mb-1">VIP Parking</h6>
            <p className="fs-14 mb-0">235</p>
            <Link
              to={routes.categories}
              className="link-primary text-decoration-underline fs-14"
            >
              View All
            </Link>
          </div>
        </div>
        <div className="col d-flex">
          <div
            className="category-item text-center flex-fill wow fadeInUp"
            data-wow-delay="0.2s"
          >
            <div className="mx-auto mb-3">
              <ImageWithBasePath
                src="assets/img/icons/category-04.svg"
                className="img-fluid"
                alt="img"
              />
            </div>
            <h6 className="fs-14 mb-1">Handicap Accessible Parking</h6>
            <p className="fs-14 mb-0">1260</p>
            <Link
              to={routes.categories}
              className="link-primary text-decoration-underline fs-14"
            >
              View All
            </Link>
          </div>
        </div>
        <div className="col d-flex">
          <div
            className="category-item text-center flex-fill wow fadeInUp"
            data-wow-delay="0.2s"
          >
            <div className="mx-auto mb-3">
              <ImageWithBasePath
                src="assets/img/icons/category-06.svg"
                className="img-fluid"
                alt="img"
              />
            </div>
            <h6 className="fs-14 mb-1">Monthly Parking</h6>
            <p className="fs-14 mb-0">2546</p>
            <Link
              to={routes.categories}
              className="link-primary text-decoration-underline fs-14"
            >
              View All
            </Link>
          </div>
        </div>
        <div className="col d-flex">
          <div
            className="category-item text-center flex-fill wow fadeInUp"
            data-wow-delay="0.2s"
          >
            <div className="mx-auto mb-3">
              <ImageWithBasePath
                src="assets/img/icons/category-07.svg"
                className="img-fluid"
                alt="img"
              />
            </div>
            <h6 className="fs-14 mb-1">Hourly Parking</h6>
            <p className="fs-14 mb-0">4547</p>
            <Link
              to={routes.categories}
              className="link-primary text-decoration-underline fs-14"
            >
              View All
            </Link>
          </div>
        </div>
      </div>
    </div>
  </section>
  {/* /Category Section */}
  <FeatureSection/>
  <PopularSection/>
  <WorkSection/>
  <CustomerSection/>
  <BlogAndJoinus/>
  <BussinessWithUs/>
  <NewFooter/>
</>
<AuthModals/>
<QuoteModal/>
<BecomeProvider/>
    </>
  )
}

export default NewHome