import { DataTable } from 'primereact/datatable';
import React, { useState, useEffect } from 'react';
import { Column } from 'primereact/column';
import { Link } from 'react-router-dom';
import ImageWithBasePath from '../../../core/img/ImageWithBasePath';
import * as Icon from 'react-feather';
import { Dropdown } from 'primereact/dropdown';
import { useSelector } from 'react-redux';
import { CompletedBookingInterface } from '../../../core/models/interface';
import axios from "axios";
import { format } from 'date-fns';
import TruncatedAddress from '../dashboard/TruncatedAddress';

interface Reservation {
  _id: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  parkingId: {
    _id: string;
    nom: string;
    image: string;
    adresse: string;
  };
  status: string;
  parkingSpot: {
    _id: string;
    numero: string;
  };
  userId: {
    _id: string;
    firstname: string;
    email: string;
  };
}

const CompletedBooking = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/api/reservations/confirmed`);
        console.log("Fetched completed reservations:", res.data);
        setReservations(res.data.data);
      } catch (error) {
        console.error("Failed to fetch reservations:", error);
      }
    };

    fetchReservations();
  }, []);

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
    return rowData.userId ? (
      <div>
        <div>{rowData.userId.firstname}</div>
        <div>{rowData.userId.email}</div>
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
                      <Link to="/admin/booking">All Booking</Link>
                    </li>
                    <li>
                      <Link to="/admin/pending-booking">Pending </Link>
                    </li>
                    <li>
                      <Link to="/admin/completed-booking" className="active">
                        Completed
                      </Link>
                    </li>
                    <li>
                      <Link to="/admin/cancelled-booking">Cancelled</Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-12 ">
              <div className="table-resposnive table-div">
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
                  <Column header="Parking" body={(rowData) => rowData.parkingId?.nom || '—'} />
                  <Column
                    header="Address"
                    body={(rowData) => <TruncatedAddress address={rowData.parkingId?.adresse} />}
                  />
                  <Column header="Spot" body={(rowData) => rowData.parkingSpot?.numero || '—'} />
                  <Column field="status" header="Status" body={renderStatusBadge} sortable />
                </DataTable>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CompletedBooking;