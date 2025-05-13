import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Link } from 'react-router-dom';
import { Column } from 'primereact/column';
import { Dropdown } from 'primereact/dropdown';
import * as Icon from 'react-feather';
import ImageWithBasePath from '../../../core/img/ImageWithBasePath';
import { useSelector } from 'react-redux';
import { all_routes } from '../../../core/data/routes/all_routes';
import { PendingBookinginterface } from '../../../core/models/interface';
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

const routes = all_routes;

const PendingBooking = () => {
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
                const res = await axios.get(`http://localhost:4000/api/reservations/pending`);
                console.log("Fetched reservations:", res.data);
                setReservations(res.data.data);
            } catch (error) {
                console.error("Failed to fetch reservations:", error);
            }
        };

        fetchReservations();
    }, []);

    useEffect(() => {
        const fetchParkings = async () => {
            const updatedReservations = [...reservations];

            for (let i = 0; i < updatedReservations.length; i++) {
                const reservation = updatedReservations[i];
                if (reservation.parkingId && !reservation.parking) {
                    try {
                        const parkingRes = await axios.get(`http://localhost:4000/api/parking/${reservation.parkingId}`);
                        updatedReservations[i].parking = parkingRes.data;
                    } catch (error) {
                        console.error('Error fetching parking details for reservation:', reservation._id, error);
                    }
                }
            }

            setReservations(updatedReservations);
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

    useEffect(() => {
        const fetchUserDetails = async () => {
            const updatedReservations = [...reservations];

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

            setReservations(updatedReservations);
        };

        if (reservations.length > 0) {
            fetchUserDetails();
        }
    }, [reservations]);

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
                                            <Link to={routes.pendingBooking} className="active">Pending </Link>
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
                        <div className="col-12 ">
                            <div className="table-resposnive table-div">
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
                                    <Column field="totalPrice" header="Total Price" sortable />
                                    <Column header="Parking" body={(rowData) => rowData.parking?.nom || '—'} />
                                    <Column
                                        header="Address"
                                        body={(rowData) => <TruncatedAddress address={rowData.parking?.adresse} />}
                                    />
                                    <Column header="Spot" body={(rowData) => rowData.parkingS?.numero || '—'} />
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

export default PendingBooking;