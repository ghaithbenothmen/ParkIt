import React, { useState, useEffect, useRef } from "react";
import PropTypes from 'prop-types';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Toast } from "primereact/toast";
import { Card } from 'primereact/card';
import * as Icon from "react-feather";
import axios from "axios";
import { Modal } from "bootstrap";
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

// Configuration de l'icône Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const LocationMarker = ({ position, setPosition, setFormValues, formFieldNames }) => {
  const map = useMapEvents({
    async click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
        const data = await response.json();
        const address = data.display_name || "";
        
        setFormValues(prev => ({
          ...prev,
          [formFieldNames.latitude]: lat.toFixed(6),
          [formFieldNames.longitude]: lng.toFixed(6),
          adresse: address
        }));
      } catch (error) {
        console.error("Error fetching address:", error);
        setFormValues(prev => ({
          ...prev,
          [formFieldNames.latitude]: lat.toFixed(6),
          [formFieldNames.longitude]: lng.toFixed(6)
        }));
      }
    },
  });

  return position === null ? null : (
    <Marker 
      position={position} 
      draggable={true}
      eventHandlers={{
        async dragend(e) {
          const { lat, lng } = e.target.getLatLng();
          setPosition([lat, lng]);
          
          try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await response.json();
            const address = data.display_name || "";
            
            setFormValues(prev => ({
              ...prev,
              [formFieldNames.latitude]: lat.toFixed(6),
              [formFieldNames.longitude]: lng.toFixed(6),
              adresse: address
            }));
          } catch (error) {
            console.error("Error fetching address:", error);
            setFormValues(prev => ({
              ...prev,
              [formFieldNames.latitude]: lat.toFixed(6),
              [formFieldNames.longitude]: lng.toFixed(6)
            }));
          }
        }
      }}
    >
      <Popup>Parking location</Popup>
    </Marker>
  );
};

LocationMarker.propTypes = {
  position: PropTypes.arrayOf(PropTypes.number),
  setPosition: PropTypes.func.isRequired,
  setFormValues: PropTypes.func.isRequired,
  formFieldNames: PropTypes.shape({
    latitude: PropTypes.string.isRequired,
    longitude: PropTypes.string.isRequired
  }).isRequired
};

const ViewLocationMap = ({ position }) => {
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);

  useEffect(() => {
    if (mapRef.current && position) {
      mapRef.current.setView(position, 15);
      setTimeout(() => {
        mapRef.current.invalidateSize();
      }, 0);
    }
  }, [position]);

  return (
    <div 
      ref={mapContainerRef}
      style={{ 
        height: '500px',  // Augmenté de 400px à 500px
        width: '100%',
        borderRadius: '8px', 
        overflow: 'hidden' 
      }}
    >
      <MapContainer 
        center={position} 
        zoom={15} 
        style={{ height: '100%', width: '100%' }}
        whenReady={(map) => {
          mapRef.current = map.target;
          map.target.invalidateSize();
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={position}>
          <Popup>Parking Location</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

ViewLocationMap.propTypes = {
  position: PropTypes.arrayOf(PropTypes.number).isRequired
};

const AllService = () => {
  const [parkingToDelete, setParkingToDelete] = useState(null);
  const [parkingToUpdate, setParkingToUpdate] = useState(null);
  const [parkingToView, setParkingToView] = useState(null);
  const [newParking, setNewParking] = useState({
    nom: "",
    adresse: "",
    nbr_place: "",
    tarif_horaire: "",
    disponibilite: true,
    latitude: "",
    longitude: "",
  });
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [errors, setErrors] = useState({});
  const [mapPosition, setMapPosition] = useState([36.8065, 10.1815]);
  const [updateMapPosition, setUpdateMapPosition] = useState([36.8065, 10.1815]);
  const [userPosition, setUserPosition] = useState(null);
  const [routingControl, setRoutingControl] = useState(null);
  
  const toast = useRef(null);
  const createModalRef = useRef(null);
  const updateModalRef = useRef(null);
  const deleteModalRef = useRef(null);
  const viewModalRef = useRef(null);
  const createMapRef = useRef(null);
  const updateMapRef = useRef(null);
  const mainMapRef = useRef(null);

  const fetchServices = async () => {
    try {
      const response = await axios.get("http://localhost:4000/api/parking");
      setServices(response.data);
    } catch (error) {
      showToast('error', 'Error', 'Failed to load parking data');
      console.error("Error loading services:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
    createModalRef.current = new Modal(document.getElementById('create-item'));
    updateModalRef.current = new Modal(document.getElementById('update-item'));
    deleteModalRef.current = new Modal(document.getElementById('delete-item'));
    viewModalRef.current = new Modal(document.getElementById('view-location'));

    // Get user's current position
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserPosition([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error("Error getting user location:", error);
          showToast('warn', 'Warning', 'Could not get your current location');
        }
      );
    }
  }, []);

  useEffect(() => {
    if (newParking.latitude && newParking.longitude) {
      setMapPosition([parseFloat(newParking.latitude), parseFloat(newParking.longitude)]);
    }
  }, [newParking.latitude, newParking.longitude]);

  useEffect(() => {
    if (parkingToUpdate?.latitude && parkingToUpdate?.longitude) {
      setUpdateMapPosition([parseFloat(parkingToUpdate.latitude), parseFloat(parkingToUpdate.longitude)]);
    }
  }, [parkingToUpdate?.latitude, parkingToUpdate?.longitude]);

  const showToast = (severity, summary, detail) => {
    toast.current?.show({ severity, summary, detail, life: 3000 });
  };

  const validateForm = (data) => {
    const errors = {};
    
    if (!data.nom.trim()) errors.nom = "Parking name is required";
    else if (data.nom.length > 50) errors.nom = "Name must not exceed 50 characters";
    
    if (!data.adresse.trim()) errors.adresse = "Address is required";
    else if (data.adresse.length > 300) errors.adresse = "Address must not exceed 300 characters";
    
    if (!data.nbr_place) errors.nbr_place = "Number of places is required and > 0";
    else if (isNaN(data.nbr_place)) errors.nbr_place = "Must be a valid number";
    else if (Number(data.nbr_place) <= 0) errors.nbr_place = "Must be greater than 0";
    else if (Number(data.nbr_place) > 1000) errors.nbr_place = "Maximum number is 1000";
    
    if (!data.tarif_horaire) errors.tarif_horaire = "Hourly rate is required and > 0";
    else if (isNaN(data.tarif_horaire)) errors.tarif_horaire = "Must be a valid number";
    else if (Number(data.tarif_horaire) <= 0) errors.tarif_horaire = "Must be greater than 0";
    else if (Number(data.tarif_horaire) > 100) errors.tarif_horaire = "Maximum rate is 100 DT";
    
    if (!data.latitude) errors.latitude = "Latitude is required";
    else if (isNaN(data.latitude)) errors.latitude = "Must be a valid number";
    else if (data.latitude < -90 || data.latitude > 90) errors.latitude = "Latitude must be between -90 and 90";
    
    if (!data.longitude) errors.longitude = "Longitude is required";
    else if (isNaN(data.longitude)) errors.longitude = "Must be a valid number";
    else if (data.longitude < -180 || data.longitude > 180) errors.longitude = "Longitude must be between -180 and 180";
    
    return errors;
  };

  const deleteParking = async () => {
    if (!parkingToDelete) return;
    try {
      await axios.delete(`http://localhost:4000/api/parking/${parkingToDelete._id}`);
      fetchServices();
      showToast('success', 'Success', 'Parking deleted successfully');
      deleteModalRef.current?.hide();
    } catch (error) {
      console.error("Error deleting parking:", error);
      showToast('error', 'Error', 'Failed to delete parking');
    }
  };

  const addParking = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm(newParking);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    try {
      await axios.post("http://localhost:4000/api/parking", newParking);
      showToast('success', 'Success', 'Parking added successfully');
      createModalRef.current?.hide();
      fetchServices();
      setNewParking({
        nom: "",
        adresse: "",
        nbr_place: "",
        tarif_horaire: "",
        disponibilite: true,
        latitude: "",
        longitude: "",
      });
      setErrors({});
    } catch (error) {
      console.error("Error adding parking:", error);
      showToast('error', 'Error', 'Failed to add parking');
    }
  };

  const updateParking = async (e) => {
    e.preventDefault();
    if (!parkingToUpdate) return;
    const validationErrors = validateForm(parkingToUpdate);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    try {
      await axios.put(
        `http://localhost:4000/api/parking/${parkingToUpdate._id}`,
        parkingToUpdate
      );
      showToast('success', 'Success', 'Parking updated successfully');
      updateModalRef.current?.hide();
      fetchServices();
    } catch (error) {
      console.error("Error updating parking:", error);
      showToast('error', 'Error', 'Failed to update parking');
    }
  };

  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    // Ne pas permettre la modification des champs de localisation via l'input
    if (name !== 'latitude' && name !== 'longitude' && name !== 'adresse') {
      setParkingToUpdate({
        ...parkingToUpdate,
        [name]: name === 'disponibilite' ? value === 'true' : value,
      });
    }
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    // Ne pas permettre la modification des champs de localisation via l'input
    if (name !== 'latitude' && name !== 'longitude' && name !== 'adresse') {
      setNewParking({
        ...newParking,
        [name]: name === 'disponibilite' ? value === 'true' : value,
      });
    }
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const openUpdateModal = (parking) => {
    setParkingToUpdate({ ...parking });
    setUpdateMapPosition([
      parseFloat(parking.latitude) || 36.8065,
      parseFloat(parking.longitude) || 10.1815
    ]);
    setErrors({});
    updateModalRef.current?.show();
    
    // Force map resize after modal is shown
    setTimeout(() => {
      if (updateMapRef.current) {
        updateMapRef.current.invalidateSize();
      }
    }, 300);
  };

  const openDeleteModal = (parking) => {
    setParkingToDelete(parking);
    deleteModalRef.current?.show();
  };

  const openViewModal = (parking) => {
    setParkingToView(parking);
    viewModalRef.current?.show();
    
    // Force map resize after modal is shown
    setTimeout(() => {
      const mapContainer = document.querySelector('#view-location .leaflet-container');
      if (mapContainer && mapContainer._leaflet_map) {
        mapContainer._leaflet_map.invalidateSize();
      }
    }, 300);
  };

  const filteredServices = services.filter(service => {
    return Object.values(service).some(value => 
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const addressBodyTemplate = (rowData) => {
    return (
      <span 
        title={rowData.adresse}
        style={{
          display: 'inline-block',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '150px'
        }}
      >
        {rowData.adresse}
      </span>
    );
  };

  const availabilityBodyTemplate = (rowData) => {
    return rowData.disponibilite ? (
      <span className="badge bg-success">Available</span>
    ) : (
      <span className="badge bg-danger">Unavailable</span>
    );
  };

  const actionButtonsTemplate = (rowData) => {
    return (
      <div className="btn-group">
        <button
          className="btn btn-sm btn-outline-primary"
          onClick={() => openUpdateModal(rowData)}
        >
          <i className="fa-solid fa-pen-to-square me-1"></i>
          Edit
        </button>
        <button
          className="btn btn-sm btn-outline-info ms-2"
          onClick={() => openViewModal(rowData)}
        >
          <i className="fa-solid fa-map-location-dot me-1"></i>
          View
        </button>
        <button
          className="btn btn-sm btn-outline-danger ms-2"
          onClick={() => openDeleteModal(rowData)}
        >
          <i className="fa-solid fa-trash-can me-1"></i>
          Delete
        </button>
      </div>
    );
  };

  const focusOnParking = (parking) => {
    if (mainMapRef.current && parking.latitude && parking.longitude) {
      const position = [parseFloat(parking.latitude), parseFloat(parking.longitude)];
      mainMapRef.current.flyTo(position, 15);
    }
  };

  const showRouteToParking = (parking) => {
    if (!mainMapRef.current || !userPosition) {
      showToast('warn', 'Warning', 'Could not determine your current location');
      return;
    }

    const parkingPosition = [parseFloat(parking.latitude), parseFloat(parking.longitude)];
    
    // Remove previous routing control if exists
    if (routingControl && mainMapRef.current.hasLayer(routingControl)) {
      mainMapRef.current.removeControl(routingControl);
    }

    // Create new routing control
    const newRoutingControl = L.Routing.control({
      waypoints: [
        L.latLng(userPosition[0], userPosition[1]),
        L.latLng(parkingPosition[0], parkingPosition[1])
      ],
      routeWhileDragging: true,
      show: false, // Hide the instructions panel initially
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      lineOptions: {
        styles: [{color: '#007bff', opacity: 0.7, weight: 5}]
      },
      createMarker: function(i, waypoint, n) {
        if (i === 0) {
          return L.marker(waypoint.latLng, {
            icon: L.icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41]
            }),
            title: 'Your location'
          });
        }
        return L.marker(waypoint.latLng, {
          title: parking.nom
        });
      }
    }).addTo(mainMapRef.current);

    setRoutingControl(newRoutingControl);

    // Show route instructions in a popup
    newRoutingControl.on('routesfound', function(e) {
      const routes = e.routes;
      const summary = routes[0].summary;
      const distance = (summary.totalDistance / 1000).toFixed(2) + ' km';
      const time = (summary.totalTime / 60).toFixed(1) + ' min';
      
      const popupContent = `
        <div>
          <h6>Route to ${parking.nom}</h6>
          <p><strong>Distance:</strong> ${distance}</p>
          <p><strong>Estimated time:</strong> ${time}</p>
          <button class="btn btn-sm btn-outline-danger mt-2" onclick="document.querySelector('.leaflet-routing-container').style.display='block'">
            Show Directions
          </button>
          <button class="btn btn-sm btn-outline-secondary mt-2 ms-2" onclick="document.querySelector('.leaflet-routing-container').style.display='none'">
            Hide Directions
          </button>
        </div>
      `;
      
      L.popup()
        .setLatLng(parkingPosition)
        .setContent(popupContent)
        .openOn(mainMapRef.current);
    });

    // Fly to the route
    mainMapRef.current.flyToBounds([
      [userPosition[0], userPosition[1]],
      [parkingPosition[0], parkingPosition[1]]
    ], { padding: [50, 50] });
  };

  return (
    <>
      <Toast ref={toast} />
      <div className="page-wrapper page-settings" style={{ height: '100vh', overflow: 'hidden' }}>
        <div className="content" style={{ height: 'calc(100% - 60px)', overflowY: 'auto' }}>
          <div className="content-page-header content-page-headersplit">
            <h5>Parking Management</h5>
            <div className="list-btn">
              <ul>
                <li>
                  <div className="input-group">
                    <span className="input-group-text">
                      <Icon.Search size={18} />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search parkings..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </li>
                <li>
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      setNewParking({
                        nom: "",
                        adresse: "",
                        nbr_place: "",
                        tarif_horaire: "",
                        disponibilite: true,
                        latitude: "",
                        longitude: "",
                      });
                      setMapPosition([36.8065, 10.1815]);
                      setErrors({});
                      createModalRef.current?.show();
                      
                      // Force map resize after modal is shown
                      setTimeout(() => {
                        if (createMapRef.current) {
                          createMapRef.current.invalidateSize();
                        }
                      }, 300);
                    }}
                  >
                    <i className="fa fa-plus me-2" />
                    Add Parking
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Carte principale des parkings */}
          <Card title="Parkings Map" className="mb-4">
            <div style={{ height: '400px', borderRadius: '8px', overflow: 'hidden' }}>
              <MapContainer 
                center={[36.8065, 10.1815]} 
                zoom={12} 
                style={{ height: '100%', width: '100%' }}
                whenReady={(map) => {
                  mainMapRef.current = map.target;
                }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {services.map((parking, index) => (
                  parking.latitude && parking.longitude && (
                    <Marker 
                      key={index}
                      position={[parseFloat(parking.latitude), parseFloat(parking.longitude)]}
                      eventHandlers={{
                        click: () => focusOnParking(parking),
                        dblclick: () => showRouteToParking(parking)
                      }}
                    >
                      <Popup>
                        <div>
                          <h6 className="font-bold">{parking.nom}</h6>
                          <p className="m-0">{parking.adresse}</p>
                          <p className="m-0">Places: {parking.nbr_place}</p>
                          <p className="m-0">Rate: {parking.tarif_horaire} DT/h</p>
                          <p className="m-0">
                            Status: <span className={parking.disponibilite ? "text-success" : "text-danger"}>
                              {parking.disponibilite ? "Available" : "Unavailable"}
                            </span>
                          </p>
                          <button 
                            className="btn btn-sm btn-primary mt-2 w-100"
                            onClick={() => showRouteToParking(parking)}
                          >
                            Show Route
                          </button>
                        </div>
                      </Popup>
                    </Marker>
                  )
                ))}
              </MapContainer>
            </div>
          </Card>

          <div className="row">
            <div className="col-12">
              <div className="table-responsive">
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : (
                  <DataTable 
                    value={filteredServices} 
                    paginator 
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    emptyMessage="No parking found"
                    className="mt-3"
                    scrollable
                    scrollHeight="flex"
                  >
                    <Column field="nom" header="Name" sortable style={{ width: '150px' }} />
                    <Column 
                      field="adresse" 
                      header="Address" 
                      sortable 
                      body={addressBodyTemplate}
                      style={{ width: '150px' }}
                    />
                    <Column field="nbr_place" header="Places" sortable style={{ width: '100px' }} />
                    <Column 
                      field="tarif_horaire" 
                      header="Hourly Rate" 
                      sortable 
                      body={(rowData) => `DT${rowData.tarif_horaire}`}
                      style={{ width: '120px' }}
                    />
                    <Column 
                      field="disponibilite" 
                      header="Status" 
                      sortable 
                      body={availabilityBodyTemplate}
                      style={{ width: '120px' }}
                    />
                    <Column 
                      field="latitude" 
                      header="Coordinates" 
                      body={(rowData) => `${rowData.latitude}, ${rowData.longitude}`}
                      style={{ width: '180px' }}
                    />
                    <Column
                      header="Actions"
                      body={actionButtonsTemplate}
                      style={{ width: '220px' }}
                    />
                  </DataTable>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <div className="modal fade" id="delete-item" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header border-0">
              <h5 className="modal-title">Confirm Deletion</h5>
              <button 
                type="button" 
                className="btn-close" 
                data-bs-dismiss="modal" 
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body py-4">
              <p>Are you sure you want to delete the parking <strong>{parkingToDelete?.nom}</strong>?</p>
              <p className="text-muted">This action cannot be undone.</p>
            </div>
            <div className="modal-footer border-0">
              <button 
                type="button" 
                className="btn btn-secondary" 
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-danger" 
                onClick={deleteParking}
              >
                Delete Parking
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* View Location Modal */}
      <div className="modal fade" id="view-location" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header border-0">
              <h5 className="modal-title">Parking Location - {parkingToView?.nom}</h5>
              <button 
                type="button" 
                className="btn-close" 
                data-bs-dismiss="modal" 
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body py-4">
              {parkingToView && (
                <>
                  <div className="mb-3">
                    <p><strong>Address:</strong> {parkingToView.adresse}</p>
                    <p><strong>Coordinates:</strong> {parkingToView.latitude}, {parkingToView.longitude}</p>
                  </div>
                  <ViewLocationMap 
                    position={[
                      parseFloat(parkingToView.latitude) || 36.8065,
                      parseFloat(parkingToView.longitude) || 10.1815
                    ]} 
                  />
                </>
              )}
            </div>
            <div className="modal-footer border-0">
              <button 
                type="button" 
                className="btn btn-secondary" 
                data-bs-dismiss="modal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Update Parking Modal */}
      <div className="modal fade" id="update-item" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header border-0">
              <h5 className="modal-title">Update Parking</h5>
              <button 
                type="button" 
                className="btn-close" 
                data-bs-dismiss="modal" 
                aria-label="Close"
                onClick={() => setErrors({})}
              ></button>
            </div>
            <div className="modal-body py-4">
              {parkingToUpdate && (
                <form onSubmit={updateParking}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label">Name*</label>
                        <input
                          type="text"
                          name="nom"
                          value={parkingToUpdate.nom || ""}
                          onChange={handleUpdateChange}
                          className={`form-control ${errors.nom ? "is-invalid" : ""}`}
                          maxLength="50"
                        />
                        {errors.nom && (
                          <div className="text-danger small mt-1" style={{fontSize: '0.8rem'}}>
                            {errors.nom}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label">Address*</label>
                        <input
                          type="text"
                          name="adresse"
                          value={parkingToUpdate.adresse || ""}
                          onChange={handleUpdateChange}
                          className={`form-control ${errors.adresse ? "is-invalid" : ""}`}
                          maxLength="300"
                          readOnly
                        />
                        {errors.adresse && (
                          <div className="text-danger small mt-1" style={{fontSize: '0.8rem'}}>
                            {errors.adresse}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label">Number of Places*</label>
                        <input
                          type="number"
                          name="nbr_place"
                          value={parkingToUpdate.nbr_place || ""}
                          onChange={handleUpdateChange}
                          className={`form-control ${errors.nbr_place ? "is-invalid" : ""}`}
                          min="1"
                          max="1000"
                        />
                        {errors.nbr_place && (
                          <div className="text-danger small mt-1" style={{fontSize: '0.8rem'}}>
                            {errors.nbr_place}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label">Hourly Rate (DT)*</label>
                        <input
                          type="number"
                          name="tarif_horaire"
                          value={parkingToUpdate.tarif_horaire || ""}
                          onChange={handleUpdateChange}
                          className={`form-control ${errors.tarif_horaire ? "is-invalid" : ""}`}
                          min="0.01"
                          max="100"
                          step="0.01"
                        />
                        {errors.tarif_horaire && (
                          <div className="text-danger small mt-1" style={{fontSize: '0.8rem'}}>
                            {errors.tarif_horaire}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="form-group">
                        <label className="form-label">Status</label>
                        <select
                          name="disponibilite"
                          value={parkingToUpdate.disponibilite ? "true" : "false"}
                          onChange={handleUpdateChange}
                          className="form-select"
                        >
                          <option value="true">Available</option>
                          <option value="false">Unavailable</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="col-12">
                      <label className="form-label">Select Location on Map*</label>
                      <div style={{ height: '300px', borderRadius: '8px', overflow: 'hidden', marginBottom: '1rem' }}>
                        <MapContainer 
                          center={updateMapPosition} 
                          zoom={13} 
                          style={{ height: '100%', width: '100%' }}
                          whenReady={(map) => {
                            updateMapRef.current = map.target;
                            map.target.invalidateSize();
                          }}
                          ref={updateMapRef}
                        >
                          <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                          />
                          <LocationMarker 
                            position={updateMapPosition} 
                            setPosition={setUpdateMapPosition}
                            setFormValues={setParkingToUpdate}
                            formFieldNames={{ latitude: 'latitude', longitude: 'longitude' }}
                          />
                        </MapContainer>
                      </div>
                      <div className="row">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Latitude*</label>
                            <input
                              type="number"
                              name="latitude"
                              value={parkingToUpdate.latitude || ""}
                              onChange={handleUpdateChange}
                              className={`form-control ${errors.latitude ? "is-invalid" : ""}`}
                              step="any"
                              min="-90"
                              max="90"
                              readOnly
                            />
                            {errors.latitude && (
                              <div className="text-danger small mt-1" style={{fontSize: '0.8rem'}}>
                                {errors.latitude}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label className="form-label">Longitude*</label>
                            <input
                              type="number"
                              name="longitude"
                              value={parkingToUpdate.longitude || ""}
                              onChange={handleUpdateChange}
                              className={`form-control ${errors.longitude ? "is-invalid" : ""}`}
                              step="any"
                              min="-180"
                              max="180"
                              readOnly
                            />
                            {errors.longitude && (
                              <div className="text-danger small mt-1" style={{fontSize: '0.8rem'}}>
                                {errors.longitude}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer border-0 pt-4">
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      data-bs-dismiss="modal"
                      onClick={() => setErrors({})}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Save Changes
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Parking Modal */}
      <div className="modal fade" id="create-item" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header border-0">
              <h5 className="modal-title">Add New Parking</h5>
              <button 
                type="button" 
                className="btn-close" 
                data-bs-dismiss="modal" 
                aria-label="Close"
                onClick={() => {
                  setNewParking({
                    nom: "",
                    adresse: "",
                    nbr_place: "",
                    tarif_horaire: "",
                    disponibilite: true,
                    latitude: "",
                    longitude: "",
                  });
                  setMapPosition([36.8065, 10.1815]);
                  setErrors({});
                }}
              ></button>
            </div>
            <div className="modal-body py-4">
              <form onSubmit={addParking}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label">Name*</label>
                      <input
                        type="text"
                        name="nom"
                        value={newParking.nom}
                        onChange={handleCreateChange}
                        className={`form-control ${errors.nom ? "is-invalid" : ""}`}
                        maxLength="50"
                      />
                      {errors.nom && (
                        <div className="text-danger small mt-1" style={{fontSize: '0.8rem'}}>
                          {errors.nom}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label">Address*</label>
                      <input
                        type="text"
                        name="adresse"
                        value={newParking.adresse}
                        onChange={handleCreateChange}
                        className={`form-control ${errors.adresse ? "is-invalid" : ""}`}
                        maxLength="300"
                        readOnly
                      />
                      {errors.adresse && (
                        <div className="text-danger small mt-1" style={{fontSize: '0.8rem'}}>
                          {errors.adresse}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label">Number of Places*</label>
                      <input
                        type="number"
                        name="nbr_place"
                        value={newParking.nbr_place}
                        onChange={handleCreateChange}
                        className={`form-control ${errors.nbr_place ? "is-invalid" : ""}`}
                        min="1"
                        max="1000"
                      />
                      {errors.nbr_place && (
                        <div className="text-danger small mt-1" style={{fontSize: '0.8rem'}}>
                          {errors.nbr_place}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label">Hourly Rate (DT)*</label>
                      <input
                        type="number"
                        name="tarif_horaire"
                        value={newParking.tarif_horaire}
                        onChange={handleCreateChange}
                        className={`form-control ${errors.tarif_horaire ? "is-invalid" : ""}`}
                        min="0.01"
                        max="100"
                        step="0.01"
                      />
                      {errors.tarif_horaire && (
                        <div className="text-danger small mt-1" style={{fontSize: '0.8rem'}}>
                          {errors.tarif_horaire}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label">Status</label>
                      <select
                        name="disponibilite"
                        value={newParking.disponibilite ? "true" : "false"}
                        onChange={handleCreateChange}
                        className="form-select"
                      >
                        <option value="true">Available</option>
                        <option value="false">Unavailable</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="col-12">
                    <label className="form-label">Select Location on Map*</label>
                    <div style={{ height: '300px', borderRadius: '8px', overflow: 'hidden', marginBottom: '1rem' }}>
                      <MapContainer 
                        center={mapPosition} 
                        zoom={13} 
                        style={{ height: '100%', width: '100%' }}
                        whenReady={(map) => {
                          createMapRef.current = map.target;
                          map.target.invalidateSize();
                        }}
                        ref={createMapRef}
                      >
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        <LocationMarker 
                          position={mapPosition} 
                          setPosition={setMapPosition}
                          setFormValues={setNewParking}
                          formFieldNames={{ latitude: 'latitude', longitude: 'longitude' }}
                        />
                      </MapContainer>
                    </div>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">Latitude*</label>
                          <input
                            type="number"
                            name="latitude"
                            value={newParking.latitude}
                            onChange={handleCreateChange}
                            className={`form-control ${errors.latitude ? "is-invalid" : ""}`}
                            step="any"
                            min="-90"
                            max="90"
                            readOnly
                          />
                          {errors.latitude && (
                            <div className="text-danger small mt-1" style={{fontSize: '0.8rem'}}>
                              {errors.latitude}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label className="form-label">Longitude*</label>
                          <input
                            type="number"
                            name="longitude"
                            value={newParking.longitude}
                            onChange={handleCreateChange}
                            className={`form-control ${errors.longitude ? "is-invalid" : ""}`}
                            step="any"
                            min="-180"
                            max="180"
                            readOnly
                          />
                          {errors.longitude && (
                            <div className="text-danger small mt-1" style={{fontSize: '0.8rem'}}>
                              {errors.longitude}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-4">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    data-bs-dismiss="modal"
                    onClick={() => {
                      setNewParking({
                        nom: "",
                        adresse: "",
                        nbr_place: "",
                        tarif_horaire: "",
                        disponibilite: true,
                        latitude: "",
                        longitude: "",
                      });
                      setMapPosition([36.8065, 10.1815]);
                      setErrors({});
                    }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create Parking
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AllService;