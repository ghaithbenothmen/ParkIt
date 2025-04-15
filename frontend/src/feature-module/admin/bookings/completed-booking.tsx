import { DataTable } from 'primereact/datatable'
import React, { useState, useEffect } from 'react'

import { Column } from 'primereact/column';
import { Link } from 'react-router-dom';
import ImageWithBasePath from '../../../core/img/ImageWithBasePath';
import * as Icon from 'react-feather';
import { Dropdown } from 'primereact/dropdown';
import { useSelector } from 'react-redux';
import { CompletedBookingInterface } from '../../../core/models/interface';
import { jwtDecode } from 'jwt-decode';
import axios from "axios";
interface Reservation {
  _id: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  parkingId: string;  // Parking ID
  status: string;
  parkingSpot: string;
  parking: {
    nom: string;
    image: string;
    adresse: string;
  } | null; // parking details will be populated later
  parkingS: {
    numero: string;
  } | null;
  userId: string;  // User ID field added
  user?: {
    firstname: string;
    email: string;
  }; // parking details will be populated later
}



const CompletedBooking = () => {

  const [parkings, setParkings] = useState<Record<string, { nom: string; image: string; adresse: string }>>({});
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredReservations = reservations.filter(reservation => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'confirmed' && reservation.status === 'confirmed') return true;
    if (filterStatus === 'pending' && reservation.status === 'pending') return true;
    if (filterStatus === 'over' && reservation.status === 'over') return true;
    return false;
  });

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/api/reservations/confirmed`);
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
  useEffect(() => {
    const fetchParkingSpots = async () => {
      const updatedReservations = [...reservations];

      for (let i = 0; i < updatedReservations.length; i++) {
        const reservation = updatedReservations[i];

        if (reservation.parkingSpot && !reservation.parkingS) {
          try {
            console.log(`Fetching parking spot for ID: ${reservation.parkingSpot}`);
            const spotRes = await axios.get(`http://localhost:4000/api/parking-spots/${reservation.parkingSpot}`);
            console.log("Parking spot fetched:", spotRes.data);
            updatedReservations[i].parkingS = spotRes.data.data;
          } catch (error) {
            console.error('Error fetching parking spot for reservation:', reservation._id, error);
          }
        }
      }

      setReservations(updatedReservations);
    };

    if (reservations.length > 0) {
      fetchParkingSpots();
    }
  }, [reservations]);

  const renderStatusBadge = (rowData: Reservation) => {
    let badgeClass = '';
    const label = rowData.status;

    switch (rowData.status.toLowerCase()) {
      case 'confirmed':
        badgeClass = 'badge bg-success'; // Green
        break;
      case 'pending':
        badgeClass = 'badge bg-primary'; // Blue
        break;
      case 'over':
        badgeClass = 'badge bg-danger'; // Red
        break;
      default:
        badgeClass = 'badge bg-secondary'; // Gray fallback
    }

    return <span className={badgeClass}>{label}</span>;
  };
  const data = useSelector((state: any) => state.bookingCompleted);

  const [selectedValue, setSelectedValue] = useState(null);
  const value = [{ name: 'A - Z' }, { name: 'Z - A' }];



  const renderNameAndImage = (rowData: CompletedBookingInterface) => {
    if (typeof rowData.img === 'string') {
      return (
        <div className="table-profileimage">
          <ImageWithBasePath src={rowData.img} alt={rowData.img} style={{ width: '50px', height: 'auto' }} />
          <span className="ml-2">{rowData.name}</span>
        </div>
      );
    } else {
      return (
        <div className="table-profileimage">
          <span className="ml-2">{rowData.name}</span>
        </div>
      );
    }
  };

  const renderNameAndUserImage = (rowData: any) => {
    return (
      <div className="d-flex align-items-center">
        <ImageWithBasePath src={rowData.userImg} alt="img" style={{ width: '50px', height: 'auto' }} />
        <div className="ml-2">
          <span>{rowData.user}</span>
        </div>
      </div>
    );
  };
  const renderNameAndServiceImage = (rowData: CompletedBookingInterface) => {
    return (
      <div className="d-flex align-items-center">
        <ImageWithBasePath src={rowData.serviceImg} alt="img" style={{ width: '50px', height: 'auto' }} />
        <div className="ml-2">
          <span>{rowData.service}</span>
        </div>
      </div>
    );
  };

  const renderActionColumn = (rowData: CompletedBookingInterface) => {
    const actions = rowData.action.split('\n');

    if (actions.length > 1) {
      return (
        <div>
          <select className="form-select">
            {actions.map((action, index) => (
              <option key={index} value={action}>
                {action}
              </option>
            ))}
          </select>
        </div>
      );
    } else {
      return <div>{actions[0]}</div>;
    }
  }
  useEffect(() => {
    const fetchUserDetails = async () => {
      const updatedReservations = [...reservations]; // Copy of reservations state

      for (let i = 0; i < updatedReservations.length; i++) {
        const reservation = updatedReservations[i];
        if (reservation.userId && !reservation.user) {
          try {
            const userRes = await axios.get(`http://localhost:4000/api/users/${reservation.userId}`);
            updatedReservations[i].user = {
              firstname: userRes.data.firstname,
              email: userRes.data.email,
            };
          } catch (error) {
            console.error('Error fetching user details for reservation:', reservation._id, error);
          }
        }
      }

      setReservations(updatedReservations); // Update the state with user details
    };

    if (reservations.length > 0) {
      fetchUserDetails();
    }
  }, [reservations]);

  const renderUserDetails = (rowData: Reservation) => {
    return rowData.user ? (
      <div>
        <div>{rowData.user.firstname}</div>
        <div>{rowData.user.email}</div>
      </div>
    ) : (
      '—' // Fallback if user details are not available yet
    );
  };

  return (
    <>
      <div className="page-wrapper page-settings">
        <div className="content">
          <div className="content-page-header content-page-headersplit">
            <h5>Booking List</h5>
            <div className="list-btn">
              <ul>
                <li>
                  <div className="filter-sorting">
                    <ul>
                      <li>
                        <Link to="#" className="filter-sets">
                          <Icon.Filter className="react-feather-custom me-2"></Icon.Filter>
                          Filter
                        </Link>
                      </li>
                      <li>
                        <span>
                          <ImageWithBasePath
                            src="assets/img/icons/sort.svg"
                            className="me-2"
                            alt="img"
                          />
                        </span>
                        <div className="review-sort">
                          <Dropdown
                            value={selectedValue}
                            onChange={(e) => setSelectedValue(e.value)}
                            options={value}
                            optionLabel="name"
                            placeholder="A - Z"
                            className="select admin-select-breadcrumb"
                          />
                        </div>
                      </li>
                    </ul>
                  </div>
                </li>
              </ul>
            </div>
          </div>
          <div className="row">
            <div className="col-12">
              <div className="tab-sets">
                <div className="tab-contents-sets">
                  <ul>
                    <li>
                      <Link to="/admin/booking">All Booking</Link>
                    </li>
                    <li>
                      <Link to="/admin/pending-booking">Pending </Link>
                    </li>
                    <li>
                      <Link to="/admin/completed-booking" className="active">
                        Completed{" "}
                      </Link>
                    </li>
                    <li>
                      <Link to="/admin/cancelled-booking">Cancelled</Link>
                    </li>
                  </ul>
                </div>
                <div className="tab-contents-count">
                  <h6>Showing 8-10 of 84 results</h6>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-12 ">
              <div className="table-resposnive table-div">
                <DataTable
                  paginatorTemplate="RowsPerPageDropdown CurrentPageReport PrevPageLink PageLinks NextPageLink  "
                  currentPageReportTemplate="{first} to {last} of {totalRecords}"
                  value={filteredReservations}
                  paginator
                  rows={10}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  tableStyle={{ minWidth: '50rem' }}
                >
                  <Column header="User" body={renderUserDetails} />
                  <Column field="startDate" header="Start Date" sortable />
                  <Column field="endDate" header="End Date" sortable />
                  <Column field="totalPrice" header="Total Price" sortable />
                  <Column header="Parking" body={(rowData) => rowData.parking?.nom || '—'} />
                  <Column header="Address" body={(rowData) => rowData.parking?.adresse || '—'} />
                  <Column header="Spot" body={(rowData) => rowData.parkingS?.numero || '—'} />
                  <Column field="status" header="Status" body={renderStatusBadge} sortable />

                </DataTable>
              </div>
            </div>
          </div>
        </div>
      </div>

    </>
  )
}

export default CompletedBooking
