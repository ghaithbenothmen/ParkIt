import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import ImageWithBasePath from '../../../../core/img/ImageWithBasePath';
import { all_routes } from '../../../../core/data/routes/all_routes';

const OverdueDetails = () => {
  const { id } = useParams(); // Reservation ID from the URL

  interface Reservation {
    _id: string;
    userId: string;
    startDate: string;
    endDate: string;
    totalPrice: number;
    parkingId: {
      _id: string;
      nom?: string;
      images?: string[];
      adresse?: string;
      tarif_horaire?: number;
    }; // Parking details directly under parkingId
    status: string;
    parkingSpot: string;
    additionalFee: number;
    extendedEndDate: string | null;
    parkingS: {
      numero?: string;
    } | null;
  }

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [isLoadingPayment, setIsLoadingPayment] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchReservation = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/api/reservations/${id}`);
        const reservationData = res.data.data;
        console.log('Reservation Data:', reservationData);

        // No need to fetch parking details separately since they're already in parkingId
        // Ensure parkingSpot is valid before making the API call
        if (reservationData.parkingSpot && typeof reservationData.parkingSpot === 'string') {
          const parkingSpotRes = await axios.get(`http://localhost:4000/api/parking-spots/${reservationData.parkingSpot}`);
          reservationData.parkingS = parkingSpotRes.data.data;
        }

        setReservation(reservationData);
      } catch (error) {
        console.error('Failed to fetch reservation details:', error);
      }
    };

    fetchReservation();
  }, [id]);

  const handlePayment = async () => {
    setIsLoadingPayment(true);
    try {
      const res = await axios.post('http://localhost:4000/api/reservations/pay-additional-fee', {
        reservationId: reservation?._id,
      });

      if (res.data.paymentLink) {
        window.location.href = res.data.paymentLink;
      }
    } catch (error) {
      console.error('Payment initiation failed:', error);
    } finally {
      setIsLoadingPayment(false);
    }
  };

  const calculateAdditionalHours = () => {
    if (!reservation?.extendedEndDate || !reservation.endDate) return 0;
    const endDate = new Date(reservation.endDate);
    const extendedEndDate = new Date(reservation.extendedEndDate);
    const diffMs = extendedEndDate.getTime() - endDate.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60)); // Convert milliseconds to hours
  };

  const additionalHours = calculateAdditionalHours();

  if (!reservation) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading reservation details...</p>
      </div>
    );
  }

  // Determine the image source
  const getImageSrc = () => {
    if (imageError || !reservation.parkingId?.images || reservation.parkingId.images.length === 0) {
      return 'assets/img/parking.jpg';
    }
    return reservation.parkingId.images[0];
  };

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10 mx-auto">
              <div className="card shadow">
                <div className="card-body">
                  {/* Highlight Additional Fee */}
                  <div className="alert alert-warning text-center mb-4">
                    <h4 className="mb-0">
                      <i className="ti ti-alert-circle me-2"></i>
                      Additional Fee Due: <strong>{reservation.additionalFee.toFixed(2)}DT</strong>
                    </h4>
                  </div>

                  {/* Reservation Details */}
                  <div className="section mb-4">
                    <h5 className="section-title">
                      <i className="ti ti-calendar me-2"></i>Reservation Details
                    </h5>
                    <div className="row">
                      <div className="col-md-6">
                        <ul className="list-group">
                          <li className="list-group-item d-flex justify-content-between align-items-center">
                            <strong>Start Date:</strong>
                            <span>{new Date(reservation.startDate).toLocaleString()}</span>
                          </li>
                          <li className="list-group-item d-flex justify-content-between align-items-center">
                            <strong>End Date:</strong>
                            <span>{new Date(reservation.endDate).toLocaleString()}</span>
                          </li>
                          <li className="list-group-item d-flex justify-content-between align-items-center">
                            <strong>Status:</strong>
                            <span
                              className={`badge ${reservation.status === 'overdue' ? 'bg-danger' : 'bg-success'}`}
                            >
                              {reservation.status}
                            </span>
                          </li>
                          <li className="list-group-item d-flex justify-content-between align-items-center">
                            <strong>Total Additional Hours:</strong>
                            <span>
                              {additionalHours > 0 ? `${additionalHours} hour(s)` : 'No Additional Hours'}
                            </span>
                          </li>
                          <li className="list-group-item d-flex justify-content-between align-items-center">
                            <strong>Additional Fee:</strong>
                            <span>${reservation.additionalFee.toFixed(2)}</span>
                          </li>
                        </ul>
                      </div>
                      <div className="col-md-6 text-center">
                        <img
                          src={getImageSrc()}
                          alt="Parking"
                          className="rounded mb-3"
                          style={{ width: '100%', maxHeight: '200px', objectFit: 'cover' }}
                          onError={() => setImageError(true)}
                        />
                        <div>
                          <p className="mb-1">
                            <strong>{reservation.parkingId?.nom || 'Parking Name Not Available'}</strong>
                          </p>
                          <p className="mb-0">{reservation.parkingId?.adresse || 'Address Not Available'}</p>
                          <p className="mb-0">
                            Hourly Rate:{' '}
                            <strong>
                              {reservation.parkingId?.tarif_horaire
                                ? `$${reservation.parkingId.tarif_horaire.toFixed(2)}`
                                : 'Not Available'}
                            </strong>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="text-end mt-4">
                    <button
                      className="btn btn-primary me-2"
                      onClick={handlePayment}
                      disabled={isLoadingPayment}
                    >
                      {isLoadingPayment ? (
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      ) : (
                        <i className="ti ti-credit-card me-2"></i>
                      )}
                      Pay Additional Fee
                    </button>
                    <Link to={all_routes.providerBooking} className="btn btn-secondary">
                      <i className="ti ti-arrow-left me-2"></i>Back to Reservations
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverdueDetails;