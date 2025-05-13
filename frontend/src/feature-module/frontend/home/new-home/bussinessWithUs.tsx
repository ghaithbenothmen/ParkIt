import React from 'react'
import { Link } from 'react-router-dom'
import ImageWithBasePath from '../../../../core/img/ImageWithBasePath'

const BussinessWithUs = () => {
  return (
    <>
  {/* Business Section */}
  <section className="section business-section bg-black" id="about">
    <div className="container">
      <div className="row align-items-center bg-01">
        <div className="col-md-6 wow fadeInUp" data-wow-delay="0.2s">
          <div className="section-header mb-md-0 mb-4">
            <h2 className="text-white display-4">
              Add Your profile &amp; Cars{" "}
              <span className="text-linear-primary">find the perfect parking spot</span>
            </h2>
            <p className="text-light">
            A versatile platform that connects you with local parking spaces across various categories, from residential parking 
            spots and garages to commercial parking areas and event spaces.
            </p>
            <Link className="btn btn-linear-primary" to="#" data-bs-toggle="modal" data-bs-target="#register-modal">
          <i className="ti ti-user-filled me-2"></i>Join Us</Link>
          </div>
        </div>
        <div
          className="col-md-6 text-md-end wow fadeInUp"
          data-wow-delay="0.2s"
        >
          <div className="business-img">
            <ImageWithBasePath
              src="assets/img/parkit-bg-dark.png"
              className="img-fluid"
              alt="img"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
  {/* /Business Section */}
</>

  )
}

export default BussinessWithUs