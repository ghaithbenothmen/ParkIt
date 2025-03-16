import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ParkingVisualization = () => {
  const navigate = useNavigate();
  const [selectedSpot, setSelectedSpot] = useState(null);
  
  // Mock data for parking spots
  const parkingSpots = [
    { id: 'A02', position: 'right', row: 1 },
    { id: 'A03', position: 'left', row: 2 },
    { id: 'A05', position: 'left', row: 3 },
    { id: 'A08', position: 'right', row: 5 },
    { id: 'A11', position: 'left', row: 7 }
  ];
  
  // Occupied spots data
  const occupiedSpots = [
    { position: 'left', row: 1 },
    { position: 'right', row: 2 },
    { position: 'right', row: 3 },
    { position: 'left', row: 5 },
    { position: 'left', row: 6 },
    { position: 'right', row: 6 },
    { position: 'right', row: 7 }
  ];

  const handleSelectSpot = (spotId) => {
    setSelectedSpot(spotId);
  };

  const handleContinue = () => {
    navigate('/confirmation', { state: { selectedSpot } });
  };

  const generateParkingLayout = () => {
    const maxRows = 7;
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

  return (
    <div className="page-wrapper">
      <div className="content container-fluid">
        <div className="row justify-content-center">
          <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3 mb-4">
            <h4>Select Parking Spot</h4>
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