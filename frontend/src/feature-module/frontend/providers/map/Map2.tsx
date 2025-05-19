import React, { useEffect, useState, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import L from "leaflet";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { MapPin, Search, Clock, Navigation } from "react-feather";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
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
  const { parkingId } = useParams<{ parkingId: string }>(); // Extract parkingId from URL
  const [parking, setParking] = useState<Parking | null>(null); // State for single parking
  const [searchedLocation, setSearchedLocation] = useState<[number, number] | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [mapLocation, setMapLocation] = useState<[number, number]>([36.8065, 10.1815]); // Default to Tunis
  const [searchLocation, setSearchLocation] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [distanceFilter, setDistanceFilter] = useState<number | null>(null);
  const [routeInfo, setRouteInfo] = useState<{ distance: string; time: string } | null>(null);
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  // Calculate distance between two coordinates in km
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Initialize routing control
  const initRoutingControl = useCallback(
    (from: [number, number], to: [number, number]) => {
      if (!mapRef.current) return;

      if (routingControlRef.current) {
        mapRef.current.removeControl(routingControlRef.current);
      }

      const routingControl = L.Routing.control({
        waypoints: [L.latLng(from[0], from[1]), L.latLng(to[0], to[1])],
        routeWhileDragging: false,
        showAlternatives: false,
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        lineOptions: {
          styles: [{ color: "#007bff", opacity: 0.7, weight: 5 }],
        },
        createMarker: function (i, waypoint, n) {
          if (i === 0) {
            return L.marker(waypoint.latLng, {
              icon: customIcon,
              title: "Your location",
            });
          }
          return L.marker(waypoint.latLng, {
            icon: parkingIcon,
            title: "Parking",
          });
        },
      });

      routingControl.addTo(mapRef.current);

      routingControl.on("routesfound", function (e) {
        const routes = e.routes;
        const summary = routes[0].summary;
        setRouteInfo({
          distance: (summary.totalDistance / 1000).toFixed(1) + " km",
          time: (summary.totalTime / 60).toFixed(0) + " min",
        });
      });

      routingControlRef.current = routingControl;
    },
    []
  );

  // Handle double click on parking marker
  const handleParkingDoubleClick = useCallback(
    (parking: Parking) => {
      if (!userPosition) {
        alert("Votre position actuelle n'est pas disponible");
        return;
      }

      setRouteInfo(null);
      initRoutingControl(userPosition, [parking.latitude, parking.longitude]);

      mapRef.current?.flyToBounds([
        userPosition,
        [parking.latitude, parking.longitude],
      ]);
    },
    [userPosition, initRoutingControl]
  );

  // Map component
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

  // Fetch the specific parking based on parkingId
  useEffect(() => {
    if (parkingId) {
      axios
        .get(`${process.env.REACT_APP_API_BASE_URL}/parking/${parkingId}`)
        .then((response) => {
          setParking(response.data);
          setMapLocation([response.data.latitude, response.data.longitude]); // Center map on the parking
          setSearchLocation(response.data.adresse); // Set search bar to parking address
        })
        .catch((error) => {
          console.error("Erreur de chargement du parking :", error);
          setError("Failed to load parking details");
        });
    }
  }, [parkingId]);

  useEffect(() => {
    if (location.state) {
      const { location: loc, distanceFilter } = location.state;
      setDistanceFilter(distanceFilter || null);
      setSearchLocation(loc);
    }
  }, [location]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchLocation(value);
    setSearchQuery(value);
    setSuggestions([]);

    if (value.length > 2) {
      axios
        .get(
          `https://nominatim.openstreetmap.org/search?format=json&q=${value}&addressdetails=1&limit=5`
        )
        .then((response) => {
          setSuggestions(response.data);
        })
        .catch((error) => console.error("Error fetching address:", error));
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

  // Clear route on unmount
  useEffect(() => {
    return () => {
      if (routingControlRef.current && mapRef.current) {
        mapRef.current.removeControl(routingControlRef.current);
      }
    };
  }, []);

  const mapCenter = parking ? [parking.latitude, parking.longitude] : (searchedLocation || userPosition || mapLocation);

  // If there's an error, display it
  if (error) {
    return (
      <div className="page-wrapper">
        <div className="content container-fluid pb-0">
          <div className="row">
            <div className="col-12">
              <div className="card p-3 mb-3">
                <div className="text-danger">{error}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If parking is not yet loaded, show a loading message
  if (!parking) {
    return (
      <div className="page-wrapper">
        <div className="content container-fluid pb-0">
          <div className="row">
            <div className="col-12">
              <div className="card p-3 mb-3">
                <div>Loading parking details...</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="content container-fluid pb-0">
        {/* Search Section */}
        <div className="row">
          <div className="col-12">
            <div className="card p-3 mb-3">
              <div className="row align-items-center">
                <div className="col-md-8">
                  <div className="input-group">
                    <span className="input-group-text px-1">
                      <MapPin
                        style={{ cursor: "pointer", color: "#9b0e16", fontSize: "24px" }}
                      />
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
                  {isSearchFocused && suggestions.length > 0 && (
                    <ul
                      className="list-group position-absolute mt-1 z-index-1000"
                      style={{ width: "calc(100% - 30px)", maxHeight: "200px", overflowY: "auto" }}
                    >
                      {suggestions.map((s, index) => (
                        <li
                          key={index}
                          className="list-group-item list-group-item-action"
                          onClick={() =>
                            handleSelectLocation(
                              parseFloat(s.lat),
                              parseFloat(s.lon),
                              s.display_name
                            )
                          }
                          style={{ cursor: "pointer" }}
                        >
                          {s.display_name}
                        </li>
                      ))}
                    </ul>
                  )}
                  {locationError && <div className="text-danger mt-1">{locationError}</div>}
                </div>
                <div className="col-md-4 mt-2 mt-md-0">
                  <div className="d-flex align-items-center">
                    <span className="me-2">Filter by distance:</span>
                    <select
                      className="form-select form-select-sm"
                      value={distanceFilter || ""}
                      onChange={(e) =>
                        setDistanceFilter(e.target.value ? Number(e.target.value) : null)
                      }
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
          </div>
        </div>

        {/* Route Info */}
        {routeInfo && (
          <div className="row">
            <div className="col-12">
              <div className="card p-2 mb-3 bg-primary text-white">
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
            </div>
          </div>
        )}

        {/* Map Section */}
        <div className="row">
          <div className="col-12">
            <div className="card p-0">
              <MapContainer
                center={mapCenter}
                zoom={13}
                style={{ height: "calc(100vh - 280px)", width: "100%" }} // Adjusted for header, search, and route info
                whenCreated={(map) => {
                  mapRef.current = map;
                }}
              >
                <MapContent />
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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

                {/* Single Parking Marker */}
                {parking && (
                  <Marker
                    position={[parking.latitude, parking.longitude]}
                    icon={parkingIcon}
                    eventHandlers={{
                      dblclick: () => handleParkingDoubleClick(parking),
                    }}
                  >
                    <Popup>
                      <div style={{ width: "200px" }}>
                        <h6 className="fw-bold text-sm">{parking.nom}</h6>
                        <p className="text-muted mb-1 text-xs">
                          <MapPin size={14} className="me-1 text-danger" />
                          {parking.adresse}
                        </p>
                        {userPosition && (
                          <p className="text-muted mb-1 text-xs">
                            Distance: {calculateDistance(
                              userPosition[0],
                              userPosition[1],
                              parking.latitude,
                              parking.longitude
                            ).toFixed(1)} km
                          </p>
                        )}
                        <p className="mb-1 text-xs">
                          <strong>Places:</strong> {parking.nbr_place}
                        </p>
                        <p className="mb-1 text-xs">
                          <span
                            className={`badge ${parking.disponibilite ? "bg-success" : "bg-danger"}`}
                          >
                            {parking.disponibilite ? "Available" : "Full"}
                          </span>
                        </p>
                        <p className="fw-bold text-end text-xs" style={{ color: "#9b0e16" }}>
                          {parking.tarif_horaire} DT / hour
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
                )}
              </MapContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPage2;