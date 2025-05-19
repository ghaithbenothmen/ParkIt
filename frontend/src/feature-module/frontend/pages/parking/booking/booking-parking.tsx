import React, { useEffect, useState, useRef } from 'react'
import BreadCrumb from '../../../common/breadcrumb/breadCrumb'
import ImageWithBasePath from '../../../../../core/img/ImageWithBasePath'
import { Dropdown } from 'primereact/dropdown';
import { Link, useParams } from 'react-router-dom';
import { all_routes } from '../../../../../core/data/routes/all_routes';
import { Parking } from '../parking.model';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import CommonDatePicker from '../../../../../core/hooks/commonDatePicker';
import Calendar from 'react-calendar'; // Import react-calendar
import 'react-calendar/dist/Calendar.css'; // Styles for the calendar
import ParkingVisualization from '../../../providers/pickParkingSpot';
import { Toast } from "primereact/toast";

interface Badge {
  _id: string;
  name: string;
  discountPercentage: number;
}
const BookingParking = () => {
  const toast = useRef(null);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [startHour, setStartHour] = useState("09:00");
  const [endHour, setEndHour] = useState("13:00");
  const [duration, setDuration] = useState(2); // Default to 2 hours
  const { id } = useParams();
  const [parking, setParking] = useState<Parking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDateTime, setStartDateTime] = useState<Date | null>(null);
  const [userVehicles, setUserVehicles] = useState([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('');
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedSpot, setSelectedSpot] = useState<string | null>(null);
  const [reservationId, setReservationId] = useState<string | null>(null);
  const [badge, setBadge] = useState<Badge | null>(null);

  const showToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail: string) => {
    toast.current?.show({ severity, summary, detail, life: 3000 });
  };


  useEffect(() => {
    // Replace with your actual API endpoint
    axios
      .get(`${process.env.REACT_APP_API_BASE_URL}/parking/${id}`)
      .then((response) => {
        setParking(response.data); // Store API response
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching parking details:", error);

        setLoading(false);
      });
  }, [id]);
  const [userInfo, setUserInfo] = useState({
    _id: '',
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    badge: ''
  });

  const handlePayment = async () => {

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/reservations/${reservationId}/payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Payment initiation failed');
      }

      const data = await response.json();
      console.log("hiii  " + data)
      if (data.paymentLink) {
        // Redirect the user to the payment page
        window.location.href = data.paymentLink;
      } else {
        throw new Error('Payment link not received');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        // Is it a JWT token or JSON object?
        if (storedUser.startsWith('{')) {
          // It's a JSON string (not a token)
          const user = JSON.parse(storedUser);
          console.log("Loaded user object from localStorage:", user);
          setUserInfo({
            _id: user._id || '',
            firstname: user.firstname || '',
            lastname: user.lastname || '',
            email: user.email || '',
            phone: user.phone || '',
            badge: user.badge || ''
          });
        } else {
          // It's probably a JWT token
          const decoded: any = jwtDecode(storedUser);
          console.log("Decoded user from JWT token:", decoded);
          setUserInfo({
            _id: decoded._id || '',
            firstname: decoded.firstname || '',
            lastname: decoded.lastname || '',
            email: decoded.email || '',
            phone: decoded.phone || '',
            badge: decoded.badge || ''
          });
        }
      } catch (err) {
        console.error('Error processing stored user:', err);
      }
    }
  }, []);
  useEffect(() => {
    const fetchBadge = async () => {
      if (userInfo.badge) {
        try {
          const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/badges/${userInfo.badge}`);
          setBadge(response.data);
        } catch (error) {
          console.error('Error fetching badge:', error);
        }
      }
    };
    fetchBadge();
  }, [userInfo.badge]);
  const getBadgeStyle = (badgeName: string) => {
    switch (badgeName) {
      case 'Bronze':
        return { backgroundColor: '#cd7f32', color: 'white' };
      case 'Silver':
        return { backgroundColor: '#c0c0c0', color: 'black' };
      case 'Gold':
        return { backgroundColor: '#ffd700', color: 'black' };
      default:
        return { backgroundColor: '#e0e0e0', color: 'black' };
    }
  };

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        let userId = '';

        if (storedUser) {
          if (storedUser.startsWith('{')) {
            const user = JSON.parse(storedUser);
            userId = user._id;
          } else {
            const decoded: any = jwtDecode(storedUser);
            userId = decoded._id;
          }
        }

        if (!userId) {
          console.warn('No user ID found in localStorage');
          return;
        }

        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/vehicules/${userId}`);
        console.log('Fetched vehicles:', response.data);
        setUserVehicles(response.data.vehicules);
      } catch (error) {
        console.error('Error fetching vehicles:', error);
      }
    };

    fetchVehicles(); // ✅ Always call it, no need to wait for userInfo
  }, []);
  const [currentStep, setCurrentStep] = useState(1);
  const [count, setCount] = useState(1);
  const [count2, setCount2] = useState(1);
  const countPlus = () => {
    setCount(prevCount => prevCount + 1);
  }
  const countMinus = () => {
    setCount(prevCount => (prevCount > 1 ? prevCount - 1 : 1));
  }
  const countPlus2 = () => {
    setCount2(prevCount => prevCount + 1);
  }
  const countMinus2 = () => {
    setCount2(prevCount => (prevCount > 1 ? prevCount - 1 : 1));
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);

    // Only set count if value is a number and greater than 0
    if (!isNaN(value) && value > 0) {
      setCount(value);
    }
  };
  const handleInputChange2 = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);

    // Only set count if value is a number and greater than 0
    if (!isNaN(value) && value > 0) {
      setCount2(value);
    }
  };
  const handleStartDateChange = (date: Date) => {
    setStartDate(date);
    // Update startHour as well when the startDate is selected (for example, set it to 09:00 by default)
    setStartHour("09:00");
  };

  // Update endHour based on startHour and duration
  useEffect(() => {
    if (startDate && startHour && duration) {
      const [startH, startM] = startHour.split(":").map(Number);
      const newStartDateTime = new Date(startDate);
      newStartDateTime.setHours(startH, startM, 0, 0);

      // Save updated startDateTime
      setStartDateTime(newStartDateTime);

      // Now calculate endDateTime by adding duration (in hours)
      const newEndDateTime = new Date(newStartDateTime);
      newEndDateTime.setHours(newEndDateTime.getHours() + duration);

      setEndDate(newEndDateTime);

      // Optional: update endHour string for display if needed
      const endH = newEndDateTime.getHours();
      const endM = newEndDateTime.getMinutes();
      const formattedEndHour = `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
      setEndHour(formattedEndHour);
    }
  }, [startDate, startHour, duration]);

  // Calculate the endDate based on startDate and endHour

  if (endDate) {
    const [endH, endM] = endHour.split(":").map(Number);
    endDate.setHours(endH, endM, 0, 0);
  }
  const handleNext = () => {
    setCurrentStep(currentStep + 1);

  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };
  const handleCheckout = async () => {
    try {
      const originalTotal = parking!.tarif_horaire * duration;
      const discount = badge ? badge.discountPercentage / 100 : 0;
      const discountedTotal = originalTotal * (1 - discount);
      const reservationData = {
        userId: userInfo._id,
        parkingId: parking?._id,
        parkingSpot: selectedSpot,
        vehicule: selectedVehicleId,
        startDate: startDateTime,
        endDate: endDate,
        totalPrice: discountedTotal,
      };

      console.log("Reservation Data being sent:", reservationData);

      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization headers if required
        },
        body: JSON.stringify(reservationData),

      });

      const data = await response.json();
      if (response.ok) {
        console.log('Reservation successful:', data);
        showToast('success', 'Success', 'Reservation successful! please porceed to payment in next step');
        setReservationId(data.data._id);
        console.log('Reservation ID after setting:', data._id);

      } else {
        // If the response is not successful, show an error alert with the error message
        console.error('Reservation failed:', data.message || 'Unknown error');
        alert(data.message || 'Something went wrong during checkout.');
      }
      // Optional: redirect to another page
      // navigate('/confirmation');
    } catch (error) {
      console.error('Error submitting reservation:', error);
      alert('Something went wrong during checkout.');
    }



  };


  return (
    <>
      <Toast ref={toast} />
      <BreadCrumb title='Book A Reservation' item1='Service' item2='Reservation' />
      <>
        {/* Page Wrapper */}
        <div className="page-wrapper">
          <div className="content">
            <div className="container">
              <div className="fieldset-wizard request-wizard">
                <div className="row">
                  <div className="col-xl-3 col-lg-4 theiaStickySidebar">
                    <div className="card shadow-none bg-light-500 booking-sidebar request-sidebar mb-4 mb-lg-0">
                      <div className="card-body">
                        <div className="service-info bg-white d-flex align-items-center mb-3">
                          <span className="avatar avatar-xl me-2 flex-shrink-0">
                            <img
                              src={
                                parking?.images && parking.images.length > 0
                                  ? (parking.images[0].startsWith("//")
                                      ? `https:${parking.images[0]}` // Replace leading "//" with "https:"
                                      : parking.images[0].startsWith("http") || parking.images[0].startsWith("https")
                                      ? parking.images[0]
                                      : `https://res.cloudinary.com/dmqhmgfme/image/upload/${parking.images[0].replace(/^\//, "")}` // Remove leading slash if present
                                    )
                                  : "assets/parking.jpg" // Fallback to a default image
                              }
                              className="border-0"
                              alt="Parking Image"
                            />
                          </span>
                          <div>
                            <h5 className="mb-1">{parking?.nom}</h5>
                            <p className="fs-14">{parking?.adresse}</p>
                          </div>
                        </div>
                        <div className="booking-wizard p-0">
                          <h6 className="mb-3 fw-semibold">Steps</h6>
                          <ul className="wizard-progress" id="bokingwizard">
                            <li className={`${currentStep === 1 ? 'active' : currentStep > 1 ? 'activated' : ''} pb-4`}>
                              <span>Basic Information</span>
                            </li>
                            <li className={`${currentStep === 2 ? 'active' : currentStep > 2 ? 'activated' : ''} pb-4`}>
                              <span>Reservations Schedule</span>
                            </li>
                            <li className={`${currentStep === 3 ? 'active' : currentStep > 3 ? 'activated' : ''} pb-4`}>
                              <span>Spot Selection</span>
                            </li>
                            <li className={`${currentStep === 4 ? 'active' : currentStep > 4 ? 'activated' : ''} pb-4`}>
                              <span>Car Selections</span>
                            </li>
                            <li className={`${currentStep === 5 ? 'active' : currentStep > 5 ? 'activated' : ''} pb-4`}>
                              <span>Review Reservation</span>
                            </li>
                            <li className={`${currentStep === 6 ? 'active' : currentStep > 6 ? 'activated' : ''} pb-4`}>
                              <span>Payement</span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-xl-9 col-lg-8">
                    {currentStep === 1 && (
                      <fieldset id="first-field">
                        <div className="card flex-fill mb-0">
                          <div className="card-body">
                            <h5 className="mb-3">Personal Details</h5>
                            <form >
                              <div>
                                <h6 className="mb-3 fs-16 fw-medium">
                                  Basic Information
                                </h6>
                                <div className="row">
                                  <div className="col-md-6">
                                    <div className="mb-4">
                                      <div className="form-floating">
                                        <input
                                          type="text"
                                          className="form-control"
                                          placeholder=""
                                          value={userInfo.firstname}
                                          readOnly
                                        />
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="mb-4">
                                      <div className="form-floating">
                                        <input
                                          type="text"
                                          className="form-control"
                                          placeholder=""
                                          value={userInfo.lastname}
                                          readOnly
                                        />
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="mb-4">
                                      <div className="form-floating">
                                        <input
                                          type="text"
                                          className="form-control"
                                          placeholder=""
                                          value={userInfo.email}
                                          readOnly
                                        />
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-md-6">
                                    <div className="mb-4">
                                      <div className="form-floating">
                                        <input
                                          type="text"
                                          className="form-control"
                                          placeholder=""
                                          value={userInfo.phone}
                                          readOnly
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="text-end">
                                <button
                                  type="button"
                                  className="btn btn-linear-primary next_btn"
                                  onClick={handleNext}
                                >
                                  Next Step
                                </button>
                              </div>
                            </form>
                          </div>
                        </div>
                      </fieldset>
                    )}
                    {currentStep === 2 && (
                      <fieldset style={{ display: 'flex' }}>
                        <div className="card flex-fill mb-0">
                          <div className="card-body">
                            <h5 className="mb-3">Reservation schedule</h5>
                            <form>
                              {/* Date Picker */}
                              <div className="mb-4">
                                <label className="form-label fw-semibold">Select Date</label>
                                <Calendar
                                  value={startDate}
                                  onChange={handleStartDateChange}
                                  calendarType="US"
                                  minDate={new Date()}
                                />
                              </div>

                              {/* Duration Slider */}
                              <div className="mb-4">
                                <label className="form-label fw-semibold">Duration</label>
                                <input
                                  type="range"
                                  min="1"
                                  max="24"
                                  value={duration}
                                  onChange={(e) => setDuration(Number(e.target.value))}
                                  className="form-range"
                                />
                                <div><strong>{duration}</strong> hrs</div>
                              </div>

                              {/* Time Pickers */}
                              <div className="row">
                                <div className="col-md-6 mb-4">
                                  <label className="form-label fw-semibold">Start Hour</label>
                                  <input
                                    type="time"
                                    value={startHour}
                                    onChange={(e) => setStartHour(e.target.value)}
                                    className="form-control"
                                  />
                                </div>
                                <div className="col-md-6 mb-4">
                                  <label className="form-label fw-semibold">End Hour</label>
                                  <input
                                    type="time"
                                    value={endHour}
                                    className="form-control"
                                    disabled
                                  />
                                </div>
                              </div>

                              {/* Total Display */}
                              <div className="mb-4">
                                <label className="form-label fw-semibold">Your Badge</label>
                                {badge ? (
                                  <span
                                    className="badge"
                                    style={{
                                      ...getBadgeStyle(badge.name),
                                      padding: '8px 12px',
                                      fontSize: '14px',
                                      borderRadius: '12px',
                                    }}
                                  >
                                    {badge.name}
                                  </span>
                                ) : (
                                  <span>No badge assigned</span>
                                )}
                              </div>
                              <div className="mb-4">
                                <label className="form-label fw-semibold">Total</label>
                                <div>
                                  {badge && badge.discountPercentage > 0 ? (
                                    <>
                                      <div>
                                        Original: <strong>{(duration * parking!.tarif_horaire).toFixed(2)} DT</strong>
                                      </div>
                                      <div>
                                        Discount ({badge.discountPercentage}%):{' '}
                                        <strong>-{((duration * parking!.tarif_horaire * badge.discountPercentage) / 100).toFixed(2)} DT</strong>
                                      </div>
                                      <div>
                                        Final: <strong>{(duration * parking!.tarif_horaire * (1 - badge.discountPercentage / 100)).toFixed(2)} DT</strong> / {duration} hours
                                      </div>
                                    </>
                                  ) : (
                                    <div>
                                      <strong>{(duration * parking!.tarif_horaire).toFixed(2)} DT</strong> / {duration} hours
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Navigation Buttons */}
                              <div className="d-flex justify-content-end align-items-center">
                                <Link
                                  to="#"
                                  onClick={handlePrev}
                                  className="btn btn-light d-inline-flex align-items-center prev_btn me-2"
                                >
                                  Back
                                </Link>
                                <button
                                  type="button"
                                  onClick={handleNext}
                                  className="btn btn-linear-primary next_btn"
                                  disabled={!startDate || !startHour}
                                >
                                  Continue
                                </button>
                              </div>
                            </form>
                          </div>
                        </div>
                      </fieldset>
                    )}

                    {currentStep === 3 && (
                      <fieldset style={{ display: 'flex' }}>
                        <div className="card flex-fill mb-0">
                          <div className="card-body">
                            <h5 className="mb-3">Select Parking Spot</h5>
                            <form>
                              <div>
                                <ParkingVisualization
                                  parkingId={parking!._id}
                                  selectedSpot={selectedSpot}
                                  setSelectedSpot={setSelectedSpot}
                                  selectedStartTime={startDateTime ? startDateTime.toISOString() : ''}
                                  selectedEndTime={endDate ? endDate.toISOString() : ''}
                                />
                              </div>
                              <div className="d-flex justify-content-end align-items-center">
                                <Link
                                  to="#"
                                  onClick={handlePrev}
                                  className="btn btn-light d-inline-flex align-items-center prev_btn me-2"
                                >
                                  Back
                                </Link>
                                <button
                                  type="button"
                                  onClick={handleNext}
                                  className="btn btn-linear-primary next_btn"
                                  disabled={!selectedSpot} // Disable if no spot is selected
                                >
                                  Next Step
                                </button>
                              </div>
                            </form>
                          </div>
                        </div>
                      </fieldset>
                    )}


                    {currentStep === 4 && (
                      <fieldset style={{ display: 'flex' }}>
                        <div className="card flex-fill mb-0">
                          <div className="card-body">
                            <h5 className="mb-3">Car selection</h5>
                            <form >
                              <div>
                                <div className="row">
                                  {Array.isArray(userVehicles) && userVehicles.map((vehicule) => (
                                    <div key={vehicule._id}
                                      className={`card h-100 shadow-sm ${selectedVehicleId === vehicule._id ? 'border-primary' : ''}`}
                                      onClick={() => setSelectedVehicleId(vehicule._id)}
                                      style={{ cursor: 'pointer' }}
                                    >
                                      <div className="card-body">
                                        <h6 className="card-title">{vehicule.marque} - {vehicule.modele}</h6>
                                        <p className="card-text">
                                          <strong>Matricule:</strong> {vehicule.immatriculation}<br />
                                          <strong>Color:</strong> {vehicule.couleur}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="d-flex justify-content-end align-items-center">
                                <Link
                                  to="#"
                                  className="btn btn-light d-inline-flex align-items-center prev_btn me-2"
                                  onClick={handlePrev}
                                >
                                  Back
                                </Link>
                                <button
                                  type="button"
                                  onClick={handleNext}
                                  className="btn btn-linear-primary next_btn"
                                >
                                  Next Step
                                </button>
                              </div>
                            </form>
                          </div>
                        </div>
                      </fieldset>
                    )}

                    {currentStep === 5 && (
                      <fieldset style={{ display: 'flex' }}>
                        <div className="flex-fill">
                          <div className="review-order">
                            <h6 className="fs-16 fw-medium border-bottom mb-3 pb-3">
                              Payment details
                            </h6>
                            <div className="d-flex align-items-center justify-content-md-between flex-wrap gap-3">
                              <div className="rounded bg-white p-2 text-center review-item">
                                <h6 className="fw-medium fs-16 mb-1">
                                  Parking cost/hour
                                </h6>
                                <span>{parking!.tarif_horaire * 1000} Millimes</span>
                              </div>
                              <div className="rounded bg-white p-2 text-center review-item">
                                <h6 className="fw-medium fs-16 mb-1">Duration </h6>
                                <span>{duration} hours</span>
                              </div>
                              <div className="rounded bg-white p-2 text-center review-item">
                                <h6 className="fw-medium fs-16 mb-1">Total cost</h6>
                                <span>
                                  {badge && badge.discountPercentage > 0
                                    ? (parking!.tarif_horaire * duration * (1 - badge.discountPercentage / 100) * 1000).toFixed(0)
                                    : parking!.tarif_horaire * duration * 1000}{' '}
                                  Millimes
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="card mb-0">
                            <div className="card-body">
                              <h5 className="mb-3">Review Reservation</h5>
                              <div className="border-bottom mb-3">
                                <h6 className="fs-16 fw-medium mb-3">
                                  Personal Details
                                </h6>
                                <div className="row">
                                  <div className="col-md-4 col-sm-6">
                                    <div className="mb-3">
                                      <div className="mb-2">
                                        <h6 className="fs-14 fw-medium mb-1">
                                          First Name
                                        </h6>
                                        <span>{userInfo.firstname}</span>
                                      </div>
                                      <div className="mb-2">
                                        <h6 className="fs-14 fw-medium mb-1">Phone</h6>
                                        <span>{userInfo.phone}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-md-4 col-sm-6">
                                    <div className="mb-3">
                                    </div>
                                  </div>
                                  <div className="col-md-4 col-sm-6">
                                    <div className="mb-3">
                                      <div className="mb-2">
                                        <h6 className="fs-14 fw-medium mb-1">Last Name</h6>
                                        <span>{userInfo.lastname}</span>
                                      </div>
                                      <div className="mb-2">
                                        <h6 className="fs-14 fw-medium mb-1">
                                          Email
                                        </h6>
                                        <span>{userInfo.email}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="border-bottom mb-3">
                                <h6 className="fs-16 fw-medium mb-3">
                                  Reservation Schedule
                                </h6>
                                <div className="row">
                                  <div className="col-md-4 col-sm-6">
                                    <div className="mb-3">
                                      <div className="mb-2">
                                        <h6 className="fs-14 fw-medium mb-1">
                                          Start Date
                                        </h6>
                                        <span>{startHour}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-md-4 col-sm-6">
                                    <div className="mb-3">
                                      <div className="mb-2">
                                        <h6 className="fs-14 fw-medium mb-1">
                                          Duration
                                        </h6>
                                        <span>{duration} hours</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-md-4 col-sm-6">
                                    <div className="mb-3">
                                      <div className="mb-2">
                                        <h6 className="fs-14 fw-medium mb-1">
                                          End Date
                                        </h6>
                                        <span>{endHour}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="border-bottom mb-3">
                                <h6 className="fs-16 fw-medium mb-3">
                                  Parking details
                                </h6>
                                <div className="row">
                                  <div className="col-md-4 col-sm-6">
                                    <div className="mb-3">
                                      <div className="mb-2">
                                        <h6 className="fs-14 fw-medium mb-1">
                                          Name
                                        </h6>
                                        <span>{parking?.nom}</span>
                                      </div>
                                      <div className="mb-2">
                                        <h6 className="fs-14 fw-medium mb-1">Number of spots</h6>
                                        <span>{parking?.nbr_place}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-md-4 col-sm-6">
                                    <div className="mb-3">
                                      <div className="mb-2">
                                        <h6 className="fs-14 fw-medium mb-1">
                                          Adress
                                        </h6>
                                        <span>{parking?.adresse}</span>
                                      </div>
                                      <div className="mb-2">
                                        <h6 className="fs-14 fw-medium mb-1">
                                          Cost/hour
                                        </h6>
                                        <span>{parking!.tarif_horaire * 1000} Millimes</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="d-flex justify-content-end align-items-center">
                                <Link
                                  to="#"
                                  onClick={handlePrev}
                                  className="btn btn-light d-inline-flex align-items-center prev_btn me-2"
                                >
                                  Back
                                </Link>
                                <button
                                  type="button"
                                  className="btn btn-linear-primary next_btn"
                                  onClick={() => {
                                    handleCheckout();
                                    handleNext();
                                  }}
                                >
                                  Next Step
                                </button>

                              </div>
                            </div>
                          </div>
                        </div>
                      </fieldset>
                    )}
                    {currentStep === 6 && (
                      <fieldset style={{ display: 'flex' }}>
                        <div className="card flex-fill mb-0">
                          <div className="card-body">
                            <h5 className="mb-3">Payement</h5>
                            <div className="review-order">
                              <h6 className="fs-16 fw-medium border-bottom mb-3 pb-3">
                                Payment details
                              </h6>
                              <div className="d-flex align-items-center justify-content-md-between flex-wrap gap-3">
                                <div className="rounded bg-white p-2 text-center review-item">
                                  <h6 className="fw-medium fs-16 mb-1">
                                    Parking cost/hour
                                  </h6>
                                  <span>{parking!.tarif_horaire * 1000} Millimes</span>
                                </div>
                                <div className="rounded bg-white p-2 text-center review-item">
                                  <h6 className="fw-medium fs-16 mb-1">Duration </h6>
                                  <span>{duration} hours</span>
                                </div>
                                <div className="rounded bg-white p-2 text-center review-item">
                                  <h6 className="fw-medium fs-16 mb-1">Total cost</h6>
                                  <span>
                                    {badge && badge.discountPercentage > 0
                                      ? (parking!.tarif_horaire * duration * (1 - badge.discountPercentage / 100) * 1000).toFixed(0)
                                      : parking!.tarif_horaire * duration * 1000}{' '}
                                    Millimes
                                  </span>
                                </div>
                              </div>
                            </div>

                            <form >
                              <div className="d-flex justify-content-end align-items-center">
                                <Link
                                  to="#"
                                  onClick={handlePrev}
                                  className="btn btn-light d-inline-flex align-items-center prev_btn me-2"
                                >
                                  Back
                                </Link>
                                <Link
                                  to="#"
                                  onClick={handlePayment}
                                  className="btn btn-linear-primary next_btn"
                                >
                                  Payment
                                </Link>

                              </div>
                            </form>
                          </div>
                        </div>

                      </fieldset>
                    )}

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* /Page Wrapper */}
      </>

    </>
  )
}

export default BookingParking