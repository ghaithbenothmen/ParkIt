import React from 'react'
import ImageWithBasePath from '../../../../core/img/ImageWithBasePath'
import { all_routes } from '../../../../core/data/routes/all_routes';
import { useNavigate } from 'react-router-dom';
import PagesAuthHeader from '../../pages/authentication/common/header';
import PaymentButton from './PaymentButton';

const PaymentError = () => {
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
                      <span className="failure-check mb-3 mx-auto d-flex align-items-center justify-content-center" style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '50%',
                          backgroundColor: '#f8d7da',
                          border: '2px solid #dc3545',
                          color: '#dc3545'
                        }}>
                          <i className="ti ti-close" style={{ fontSize: '30px' }} />
                        </span>
                        <h4 className="mb-2">Payment Failed</h4>
                        <p>Please try again.</p>
                        <div>
                          <button
                            type="submit"
                            className="btn btn-lg btn-linear-primary w-30"
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

export default PaymentError