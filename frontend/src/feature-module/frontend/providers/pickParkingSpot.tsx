import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios'; 

const ParkingVisualization = () => {
  const navigate = useNavigate();  
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [parkingSpots, setParkingSpots] = useState([]);
  const [occupiedSpots, setOccupiedSpots] = useState([]);
  const [parkingInfo, setParkingInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // const { parkingId } = useParams(); // Get parking ID from URL parameters
  // Or use a fixed ID for testing:
  const parkingId = "67d6d098fb0f9da17eee00c9"; 
  
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch parking information first to get nbr_place
        const parkingResponse = await axios.get(`http://localhost:4000/api/parking/${parkingId}`);
        console.log("Parking response:", parkingResponse);

        if (!parkingResponse.data) {
          throw new Error("Failed to load parking information");
        }
        
        // Handle different response formats - direct object or nested in data property
        const parkingData = parkingResponse.data;
        setParkingInfo(parkingData);
        
        // Then fetch parking spots for this parking
        const spotsResponse = await axios.get(`http://localhost:4000/api/parking-spots/by-parking/${parkingId}`);
        console.log("Spots response:", spotsResponse);
        
        if (!spotsResponse.data) {
          throw new Error("Failed to load parking spots");
        }
        
        // Parking spots are wrapped in a data property
        const spots = spotsResponse.data.data;
        
        if (!spots || spots.length === 0) {
          setParkingSpots([]);
          setOccupiedSpots([]);
          return;
        }
        
        // Process spots into available and occupied
        const availableSpots = spots
          .filter(spot => spot.disponibilite)
          .map(spot => ({
            id: spot.numero,
            _id: spot._id, // Store MongoDB ID for future API calls
            position: determinePosition(spot.numero, parkingData.nbr_place),
            row: determineRow(spot.numero, parkingData.nbr_place)
          }));
        
        const unavailableSpots = spots
          .filter(spot => !spot.disponibilite)
          .map(spot => ({
            position: determinePosition(spot.numero, parkingData.nbr_place),
            row: determineRow(spot.numero, parkingData.nbr_place)
          }));
        
        setParkingSpots(availableSpots);
        setOccupiedSpots(unavailableSpots);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError(error.response?.data?.message || error.message || "Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    if (parkingId) {
      fetchData();
    } else {
      setError("No parking ID provided");
      setLoading(false);
    }
  }, [parkingId]);
  
  // Helper functions to determine position and row based on spot number and total spots
  const determinePosition = (spotNumber, totalSpots) => {
    // Example: Assuming we have 2 spots per row (left and right)
    // A01, A03, A05, etc. are on the left
    // A02, A04, A06, etc. are on the right
    const number = parseInt(spotNumber.replace(/[^0-9]/g, ''));
    return number % 2 === 0 ? 'right' : 'left';
  };
  
  const determineRow = (spotNumber, totalSpots) => {
    // Example: If we have 2 spots per row, then
    // A01 and A02 are row 1, A03 and A04 are row 2, etc.
    const number = parseInt(spotNumber.replace(/[^0-9]/g, ''));
    return Math.ceil(number / 2);
  };
  
  // Calculate max rows based on nbr_place (assuming 2 spots per row)
  const calculateMaxRows = () => {
    if (!parkingInfo) return 0;
    // If each row has 2 spots (left and right), then max rows = nbr_place / 2
    return Math.ceil(parkingInfo.nbr_place / 2);
  };

  const handleSelectSpot = (spotId) => {
    setSelectedSpot(spotId);
  };

  const handleContinue = async () => {
    if (selectedSpot) {
      try {
        // Find the spot data from your parkingSpots array
        const spotData = parkingSpots.find(spot => spot.id === selectedSpot);
        if (!spotData) return;
        
        // Optional: Update the availability status in the backend
        // await axios.put(`/api/parkingSpots/${spotData._id}`, { disponibilite: false });
        
        // Navigate to confirmation page
        navigate('/confirmation', { 
          state: { 
            selectedSpot,
            parkingName: parkingInfo?.nom,
            tarif: parkingInfo?.tarif_horaire
          } 
        });
      } catch (error) {
        console.error("Error updating spot availability:", error);
        setError("Failed to reserve the spot. Please try again.");
      }
    }
  };

  const generateParkingLayout = () => {
    const maxRows = calculateMaxRows();
    const layout = [];

    // Entry/Exit Section
    layout.push(
      <div key="entry-exit" className="traffic-lane mb-4 py-2 bg-light">
        <div className="d-flex align-items-center justify-content-between px-3">
          <div className="d-flex align-items-center gap-2">
            <i className="ti ti-arrow-left fs-4 text-primary"></i>
            <span className="small text-muted">Entry</span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="small text-muted">Exit</span>
            <i className="ti ti-arrow-right fs-4 text-primary"></i>
          </div>
        </div>
      </div>
    );

    // Parking Rows
    for (let row = 1; row <= maxRows; row++) {
      const leftSpot = parkingSpots.find(spot => spot.position === 'left' && spot.row === row);
      const rightSpot = parkingSpots.find(spot => spot.position === 'right' && spot.row === row);
      
      const isLeftOccupied = occupiedSpots.some(spot => spot.position === 'left' && spot.row === row);
      const isRightOccupied = occupiedSpots.some(spot => spot.position === 'right' && spot.row === row);

      layout.push(
        <div className="parking-row position-relative mb-3" key={`row-${row}`}>
          {/* Traffic Lane Separator */}
          <div className="traffic-separator">
            <div className="dashed-line"></div>
            <div className="traffic-arrows">
              <i className="ti ti-arrow-left"></i>
              <i className="ti ti-arrow-right"></i>
            </div>
          </div>

          <div className="d-flex justify-content-between align-items-center py-2">
            {/* Left Side */}
            <div className="parking-side left-side">
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
                </div>
              )}
            </div>

            {/* Right Side */}
            <div className="parking-side right-side">
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
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return layout;
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

          {/* Parking Layout */}
          <div className="card border-0 shadow-lg">
            <div className="card-body p-4">
              <div className="parking-layout">
                {generateParkingLayout()}
              </div>

              {/* Continue Button */}
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