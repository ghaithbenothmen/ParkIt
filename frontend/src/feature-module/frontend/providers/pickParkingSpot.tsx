import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ParkingVisualization = ({ parkingId }: { parkingId: string }) => {
  const navigate = useNavigate();
  const [selectedSpot, setSelectedSpot] = useState<string | null>(null);
  const [parkingSpots, setParkingSpots] = useState<any[]>([]);
  const [occupiedSpots, setOccupiedSpots] = useState<any[]>([]);
  const [parkingInfo, setParkingInfo] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const parkingResponse = await axios.get(`http://localhost:4000/api/parking/${parkingId}`);
        if (!parkingResponse.data) throw new Error('Failed to load parking information');
        const parkingData = parkingResponse.data;
        setParkingInfo(parkingData);

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
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (parkingId) {
      fetchData();
    } else {
      setError('No parking ID provided');
      setLoading(false);
    }
  }, [parkingId]);

  const determineCustomRow = (spotNumber: string) => {
    const number = parseInt(spotNumber.replace(/[^0-9]/g, ''));
    if (number <= 2) {
      return number;
    } else {
      return number - 2;
    }
  };

  const handleSelectSpot = (spotId: string) => {
    setSelectedSpot(spotId);  // This should update the selected spot
  };

  const handleContinue = async () => {
    if (selectedSpot) {
      try {
        const spotData = parkingSpots.find((spot) => spot.id === selectedSpot);
        if (!spotData) return;

        navigate('/confirmation', {
          state: {
            selectedSpot,
            parkingName: parkingInfo?.nom,
            tarif: parkingInfo?.tarif_horaire,
          },
        });
      } catch (error) {
        console.error('Error reserving spot:', error);
        setError('Failed to reserve the spot. Please try again.');
      }
    }
  };

  const generateParkingLayout = () => {
    const leftSideSpots = ['A01', 'A02', 'A03', 'A04', 'A05'];
    const rightSideSpots = ['A06', 'A07'];

    const leftSpots: any[] = [];
    const rightSpots: any[] = [];
    const centerExitPath: any[] = [];
    const centerEntryPath: any[] = [];

    const maxRows = Math.max(leftSideSpots.length, rightSideSpots.length);

    for (let i = 0; i < maxRows; i++) {
      centerExitPath.push(
        <div className="exit-path-segment" key={`exit-path-${i}`}>
          {i === Math.floor(maxRows / 2) && (
            <div className="exit-label">EXIT</div>
          )}
        </div>
      );
    }

    for (let i = 0; i < maxRows; i++) {
      centerEntryPath.push(
        <div className="entry-path-segment" key={`entry-path-${i}`}>
          {i === Math.floor(maxRows / 2) && (
            <div className="entry-label">ENTRY</div>
          )}
        </div>
      );
    }

    for (let i = 0; i < leftSideSpots.length; i++) {
      const spotId = leftSideSpots[i];
      const leftSpot = parkingSpots.find((spot) => spot.id === spotId);
      const isLeftOccupied = occupiedSpots.some((spot) => spot.id === spotId);

      leftSpots.push(
        <div className="parking-side left-side mb-3" key={`left-${i}`}>
          {leftSpot ? (
            <button
              className={`spot-btn ${selectedSpot === leftSpot.id ? 'active' : ''}`}
              onClick={() => handleSelectSpot(leftSpot.id)}
            >
              {leftSpot.id}
            </button>
          ) : (
            <div className="spot-placeholder">
              {isLeftOccupied && <img src="./../assets/img/car2D.png" alt="Occupied" />}
              {!isLeftOccupied && spotId}
            </div>
          )}
        </div>
      );
    }

    const emptySpacesNeeded = leftSideSpots.length - rightSideSpots.length;

    for (let i = 0; i < emptySpacesNeeded; i++) {
      rightSpots.push(
        <div className="parking-side right-side mb-3" key={`right-empty-${i}`}>
          <div className="spot-placeholder empty"></div>
        </div>
      );
    }

    for (let i = 0; i < rightSideSpots.length; i++) {
      const spotId = rightSideSpots[i];
      const rightSpot = parkingSpots.find((spot) => spot.id === spotId);
      const isRightOccupied = occupiedSpots.some((spot) => spot.id === spotId);

      rightSpots.push(
        <div className="parking-side right-side mb-3" key={`right-${i}`}>
          {rightSpot ? (
            <button
              className={`spot-btn ${selectedSpot === rightSpot.id ? 'active' : ''}`}
              onClick={() => handleSelectSpot(rightSpot.id)}
            >
              {rightSpot.id}
            </button>
          ) : (
            <div className="spot-placeholder">
              {isRightOccupied && <img src="./../assets/img/car2D.png" alt="Occupied" />}
              {!isRightOccupied && spotId}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="d-flex justify-content-between">
        <div className="w-30 pe-2">{leftSpots}</div>
        <div className="exit-path-container w-15 px-1">
          <div className="exit-path">{centerExitPath}</div>
        </div>
        <div className="w-30 px-1">{rightSpots}</div>
        <div className="entry-path-container w-15 ps-1">
          <div className="entry-path">{centerEntryPath}</div>
        </div>
      </div>
    );
  };

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

              <div className="text-center mt-5 pt-3">
                <button
                  className={`confirm-btn ${selectedSpot ? 'active' : ''}`}
                  onClick={handleContinue}
                  disabled={!selectedSpot}
                >
                  {selectedSpot ? `Confirm Spot ${selectedSpot}` : 'Select a Spot'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParkingVisualization;
