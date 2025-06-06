import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

interface ParkingSpot {
  _id: string;
  id: string;
  numero: string;
  position: 'left' | 'right';
}

const ParkingPreview = () => {
  const { id } = useParams();
  const [parkingSpots, setParkingSpots] = useState<ParkingSpot[]>([]);
  const [parkingInfo, setParkingInfo] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [parkingStatus, setParkingStatus] = useState<any>(null);

  const mapSpotData = (spot: any) => {
    const spotNumber = parseInt(spot.numero.match(/[0-9]+/)[0]);
    return {
      id: spot.numero,
      _id: spot._id,
      numero: spot.numero,
      position: spotNumber >= 6 ? 'right' : 'left', // Changed logic: only spots 6 and 7 go to the right
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [parkingResponse, spotsResponse] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_BASE_URL}/parking/${id}`),
          axios.get(`${process.env.REACT_APP_API_BASE_URL}/parking-spots/by-parking/${id}`)
        ]);

        setParkingInfo(parkingResponse.data);
        
        if (spotsResponse.data && spotsResponse.data.data) {
          const spots = spotsResponse.data.data.map(mapSpotData);
          setParkingSpots(spots);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load parking data');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  // Fonction pour déclencher la détection sur une image existante
  const checkParkingFromFile = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL_FLASK}/parking/from-file`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_path: 'uploads/ooo.jpg' }) // <-- utilise toujours des slashs /
      });
      const data = await response.json();
      setParkingStatus(data.parking_status);
      // Tu peux aussi afficher l'image annotée : data.annotated_image_path
    } catch (err) {
      alert("Erreur lors de la détection : " + err);
    }
  };

  // Nouveau rendu des spots façon pickParkingSpot
  const renderSpots = (spots: ParkingSpot[], side: 'left' | 'right') => {
    const sortedSpots = spots.sort((a, b) => {
      const aNum = parseInt(a.numero.replace(/[^0-9]/g, ''));
      const bNum = parseInt(b.numero.replace(/[^0-9]/g, ''));
      if (side === 'right') return bNum - aNum;
      return aNum - bNum;
    });

    return sortedSpots.map((spot) => {
      const globalIdx = parkingSpots.findIndex(s => s._id === spot._id);
      const occupied = parkingStatus && parkingStatus[globalIdx] === "occupied";

      return (
        <div className={`parking-spot-container ${side}-side`} key={spot._id}>
          <div className="access-lane"></div>
          <div className={`parking-spot${occupied ? ' occupied' : ''}`}>
            {occupied ? (
              <div className="spot-placeholder d-flex flex-column align-items-center justify-content-center" style={{height: '48px'}}>
                <img src="/assets/img/car2D.png" alt="Occupée" className="occupied-spot-img" />
              </div>
            ) : (
              <button className="spot-btn" disabled>
                {spot.numero.replace(/[^0-9]/g, '')}
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
          <div className="right-lane" style={{ 
            display: 'flex', 
            flexDirection: 'column-reverse', // Changed to column-reverse
            justifyContent: 'flex-start', // Changed to flex-start
            height: '100%',
            paddingTop: '50%' // Add padding to push spots to bottom half
          }}>
            {renderSpots(rightSpots, 'right')}
          </div>
        </div>
        <div className="exit-sign">EXIT</div>
      </div>
    );
  };

  if (loading) return <div className="text-center p-5"><span className="spinner-border"></span></div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!parkingSpots.length) return <div className="text-center p-5">No parking spots found.</div>;

  return (
    <div className="page-wrapper">
      <div className="content container-fluid">
        <div className="row justify-content-center">
          <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-3 mb-4">
            <h4>Live Preview From - {parkingInfo?.nom}</h4>
            {parkingInfo && (
              <div className="small text-muted">
                Price: {parkingInfo.tarif_horaire}DT per hour • {parkingInfo.nbr_place} total spots
              </div>
            )}
            {/* Bouton pour déclencher la détection */}
            <button className="btn btn-primary" onClick={checkParkingFromFile}>
              Vérifier disponibilité (photo existante)
            </button>
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

export default ParkingPreview;
