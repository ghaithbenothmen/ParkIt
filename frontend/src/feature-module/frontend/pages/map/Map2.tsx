import React, { useEffect, useState, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import L from "leaflet";
import { useLocation, useNavigate } from "react-router-dom";
import HomeHeader from "../../home/header/home-header";
import { MapPin, Search, Clock, Navigation } from "react-feather";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

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

const MapPage2 = () => {
  const [parkings, setParkings] = useState<Parking[]>([]);
  const [filteredParkings, setFilteredParkings] = useState<Parking[]>([]);
  const [searchedLocation, setSearchedLocation] = useState<[number, number] | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [mapLocation, setMapLocation] = useState<[number, number]>([36.8065, 10.1815]); // Default to Tunis coordinates
  const [searchLocation, setSearchLocation] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [distanceFilter, setDistanceFilter] = useState<number | null>(null);
  const [routeInfo, setRouteInfo] = useState<{distance: string, time: string} | null>(null);
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  const mapRef = useRef<L.Map>();
  const routingControlRef = useRef<L.Routing.Control>();
  const navigate = useNavigate();
  const location = useLocation();
  const { location: inputLocation, distanceFilter: routeDistanceFilter } = location.state || {};

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

  // Get user's current position
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserPosition([latitude, longitude]);
          setMapLocation([latitude, longitude]);
          setSearchLocation("Your Current Location");
          setLocationError(null);
        },
        (error) => {
          setLocationError("Unable to retrieve your location");
          console.error("Geolocation error:", error);
        }
      );
    } else {
      setLocationError("Geolocation is not supported by this browser");
    }
  }, []);

  // Helper function to calculate distance between two coordinates in km
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Initialize routing control
  const initRoutingControl = useCallback((from: [number, number], to: [number, number]) => {
    if (!mapRef.current) return;

    // Remove existing routing control if any
    if (routingControlRef.current) {
      mapRef.current.removeControl(routingControlRef.current);
    }

    // Create new routing control
    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(from[0], from[1]),
        L.latLng(to[0], to[1])
      ],
      routeWhileDragging: false,
      showAlternatives: false,
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      lineOptions: {
        styles: [{color: '#007bff', opacity: 0.7, weight: 5}]
      },
      createMarker: function(i, waypoint, n) {
        if (i === 0) {
          return L.marker(waypoint.latLng, {
            icon: customIcon,
            title: 'Your location'
          });
        }
        return L.marker(waypoint.latLng, {
          icon: parkingIcon,
          title: 'Parking'
        });
      }
    });

    routingControl.addTo(mapRef.current);

    routingControl.on('routesfound', function(e) {
      const routes = e.routes;
      const summary = routes[0].summary;
      setRouteInfo({
        distance: (summary.totalDistance / 1000).toFixed(1) + ' km',
        time: (summary.totalTime / 60).toFixed(0) + ' min'
      });
    });

    routingControlRef.current = routingControl;
  }, []);

  // Handle double click on parking marker
  const handleParkingDoubleClick = useCallback((parking: Parking) => {
    if (!userPosition) {
      alert("Votre position actuelle n'est pas disponible");
      return;
    }

    setRouteInfo(null);
    initRoutingControl(userPosition, [parking.latitude, parking.longitude]);
    
    mapRef.current?.flyToBounds([
      userPosition,
      [parking.latitude, parking.longitude]
    ]);
  }, [userPosition, initRoutingControl]);

  // Map component that handles the map instance
  const MapContent = () => {
    const map = useMap();
    
    useEffect(() => {
      mapRef.current = map;
      return () => {
        mapRef.current = undefined;
      };
    }, [map]);

    return null;
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
      const { location: loc, distanceFilter } = location.state;
      setDistanceFilter(distanceFilter || null);
      setSearchLocation(loc);
    }
  }, [location]);

  // Filter parkings based on distance
  useEffect(() => {
    if (distanceFilter && userPosition) {
      const filtered = parkings.filter(parking => {
        const distance = calculateDistance(
          userPosition[0],
          userPosition[1],
          parking.latitude,
          parking.longitude
        );
        return distance <= distanceFilter;
      });
      setFilteredParkings(filtered);
    } else {
      setFilteredParkings(parkings);
    }
  }, [distanceFilter, userPosition, parkings]);

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
    setDistanceFilter(null);
  };

  // Clear route when component unmounts
  useEffect(() => {
    return () => {
      if (routingControlRef.current && mapRef.current) {
        mapRef.current.removeControl(routingControlRef.current);
      }
    };
  }, []);

  const mapCenter = searchedLocation || userPosition || mapLocation;

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
              {locationError && (
                <div className="text-danger mt-1">{locationError}</div>
              )}
            </div>
            <div className="col-md-4 mt-2 mt-md-0">
              <div className="d-flex align-items-center">
                <span className="me-2">Filter by distance:</span>
                <select 
                  className="form-select form-select-sm"
                  value={distanceFilter || ''}
                  onChange={(e) => setDistanceFilter(e.target.value ? Number(e.target.value) : null)}
                  disabled={!userPosition}
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

      {/* Route Info Display */}
      {routeInfo && (
        <div className="route-info bg-primary text-white p-2">
          <div className="container d-flex justify-content-between align-items-center">
            <div>
              <Navigation size={18} className="me-2" />
              <strong>Distance:</strong> {routeInfo.distance}
            </div>
            <div>
              <Clock size={18} className="me-2" />
              <strong>Estimated time:</strong> {routeInfo.time}
            </div>
            <button 
              className="btn btn-sm btn-light"
              onClick={() => {
                if (routingControlRef.current && mapRef.current) {
                  mapRef.current.removeControl(routingControlRef.current);
                  setRouteInfo(null);
                }
              }}
            >
              Clear route
            </button>
          </div>
        </div>
      )}

      {/* Main Layout */}
      <section className="d-flex" style={{ height: routeInfo ? "calc(100vh - 170px)" : "calc(100vh - 120px)" }}>
        {/* Left Sidebar - Nearby Parkings */}
        <aside className="col-md-3 bg-white p-3 shadow overflow-auto">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="mb-0">Nearby Parkings</h5>
            {distanceFilter && userPosition && (
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
                  {userPosition && (
                    <p className="text-muted mb-1">
                      Distance: {calculateDistance(
                        userPosition[0],
                        userPosition[1],
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
          <MapContainer 
            center={mapCenter} 
            zoom={13} 
            style={{ height: "100%", width: "100%" }}
            whenCreated={(map) => { mapRef.current = map; }}
          >
            <MapContent />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {/* User Position Marker */}
            {userPosition && (
              <Marker position={userPosition} icon={customIcon}>
                <Popup>You are here</Popup>
              </Marker>
            )}

            {/* Searched Location Marker */}
            {searchedLocation && (
              <Marker position={searchedLocation} icon={customIcon}>
                <Popup>Searched Location</Popup>
              </Marker>
            )}

            {/* Parking Markers */}
            {filteredParkings.map((parking) => (
              <Marker 
                key={parking._id} 
                position={[parking.latitude, parking.longitude]} 
                icon={parkingIcon}
                eventHandlers={{
                  dblclick: () => handleParkingDoubleClick(parking)
                }}
              >
                <Popup>
                  <div style={{ width: "200px" }}>
                    <h6 className="fw-bold">{parking.nom}</h6>
                    <p className="text-muted mb-1">
                      <MapPin size={14} className="me-1 text-danger" />
                      {parking.adresse}
                    </p>
                    {userPosition && (
                      <p className="text-muted mb-1">
                        Distance: {calculateDistance(
                          userPosition[0],
                          userPosition[1],
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
                      className="btn btn-sm btn-danger w-100 mb-2"
                      onClick={() => navigate(`/parkings/parking-details/${parking._id}`)}
                    >
                      See Details
                    </button>
                    <button
                      className="btn btn-sm btn-primary w-100"
                      onClick={() => handleParkingDoubleClick(parking)}
                    >
                      Show Route
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

export default MapPage2;