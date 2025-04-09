import React, { useEffect ,useState } from 'react';
import { Link } from 'react-router-dom';
import ImageWithBasePath from '../../../../core/img/ImageWithBasePath';
import { all_routes } from '../../../../core/data/routes/all_routes';
import BookingModals from '../../customers/common/bookingModals';
import { customerOption, serviceOption, staffOption } from '../../../../core/data/json/dropDownData';
import CustomDropdown from '../../common/dropdown/commonSelect';
import CommonDatePicker from '../../../../core/hooks/commonDatePicker';
// adjust as needed
import axios from "axios";
interface Reservation {
  _id: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  parkingId: string;  // Parking ID
  parking: {
    nom: string;
    image: string;
    adresse: string;
  } | null; // parking details will be populated later
}
const ProviderBooking = () => {
  const routes = all_routes;
  const [selectedItems, setSelectedItems] = useState(Array(10).fill(false));
  const handleItemClick = (index: number) => {
    setSelectedItems((prevSelectedItems) => {
      const updatedSelectedItems = [...prevSelectedItems];
      updatedSelectedItems[index] = !updatedSelectedItems[index];
      return updatedSelectedItems;
    });
  };
  const [parkings, setParkings] = useState<Record<string, { nom: string; image: string; adresse: string }>>({});
  const [reservations, setReservations] = useState<Reservation[]>([]);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/reservations");
        console.log("Fetched reservations:", res.data);
  
        setReservations(res.data.data);  // Access the array inside 'data'
      } catch (error) {
        console.error("Failed to fetch reservations:", error);
      }
    };
  
    fetchReservations();
  }, []);
  useEffect(() => {
    const fetchParkings = async () => {
      const updatedReservations = [...reservations]; // Copy of reservations state

      for (let i = 0; i < updatedReservations.length; i++) {
        const reservation = updatedReservations[i];
        if (reservation.parkingId && !reservation.parking) {
          try {
            const parkingRes = await axios.get(`http://localhost:4000/api/parking/${reservation.parkingId}`);
            updatedReservations[i].parking = parkingRes.data;  // Assuming parking details come with nom, image, adresse
          } catch (error) {
            console.error('Error fetching parking details for reservation:', reservation._id, error);
          }
        }
      }

      setReservations(updatedReservations); // Update the state with parking details
    };

    if (reservations.length > 0) {
      fetchParkings();
    }
  }, [reservations]);
  
  
  return (
    <>
  {/* Page Wrapper */}
  <div className="page-wrapper">
    <div className="content container-fluid">
      <div className="row">
        <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3 mb-4">
          <h4>Booking List</h4>
          <div className="d-flex align-items-center flex-wrap row-gap-3">
            <span className="fs-14 me-2 ">Sort</span>
            <div className="dropdown me-2">
              <Link
                to="#"
                className="dropdown-toggle"
                data-bs-toggle="dropdown"
              >
                Newly Added
              </Link>
              <div className="dropdown-menu">
                <Link to="#" className="dropdown-item active">
                  Newly Added
                </Link>
                <Link to="#" className="dropdown-item">
                  Oldest
                </Link>
              </div>
            </div>
            <Link
              to={routes.providerBookDetails}
              className="tags d-flex justify-content-center align-items-center border rounded me-2"
            >
              <i className="ti ti-calendar-month" />
            </Link>
            <Link
              to={routes.providerBooking}
              className="tags active d-flex justify-content-center align-items-center border rounded me-2"
            >
              <i className="ti ti-list" />
            </Link>
            <Link
              to="#"
              className="btn btn-dark d-flex align-items-center"
              data-bs-toggle="modal"
              data-bs-target="#add_booking"
            >
              <i className="ti ti-circle-plus me-2" />
              Add Bookings
            </Link>
          </div>
        </div>
      </div>
      <div className="row justify-content-center">
            <div className="col-xxl-12 col-lg-12">
              {reservations.length > 0 ? (
                reservations.map((reservation) => (
                  <div key={reservation._id} className="card shadow-none booking-list">
                    <div className="card-body d-md-flex align-items-center">
                      <div className="booking-widget d-sm-flex align-items-center row-gap-3 flex-fill mb-3 mb-md-0">
                        <div className="booking-img me-sm-3 mb-3 mb-sm-0">
                          <Link to={routes.bookingDetails} className="avatar">
                            <ImageWithBasePath
                              src={reservation.parking?.image || "assets/img/parking.jpg"}
                              alt="Parking Image"
                            />
                          </Link>
                        </div>

                        <div className="booking-det-info">
                          <h6 className="mb-3">
                            <Link to={routes.bookingDetails}>
                              {reservation.parking?.nom || "Parking Spot"}
                            </Link>
                            <span className="badge badge-soft-success ms-2">Confirmed</span>
                          </h6>

                          <ul className="booking-details">
                            <li className="d-flex align-items-center mb-2">
                              <span className="book-item">Booking Date</span>
                              <small className="me-2">: </small>
                              {new Date(reservation.startDate).toLocaleDateString()}{" "}
                              {new Date(reservation.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{" "}
                              {new Date(reservation.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </li>
                            <li className="d-flex align-items-center mb-2">
                              <span className="book-item">Amount</span>
                              <small className="me-2">: </small> ${reservation.totalPrice.toFixed(2)}
                              <span className="badge badge-soft-primary ms-2">Paid</span>
                            </li>
                            <li className="d-flex align-items-center mb-2">
                              <span className="book-item">Location</span>
                              <small className="me-2">: </small>
                              {reservation.parking?.adresse || "Unknown"}
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div>
                        <Link to={routes.booking} className="btn btn-light" data-bs-toggle="modal" data-bs-target="#reschedule">
                          Reschedule
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p>No reservations available.</p>
              )}
            </div>
          </div>
  
  
      <div className="d-flex justify-content-between align-items-center flex-wrap row-gap-3">
        <div className="value d-flex align-items-center">
          <span>Show</span>
          <select>
            <option>7</option>
          </select>
          <span>entries</span>
        </div>
        <div className="d-flex align-items-center justify-content-center">
          <span className="me-2 text-gray-9">1 - 07 of 10</span>
          <nav aria-label="Page navigation">
            <ul className="paginations d-flex justify-content-center align-items-center">
              <li className="page-item me-2">
                <Link
                  className="page-link-1 active d-flex justify-content-center align-items-center "
                  to="#"
                >
                  1
                </Link>
              </li>
              <li className="page-item me-2">
                <Link
                  className="page-link-1 d-flex justify-content-center align-items-center "
                  to="#"
                >
                  2
                </Link>
              </li>
              <li className="page-item ">
                <Link
                  className="page-link-1 d-flex justify-content-center align-items-center "
                  to="#"
                >
                  3
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  </div>
    {/* Add Booking */}
    <div className="modal fade custom-modal" id="add_booking">
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-header d-flex align-items-center justify-content-between border-bottom">
          <h5 className="modal-title">Add Booking</h5>
          <Link
            to="#"
            data-bs-dismiss="modal"
            aria-label="Close"
          >
            <i className="ti ti-circle-x-filled fs-20" />
          </Link>
        </div>
        <form >
          <div className="modal-body">
            <div className="row">
              <div className="col-md-12">
                <div className="mb-3">
                  <label className="form-label">Staff</label>
                  <CustomDropdown
                options={staffOption}
                className="select d-flex"
                placeholder="Select"
            />
                </div>
              </div>
              <div className="col-md-12">
                <div className="mb-3">
                  <label className="form-label">Service</label>
                  <CustomDropdown
                options={serviceOption}
                className="select d-flex"
                placeholder="Select"
            />
                </div>
              </div>
              <div className="col-md-12">
                <div className="mb-3">
                  <label className="form-label">Customer</label>
                  <CustomDropdown
                options={customerOption}
                className="select d-flex"
                placeholder="Select"
            />
                </div>
              </div>
              <div className="col-md-12">
                <div className="mb-3">
                  <div className="sel-cal react-calender Calendar-icon">
                    <span>
                      <i className="ti ti-calendar-month" />
                    </span>
                    <CommonDatePicker/>
                  </div>
                </div>
              </div>
              <div className="col-md-12">
                <div className="row">
                  <div className="col-lg-6">
                    <div className="mb-3">
                      <div className="sel-cal Calendar-icon">
                        <span>
                          <i className="ti ti-clock" />
                        </span>
                        <input
                          className="form-control timepicker"
                          type="text"
                          placeholder="dd-mm-yyyy"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="mb-3">
                      <div className="sel-cal Calendar-icon">
                        <span>
                          <i className="ti ti-clock" />
                        </span>
                        <input
                          className="form-control timepicker"
                          type="text"
                          placeholder="dd-mm-yyyy"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-md-12">
                <div className="mb-0">
                  <label className="form-label">Booking Message</label>
                  <textarea
                    rows={4}
                    className="form-control"
                    defaultValue={""}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <Link
              to="#"
              className="btn btn-light me-2"
              data-bs-dismiss="modal"
            >
              Cancel
            </Link>
            <button type="button" data-bs-dismiss="modal" className="btn btn-dark">
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
  {/* /Add Booking */}
  {/* /Page Wrapper */}
  <BookingModals/>
</>

  );
};

export default ProviderBooking;
