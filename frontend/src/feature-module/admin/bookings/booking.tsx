/* eslint-disable @typescript-eslint/no-unused-vars */
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ImageWithBasePath from '../../../core/img/ImageWithBasePath';
import { useSelector } from 'react-redux';
import { Dropdown } from 'primereact/dropdown';
import { all_routes } from '../../../core/data/routes/all_routes';
import * as Icon from 'react-feather';
import { BookingInterface } from '../../../core/models/interface';
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

const Booking = () => {
  const routes = all_routes;
  const data = useSelector((state: any) => state.all_booking);
  const [selectedValue, setSelectedValue] = useState(null);
  const value = [{ name: 'A - Z' }, { name: 'Z - A' }];
  const value2 = [
    { name: 'Select Status' },
    { name: 'Pending' },
    { name: 'Completed' },
    { name: 'Cancelled' },
  ];

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
        const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/reservations`);
        console.log("Fetched reservations:", res.data);
        const reservationsData = res.data.data;

        // Fetch all additional data in parallel
        const updatedReservations = await Promise.all(
          reservationsData.map(async (reservation) => {
            let parkingData = null;
            let spotData = null;
            let userData = null;

            try {
              if (reservation.parkingId) {
                const parkingRes = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/parking/${reservation.parkingId}`);
                parkingData = parkingRes.data;
              }
              if (reservation.parkingSpot) {
                const spotRes = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/parking-spots/${reservation.parkingSpot}`);
                spotData = spotRes.data.data;
              }
              if (reservation.userId) {
                const userRes = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/users/${reservation.userId}`);
                userData = {
                  firstname: userRes.data.firstname,
                  email: userRes.data.email,
                };
              }
            } catch (error) {
              console.error('Error fetching related data:', error);
            }

            return {
              ...reservation,
              parking: parkingData,
              parkingS: spotData,
              user: userData,
            };
          })
        );

        setReservations(updatedReservations);
      } catch (error) {
        console.error("Failed to fetch reservations:", error);
      }
    };

    fetchReservations();
  }, []); // Empty dependency array as we only want to fetch once

  const statusButton = (rowData: BookingInterface) => {
    if (rowData.status === 'Completed') {
      return <span className="badge-delete">{rowData.status}</span>;
    } else if (rowData.status === 'Canceleld') {
      return <span className="badge-inactive">{rowData.status}</span>;
    } else if (rowData.status === 'Pending') {
      return <span className="badge-pending">{rowData.status}</span>;
    } else {
      return rowData.status;
    }
  };

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
    <div>
      <div className="page-wrapper page-settings">
        <div className="content">
          <div className="content-page-header content-page-headersplit">
            <h5>Booking List</h5>
            <div className="list-btn">
              <ul>
                <li>
                  <div className="filter-sorting">
                    <ul></ul>
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
                      <Link to={routes.booking} className="active">
                        All Booking
                      </Link>
                    </li>
                    <li>
                      <Link to={routes.pendingBooking}>Pending</Link>
                    </li>
                    <li>
                      <Link to={routes.completedBooking}>Completed</Link>
                    </li>
                    <li>
                      <Link to={routes.cancelledBooking}>Cancelled</Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-12">
              <div className="table-resposnive table-div">
                <table className="table datatable">
                  <DataTable
                    paginatorTemplate="RowsPerPageDropdown CurrentPageReport PrevPageLink PageLinks NextPageLink"
                    currentPageReportTemplate="{first} to {last} of {totalRecords}"
                    value={filteredReservations}
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
    </div>
  );
};

export default Booking;