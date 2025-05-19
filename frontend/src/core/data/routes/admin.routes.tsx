import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Card } from 'primereact/card';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const ParkingPreview = () => {
  const { id } = useParams();
  const [parking, setParking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParking = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/parking/${id}`);
        setParking(response.data);
      } catch (error) {
        console.error('Error fetching parking data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchParking();
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (!parking) {
    return <div className="text-center py-5">Parking not found</div>;
  }

  return (
    <div className="page-wrapper">
      <div className="content container-fluid">
        <Card title={parking.nom} className="mb-4">
          <p><strong>Address:</strong> {parking.adresse}</p>
          <p><strong>Number of Places:</strong> {parking.nbr_place}</p>
          <p><strong>Hourly Rate:</strong> {parking.tarif_horaire} DT/h</p>
          <p><strong>Status:</strong> {parking.disponibilite ? 'Available' : 'Unavailable'}</p>
          <div style={{ height: '400px', borderRadius: '8px', overflow: 'hidden' }}>
            <MapContainer 
              center={[parseFloat(parking.latitude), parseFloat(parking.longitude)]} 
              zoom={15} 
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker position={[parseFloat(parking.latitude), parseFloat(parking.longitude)]}>
                <Popup>{parking.nom}</Popup>
              </Marker>
            </MapContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ParkingPreview;