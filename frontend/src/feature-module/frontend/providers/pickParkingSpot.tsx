import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const ParkingVisualization = () => {
  const navigate = useNavigate();
  const { parkingId } = useParams();
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [parkingSpots, setParkingSpots] = useState([]);
  const [parkingInfo, setParkingInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const parkingRes = await axios.get(`http://localhost:4000/api/parking/${parkingId}`);
        setParkingInfo(parkingRes.data);

        const spotsRes = await axios.get(`http://localhost:4000/api/parking-spots/by-parking/${parkingId}`);
        const spots = spotsRes.data.data;

        const processed = spots.map((spot) => {
          const spotNumber = parseInt(spot.numero.replace(/[^0-9]/g, ''));
          const isRight = spotNumber >= 6; // Only 2 spots to the right (id > 5)

          return {
            id: spot.numero,
            _id: spot._id,
            disponibilite: spot.disponibilite,
            position: isRight ? 'right' : 'left',
            row: spotNumber, // simple row logic
          };
        });

        setParkingSpots(processed);
      } catch (err) {
        console.error("Error loading data:", err);
        setError(err.message || "Une erreur est survenue.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [parkingId]);

  const handleSelectSpot = (spotId) => setSelectedSpot(spotId);

  const handleContinue = () => {
    const spotData = parkingSpots.find(s => s.id === selectedSpot);
    if (!spotData) return;

    navigate('/confirmation', {
      state: {
        selectedSpot,
        parkingName: parkingInfo?.nom,
        tarif: parkingInfo?.tarif_horaire,
      },
    });
  };

  const generateParkingLayout = () => {
    const leftSpots = parkingSpots
      .filter(s => s.position === 'left')
      .sort((a, b) => a.row - b.row)
      .slice(0, 5);

    const rightSpots = parkingSpots
      .filter(s => s.position === 'right')
      .sort((a, b) => a.row - b.row)
      .slice(0, 2);

    const maxRows = Math.max(leftSpots.length, rightSpots.length);

    const renderPath = (label) =>
      Array.from({ length: maxRows }, (_, i) => (
        <div className={`${label.toLowerCase()}-path-segment`} key={`${label}-${i}`}>
          {i === Math.floor(maxRows / 2) && <div className={`${label.toLowerCase()}-label`}>{label}</div>}
        </div>
      ));

    const renderSpots = (spots, side) => {
      const emptyCount = maxRows - spots.length;
      const placeholders = Array.from({ length: emptyCount }, (_, i) => (
        <div className={`parking-side ${side}-side mb-3`} key={`empty-${side}-${i}`}>
          <div className="spot-placeholder empty"></div>
        </div>
      ));

      const renderedSpots = spots.map((spot) => {
        const isSelected = selectedSpot === spot.id;

        return (
          <div className={`parking-side ${side}-side mb-3`} key={`${side}-${spot.id}`}>
            {spot.disponibilite ? (
              <button
                className={`spot-btn ${isSelected ? 'active' : ''}`}
                onClick={() => handleSelectSpot(spot.id)}
              >
                {spot.id}
              </button>
            ) : (
              <div className="spot-placeholder">
                <img src="/assets/img/car2D.png" alt="Occupied" />
              </div>
            )}
          </div>
        );
      });

      return side === 'left'
        ? [...renderedSpots, ...placeholders]
        : [...placeholders, ...renderedSpots];
    };

    return (
      <div className="d-flex justify-content-between">
        <div className="w-30 pe-2">{renderSpots(leftSpots, 'left')}</div>
        <div className="exit-path-container w-15 px-1">{renderPath('EXIT')}</div>
        <div className="w-30 px-1">{renderSpots(rightSpots, 'right')}</div>
        <div className="entry-path-container w-15 ps-1">{renderPath('ENTRY')}</div>
      </div>
    );
  };

  if (loading) return <div className="text-center p-5"><span className="spinner-border"></span></div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

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
