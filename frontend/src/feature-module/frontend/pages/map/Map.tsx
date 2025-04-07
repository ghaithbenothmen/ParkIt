import { MapContainer, TileLayer, Marker, Popup,useMap } from "react-leaflet";
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
  const [searchedLocation, setSearchedLocation] = useState<[number, number] | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [mapLocation, setMapLocation] = useState([51.505, -0.09]); // Default coordinates (London)
  const [searchLocation, setSearchLocation] = useState(""); // To store the current location from search
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { location: inputLocation, currentPosition } = location.state || {};

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

  // Fetch parkings
  useEffect(() => {
    axios.get("http://localhost:4000/api/parking")
      .then(response => setParkings(response.data))
      .catch(error => console.error("Erreur de chargement des parkings :", error));
  }, []);

  useEffect(() => {
    if (location.state) {
      const { location: loc, currentPosition } = location.state;
      if (Array.isArray(currentPosition)) {
        setMapLocation(currentPosition);
        setSearchLocation(loc);
      } else {
        setSearchLocation(loc); // If it's just a location string (address)
      }
    }
  }, [location]);

  // Fetch coordinates based on searched location
  useEffect(() => {
    if (inputLocation) {
      axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${inputLocation}&addressdetails=1&limit=5`)
        .then(response => {
          setSuggestions(response.data);
        })
        .catch(error => console.error("Error fetching address:", error));
    }
  }, [inputLocation]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchLocation(value);
    setSearchQuery(value);
    setSuggestions([]); // Clear previous suggestions when the search query changes

    if (value.length > 2) {
      axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${value}&addressdetails=1&limit=5`)
        .then(response => {
          setSuggestions(response.data); // Update the suggestions with the new search result
        })
        .catch(error => console.error("Error fetching address:", error));
    }
  };

  // Handle selecting a suggested location
  const handleSelectLocation = (lat: number, lon: number, name: string) => {
    setSearchedLocation([lat, lon]);
    setSearchQuery(name);
    setSuggestions([]);
    setMapLocation([lat, lon]); // Set the map center to the selected location
  };

  // Determine map center
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
      <section className="search-section p-3">
        <div className="container d-flex align-items-center">
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

            />
            <button className="btn btn-prmary" onClick={() => setMapLocation([parseFloat(searchLocation.split(',')[0]), parseFloat(searchLocation.split(',')[1])])}>
              <Search />
            </button>
          </div>

          {/* Suggestions Dropdown */}
          {isSearchFocused && suggestions.length > 0 && (
            <ul className="suggestions-list list-group position-absolute mt-2">
              {suggestions.map((s, index) => (
                <li key={index} onClick={() => handleSelectLocation(parseFloat(s.lat), parseFloat(s.lon), s.display_name)}>
                  {s.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Main Layout */}
      <section className="d-flex" style={{ height: "calc(100vh - 60px)" }}>
        {/* Left Sidebar - Nearby Parkings */}
        <aside className="col-md-3 bg-white p-3 shadow">
          <h5 className="mb-3">Nearby Parkings</h5>
          <div className="overflow-auto" style={{ maxHeight: "80vh" }}>
            {parkings.length > 0 ? (
              parkings.map((parking) => (
                <div
                  key={parking._id}
                  className="card mb-3 shadow-sm border-0 p-3 rounded"
                  style={{ backgroundColor: "#f8f9fa" }}
                >
                  <div className="card-body">
                    <h6 className="card-title fw-bold">{parking.nom}</h6>
                    <p className="card-text text-muted mb-1">
                      <MapPin size={14} className="me-1 text-danger" />
                      {parking.adresse}
                    </p>
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
              <p>No parking spots found.</p>
            )}
          </div>
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

            {/* Searched Location Marker */}
            {searchedLocation && (
              <Marker position={searchedLocation} icon={customIcon}>
                <Popup>Search result</Popup>
              </Marker>
            )}

            {/* Parking Markers */}
            {parkings.map((parking) => (
  <Marker key={parking._id} position={[parking.latitude, parking.longitude]} icon={parkingIcon}>
    <Popup>
      <div style={{ width: "200px" }}>
        <h6 className="fw-bold">{parking.nom}</h6>
        <p className="text-muted mb-1">
          <MapPin size={14} className="me-1 text-danger" />
          {parking.adresse}
        </p>
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
