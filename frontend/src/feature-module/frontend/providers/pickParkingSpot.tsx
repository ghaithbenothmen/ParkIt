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
  const parkingId = "67d6dc550344fc876386b161"; 
  
  
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
            position: spot.numero.match(/[0-9]+/)[0] % 7 === 0 || spot.numero.match(/[0-9]+/)[0] <= 2 ? 'right' : 'left', // Adjusted logic for spot positions
            row: determineCustomRow(spot.numero)
          }));
        
          const unavailableSpots = spots
          .filter(spot => !spot.disponibilite)
          .map(spot => ({
            id: spot.numero,
            _id: spot._id,
            position: spot.numero.match(/[0-9]+/)[0] % 7 === 0 || spot.numero.match(/[0-9]+/)[0] <= 2 ? 'right' : 'left',
            row: determineCustomRow(spot.numero)
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
  
  // Custom row determination for the new layout (5 left, 2 right)
  const determineCustomRow = (spotNumber) => {
    const number = parseInt(spotNumber.replace(/[^0-9]/g, ''));
    
    if (number <= 2) { // A01, A02 on right side
      return number;
    } else { // A03-A07 on left side
      return number - 2; // Adjust rows for left side
    }
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
    // Define which spots should be on which side
    const leftSideSpots = ['A01', 'A02', 'A03', 'A04', 'A05'];
    const rightSideSpots = ['A06', 'A07'];
    
    const leftSpots = [];
    const rightSpots = [];
    const centerExitPath = [];
    const centerEntryPath = [];
  
    // Get maximum number of rows
    const maxRows = Math.max(leftSideSpots.length, rightSideSpots.length);
  
    // Generate center path elements for exit
    for (let i = 0; i < maxRows; i++) {
      centerExitPath.push(
        <div className="exit-path-segment" key={`exit-path-${i}`}>
          {i === Math.floor(maxRows / 2) && (
            <div className="exit-label">EXIT</div>
          )}
        </div>
      );
    }
  
    // Generate center path elements for entry
    for (let i = 0; i < maxRows; i++) {
      centerEntryPath.push(
        <div className="entry-path-segment" key={`entry-path-${i}`}>
          {i === Math.floor(maxRows / 2) && (
            <div className="entry-label">ENTRY</div>
          )}
        </div>
      );
    }
    
    // Generate left side spots (5 spots)
    for (let i = 0; i < leftSideSpots.length; i++) {
      const spotId = leftSideSpots[i];
      const leftSpot = parkingSpots.find(spot => spot.id === spotId);
      const isLeftOccupied = occupiedSpots.some(spot => spot.id === spotId);
  
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
  
    // Add empty spots to right side first to push A06 and A07 to the bottom
    // We need to add (leftSideSpots.length - rightSideSpots.length) empty spots
    const emptySpacesNeeded = leftSideSpots.length - rightSideSpots.length;
    
    for (let i = 0; i < emptySpacesNeeded; i++) {
      rightSpots.push(
        <div className="parking-side right-side mb-3" key={`right-empty-${i}`}>
          <div className="spot-placeholder empty"></div>
        </div>
      );
    }
  
    // Then generate right side spots (A06 and A07) at the bottom
    for (let i = 0; i < rightSideSpots.length; i++) {
      const spotId = rightSideSpots[i];
      const rightSpot = parkingSpots.find(spot => spot.id === spotId);
      const isRightOccupied = occupiedSpots.some(spot => spot.id === spotId);
  
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
        {/* Exit column (left) */}
        <div className="w-30 pe-2">
          {/* All left-side spots */}
          {leftSpots}
        </div>
  
        {/* Center exit path */}
        <div className="exit-path-container w-15 px-1">
          <div className="d-flex align-items-center justify-content-center mb-3">
            <span className="small text-muted invisible">Exit Path</span>
          </div>
          <div className="exit-path">
            {centerExitPath}
          </div>
        </div>
        
        {/* Entry column (right side spots) */}
        <div className="w-30 px-1">
          {/* All right-side spots, with empty spaces at the top and A06/A07 at the bottom */}
          {rightSpots}
        </div>
        
        {/* Entry path (rightmost column) */}
        <div className="entry-path-container w-15 ps-1">
          <div className="d-flex align-items-center justify-content-center mb-3">
            <span className="small text-muted invisible">Entry Path</span>
          </div>
          <div className="entry-path">
            {centerEntryPath}
          </div>
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