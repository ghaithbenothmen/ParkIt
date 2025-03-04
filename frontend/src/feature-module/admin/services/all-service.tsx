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

  const deleteParking = async () => {
    if (!parkingToDelete) return;
    try {
      await axios.delete(`http://localhost:4000/api/parking/${parkingToDelete._id}`);
      setServices(services.filter(service => service._id !== parkingToDelete._id));
      setParkingToDelete(null);
      alert("Parking supprimé avec succès !");
    } catch (error) {
      console.error("Erreur lors de la suppression du parking:", error);
      
    }
  };

  const updateParking = async (e) => {
    e.preventDefault();
    if (!parkingToUpdate) return;
    try {
      const response = await axios.put(
        `http://localhost:4000/api/parking/${parkingToUpdate._id}`,
        parkingToUpdate
      );
      setServices(services.map(service => 
        service._id === parkingToUpdate._id ? response.data : service
      ));
      setParkingToUpdate(null);
      alert("Parking mis à jour avec succès !");
      closeModal('update-item');
    } catch (error) {
      console.error("Erreur lors de la mise à jour du parking:", error);
      
    }
  };

  const addParking = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:4000/api/parking",newParking);
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
      alert("Parking ajouté avec succès !");
      closeModal('create-item');
    } catch (error) {
      
     
    }
  };

  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setParkingToUpdate({
      ...parkingToUpdate,
      [name]: value,
    });
  };

  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setNewParking({
      ...newParking,
      [name]: value,
    });
  };

  const closeModal = (modalId) => {
    const modal = document.getElementById(modalId);
    const modalInstance = bootstrap.Modal.getInstance(modal);
    modalInstance.hide();
  };

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
                  <p>Chargement des données...</p>
                ) : (
                  <DataTable value={filteredServices} paginator rows={5} rowsPerPageOptions={[5, 10, 25, 50]}>
                    <Column field="nom" header="Name" sortable />
                    <Column field="adresse" header="Adress" sortable />
                    <Column field="nbr_place" header="Places" sortable />
                    <Column field="tarif_horaire" header="
Hourly rate" sortable />
                    <Column field="disponibilite" header="Disponibilité" sortable />
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
                  className="form-control"
                  required
                />
              </div>
              <div className="form-group mb-3">
                <label className="form-label" htmlFor="adresse">Adress</label>
                <input
                  id="adresse"
                  type="text"
                  name="adresse"
                  value={parkingToUpdate?.adresse || ""}
                  onChange={handleUpdateChange}
                  className="form-control"
                  required
                />
              </div>
              <div className="form-group mb-3">
                <label className="form-label" htmlFor="nbr_place"> places</label>
                <input
                  id="nbr_place"
                  type="number"
                  name="nbr_place"
                  value={parkingToUpdate?.nbr_place || ""}
                  onChange={handleUpdateChange}
                  className="form-control"
                  required
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group mb-3">
                <label className="form-label" htmlFor="tarif_horaire">
                Hourly rate</label>
                <input
                  id="tarif_horaire"
                  type="number"
                  name="tarif_horaire"
                  value={parkingToUpdate?.tarif_horaire || ""}
                  onChange={handleUpdateChange}
                  className="form-control"
                  required
                />
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
                  className="form-control"
                  required
                />
              </div>
              <div className="form-group mb-3">
                <label className="form-label" htmlFor="longitude">Longitude</label>
                <input
                  id="longitude"
                  type="number"
                  name="longitude"
                  value={parkingToUpdate?.longitude || ""}
                  onChange={handleUpdateChange}
                  className="form-control"
                  required
                />
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
                  className="form-control"
                  required
                />
              </div>
              <div className="form-group mb-3">
                <label className="form-label" htmlFor="adresse">Adress</label>
                <input
                  id="adresse"
                  type="text"
                  name="adresse"
                  value={newParking.adresse}
                  onChange={handleCreateChange}
                  className="form-control"
                  required
                />
              </div>
              <div className="form-group mb-3">
                <label className="form-label" htmlFor="nbr_place"> places</label>
                <input
                  id="nbr_place"
                  type="number"
                  name="nbr_place"
                  value={newParking.nbr_place}
                  onChange={handleCreateChange}
                  className="form-control"
                  required
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group mb-3">
                <label className="form-label" htmlFor="tarif_horaire">
                Hourly rate</label>
                <input
                  id="tarif_horaire"
                  type="number"
                  name="tarif_horaire"
                  value={newParking.tarif_horaire}
                  onChange={handleCreateChange}
                  className="form-control"
                  required
                />
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
                  className="form-control"
                  required
                />
              </div>
              <div className="form-group mb-3">
                <label className="form-label" htmlFor="longitude">Longitude</label>
                <input
                  id="longitude"
                  type="number"
                  name="longitude"
                  value={newParking.longitude}
                  onChange={handleCreateChange}
                  className="form-control"
                  required
                />
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