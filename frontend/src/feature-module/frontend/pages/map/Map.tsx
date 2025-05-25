import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import axios from "axios";
import React from "react";
import L, { Map as LeafletMap } from "leaflet";
import { useLocation, useNavigate } from "react-router-dom";
import HomeHeader from "../../home/header/home-header";
import { MapPin, Search, Sliders, Map as MapIcon, List as ListIcon } from "react-feather"; // <-- add Map and List icons

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
  const [priceFilter, setPriceFilter] = useState<number>(0);
  const [showFilter, setShowFilter] = useState(false);
  const [selectedParkingId, setSelectedParkingId] = useState<string | null>(null);
  const [showMapMobile, setShowMapMobile] = useState(false);

  // Add ref for the map instance
  const mapRef = React.useRef<LeafletMap | null>(null);
  const markerRefs = React.useRef<{ [key: string]: L.Marker } | null>({});

  const navigate = useNavigate();
  const location = useLocation();
  // Ajoute priceFilter à partir du state de la route si présent
  const { location: inputLocation, currentPosition, distanceFilter: routeDistanceFilter, priceFilter: routePriceFilter } = location.state || {};

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
    axios.get(`${process.env.REACT_APP_API_BASE_URL}/parking`)
      .then(response => {
        setParkings(response.data);
        setFilteredParkings(response.data);
      })
      .catch(error => console.error("Erreur de chargement des parkings :", error));
  }, []);

  useEffect(() => {
    if (location.state) {
      const { location: loc, currentPosition, distanceFilter, priceFilter } = location.state;
      setDistanceFilter(distanceFilter || null);
      setPriceFilter(priceFilter || 0); // <-- Ajoute cette ligne pour appliquer le filtre prix transmis

      if (Array.isArray(currentPosition)) {
        setMapLocation(currentPosition);
        setSearchLocation(loc === 'Your Location' ? 'Your Current Location' : loc);
      } else {
        setSearchLocation(loc);
      }
    }
  }, [location]);

  // Filtering logic for both distance and price
  useEffect(() => {
    let filtered = parkings;

    // Distance filter
    if (distanceFilter && currentPosition) {
      filtered = filtered.filter(parking => {
        const distance = calculateDistance(
          currentPosition[0],
          currentPosition[1],
          parking.latitude,
          parking.longitude
        );
        return distance <= distanceFilter;
      });
    }

    // Price filter
    if (priceFilter && priceFilter > 0) {
      filtered = filtered.filter(parking => parking.tarif_horaire <= priceFilter);
    }

    setFilteredParkings(filtered);
  }, [distanceFilter, priceFilter, currentPosition, parkings]);

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

  // Animate map to parking
  const animateToParking = (lat: number, lng: number) => {
    const map = mapRef.current;
    if (map) {
      // Use current zoom, do not force a specific zoom (for better UX)
      map.flyTo([lat, lng], map.getZoom(), { duration: 1.2, easeLinearity: 0.25 });
    }
  };

  return (
    <>
      {/* Always show the header/navbar, even in mobile map mode */}
      <div style={{
        position: showMapMobile ? "fixed" : "static",
        top: 0,
        left: 0,
        width: "100vw",
        zIndex: 3001,
        background: "#fff"
      }}>
        <HomeHeader type={1} />
      </div>

      {/* Search Section - always visible */}
      <section
        className="search-section"
        style={{
          background: "#fff",
          padding: "24px 0 18px 0",
          borderBottom: "none",
          width: "100%",
          borderRadius: "0 0 24px 24px",
          boxShadow: "0 4px 24px 0 rgba(40,43,139,0.08)",
          position: showMapMobile ? "fixed" : "static",
          top: showMapMobile ? 64 : undefined, // adjust if your header height is different
          left: 0,
          zIndex: showMapMobile ? 3001 : undefined
        }}
      >
        <div className="d-flex justify-content-center" style={{ width: "100%" }}>
          <div
            className="d-flex align-items-center"
            style={{
              background: "#fff",
              borderRadius: 24,
              boxShadow: "0 4px 24px 0 rgba(40,43,139,0.10)",
              border: "1px solid #ececec",
              padding: "0 24px",
              height: 72,
              width: "100%",
              maxWidth: "none",
              minWidth: 0,
              margin: "0 24px",
              position: "relative",
              transition: "box-shadow 0.2s"
            }}
          >
            <div className="d-flex align-items-center flex-grow-1" style={{ minWidth: 0, gap: 18 }}>
              <span
                className="input-group-text px-1"
                style={{
                  background: "transparent",
                  border: "none",
                  marginRight: 8
                }}
              >
                <MapPin style={{ cursor: "pointer", color: "#9b0e16", fontSize: "24px" }} />
              </span>
              <input
                type="text"
                className="form-control border-0"
                placeholder="Search for a location..."
                value={searchLocation}
                onChange={handleSearchChange}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                style={{
                  height: "54px",
                  fontSize: "1.1rem",
                  background: "transparent",
                  boxShadow: "none",
                  border: "none",
                  outline: "none"
                }}
              />
              {/* Filter button: perfectly round */}
              <button
                type="button"
                className="btn d-flex align-items-center justify-content-center p-0"
                style={{
                  borderRadius: "50%",
                  width: "54px",
                  height: "54px",
                  minWidth: "54px",
                  minHeight: "54px",
                  maxWidth: "54px",
                  maxHeight: "54px",
                  background: "#fff",
                  border: "none",
                  boxShadow: "0 2px 8px rgba(40,43,139,0.10)",
                  transition: "box-shadow 0.2s, background 0.2s"
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "#f7f7f7";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 16px rgba(40,43,139,0.15)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "#fff";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 2px 8px rgba(40,43,139,0.10)";
                }}
                onClick={() => setShowFilter(true)}
                aria-label="Open filters"
              >
                <Sliders color="#9b0e16" size={26} />
              </button>
              {/* Search button: perfectly round */}
              <button
                className="btn d-flex align-items-center justify-content-center p-0"
                style={{
                  borderRadius: "50%",
                  width: "54px",
                  height: "54px",
                  minWidth: "54px",
                  minHeight: "54px",
                  maxWidth: "54px",
                  maxHeight: "54px",
                  background: "#9b0e16",
                  color: "#fff",
                  border: "none",
                  boxShadow: "0 2px 8px rgba(40,43,139,0.10)",
                  transition: "box-shadow 0.2s, background 0.2s"
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "#b31217";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 16px rgba(40,43,139,0.15)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.background = "#9b0e16";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 2px 8px rgba(40,43,139,0.10)";
                }}
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
                <Search style={{ fontSize: "22px", color: "#fff" }} />
              </button>
              {/* Suggestions Dropdown */}
              {isSearchFocused && suggestions.length > 0 && (
                <ul
                  className="list-group position-absolute mt-1 z-index-1000"
                  style={{
                    width: "calc(100% - 30px)",
                    maxHeight: "200px",
                    overflowY: "auto",
                    left: 0,
                    top: "100%",
                    background: "#fff",
                    border: "1px solid #ececec",
                    borderRadius: "0 0 8px 8px",
                    boxShadow: "0 4px 8px rgba(0,0,0,0.07)"
                  }}
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
                      style={{ cursor: "pointer" }}
                    >
                      {s.display_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Filter Modal/Drawer */}
      {showFilter && (
        <>
          <div
            className="modal-backdrop fade show"
            style={{
              zIndex: 1999,
              background: "rgba(33, 37, 41, 0.7)"
            }}
          ></div>
          <div
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              width: "100%",
              maxWidth: 420,
              height: "100%",
              background: "#fff",
              zIndex: 2000,
              boxShadow: "-2px 0 16px rgba(0,0,0,0.15)",
              transition: "right 0.3s",
              overflowY: "auto"
            }}
          >
            <div className="p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="mb-0">Filter</h4>
                <button
                  className="btn btn-light"
                  style={{ borderRadius: "50%" }}
                  onClick={() => setShowFilter(false)}
                >
                  <span style={{ fontSize: 22, fontWeight: "bold" }}>&times;</span>
                </button>
              </div>
              {/* Price filter */}
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span>Price Hr</span>
                  <span>
                    {priceFilter > 0
                      ? `Up to ${priceFilter} DT`
                      : "Any"}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={15}
                  step={1}
                  value={priceFilter}
                  onChange={e => setPriceFilter(Number(e.target.value))}
                  className="form-range"
                  style={{
                    accentColor: "#282B8B"
                  }}
                />
                <div className="d-flex flex-wrap gap-2 mt-2">
                  {[0, 5, 10, 15].map(val => (
                    <button
                      key={val}
                      type="button"
                      className={`btn ${priceFilter === val ? "" : "btn-outline-secondary"}`}
                      style={{
                        borderRadius: 16,
                        minWidth: 110,
                        background: priceFilter === val ? "#9b0e16" : "",
                        color: priceFilter === val ? "#fff" : "",
                        border: priceFilter === val ? "1px solid #9b0e16" : ""
                      }}
                      onClick={() => setPriceFilter(val)}
                    >
                      {val === 0 ? "Any" : `Up to ${val} DT`}
                    </button>
                  ))}
                </div>
              </div>
              {/* Distance filter */}
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span>Distance</span>
                  <span>Up to {distanceFilter || 0} km</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={50}
                  step={1}
                  value={distanceFilter || 0}
                  onChange={e => setDistanceFilter(Number(e.target.value))}
                  className="form-range"
                  style={{
                    accentColor: "#2563eb"
                  }}
                />
                <div className="d-flex flex-wrap gap-2 mt-2">
                  {[1, 3, 5, 10, 20, 50].map(val => (
                    <button
                      key={val}
                      type="button"
                      className={`btn ${distanceFilter === val ? "" : "btn-outline-secondary"}`}
                      style={{
                        borderRadius: 16,
                        minWidth: 110,
                        background: distanceFilter === val ? "#9b0e16" : "",
                        color: distanceFilter === val ? "#fff" : "",
                        border: distanceFilter === val ? "1px solid #9b0e16" : ""
                      }}
                      onClick={() => setDistanceFilter(val)}
                    >
                      Up to {val} km
                    </button>
                  ))}
                </div>
              </div>
              {/* Footer actions */}
              <div className="d-flex justify-content-between align-items-center mt-5 gap-2">
                <button
                  className="btn btn-outline-secondary w-50"
                  onClick={() => {
                    setPriceFilter(0);
                    setDistanceFilter(null);
                  }}
                >
                  Clear filters
                </button>
                <button
                  className="btn w-50"
                  style={{ background: "#9b0e16", color: "#fff", border: "none" }}
                  onClick={() => setShowFilter(false)}
                >
                  View results
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Responsive toggle button */}
      <button
        className="d-md-none btn btn-primary"
        style={{
          position: "fixed",
          left: "50%",
          bottom: 18,
          transform: "translateX(-50%)",
          zIndex: 3002,
          borderRadius: 22,
          padding: "8px 18px",
          fontWeight: 600,
          fontSize: 15,
          boxShadow: "0 2px 10px rgba(40,43,139,0.13)"
        }}
        onClick={() => setShowMapMobile((v) => !v)}
      >
        {showMapMobile ? (
          <>
            <ListIcon size={18} style={{ marginRight: 8, marginBottom: 2 }} />
            See list
          </>
        ) : (
          <>
            <MapIcon size={18} style={{ marginRight: 8, marginBottom: 2 }} />
            See map
          </>
        )}
      </button>

      {/* Main Layout */}
      <section
        className="d-flex"
        style={{
          height: "calc(100vh - 120px)",
          background: "#fff",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Left Sidebar - Nearby Parkings */}
        <aside
          className={`col-md-3 p-4 overflow-auto ${
            showMapMobile ? "d-none d-md-block" : ""
          }`}
          style={{
            background: "#fff",
            borderRight: "1px solid #ececec",
            minHeight: "100%",
            paddingTop: 24,
            paddingBottom: 24,
            borderRadius: "0 0 24px 24px",
            boxShadow: "0 4px 24px 0 rgba(40,43,139,0.08)",
            height: "100%",
            maxHeight: "100vh",
          }}
        >
          <div className="d-flex justify-content-between align-items-center mb-4">
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
                className="card mb-4 border-0"
                style={{
                  background: "#fff",
                  borderRadius: 24,
                  // Animation et shadow améliorés
                  boxShadow: selectedParkingId === parking._id
                    ? "0 12px 32px 0 rgba(155,14,22,0.16), 0 2px 8px 0 rgba(40,43,139,0.13)"
                    : "0 4px 16px 0 rgba(40,43,139,0.10)",
                  transition: "box-shadow 0.25s cubic-bezier(.4,2,.6,1), transform 0.18s cubic-bezier(.4,2,.6,1), border 0.18s",
                  padding: "28px 24px",
                  cursor: "pointer",
                  border: selectedParkingId === parking._id ? "2.5px solid #9b0e16" : "2px solid transparent",
                  transform: selectedParkingId === parking._id ? "scale(1.025) translateY(-2px)" : "scale(1)"
                }}
                onClick={() => {
                  navigate(`/parkings/parking-details/${parking._id}`);
                }}
                onMouseEnter={() => {
                  setSelectedParkingId(parking._id);
                  // Juste ouvrir le popup, pas de déplacement ni zoom
                  setTimeout(() => {
                    const marker = markerRefs.current?.[parking._id];
                    if (marker && marker.isPopupOpen && !marker.isPopupOpen()) {
                      marker.openPopup();
                    } else if (marker && !marker.isPopupOpen) {
                      marker.openPopup();
                    }
                  }, 100);
                }}
                onMouseLeave={() => {
                  setSelectedParkingId(null);
                  setTimeout(() => {
                    const marker = markerRefs.current?.[parking._id];
                    if (marker) marker.closePopup();
                  }, 100);
                }}
              >
                <div className="card-body p-0">
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
                    {parking.tarif_horaire} DT / hour
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
        <div
          className={`col-md-9 p-0 ${
            showMapMobile ? "" : "d-none d-md-block"
          }`}
          style={{
            height: showMapMobile ? "100dvh" : "100%",
            width: showMapMobile ? "100vw" : "100%",
            minHeight: 0,
            minWidth: 0,
            background: "#fff",
            position: showMapMobile ? "fixed" : "relative",
            top: showMapMobile ? 0 : undefined,
            left: showMapMobile ? 0 : undefined,
            zIndex: showMapMobile ? 2000 : undefined,
            padding: 0,
            margin: 0,
            borderRadius: 0,
            flex: 1
          }}
        >
          <MapContainer
            center={mapCenter}
            zoom={13}
            style={{
              height: "100%",
              width: "100%",
              minHeight: 0,
              minWidth: 0,
              background: "#fff",
              position: "relative",
              borderRadius: 0,
              // Add top padding to avoid header/search overlap in mobile map mode
              ...(showMapMobile ? { paddingTop: 130 } : {})
            }}
           
          >
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
                ref={ref => {
                  if (ref) {
                    markerRefs.current![parking._id] = ref;
                  }
                }}
                eventHandlers={{
                  click: () => {
                    setSelectedParkingId(parking._id);
                    animateToParking(parking.latitude, parking.longitude); // Animate, but keep current zoom
                    setTimeout(() => {
                      const marker = markerRefs.current?.[parking._id];
                      if (marker) marker.openPopup();
                    }, 0);
                  },
                  popupopen: () => setSelectedParkingId(parking._id),
                  popupclose: () => {
                    if (selectedParkingId === parking._id) setSelectedParkingId(null);
                  }
                }}
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
                      {parking.tarif_horaire} DT / hour
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