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

const ParkingVisualization = ({
  parkingId,
  selectedSpot,
  setSelectedSpot,
  selectedStartTime,
  selectedEndTime
}: ParkingVisualizationProps) => {
  const navigate = useNavigate();
  const [parkingSpots, setParkingSpots] = useState<any[]>([]);
  const [occupiedSpots, setOccupiedSpots] = useState<any[]>([]);
  const [parkingInfo, setParkingInfo] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [reservations, setReservations] = useState<any[]>([]); // Initialize as an empty array

  // Fetching parking information and spots
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch parking details (info such as name, rate, etc.)
        const parkingResponse = await axios.get(`http://localhost:4000/api/parking/${parkingId}`);
        if (!parkingResponse.data) throw new Error('Failed to load parking information');
        const parkingData = parkingResponse.data;
        setParkingInfo(parkingData);

        // Fetch parking spots
        const spotsResponse = await axios.get(`http://localhost:4000/api/parking-spots/by-parking/${parkingId}`);
        if (!spotsResponse.data) throw new Error('Failed to load parking spots');
        const spots = spotsResponse.data.data;

        if (!spots || spots.length === 0) {
          setParkingSpots([]);
          setOccupiedSpots([]);
          return;
        }

        const availableSpots = spots
          .filter((spot: any) => spot.disponibilite)
          .map((spot: any) => ({
            id: spot.numero,
            _id: spot._id,
            position: spot.numero.match(/[0-9]+/)[0] % 7 === 0 || spot.numero.match(/[0-9]+/)[0] <= 2 ? 'right' : 'left',
            row: determineCustomRow(spot.numero),
          }));

        const unavailableSpots = spots
          .filter((spot: any) => !spot.disponibilite)
          .map((spot: any) => ({
            id: spot.numero,
            _id: spot._id,
            position: spot.numero.match(/[0-9]+/)[0] % 7 === 0 || spot.numero.match(/[0-9]+/)[0] <= 2 ? 'right' : 'left',
            row: determineCustomRow(spot.numero),
          }));

        setParkingSpots(availableSpots);
        setOccupiedSpots(unavailableSpots);
        
        // Fetch all reservations for the parking lot
        const reservationResponse = await axios.get(`http://localhost:4000/api/reservations/by-parking/${parkingId}`);
        if (Array.isArray(reservationResponse.data)) { // Ensure that it's an array
          setReservations(reservationResponse.data);
        } else {
          setReservations([]); // In case the data is not an array
        }
        
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load parking spots');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    if (parkingId) {
      fetchData();
    } else {
      setError('No parking ID provided');
      setLoading(false);
    }
  }, [parkingId]);

  const determineCustomRow = (spotNumber: string) => {
    const number = parseInt(spotNumber.replace(/[^0-9]/g, ''));
    return number <= 2 ? number : number - 2;
  };

  // Function to check if a spot is occupied based on reservation dates
  const isSpotOccupied = (spotId: string) => {
    return reservations.some((reservation: any) => {
      // Check if this reservation is for the same parking spot
      if (reservation.parkingSpot !== spotId) return false;
  
      const reservationStart = new Date(reservation.startDate);
      const reservationEnd = new Date(reservation.endDate);
      const selectedStart = new Date(selectedStartTime);
      const selectedEnd = new Date(selectedEndTime);
  
      // Check if selected time range overlaps with this reservation
      return selectedStart < reservationEnd && selectedEnd > reservationStart;
    });
  };
  
  

  const handleSelectSpot = (event: React.MouseEvent<HTMLButtonElement>, spotId: string) => {
    event.preventDefault();
    if (isSpotOccupied(spotId)) {
      return; // Do not select the spot if it's occupied
    }
    setSelectedSpot(spotId); // Save the MongoDB _id instead of spot.numero
  };

  const generateParkingLayout = () => {
    const leftSpots: any[] = [];
    const rightSpots: any[] = [];
    const centerExitPath: any[] = [];
    const centerEntryPath: any[] = [];

    const maxRows = Math.max(leftSpots.length, rightSpots.length);

    for (let i = 0; i < maxRows; i++) {
      centerExitPath.push(
        <div className="exit-path-segment" key={`exit-path-${i}`}>
          {i === Math.floor(maxRows / 2) && (
            <div className="exit-label">EXIT</div>
          )}
        </div>
      );
    }

    // Entry Path (Centered in the middle)
    for (let i = 0; i < maxRows; i++) {
      centerEntryPath.push(
        <div className="entry-path-segment" key={`entry-path-${i}`}>
          {i === Math.floor(maxRows / 2) && (
            <div className="entry-label">ENTRY</div>
          )}
        </div>
      );
    }

    // Generate the left spots dynamically
    parkingSpots.forEach((spot) => {
      const isOccupied = isSpotOccupied(spot.id);
      if (spot.position === 'left') {
        leftSpots.push(
          <div className="parking-side left-side mb-3" key={`left-${spot.id}`}>
            <button
              className={`spot-btn ${selectedSpot === spot._id ? 'active' : ''}`}
              onClick={(e) => handleSelectSpot(e, spot._id)}
              disabled={isOccupied}
            >
              {isOccupied ? <img src="../../../" alt="Occupied" /> : spot.id}
            </button>
          </div>
        );
      }
    });

    // Generate the right spots dynamically
    parkingSpots.forEach((spot) => {
      const isOccupied = isSpotOccupied(spot.id);
      if (spot.position === 'right') {
        rightSpots.push(
          <div className="parking-side right-side mb-3" key={`right-${spot.id}`}>
            <button
              className={`spot-btn ${selectedSpot === spot._id ? 'active' : ''}`}
              onClick={(e) => handleSelectSpot(e, spot._id)}
              disabled={isOccupied}
            >
              {isOccupied ? <img src="../../../../public/assets/img/car2D.png" alt="Occupied" /> : spot.id}
            </button>
          </div>
        );
      }
    });

    return (
      <div className="d-flex justify-content-between">
        <div className="w-30 pe-2">{renderSpots(leftSpots, 'left')}</div>
        <div className="exit-path-container w-15 px-1">{renderPath('EXIT')}</div>
        <div className="w-30 px-1">{renderSpots(rightSpots, 'right')}</div>
        <div className="entry-path-container w-15 ps-1">{renderPath('ENTRY')}</div>
        {/* Left Parking Spots */}
        <div className="w-30 pe-2">
          {leftSpots}
        </div>

        {/* Exit Path in the Middle */}
        <div className="exit-path-container w-15 px-1">
          <div className="exit-path">{centerExitPath}</div>
        </div>

        {/* Right Parking Spots */}
        <div className="w-30 px-1">
          {rightSpots}
        </div>

        {/* Entry Path in the Middle */}
        <div className="entry-path-container w-15 ps-1">
          <div className="entry-path">{centerEntryPath}</div>
        </div>
      </div>
    );
  };

  if (loading) return <div className="text-center p-5"><span className="spinner-border"></span></div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  if (loading) {
    return <div className="text-center p-5"><span className="spinner-border"></span></div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="page-wrapper">
      <div className="content container-fluid">
        <div className="row justify-content-center">
          <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3 mb-4">
            <h4>Select Parking Spot - {parkingInfo?.nom}</h4>
            {parkingInfo && (
              <div className="small text-muted">
                Rate: {parkingInfo.tarif_horaire} per hour • {parkingInfo.nbr_place} total spots
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
