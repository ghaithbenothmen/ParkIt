import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface ParkingVisualizationProps {
  parkingId: string;
  selectedSpot: string | null;
  setSelectedSpot: (spotId: string | null) => void;
  selectedStartTime: string; // ⛔ missing
  selectedEndTime: string;   // ⛔ missing
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
  selectedEndTime
}: ParkingVisualizationProps) => {
  const navigate = useNavigate();
  const [parkingSpots, setParkingSpots] = useState<ParkingSpot[]>([]);
  const [occupiedSpots, setOccupiedSpots] = useState<ParkingSpot[]>([]);
  const [parkingInfo, setParkingInfo] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reservations, setReservations] = useState<any[]>([]); // Initialize as an empty array

  // Mapping each spot to the required format
  const mapSpotData = (spot: any) => {
    return {
      id: spot.numero,
      _id: spot._id,
      position: spot.numero.match(/[0-9]+/)[0] % 7 === 0 || spot.numero.match(/[0-9]+/)[0] <= 2 ? 'right' : 'left',
      row: determineCustomRow(spot.numero),
      disponibilite: spot.disponibilite, // Ensure availability status is included
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

        // Fetch parking details (info such as name, rate, etc.)
        const parkingResponse = await axios.get(`http://localhost:4000/api/parking/${parkingId}`);
        const parkingData = parkingResponse.data;
        console.log('Fetched parking details:', parkingData); // Log parking info
        setParkingInfo(parkingData);



        const reservationsResponse = await axios.get(`http://localhost:4000/api/reservations/by-parking/${parkingId}`);
        const allReservations = reservationsResponse.data?.data || [];
        setReservations(allReservations);
        console.log("allReservations",allReservations)

        const spotsResponse = await axios.get(`http://localhost:4000/api/parking-spots/by-parking/${parkingId}`);
        console.log('Fetched parking spots:', spotsResponse.data); // Log parking spots data
        if (spotsResponse.data && spotsResponse.data.data) {
          const spots = spotsResponse.data.data.map(mapSpotData); // Map spots data before setting
          setParkingSpots(spots); // Make sure this contains the correct spots data
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load parking spots');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [parkingId]);  // Only re-run when parkingId changes

  const determineCustomRow = (spotNumber: string) => {
    const number = parseInt(spotNumber.replace(/[^0-9]/g, ''));
    return number <= 2 ? number : number - 2;
  };

  // Function to check if a spot is occupied based on reservation dates
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
    if (isSpotOccupied(spotId)) {
      return; // Do not select the spot if it's occupied
    }
    setSelectedSpot(spotId); // Save the MongoDB _id instead of spot.numero
  };

  const renderPath = (label: string) => {
    const maxRows = Math.max(parkingSpots.filter(spot => spot.position === 'left').length,
      parkingSpots.filter(spot => spot.position === 'right').length);
    return Array.from({ length: maxRows }, (_, i) => (
      <div className={`${label.toLowerCase()}-path-segment`} key={`${label}-${i}`}>
        {i === Math.floor(maxRows / 2) && <div className={`${label.toLowerCase()}-label`}>{label}</div>}
      </div>
    ));
  };

  const renderSpots = (spots: ParkingSpot[], side: 'left' | 'right') => {
    const emptyCount = Math.max(parkingSpots.length - spots.length, 0);
    const placeholders = Array.from({ length: emptyCount }, (_, i) => (
      <div className={`parking-side ${side}-side mb-3`} key={`empty-${side}-${i}`}>
        <div className="spot-placeholder empty"></div>
      </div>
    ));

    const renderedSpots = spots.map((spot) => {
      const isSelected = selectedSpot === spot._id;
      const occupied = isSpotOccupied(spot._id);
      

      return (
        <div className={`parking-side ${side}-side mb-3`} key={`${side}-${spot.id}`}>
          {occupied ? (
            <div className="spot-placeholder">
              <img src="/assets/img/car2D.png" alt="Occupied" className="occupied-spot-img" />
            </div>
          ) : (
            <button
              className={`spot-btn ${isSelected ? 'active' : ''}`}
              onClick={(e) => handleSelectSpot(e, spot._id)}
            >
              {spot.id}
            </button>
          )}
        </div>
      );
    });

    return side === 'left'
      ? [...renderedSpots, ...placeholders]
      : [...placeholders, ...renderedSpots];
  };


  const generateParkingLayout = () => {
    const leftSpots = parkingSpots.filter(spot => spot.position === 'left');
    const rightSpots = parkingSpots.filter(spot => spot.position === 'right');
    const maxRows = Math.max(leftSpots.length, rightSpots.length);

    return (
      <div className="d-flex justify-content-between">
        <div className="w-30 px-1">{renderSpots(leftSpots, 'left')}</div>
        <div className="exit-path-container w-15 px-1">{renderPath('EXIT')}</div>
        <div className="w-30 px-1">{renderSpots(rightSpots, 'right')}</div>
        <div className="entry-path-container w-15 ps-1">{renderPath('ENTRY')}</div>
      </div>
    );
  };

  if (loading) return <div className="text-center p-5"><span className="spinner-border"></span></div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  if (!parkingSpots.length) {
    return <div className="text-center p-5">No available parking spots.</div>;
  }

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
              <div className="parking-layout">
                {generateParkingLayout()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParkingVisualization;