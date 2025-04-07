import React, { useState, useEffect, useRef } from "react";
import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { DataTable } from "primereact/datatable";
import { Toast } from "primereact/toast";
import * as Icon from "react-feather";
import axios from "axios";
import { Modal } from "bootstrap";

const AllService = () => {
  const [selectedValue, setSelectedValue] = useState(null);
  const [parkingToDelete, setParkingToDelete] = useState(null);
  const [parkingToUpdate, setParkingToUpdate] = useState(null);
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
  const toast = useRef(null);
  const createModalRef = useRef(null);
  const updateModalRef = useRef(null);
  const deleteModalRef = useRef(null);

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
  }, []);

  const showToast = (severity, summary, detail) => {
    toast.current?.show({ severity, summary, detail, life: 3000 });
  };

  const validateForm = (data) => {
    const errors = {};
    
    if (!data.nom.trim()) {
      errors.nom = "Parking name is required";
    } else if (data.nom.length > 50) {
      errors.nom = "Name must not exceed 50 characters";
    }
    
    if (!data.adresse.trim()) {
      errors.adresse = "Address is required";
    } else if (data.adresse.length > 100) {
      errors.adresse = "Address must not exceed 100 characters";
    }
    
    if (!data.nbr_place) {
      errors.nbr_place = "Number of places is required and > 0";
    } else if (isNaN(data.nbr_place)) {
      errors.nbr_place = "Must be a valid number";
    } else if (Number(data.nbr_place) <= 0) {
      errors.nbr_place = "Must be greater than 0";
    } else if (Number(data.nbr_place) > 1000) {
      errors.nbr_place = "Maximum number is 1000";
    }
    
    if (!data.tarif_horaire) {
      errors.tarif_horaire = "Hourly rate is required and > 0";
    } else if (isNaN(data.tarif_horaire)) {
      errors.tarif_horaire = "Must be a valid number";
    } else if (Number(data.tarif_horaire) <= 0) {
      errors.tarif_horaire = "Must be greater than 0";
    } else if (Number(data.tarif_horaire) > 100) {
      errors.tarif_horaire = "Maximum rate is 100 DT";
    }
    
    if (!data.latitude) {
      errors.latitude = "Latitude is required";
    } else if (isNaN(data.latitude)) {
      errors.latitude = "Must be a valid number";
    } else if (data.latitude < -90 || data.latitude > 90) {
      errors.latitude = "Latitude must be between -90 and 90";
    }
    
    if (!data.longitude) {
      errors.longitude = "Longitude is required";
    } else if (isNaN(data.longitude)) {
      errors.longitude = "Must be a valid number";
    } else if (data.longitude < -180 || data.longitude > 180) {
      errors.longitude = "Longitude must be between -180 and 180";
    }
    
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
    setParkingToUpdate({
      ...parkingToUpdate,
      [name]: name === 'disponibilite' ? value === 'true' : value,
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setNewParking({
      ...newParking,
      [name]: name === 'disponibilite' ? value === 'true' : value,
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const openUpdateModal = (parking) => {
    setParkingToUpdate({ ...parking });
    setErrors({});
    updateModalRef.current?.show();
  };

  const openDeleteModal = (parking) => {
    setParkingToDelete(parking);
    deleteModalRef.current?.show();
  };

  const filteredServices = services.filter(service => {
    return Object.values(service).some(value => 
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const availabilityBodyTemplate = (rowData) => {
    return rowData.disponibilite ? (
      <span className="badge bg-success">Available</span>
    ) : (
      <span className="badge bg-danger">Unavailable</span>
    );
  };

  return (
    <>
      <Toast ref={toast} />
      <div className="page-wrapper page-settings">
        <div className="content">
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
                      setErrors({});
                      createModalRef.current?.show();
                    }}
                  >
                    <i className="fa fa-plus me-2" />
                    Add Parking
                  </button>
                </li>
              </ul>
            </div>
          </div>

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
                  >
                    <Column field="nom" header="Name" sortable />
                    <Column field="adresse" header="Address" sortable />
                    <Column field="nbr_place" header="Places" sortable />
                    <Column 
                      field="tarif_horaire" 
                      header="Hourly Rate" 
                      sortable 
                      body={(rowData) => `DT${rowData.tarif_horaire}`}
                    />
                    <Column 
                      field="disponibilite" 
                      header="Status" 
                      sortable 
                      body={availabilityBodyTemplate}
                    />
                    <Column 
                      field="latitude" 
                      header="Coordinates" 
                      body={(rowData) => `${rowData.latitude}, ${rowData.longitude}`}
                    />
                    <Column
                      header="Actions"
                      body={(rowData) => (
                        <div className="btn-group">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => openUpdateModal(rowData)}
                          >
                            <i className="fa-solid fa-pen-to-square me-1"></i>
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger ms-2"
                            onClick={() => openDeleteModal(rowData)}
                          >
                            <i className="fa-solid fa-trash-can me-1"></i>
                            Delete
                          </button>
                        </div>
                      )}
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
                          maxLength="100"
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
                        />
                        {errors.longitude && (
                          <div className="text-danger small mt-1" style={{fontSize: '0.8rem'}}>
                            {errors.longitude}
                          </div>
                        )}
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
                        maxLength="100"
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
                      />
                      {errors.longitude && (
                        <div className="text-danger small mt-1" style={{fontSize: '0.8rem'}}>
                          {errors.longitude}
                        </div>
                      )}
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