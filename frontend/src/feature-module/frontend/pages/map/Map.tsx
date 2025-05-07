import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import axios from "axios";
import React from "react";
import L from "leaflet";
import { useLocation, useNavigate } from "react-router-dom";
import HomeHeader from "../../home/header/home-header";
import { MapPin, Search } from "react-feather";

interface Parking {
  _id: string;
  latitude: number;
  longitude: number;
  nom: string;
  adresse: string;
  disponibilite: boolean;
  nbr_place: number;
  tarif_horaire: number;
}

const MapPage = () => {
  const [parkings, setParkings] = useState<Parking[]>([]);
  const [filteredParkings, setFilteredParkings] = useState<Parking[]>([]);
  const [searchedLocation, setSearchedLocation] = useState<[number, number] | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [mapLocation, setMapLocation] = useState([51.505, -0.09]);
  const [searchLocation, setSearchLocation] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [distanceFilter, setDistanceFilter] = useState<number | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { location: inputLocation, currentPosition, distanceFilter: routeDistanceFilter } = location.state || {};

  // Custom Icons
  const parkingIcon = new L.Icon({
    iconUrl: "/parking.png",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });

  const customIcon = new L.Icon({
    iconUrl: require("leaflet/dist/images/marker-icon.png"),
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
  });

  // Helper function to calculate distance between two coordinates in km
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
  };

  // Fetch parkings
  useEffect(() => {
    axios.get("http://localhost:4000/api/parking")
      .then(response => {
        setParkings(response.data);
        setFilteredParkings(response.data);
      })
      .catch(error => console.error("Erreur de chargement des parkings :", error));
  }, []);

  useEffect(() => {
    if (location.state) {
      const { location: loc, currentPosition, distanceFilter } = location.state;
      setDistanceFilter(distanceFilter || null);
      
      if (Array.isArray(currentPosition)) {
        setMapLocation(currentPosition);
        setSearchLocation(loc === 'Your Location' ? 'Your Current Location' : loc);
      } else {
        setSearchLocation(loc);
      }
    }
  }, [location]);

  // Filter parkings based on distance
  useEffect(() => {
    if (distanceFilter && currentPosition) {
      const filtered = parkings.filter(parking => {
        const distance = calculateDistance(
          currentPosition[0],
          currentPosition[1],
          parking.latitude,
          parking.longitude
        );
        return distance <= distanceFilter;
      });
      setFilteredParkings(filtered);
    } else {
      setFilteredParkings(parkings);
    }
  }, [distanceFilter, currentPosition, parkings]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchLocation(value);
    setSearchQuery(value);
    setSuggestions([]);

    if (value.length > 2) {
      axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${value}&addressdetails=1&limit=5`)
        .then(response => {
          setSuggestions(response.data);
        })
        .catch(error => console.error("Error fetching address:", error));
    }
  };

  // Handle selecting a suggested location
  const handleSelectLocation = (lat: number, lon: number, name: string) => {
    setSearchedLocation([lat, lon]);
    setSearchQuery(name);
    setSearchLocation(name);
    setSuggestions([]);
    setMapLocation([lat, lon]);
    setDistanceFilter(null); // Reset distance filter when new location is selected
  };

  const mapCenter = searchedLocation || currentPosition || [50.826024, 10.142264];

  const ChangeMapCenter = ({ center }: { center: [number, number] }) => {
    const map = useMap();
    useEffect(() => {
      map.setView(center, 13, { animate: true });
    }, [center, map]);
    return null;
  };

  return (
    <>
      <HomeHeader type={1} />

      {/* Search Section */}
      <section className="search-section p-3 bg-light">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-8">
              <div className="input-group">
                <span className="input-group-text px-1">
                  <MapPin style={{ cursor: "pointer", color: "#9b0e16", fontSize: "24px" }} />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search for a location..."
                  value={searchLocation}
                  onChange={handleSearchChange}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                />
                <button 
                  className="btn btn-primary" 
                  onClick={() => {
                    if (searchQuery && suggestions.length > 0) {
                      const firstSuggestion = suggestions[0];
                      handleSelectLocation(
                        parseFloat(firstSuggestion.lat),
                        parseFloat(firstSuggestion.lon),
                        firstSuggestion.display_name
                      );
                    }
                  }}
                >
                  <Search />
                </button>
              </div>

              {/* Suggestions Dropdown */}
              {isSearchFocused && suggestions.length > 0 && (
                <ul 
                  className="list-group position-absolute mt-1 z-index-1000"
                  style={{ width: 'calc(100% - 30px)', maxHeight: '200px', overflowY: 'auto' }}
                >
                  {suggestions.map((s, index) => (
                    <li 
                      key={index} 
                      className="list-group-item list-group-item-action"
                      onClick={() => handleSelectLocation(
                        parseFloat(s.lat),
                        parseFloat(s.lon),
                        s.display_name
                      )}
                      style={{ cursor: 'pointer' }}
                    >
                      {s.display_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="col-md-4 mt-2 mt-md-0">
              <div className="d-flex align-items-center">
                <span className="me-2">Filter by distance:</span>
                <select 
                  className="form-select form-select-sm"
                  value={distanceFilter || ''}
                  onChange={(e) => setDistanceFilter(e.target.value ? Number(e.target.value) : null)}
                  disabled={!currentPosition}
                >
                  <option value="">All parkings</option>
                  <option value="5">5 km</option>
                  <option value="10">10 km</option>
                  <option value="20">20 km</option>
                  <option value="30">30 km</option>
                  <option value="50">50 km</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Layout */}
      <section className="d-flex" style={{ height: "calc(100vh - 120px)" }}>
        {/* Left Sidebar - Nearby Parkings */}
        <aside className="col-md-3 bg-white p-3 shadow overflow-auto">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Nearby Parkings</h5>
            {distanceFilter && currentPosition && (
              <span className="badge bg-primary">
                Within {distanceFilter} km
              </span>
            )}
          </div>
          {filteredParkings.length > 0 ? (
            filteredParkings.map((parking) => (
              <div
                key={parking._id}
                className="card mb-3 shadow-sm border-0 p-3 rounded"
                style={{ backgroundColor: "#f8f9fa", cursor: 'pointer' }}
                onClick={() => setMapLocation([parking.latitude, parking.longitude])}
              >
                <div className="card-body">
                  <h6 className="card-title fw-bold">{parking.nom}</h6>
                  <p className="card-text text-muted mb-1">
                    <MapPin size={14} className="me-1 text-danger" />
                    {parking.adresse}
                  </p>
                  {currentPosition && (
                    <p className="text-muted mb-1">
                      Distance: {calculateDistance(
                        currentPosition[0],
                        currentPosition[1],
                        parking.latitude,
                        parking.longitude
                      ).toFixed(1)} km
                    </p>
                  )}
                  <p className="mb-1">
                    <strong>Places:</strong> {parking.nbr_place}
                  </p>
                  <p className="mb-1">
                    <span className={`badge ${parking.disponibilite ? "bg-success" : "bg-danger"}`}>
                      {parking.disponibilite ? "Available" : "Full"}
                    </span>
                  </p>
                  <p className="fw-bold text-end" style={{ color: "#9b0e16" }}>
                    {parking.tarif_horaire} TND / hour
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="alert alert-info">
              {distanceFilter 
                ? `No parking spots found within ${distanceFilter} km`
                : "No parking spots found"}
            </div>
          )}
        </aside>

        {/* Right Section - Map */}
        <div className="col-md-9">
          <MapContainer center={mapCenter} zoom={13} style={{ height: "100%", width: "100%" }}>
            <ChangeMapCenter center={mapCenter} />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {/* User Position Marker */}
            {currentPosition && (
              <Marker position={currentPosition} icon={customIcon}>
                <Popup>You are here</Popup>
              </Marker>
            )}

            {/* Parking Markers */}
            {filteredParkings.map((parking) => (
              <Marker 
                key={parking._id} 
                position={[parking.latitude, parking.longitude]} 
                icon={parkingIcon}
              >
                <Popup>
                  <div style={{ width: "200px" }}>
                    <h6 className="fw-bold">{parking.nom}</h6>
                    <p className="text-muted mb-1">
                      <MapPin size={14} className="me-1 text-danger" />
                      {parking.adresse}
                    </p>
                    {currentPosition && (
                      <p className="text-muted mb-1">
                        Distance: {calculateDistance(
                          currentPosition[0],
                          currentPosition[1],
                          parking.latitude,
                          parking.longitude
                        ).toFixed(1)} km
                      </p>
                    )}
                    <p className="mb-1">
                      <strong>Places:</strong> {parking.nbr_place}
                    </p>
                    <p className="mb-1">
                      <span className={`badge ${parking.disponibilite ? "bg-success" : "bg-danger"}`}>
                        {parking.disponibilite ? "Available" : "Full"}
                      </span>
                    </p>
                    <p className="fw-bold text-end" style={{ color: "#9b0e16" }}>
                      {parking.tarif_horaire} TND / hour
                    </p>
                    <button
                      className="btn btn-sm btn-danger w-100"
                      onClick={() => navigate(`/parkings/parking-details/${parking._id}`)}
                    >
                      See Details
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </section>
    </>
  );
};

export default MapPage;