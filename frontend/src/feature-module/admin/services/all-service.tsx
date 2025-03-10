import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { DataTable } from "primereact/datatable";
import * as Icon from "react-feather";
import axios from "axios";
import ImageWithBasePath from "../../../core/img/ImageWithBasePath";
import { all_routes } from "../../../core/data/routes/all_routes";

const AllService = () => {
  const routes = all_routes;
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
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [errors, setErrors] = useState({});

  // Charger les services au montage du composant
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await axios.get("http://localhost:4000/api/parking");
        setServices(response.data);
      } catch (error) {
        console.error("Erreur lors du chargement des services :", error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  // Valider les données du formulaire
  const validateForm = (data) => {
    const errors = {};
    if (!data.nom) errors.nom = "Name is required.";
    if (!data.adresse) errors.adresse = "Address is required.";
    if (!data.nbr_place || data.nbr_place <= 0) errors.nbr_place = "Number of places must be greater than 0.";
    if (!data.tarif_horaire || data.tarif_horaire <= 0) errors.tarif_horaire = "Hourly rate must be greater than 0.";
    if (!data.latitude) errors.latitude = "Latitude is required.";
    if (!data.longitude) errors.longitude = "Longitude is required.";
    return errors;
  };

  // Supprimer un parking
  const deleteParking = async () => {
    if (!parkingToDelete) return;
    try {
      await axios.delete(`http://localhost:4000/api/parking/${parkingToDelete._id}`);
      setServices(services.filter(service => service._id !== parkingToDelete._id));
      setParkingToDelete(null);
      setPopupMessage("Parking deleted successfully!");
      setShowPopup(true);
    } catch (error) {
      console.error("Error deleting parking:", error);
      setPopupMessage("Error deleting parking.");
      setShowPopup(true);
    }
  };

  // Mettre à jour un parking
  const updateParking = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm(parkingToUpdate);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    try {
      const response = await axios.put(
        `http://localhost:4000/api/parking/${parkingToUpdate._id}`,
        parkingToUpdate
      );
      setServices(services.map(service => 
        service._id === parkingToUpdate._id ? response.data : service
      ));
      setParkingToUpdate(null);
      setErrors({});
      setPopupMessage("Parking updated successfully!");
      setShowPopup(true);
      closeModal('update-item');
    } catch (error) {
      console.error("Error updating parking:", error);
      setPopupMessage("Error updating parking.");
      setShowPopup(true);
    }
  };

  // Ajouter un parking
  const addParking = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm(newParking);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    try {
      const response = await axios.post("http://localhost:4000/api/parking", newParking);
      setServices([...services, response.data]);
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
      setPopupMessage("Parking added successfully!");
      setShowPopup(true);
      closeModal('create-item');
    } catch (error) {
      console.error("Error adding parking:", error);
      setPopupMessage("Error adding parking.");
      setShowPopup(true);
    }
  };

  // Gérer les changements dans le formulaire de mise à jour
  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setParkingToUpdate({
      ...parkingToUpdate,
      [name]: value,
    });
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  // Gérer les changements dans le formulaire de création
  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setNewParking({
      ...newParking,
      [name]: value,
    });
    // Effacer l'erreur du champ modifié
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  // Fermer une modale
  const closeModal = (modalId) => {
    const modal = document.getElementById(modalId);
    const modalInstance = bootstrap.Modal.getInstance(modal);
    if (modalInstance) {
      modalInstance.hide();
    }
  };

  // Fermer le pop-up
  const closePopup = () => {
    setShowPopup(false);
  };

  // Filtrer les services en fonction du terme de recherche
  const filteredServices = services.filter(service =>
    Object.values(service).some(value =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <>
      <div className="page-wrapper page-settings">
        <div className="content">
          <div className="content-page-header content-page-headersplit">
            <h5>All Parkings</h5>
            <div className="list-btn">
              <ul>
                <li>
                  <div className="filter-sorting">
                    <ul>
                      <li>
                        <input
                          type="text"
                          placeholder="Search..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </li>
                      <li>
                        <Link to="#" className="filter-sets">
                          <Icon.Filter className="react-feather-custom me-2" />
                          Filter
                        </Link>
                      </li>
                      <li>
                        <span>
                          <ImageWithBasePath
                            src="assets/admin/img/icons/sort.svg"
                            className="me-2"
                            alt="img"
                          />
                        </span>
                        <Dropdown
                          value={selectedValue}
                          onChange={(e) => setSelectedValue(e.value)}
                          options={[{ name: "A - Z" }, { name: "Z - A" }]}
                          optionLabel="name"
                          placeholder="A - Z"
                          className="select admin-select-breadcrumb"
                        />
                      </li>
                    </ul>
                  </div>
                </li>
                <li>
                  <Link
                    className="btn btn-primary"
                    to="#"
                    data-bs-toggle="modal"
                    data-bs-target="#create-item"
                  >
                    <i className="fa fa-plus me-2" />
                    Create Services
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="row">
            <div className="col-12">
              <div className="table-responsive table-div">
                {loading ? (
                  <p>Loading data...</p>
                ) : (
                  <DataTable value={filteredServices} paginator rows={5} rowsPerPageOptions={[5, 10, 25, 50]}>
                    <Column field="nom" header="Name" sortable />
                    <Column field="adresse" header="Address" sortable />
                    <Column field="nbr_place" header="Places" sortable />
                    <Column field="tarif_horaire" header="Hourly rate" sortable />
                    <Column field="disponibilite" header="Availability" sortable />
                    <Column field="latitude" header="Latitude" sortable />
                    <Column field="longitude" header="Longitude" sortable />
                    <Column
                      header="Actions"
                      body={(rowData) => (
                        <div className="action-language">
                          <Link
                            className="table-edit"
                            to="#"
                            data-bs-toggle="modal"
                            data-bs-target="#update-item"
                            onClick={() => setParkingToUpdate(rowData)}
                          >
                            <i className="fa-solid fa-pen-to-square"></i>
                            <span>Edit</span>
                          </Link>
                          <Link
                            className="table-delete"
                            to="#"
                            data-bs-toggle="modal"
                            data-bs-target="#delete-item"
                            onClick={() => setParkingToDelete(rowData)}
                          >
                            <i className="fa-solid fa-trash-can"></i>
                            <span>Delete</span>
                          </Link>
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

      {/* Pop-up personnalisé */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <p>{popupMessage}</p>
            <button onClick={closePopup}>Close</button>
          </div>
        </div>
      )}

      {/* Modal de suppression */}
      <div className="modal fade" id="delete-item" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <button type="button" className="delete-popup" data-bs-dismiss="modal" aria-label="Close">
              <i className="fa-regular fa-rectangle-xmark" />
            </button>
            <div className="del-modal">
              <h5>Do you really want to delete this parking?</h5>
              <p>{parkingToDelete?.nom || "Parking Service"}</p>
            </div>
            <div className="delete-footer">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                Cancel
              </button>
              <button type="button" className="btn modal-delete" data-bs-dismiss="modal" onClick={deleteParking}>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de mise à jour */}
      <div className="modal fade" id="update-item" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content rounded-3 shadow-lg">
            <button type="button" className="delete-popup" data-bs-dismiss="modal" aria-label="Close">
              <i 
                className="fa-regular fa-rectangle-xmark" 
                style={{ color: '#dc3545', fontSize: '1.5rem', transition: 'color 0.3s ease' }} 
              />
            </button>
            <div className="del-modal p-4">
              <h5 className="text-center mb-4 text-primary">Update Parking</h5>
              <form onSubmit={updateParking}>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label className="form-label" htmlFor="nom">Name</label>
                      <input
                        id="nom"
                        type="text"
                        name="nom"
                        value={parkingToUpdate?.nom || ""}
                        onChange={handleUpdateChange}
                        className={`form-control ${errors.nom ? "is-invalid" : ""}`}
                        required
                      />
                      {errors.nom && <div className="invalid-feedback">{errors.nom}</div>}
                    </div>
                    <div className="form-group mb-3">
                      <label className="form-label" htmlFor="adresse">Address</label>
                      <input
                        id="adresse"
                        type="text"
                        name="adresse"
                        value={parkingToUpdate?.adresse || ""}
                        onChange={handleUpdateChange}
                        className={`form-control ${errors.adresse ? "is-invalid" : ""}`}
                        required
                      />
                      {errors.adresse && <div className="invalid-feedback">{errors.adresse}</div>}
                    </div>
                    <div className="form-group mb-3">
                      <label className="form-label" htmlFor="nbr_place">Places</label>
                      <input
                        id="nbr_place"
                        type="number"
                        name="nbr_place"
                        value={parkingToUpdate?.nbr_place || ""}
                        onChange={handleUpdateChange}
                        className={`form-control ${errors.nbr_place ? "is-invalid" : ""}`}
                        required
                      />
                      {errors.nbr_place && <div className="invalid-feedback">{errors.nbr_place}</div>}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label className="form-label" htmlFor="tarif_horaire">Hourly rate</label>
                      <input
                        id="tarif_horaire"
                        type="number"
                        name="tarif_horaire"
                        value={parkingToUpdate?.tarif_horaire || ""}
                        onChange={handleUpdateChange}
                        className={`form-control ${errors.tarif_horaire ? "is-invalid" : ""}`}
                        required
                      />
                      {errors.tarif_horaire && <div className="invalid-feedback">{errors.tarif_horaire}</div>}
                    </div>
                    <div className="form-group mb-3">
                      <label className="form-label" htmlFor="disponibilite">Availability</label>
                      <select
                        id="disponibilite"
                        name="disponibilite"
                        value={parkingToUpdate?.disponibilite || true}
                        onChange={handleUpdateChange}
                        className="form-select"
                      >
                        <option value={true}>Disponible</option>
                        <option value={false}>Non disponible</option>
                      </select>
                    </div>
                    <div className="form-group mb-3">
                      <label className="form-label" htmlFor="latitude">Latitude</label>
                      <input
                        id="latitude"
                        type="number"
                        name="latitude"
                        value={parkingToUpdate?.latitude || ""}
                        onChange={handleUpdateChange}
                        className={`form-control ${errors.latitude ? "is-invalid" : ""}`}
                        required
                      />
                      {errors.latitude && <div className="invalid-feedback">{errors.latitude}</div>}
                    </div>
                    <div className="form-group mb-3">
                      <label className="form-label" htmlFor="longitude">Longitude</label>
                      <input
                        id="longitude"
                        type="number"
                        name="longitude"
                        value={parkingToUpdate?.longitude || ""}
                        onChange={handleUpdateChange}
                        className={`form-control ${errors.longitude ? "is-invalid" : ""}`}
                        required
                      />
                      {errors.longitude && <div className="invalid-feedback">{errors.longitude}</div>}
                    </div>
                  </div>
                </div>
                <div className="d-flex justify-content-between">
                  <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de création */}
      <div className="modal fade" id="create-item" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content rounded-3 shadow-lg">
            <button type="button" className="delete-popup" data-bs-dismiss="modal" aria-label="Close">
              <i 
                className="fa-regular fa-rectangle-xmark" 
                style={{ color: '#dc3545', fontSize: '1.5rem', transition: 'color 0.3s ease' }} 
              />
            </button>
            <div className="del-modal p-4">
              <h5 className="text-center mb-4 text-primary">Create Parking</h5>
              <form onSubmit={addParking}>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label className="form-label" htmlFor="nom">Name</label>
                      <input
                        id="nom"
                        type="text"
                        name="nom"
                        value={newParking.nom}
                        onChange={handleCreateChange}
                        className={`form-control ${errors.nom ? "is-invalid" : ""}`}
                        required
                      />
                      {errors.nom && <div className="invalid-feedback">{errors.nom}</div>}
                    </div>
                    <div className="form-group mb-3">
                      <label className="form-label" htmlFor="adresse">Address</label>
                      <input
                        id="adresse"
                        type="text"
                        name="adresse"
                        value={newParking.adresse}
                        onChange={handleCreateChange}
                        className={`form-control ${errors.adresse ? "is-invalid" : ""}`}
                        required
                      />
                      {errors.adresse && <div className="invalid-feedback">{errors.adresse}</div>}
                    </div>
                    <div className="form-group mb-3">
                      <label className="form-label" htmlFor="nbr_place">Places</label>
                      <input
                        id="nbr_place"
                        type="number"
                        name="nbr_place"
                        value={newParking.nbr_place}
                        onChange={handleCreateChange}
                        className={`form-control ${errors.nbr_place ? "is-invalid" : ""}`}
                        required
                      />
                      {errors.nbr_place && <div className="invalid-feedback">{errors.nbr_place}</div>}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group mb-3">
                      <label className="form-label" htmlFor="tarif_horaire">Hourly rate</label>
                      <input
                        id="tarif_horaire"
                        type="number"
                        name="tarif_horaire"
                        value={newParking.tarif_horaire}
                        onChange={handleCreateChange}
                        className={`form-control ${errors.tarif_horaire ? "is-invalid" : ""}`}
                        required
                      />
                      {errors.tarif_horaire && <div className="invalid-feedback">{errors.tarif_horaire}</div>}
                    </div>
                    <div className="form-group mb-3">
                      <label className="form-label" htmlFor="disponibilite">Availability</label>
                      <select
                        id="disponibilite"
                        name="disponibilite"
                        value={newParking.disponibilite}
                        onChange={handleCreateChange}
                        className="form-select"
                      >
                        <option value={true}>Disponible</option>
                        <option value={false}>Non disponible</option>
                      </select>
                    </div>
                    <div className="form-group mb-3">
                      <label className="form-label" htmlFor="latitude">Latitude</label>
                      <input
                        id="latitude"
                        type="number"
                        name="latitude"
                        value={newParking.latitude}
                        onChange={handleCreateChange}
                        className={`form-control ${errors.latitude ? "is-invalid" : ""}`}
                        required
                      />
                      {errors.latitude && <div className="invalid-feedback">{errors.latitude}</div>}
                    </div>
                    <div className="form-group mb-3">
                      <label className="form-label" htmlFor="longitude">Longitude</label>
                      <input
                        id="longitude"
                        type="number"
                        name="longitude"
                        value={newParking.longitude}
                        onChange={handleCreateChange}
                        className={`form-control ${errors.longitude ? "is-invalid" : ""}`}
                        required
                      />
                      {errors.longitude && <div className="invalid-feedback">{errors.longitude}</div>}
                    </div>
                  </div>
                </div>
                <div className="d-flex justify-content-between">
                  <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create
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