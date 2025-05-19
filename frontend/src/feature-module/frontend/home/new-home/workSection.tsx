import React from 'react'
import ImageWithBasePath from '../../../../core/img/ImageWithBasePath'

const WorkSection = () => {
  return (
    <>
  {/* Work Section*/}
  <section className="section pt-0" id="works">
    <div className="container">
      <div className="work-section bg-black m-0">
        <div className="row align-items-center bg-01">
          <div className="col-md-12 wow fadeInUp" data-wow-delay="0.2s">
            <div className="section-header text-center">
              <h2 className="text-white">
                How ParkIt{" "}
                <span className="text-linear-primary">Works</span>
              </h2>
              <p className="text-light">
              Each parking spot is designed to be clear and concise, providing 
              users with all the necessary details to make an informed decision.
              </p>
            </div>
          </div>
        </div>
        <div className="row gx-0 gy-4">
          <div className="col-lg-4 d-flex">
            <div className="work-item text-center flex-fill">
              <div className="mb-3">
                <ImageWithBasePath src="assets/img/icons/work-01.svg" alt="img" />
              </div>
              <h6 className="text-white mb-2">1. Create account</h6>
              <p>
                The first step to use ParkIt is to create an account 
                login with your credentials and add the necessary information.
              </p>
            </div>
          </div>
          <div className="col-lg-4 d-flex">
            <div className="work-item text-center flex-fill">
              <div className="mb-3">
                <ImageWithBasePath src="assets/img/icons/work-01.svg" alt="img" />
              </div>
              <h6 className="text-white mb-2">
                2. Explore Parkings
              </h6>
              <p>
                After Logging in , you can explore the parkings i the erea you searched for ,
                select the parking you need and reserve a spot to park .
              </p>
            </div>
          </div>
          <div className="col-lg-4 d-flex">
            <div className="work-item work-03 text-center flex-fill">
              <div className="mb-3">
                <ImageWithBasePath src="assets/img/icons/work-03.svg" alt="img" />
              </div>
              <h6 className="text-white mb-2">
                3. Get to your spot
              </h6>
              <p>
                After the reservation , a guide will help you to get to your destined spot .
              </p>
            </div>
          </div>
        </div>
        <div className="work-bg1">
          <ImageWithBasePath
            src="assets/img/bg/work-bg-01.svg"
            className="img-fluid"
            alt="img"
          />
        </div>
        <div className="work-bg2">
          <ImageWithBasePath
            src="assets/img/bg/work-bg-02.svg"
            className="img-fluid"
            alt="img"
          />
        </div>
      </div>
    </div>
  </section>
  {/* /Work Section */}
</>

  )
}

export default WorkSection