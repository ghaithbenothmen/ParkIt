import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface ParkingVisualizationProps {
  parkingId: string;
  selectedSpot: string | null;
  setSelectedSpot: (spotId: string | null) => void;
  selectedStartTime: string;
  selectedEndTime: string;
}

interface ParkingSpot {
  _id: string;
  id: string;
  numero: string;
  disponibilite: boolean;
  position: 'left' | 'right';
  row: number;
}

const ParkingVisualization = ({
  parkingId,
  selectedSpot,
  setSelectedSpot,
  selectedStartTime,
  selectedEndTime,
}: ParkingVisualizationProps) => {
  const navigate = useNavigate();
  const [parkingSpots, setParkingSpots] = useState<ParkingSpot[]>([]);
  const [parkingInfo, setParkingInfo] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reservations, setReservations] = useState<any[]>([]);

  const mapSpotData = (spot: any) => {
    return {
      id: spot.numero,
      _id: spot._id,
      position: spot.numero.match(/[0-9]+/)[0] % 7 === 0 || spot.numero.match(/[0-9]+/)[0] <= 2 ? 'right' : 'left',
      row: determineCustomRow(spot.numero),
      disponibilite: spot.disponibilite,
    };
  };

  useEffect(() => {
    if (!parkingId) {
      setError('No parking ID provided');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        const parkingResponse = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/parking/${parkingId}`);
        const parkingData = parkingResponse.data;
        console.log('Fetched parking details:', parkingData);
        setParkingInfo(parkingData);

        const reservationsResponse = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/reservations/by-parking/${parkingId}`).catch(err => {
          if (err.response && err.response.status === 404) {
            console.warn("No reservations found for this parking.");
            return { data: { data: [] } };
          }
          throw err;
        });
        const allReservations = reservationsResponse.data?.data || [];
        setReservations(allReservations);
        console.log("allReservations", allReservations);

        const spotsResponse = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/parking-spots/by-parking/${parkingId}`);
        console.log('Fetched parking spots:', spotsResponse.data);
        if (spotsResponse.data && spotsResponse.data.data) {
          const spots = spotsResponse.data.data.map(mapSpotData);
          setParkingSpots(spots);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load parking spots');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [parkingId]);

  const determineCustomRow = (spotNumber: string) => {
    const number = parseInt(spotNumber.replace(/[^0-9]/g, ''));
    return number <= 2 ? number : number - 2;
  };

  const isSpotOccupied = (spotId: string) => {
    const selectedStart = new Date(selectedStartTime);
    const selectedEnd = new Date(selectedEndTime);

    const result = reservations.some((reservation: any) => {
      if (reservation.parkingSpot !== spotId) return false;

      const reservationStart = new Date(reservation.startDate);
      const reservationEnd = new Date(reservation.endDate);

      const overlap = selectedStart < reservationEnd && selectedEnd > reservationStart;
      return overlap;
    });

    console.log(`>>> Final result for spot ${spotId}: ${result}`);
    return result;
  };

  const handleSelectSpot = (event: React.MouseEvent<HTMLButtonElement>, spotId: string) => {
    event.preventDefault();
    if (isSpotOccupied(spotId)) return;
    setSelectedSpot(spotId);
  };

  const renderSpots = (spots: ParkingSpot[], side: 'left' | 'right') => {
    const sortedSpots = spots.sort((a, b) => parseInt(a.id.replace(/[^0-9]/g, '')) - parseInt(b.id.replace(/[^0-9]/g, '')));
    return sortedSpots.map((spot) => {
      const isSelected = selectedSpot === spot._id;
      const occupied = isSpotOccupied(spot._id);

      return (
        <div className={`parking-spot-container ${side}-side`} key={spot._id}>
          <div className="access-lane"></div>
          <div className={`parking-spot ${occupied ? 'occupied' : ''}`}>
            {occupied ? (
              <div className="spot-placeholder">
                <img src="/assets/img/car2D.png" alt="Occupied" className="occupied-spot-img" />
              </div>
            ) : (
              <button
                className={`spot-btn ${isSelected ? 'active' : ''}`}
                onClick={(e) => handleSelectSpot(e, spot._id)}
              >
                {spot.id.replace(/[^0-9]/g, '')}
              </button>
            )}
          </div>
        </div>
      );
    });
  };

  const generateParkingLayout = () => {
    const leftSpots = parkingSpots.filter(spot => spot.position === 'left');
    const rightSpots = parkingSpots.filter(spot => spot.position === 'right');

    return (
      <div className="parking-layout">
        <div className="entry-sign">ENTRY</div>
        <div className="parking-container">
          <div className="left-lane">
            {renderSpots(leftSpots, 'left')}
          </div>
          <div className="main-road">
            <div className="road-boundary left"></div>
            <div className="road-boundary right"></div>
            <div className="road-marking"></div>
          </div>
          <div className="right-lane">
            {renderSpots(rightSpots, 'right')}
          </div>
        </div>
        <div className="exit-sign">EXIT</div>
      </div>
    );
  };

  if (loading) return <div className="text-center p-5"><span className="spinner-border"></span></div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!parkingSpots.length) return <div className="text-center p-5">No available parking spots.</div>;

  return (
    <div className="page-wrapper">
      <div className="content container-fluid">
        <div className="row justify-content-center">
          <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3 mb-4">
            <h4>Select Parking Spot - {parkingInfo?.nom}</h4>
            {parkingInfo && (
              <div className="small text-muted">
                Price: {parkingInfo.tarif_horaire}$ per hour • {parkingInfo.nbr_place} total spots
              </div>
            )}
          </div>

          <div className="card border-0 shadow-lg">
            <div className="card-body p-4">
              {generateParkingLayout()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParkingVisualization;