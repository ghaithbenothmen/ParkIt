import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Dropdown } from 'primereact/dropdown';
import React, { useState, useEffect } from 'react';
import ImageWithBasePath from '../../../core/img/ImageWithBasePath';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { all_routes } from '../../../core/data/routes/all_routes';
import * as Icon from 'react-feather';
import { CancelledBookingInterface } from '../../../core/models/interface';
import axios from "axios";
import { format } from 'date-fns';
import TruncatedAddress from '../dashboard/TruncatedAddress';

interface Reservation {
  _id: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  parkingId: string;
  status: string;
  parkingSpot: string;
  parking: {
    nom: string;
    image: string;
    adresse: string;
  } | null;
  parkingS: {
    numero: string;
  } | null;
  userId: string;
  user?: {
    firstname: string;
    email: string;
  };
}

const CancelledBooking = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const routes = all_routes;

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/reservations/over`);
        console.log("Initial cancelled reservations:", res.data);
        const updatedReservations = await Promise.all(
          res.data.data.map(async (reservation: Reservation) => {
            try {
              // Fetch parking details
              const parkingRes = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/parking/${reservation.parkingId}`);
              console.log("Parking data for reservation:", parkingRes.data);

              // Fetch parking spot details
              const spotRes = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/parking-spots/${reservation.parkingSpot}`);
              console.log("Spot data for reservation:", spotRes.data);

              // Fetch user details
              const userRes = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/users/${reservation.userId}`);
              console.log("User data for reservation:", userRes.data);

              return {
                ...reservation,
                parking: parkingRes.data,
                parkingS: spotRes.data.data,
                user: {
                  firstname: userRes.data.firstname,
                  email: userRes.data.email
                }
              };
            } catch (error) {
              console.error("Error fetching related data:", error);
              return reservation;
            }
          })
        );
        console.log("Final updated reservations:", updatedReservations);
        setReservations(updatedReservations);
      } catch (error) {
        console.error("Failed to fetch reservations:", error);
      }
    };

    fetchReservations();
  }, []); // Empty dependency array - runs once on mount

  const renderStatusBadge = (rowData: Reservation) => {
    let badgeClass = '';
    const label = rowData.status;

    switch (rowData.status.toLowerCase()) {
      case 'confirmed':
        badgeClass = 'badge bg-success';
        break;
      case 'pending':
        badgeClass = 'badge bg-primary';
        break;
      case 'over':
        badgeClass = 'badge bg-danger';
        break;
      default:
        badgeClass = 'badge bg-secondary';
    }

    return <span className={badgeClass}>{label}</span>;
  };

  const renderUserDetails = (rowData: Reservation) => {
    return rowData.user ? (
      <div>
        <div>{rowData.user.firstname}</div>
        <div>{rowData.user.email}</div>
      </div>
    ) : (
      '—'
    );
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'yyyy-MM-dd hha');
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };

  return (
    <>
      <div className="page-wrapper page-settings">
        <div className="content">
          <div className="content-page-header content-page-headersplit">
            <h5>Booking List</h5>
          </div>
          <div className="row">
            <div className="col-12">
              <div className="tab-sets">
                <div className="tab-contents-sets">
                  <ul>
                    <li>
                      <Link to={routes.booking}>All Booking</Link>
                    </li>
                    <li>
                      <Link to={routes.pendingBooking}>Pending </Link>
                    </li>
                    <li>
                      <Link to={routes.completedBooking}>Completed</Link>
                    </li>
                    <li>
                      <Link to={routes.cancelledBooking} className="active">
                        Cancelled
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-12 ">
              <div className="table-resposnive table-div">
                <table className="table datatable">
                  <DataTable
                    paginatorTemplate="RowsPerPageDropdown CurrentPageReport PrevPageLink PageLinks NextPageLink"
                    currentPageReportTemplate="{first} to {last} of {totalRecords}"
                    value={reservations}
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    tableStyle={{ minWidth: '50rem' }}
                  >
                    <Column header="User" body={renderUserDetails} />
                    <Column
                      header="Start Date"
                      body={(rowData) => formatDate(rowData.startDate)}
                      sortable
                    />
                    <Column
                      header="End Date"
                      body={(rowData) => formatDate(rowData.endDate)}
                      sortable
                    />
                    <Column 
                      field="totalPrice" 
                      header="Total Price" 
                      sortable
                      body={(rowData) => `${rowData.totalPrice} DT`}
                    />
                    <Column header="Parking" body={(rowData) => rowData.parking?.nom || '—'} />
                    <Column
                      header="Address"
                      body={(rowData) => <TruncatedAddress address={rowData.parking?.adresse} />}
                    />
                    <Column header="Spot" body={(rowData) => rowData.parkingS?.numero || '—'} />
                    <Column field="status" header="Status" body={renderStatusBadge} sortable />
                  </DataTable>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CancelledBooking;