import React, { useEffect, useState } from 'react'
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

const BookingParking = () => {
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



  useEffect(() => {
    // Replace with your actual API endpoint
    axios
      .get(`http://localhost:4000/api/parking/${id}`)
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
    phone: ''
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    console.log('ho' + storedUser)
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
            phone: user.phone || ''
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
            phone: decoded.phone || ''
          });
        }
      } catch (err) {
        console.error('Error processing stored user:', err);
      }
    }
  }, []);

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

        const response = await axios.get(`http://localhost:4000/api/vehicules/${userId}`);
        console.log('Fetched vehicles:', response.data);
        setUserVehicles(response.data.vehicules);
      } catch (error) {
        console.error('Error fetching vehicles:', error);
      }
    };

    fetchVehicles(); // ✅ Always call it, no need to wait for userInfo
  }, []);



  const routes = all_routes
  const [selectedValue1, setSelectedValue1] = useState(null);
  const [selectedValue2, setSelectedValue2] = useState(null);
  const value1 = [
    { name: '0-2 Hrs' },
    { name: '2-3 Hrs' },
    { name: '3-4 Hrs' },
  ];
  const value2 = [
    { name: '1st Floor' },
    { name: '2st Floor' },
    { name: '3st Floor' },
  ];
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
      const reservationData = {
        userId: userInfo._id,
        parkingId: parking?._id,
        parkingSpot: "67cfb44da934fcde03496cb0",
        vehicule: selectedVehicleId,
        startDate: startDateTime,
        endDate: endDate,
        totalPrice: parking?.tarif_horaire! * duration,
      };

      console.log("Reservation Data being sent:", reservationData);

      const response = await fetch('http://localhost:4000/api/reservations', {
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
        alert('Reservation successful!');
        // Optional: redirect to another page, e.g., a confirmation page
        // navigate('/confirmation');
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
      <BreadCrumb title='Book a Service' item1='Service' item2='Book a Service' />
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
                            <ImageWithBasePath
                              src="assets/img/service-request.jpg"
                              className="border-0"
                              alt="img"
                            />
                          </span>
                          <div>
                            <h5 className="mb-1">Removals</h5>
                            <p className="fs-14">35 Providers Available</p>
                          </div>
                        </div>
                        <div className="booking-wizard p-0">
                          <h6 className="mb-3 fw-semibold">Steps</h6>
                          <ul className="wizard-progress" id="bokingwizard">
                            <li className={`${currentStep === 1 ? 'active' : currentStep > 1 ? 'activated' : ''} pb-4`}>
                              <span>Basic Information</span>
                            </li>
                            <li className={`${currentStep === 2 ? 'active' : currentStep > 2 ? 'activated' : ''} pb-4`}>
                              <span>Booking Schedule</span>
                            </li>
                            <li className={`${currentStep === 3 ? 'active' : currentStep > 3 ? 'activated' : ''} pb-4`}>
                              <span>Collection Address Details</span>
                            </li>
                            <li className={`${currentStep === 4 ? 'active' : currentStep > 4 ? 'activated' : ''} pb-4`}>
                              <span>Delivery Address Details</span>
                            </li>
                            <li className={`${currentStep === 5 ? 'active' : currentStep > 5 ? 'activated' : ''} pb-4`}>
                              <span>Additional Items</span>
                            </li>
                            <li className={`${currentStep === 6 ? 'active' : currentStep > 6 ? 'activated' : ''} pb-4`}>
                              <span>Review Order</span>
                            </li>
                            <li>
                              <span>Checkout</span>
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
                            <h5 className="mb-3">Personal Details(<p>parking nom :(badelha juste test) {parking?.nom}</p>)</h5>
                            <form >
                              <div>
                                <h6 className="mb-3 fs-16 fw-medium">
                                  Basic Information
                                </h6>
                                <div className="form-check mb-4">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    defaultValue=""
                                    id="remember_me"
                                  />
                                  <label
                                    className="form-check-label"
                                    htmlFor="remember_me"
                                  >
                                    Is the Name and Contact details the same as on your
                                    Profile?
                                  </label>
                                </div>
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
                            <h5 className="mb-3">Book Parking Details</h5>
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
                                <label className="form-label fw-semibold">Total</label>
                                <div><strong>${(duration * parking?.tarif_horaire!).toFixed(2)}</strong> / {duration} hours</div>
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
                            <h5 className="mb-3">Collection Address Details</h5>
                            <form >
                              <div>
                                <ParkingVisualization parkingId={parking?._id!} />
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
                            <h5 className="mb-3">Delivery Address Details</h5>
                            <form >
                              <div>
                                <div className="row">
                                  {Array.isArray(userVehicles) && userVehicles.map((vehicule) => (
                                    <div
                                    className={`card h-100 shadow-sm ${selectedVehicleId === vehicule._id ? 'border-primary' : ''}`}
                                    onClick={() => setSelectedVehicleId(vehicule._id)}
                                    style={{ cursor: 'pointer' }}
                                  >
                                    <div className="card-body">
                                      <h6 className="card-title">{vehicule.marque} - {vehicule.modele}</h6>
                                      <p className="card-text">
                                        <strong>Matricule:</strong> {vehicule.immatriculation}<br />
                                        <strong>Type:</strong> {vehicule.type}
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
                        <div className="card flex-fill mb-0">
                          <div className="card-body">
                            <h5 className="mb-3">Additional Items</h5>
                            <form >
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
                    {currentStep === 6 && (
                      <fieldset style={{ display: 'flex' }}>
                        <div className="flex-fill">
                          <div className="review-order">
                            <h6 className="fs-16 fw-medium border-bottom mb-3 pb-3">
                              Order Details
                            </h6>
                            <div className="d-flex align-items-center justify-content-md-between flex-wrap gap-3">
                              <div className="rounded bg-white p-2 text-center review-item">
                                <h6 className="fw-medium fs-16 mb-1">
                                  Booking Charges
                                </h6>
                                <span>£ 42.00</span>
                              </div>
                              <div className="rounded bg-white p-2 text-center review-item">
                                <h6 className="fw-medium fs-16 mb-1">CC Zone</h6>
                                <span>£ 0.00</span>
                              </div>
                              <div className="rounded bg-white p-2 text-center review-item">
                                <h6 className="fw-medium fs-16 mb-1">Subtotal</h6>
                                <span>£ 280.00</span>
                              </div>
                              <div className="rounded bg-white p-2 text-center review-item">
                                <h6 className="fw-medium fs-16 mb-1">V.A.T</h6>
                                <span>£ 0.00</span>
                              </div>
                              <div className="rounded bg-white p-2 text-center review-item">
                                <h6 className="fw-medium fs-16 mb-1">Total Payment</h6>
                                <span>£ 322.00</span>
                              </div>
                            </div>
                          </div>
                          <div className="card mb-0">
                            <div className="card-body">
                              <h5 className="mb-3">Review Order</h5>
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
                                        <span>Name</span>
                                      </div>
                                      <div className="mb-2">
                                        <h6 className="fs-14 fw-medium mb-1">Phone</h6>
                                        <span>Phone</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-md-4 col-sm-6">
                                    <div className="mb-3">
                                      <div className="mb-2">
                                        <h6 className="fs-14 fw-medium mb-1">
                                          Last Name
                                        </h6>
                                        <span>Name</span>
                                      </div>
                                      <div className="mb-2">
                                        <h6 className="fs-14 fw-medium mb-1">
                                          Booking Estimate
                                        </h6>
                                        <span>2</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-md-4 col-sm-6">
                                    <div className="mb-3">
                                      <div className="mb-2">
                                        <h6 className="fs-14 fw-medium mb-1">Email</h6>
                                        <span>Email</span>
                                      </div>
                                      <div className="mb-2">
                                        <h6 className="fs-14 fw-medium mb-1">
                                          CC Zone
                                        </h6>
                                        <span>CC Zone</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="border-bottom mb-3">
                                <h6 className="fs-16 fw-medium mb-3">
                                  Booking Schedule
                                </h6>
                                <div className="row">
                                  <div className="col-md-4 col-sm-6">
                                    <div className="mb-3">
                                      <div className="mb-2">
                                        <h6 className="fs-14 fw-medium mb-1">
                                          Luton Van
                                        </h6>
                                        <span>2, 2</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-md-4 col-sm-6">
                                    <div className="mb-3">
                                      <div className="mb-2">
                                        <h6 className="fs-14 fw-medium mb-1">
                                          Number of Luton Vans
                                        </h6>
                                        <span>2</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-md-4 col-sm-6">
                                    <div className="mb-3">
                                      <div className="mb-2">
                                        <h6 className="fs-14 fw-medium mb-1">
                                          Booking Date/Time
                                        </h6>
                                        <span>26 September 2024</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="border-bottom mb-3">
                                <h6 className="fs-16 fw-medium mb-3">
                                  Collection Address Details
                                </h6>
                                <div className="row">
                                  <div className="col-md-4 col-sm-6">
                                    <div className="mb-3">
                                      <div className="mb-2">
                                        <h6 className="fs-14 fw-medium mb-1">
                                          Address
                                        </h6>
                                        <span>Address</span>
                                      </div>
                                      <div className="mb-2">
                                        <h6 className="fs-14 fw-medium mb-1">
                                          Floor Level
                                        </h6>
                                        <span>1</span>
                                      </div>
                                      <div className="mb-2">
                                        <h6 className="fs-14 fw-medium mb-1">Phone</h6>
                                        <span>Phone</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-md-4 col-sm-6">
                                    <div className="mb-3">
                                      <div className="mb-2">
                                        <h6 className="fs-14 fw-medium mb-1">Email</h6>
                                        <span>Email</span>
                                      </div>
                                      <div className="mb-2">
                                        <h6 className="fs-14 fw-medium mb-1">
                                          Is there a Lift
                                        </h6>
                                        <span>Yes</span>
                                      </div>
                                      <div className="mb-2">
                                        <h6 className="fs-14 fw-medium mb-1">
                                          Property Type
                                        </h6>
                                        <span>House</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-md-4 col-sm-6">
                                    <div className="mb-3">
                                      <div className="mb-2">
                                        <h6 className="fs-14 fw-medium mb-1">
                                          First Name
                                        </h6>
                                        <span>Name</span>
                                      </div>
                                      <div className="mb-2">
                                        <h6 className="fs-14 fw-medium mb-1">
                                          Number of Bedrooms
                                        </h6>
                                        <span>5</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="border-bottom mb-3">
                                <h6 className="fs-16 fw-medium mb-3">
                                  Delivery Address Details
                                </h6>
                                <div className="row">
                                  <div className="col-md-4 col-sm-6">
                                    <div className="mb-3">
                                      <div className="mb-2">
                                        <h6 className="fs-14 fw-medium mb-1">
                                          Address
                                        </h6>
                                        <span>Address</span>
                                      </div>
                                      <div className="mb-2">
                                        <h6 className="fs-14 fw-medium mb-1">
                                          Floor Level
                                        </h6>
                                        <span>1</span>
                                      </div>
                                      <div className="mb-2">
                                        <h6 className="fs-14 fw-medium mb-1">Phone</h6>
                                        <span>Phone</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-md-4 col-sm-6">
                                    <div className="mb-3">
                                      <div className="mb-2">
                                        <h6 className="fs-14 fw-medium mb-1">Email</h6>
                                        <span>Email</span>
                                      </div>
                                      <div className="mb-2">
                                        <h6 className="fs-14 fw-medium mb-1">
                                          Is there a Lift
                                        </h6>
                                        <span>Yes</span>
                                      </div>
                                      <div className="mb-2">
                                        <h6 className="fs-14 fw-medium mb-1">
                                          Property Type
                                        </h6>
                                        <span>House</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-md-4 col-sm-6">
                                    <div className="mb-3">
                                      <div className="mb-2">
                                        <h6 className="fs-14 fw-medium mb-1">
                                          First Name
                                        </h6>
                                        <span>Name</span>
                                      </div>
                                      <div className="mb-2">
                                        <h6 className="fs-14 fw-medium mb-1">
                                          Number of Bedrooms
                                        </h6>
                                        <span>5</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="border-bottom mb-3">
                                <h6 className="fs-16 fw-medium mb-3">
                                  Additional Details
                                </h6>
                                <div className="row">
                                  <div className="col-md-4 col-sm-6">
                                    <div className="mb-3">
                                      <div className="mb-2">
                                        <h6 className="fs-14 fw-medium mb-1">
                                          Already have items
                                        </h6>
                                        <span>Nil</span>
                                      </div>
                                      <div className="mb-2">
                                        <h6 className="fs-14 fw-medium mb-1">
                                          Does the car start?
                                        </h6>
                                        <span>Nil</span>
                                      </div>
                                      <div className="mb-2">
                                        <h6 className="fs-14 fw-medium mb-1">
                                          Largest Items
                                        </h6>
                                        <span>Nil</span>
                                      </div>
                                      <div className="mb-2">
                                        <h6 className="fs-14 fw-medium mb-1">
                                          Special Notes
                                        </h6>
                                        <span>Notes</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-md-4 col-sm-6">
                                    <div className="mb-3">
                                      <div className="mb-2">
                                        <h6 className="fs-14 fw-medium mb-1">
                                          Already bought items
                                        </h6>
                                        <span>No</span>
                                      </div>
                                      <div className="mb-2">
                                        <h6 className="fs-14 fw-medium mb-1">
                                          Hair Done?
                                        </h6>
                                        <span>Nil</span>
                                      </div>
                                      <div className="mb-2">
                                        <h6 className="fs-14 fw-medium mb-1">
                                          Items need mounting?
                                        </h6>
                                        <span>Nil</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="col-md-4 col-sm-6">
                                    <div className="mb-3">
                                      <div className="mb-2">
                                        <h6 className="fs-14 fw-medium mb-1">
                                          Does the car run and drive?
                                        </h6>
                                        <span>Nil</span>
                                      </div>
                                      <div className="mb-2">
                                        <h6 className="fs-14 fw-medium mb-1">
                                          Do you need furniture assembly?
                                        </h6>
                                        <span>Nil</span>
                                      </div>
                                      <div className="mb-2">
                                        <h6 className="fs-14 fw-medium mb-1">
                                          Number of Items that need Assembling
                                        </h6>
                                        <span>1</span>
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
                                  className="btn btn-linear-primary"
                                  onClick={handleCheckout}
                                >
                                  Checkout
                                </button>
                              </div>
                            </div>
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