import React from 'react'
import ImageWithBasePath from '../../../../core/img/ImageWithBasePath'
import { all_routes } from '../../../../core/data/routes/all_routes';
import { useNavigate } from 'react-router-dom';
import PagesAuthHeader from '../../pages/authentication/common/header';

const PaymentSuccess = () => {
  const routes = all_routes;
  const navigate = useNavigate()
  
  return (
    <>
      <PagesAuthHeader/>
      <div className="main-wrapper">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-5 mx-auto">
              <form onSubmit={() => navigate(routes.providerBooking)}>
                <div className="d-flex flex-column justify-content-center vh-100">
                  <div className="card p-sm-4">
                    <div className="card-body">
                      <div className="text-center">
                        <span className="success-check mb-3 mx-auto">
                          <i className="ti ti-check" />
                        </span>
                        <h4 className="mb-2">Your Reservation is Confirmed!</h4>
                        <p>Thank you for choosing our service.</p>
                        <div>
                          <button
                            type="submit"
                            className="btn btn-lg btn-linear-primary w-100"
                          >
                            Back to Home
                          </button>
                        </div>
                      </div>
                    </div>
                    <div>
                      <ImageWithBasePath
                        src="assets/img/bg/authentication-bg.png"
                        className="bg-left-top"
                        alt="Img"
                      />
                      <ImageWithBasePath
                        src="assets/img/bg/authentication-bg.png"
                        className="bg-right-bottom"
                        alt="Img"
                      />
                    </div>
                  </div>
                  <div className="p-4 text-center">
                    <p className="mb-0 ">
                      Copyright © 2024 - All Rights Reserved Truelysell
                    </p>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default PaymentSuccess