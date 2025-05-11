import React from 'react';
import { Link } from 'react-router-dom';
import { all_routes } from '../../../../core/data/routes/all_routes';
import ImageWithBasePath from '../../../../core/img/ImageWithBasePath';

const NewFooter = () => {
  const routes = all_routes;

  return (
    <>
      {/* Footer */}
      <footer>
        <div className="footer-top">
          <div className="container">
            <div className="row">
              {/* About Section */}
              <div className="col-md-6 col-xl-3">
                <div className="footer-widget">
                  <h5 className="mb-4">About ParkIt</h5>
                  <p>
                    ParkIt is your trusted solution for finding and reserving parking spots. 
                    We aim to make parking hassle-free and efficient for everyone.
                  </p>
                  <ul className="social-icon">
                    <li>
                      <Link to="#">
                        <ImageWithBasePath src="assets/img/icons/fb.svg" alt="Facebook" />
                      </Link>
                    </li>
                    <li>
                      <Link to="#">
                        <ImageWithBasePath src="assets/img/icons/instagram.svg" alt="Instagram" />
                      </Link>
                    </li>
                    <li>
                      <Link to="#">
                        <ImageWithBasePath src="assets/img/icons/youtube.svg" alt="YouTube" />
                      </Link>
                    </li>
                    <li>
                      <Link to="#">
                        <ImageWithBasePath src="assets/img/icons/linkedin.svg" alt="LinkedIn" />
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Quick Links */}
              <div className="col-md-6 col-xl-3">
                <div className="footer-widget">
                  <h5 className="mb-4">Quick Links</h5>
                  <ul className="footer-menu">
                    <li>
                      <Link to={routes.aboutUs}>About Us</Link>
                    </li>
                    <li>
                      <Link to={routes.contactUs}>Contact Us</Link>
                    </li>
                    <li>
                      <Link to={routes.faq}>FAQs</Link>
                    </li>
                    <li>
                      <Link to={routes.blogGrid}>Blog</Link>
                    </li>
                    <li>
                      <Link to={routes.termsAndConditions}>Terms & Conditions</Link>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Services */}
              <div className="col-md-6 col-xl-3">
                <div className="footer-widget">
                  <h5 className="mb-4">Our Services</h5>
                  <ul className="footer-menu">
                    <li>
                      <Link to={routes.parkingSearch}>Search Parking</Link>
                    </li>
                    <li>
                      <Link to={routes.providerBooking}>Manage Reservations</Link>
                    </li>
                    <li>
                      <Link to={routes.map}>Parking Map</Link>
                    </li>
                    <li>
                      <Link to={routes.register}>Register</Link>
                    </li>
                    <li>
                      <Link to={routes.login}>Login</Link>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Newsletter */}
              <div className="col-md-6 col-xl-3">
                <div className="footer-widget">
                  <h5 className="mb-4">Stay Updated</h5>
                  <p>Subscribe to our newsletter to get the latest updates and offers.</p>
                  <div className="mb-3">
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Enter your email"
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-linear-primary btn-lg w-100"
                  >
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="container">
            <div className="row">
              <div className="col-md-12">
                <div className="d-flex align-items-center justify-content-between flex-wrap">
                  <p className="mb-2">
                    © {new Date().getFullYear()} ParkIt. All Rights Reserved.
                  </p>
                  <ul className="footer-menu d-flex">
                    <li>
                      <Link to={routes.privacyPolicy}>Privacy Policy</Link>
                    </li>
                    <li>
                      <Link to={routes.termsAndConditions}>Terms of Service</Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* /Footer Bottom */}
      </footer>
      {/* /Footer */}
    </>
  );
};

export default NewFooter;