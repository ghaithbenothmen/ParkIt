import React, { useState, useEffect } from 'react';
import ImageWithBasePath from '../../../../core/img/ImageWithBasePath';
import { Link } from 'react-router-dom';
import { all_routes } from '../../../../core/data/routes/all_routes';
import { jwtDecode } from 'jwt-decode';
const routes = all_routes;

const ProviderCars = () => {
  console.log("ProvidersCars component rendered");
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Filter vehicles based on search term
  const filteredVehicles = vehicles.filter(vehicle => {
    const searchLower = searchTerm.toLowerCase();
    return (
      vehicle.marque.toLowerCase().includes(searchLower) ||
      vehicle.modele.toLowerCase().includes(searchLower)
    );
  });

  const fetchVehicles = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Utilisateur non connecté');
      }

      const decoded = jwtDecode(token);
      const userId = decoded.id;

      const response = await fetch(`http://localhost:4000/api/vehicules/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des véhicules');
      }

      const data = await response.json();

      const vehiclesWithImages = await Promise.all(
        data.vehicules.map(async (vehicle) => {
          const imageUrl = await fetchCarImage(vehicle.marque, vehicle.modele);
          return { ...vehicle, imageUrl };
        })
      );

      setVehicles(vehiclesWithImages);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCarImage = async (marque, modele) => {
    try {
      const apiKey = process.env.REACT_APP_PEXELS_API_KEY;
      const query = `${marque} ${modele} car`;
      const response = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`,
        {
          headers: {
            Authorization: apiKey,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération de l\'image');
      }

      const data = await response.json();
      if (data.photos.length > 0) {
        return data.photos[0].src.medium;
      } else {
        return 'https://via.placeholder.com/300';
      }
    } catch (error) {
      console.error(error);
      return 'https://via.placeholder.com/300';
    }
  };

  const handleDeleteConfirmation = (vehicleId) => {
    setVehicleToDelete(vehicleId);
    setShowDeleteModal(true);
  };

  const handleDeleteVehicle = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/api/vehicules/${vehicleToDelete}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        throw new Error('Error deleting vehicle');
      }
      setVehicles(vehicles.filter((vehicle) => vehicle._id !== vehicleToDelete));
      setShowDeleteModal(false);
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 2000);
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditClick = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setSelectedVehicle(null);
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:4000/api/vehicules/${selectedVehicle._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(selectedVehicle),
      });
      if (!response.ok) {
        throw new Error('Error updating vehicle');
      }
      handleCloseModal();
      fetchVehicles();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  return (
    <>
      <div className="page-wrapper">
        <div className="content container-fluid">
          {/* Search Bar and Add Car Button */}
          <div className="row">
            <div className="d-flex justify-content-between align-items-center flex-wrap mb-4">
              <h5>My Cars</h5>
              <div className="d-flex align-items-center">
                <div className="me-3">
                  <div className="form-group mb-0">
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Search by brand or model..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <span className="input-group-text">
                        <i className="ti ti-search" />
                      </span>
                    </div>
                  </div>
                </div>
                <Link
                  to={routes.createService}
                  className="btn btn-dark d-flex align-items-center"
                >
                  <i className="ti ti-circle-plus me-2" />
                  Add Cars
                </Link>
              </div>
            </div>
          </div>

          {/* Vehicles List */}
          <div className="row justify-content-center">
            <div className="col-xl-12 col-lg-12">
              <div className="tab-content pt-0">
                <div
                  className="tab-pane active"
                  id="active-service"
                  role="tabpanel"
                  aria-labelledby="active-service"
                >
                  {isLoading ? (
                    <div className="text-center">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : (
                    <div className="row justify-content-center align-items-center">
                      {filteredVehicles.length === 0 ? (
                        <div className="col-12 text-center">
                          <p>{searchTerm ? 'No matching vehicles found' : 'No vehicles found'}</p>
                        </div>
                      ) : (
                        filteredVehicles.map((vehicle) => (
                          <div className="col-xl-4 col-md-6" key={vehicle._id}>
                            <div className="card p-0">
                              <div className="card-body p-0">
                                <div className="img-sec w-200 image-container" style={{ height: '500px', overflow: 'hidden' }}>
                                  <img
                                    src={vehicle.imageUrl}
                                    className="img-fluid rounded-top"
                                    alt={`${vehicle.marque} ${vehicle.modele}`}
                                    style={{ 
                                      height: '600px', 
                                      width: '410px',
                                      objectFit: 'cover',
                                      margin: '0 auto'
                                    }}
                                  />
                                  <div className="image-tag d-flex justify-content-end align-items-center">
                                    <span className="trend-tag">{vehicle.marque}</span>
                                  </div>
                                </div>
                                <div className="p-3">
                                  <h5 className="mb-2 text-truncate">
                                    {vehicle.marque} {vehicle.modele}
                                  </h5>
                                  <div className="d-flex justify-content-between align-items-center mb-3">
                                    <p className="fs-14 mb-0">
                                      <i className="ti ti-map-pin me-2" />
                                      {vehicle.couleur}
                                    </p>
                                  </div>
                                  <div className="d-flex justify-content-between align-items-center">
                                    <div className="d-flex gap-3">
                                      <Link to="#" onClick={() => handleEditClick(vehicle)}>
                                        <i className="ti ti-edit me-2" />
                                        Edit
                                      </Link>
                                    </div>
                                    <Link
                                      to="#"
                                      onClick={() => handleDeleteConfirmation(vehicle._id)}
                                      className="btn btn-danger"
                                    >
                                      <i className="ti ti-trash me-2" />
                                      Delete
                                    </Link>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedVehicle && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Edit Vehicle</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmitEdit}>
                  <div className="mb-3">
                    <label htmlFor="marque" className="form-label">Brand</label>
                    <input
                      type="text"
                      className="form-control"
                      id="marque"
                      value={selectedVehicle.marque}
                      onChange={(e) =>
                        setSelectedVehicle({ ...selectedVehicle, marque: e.target.value })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="modele" className="form-label">Model</label>
                    <input
                      type="text"
                      className="form-control"
                      id="modele"
                      value={selectedVehicle.modele}
                      onChange={(e) =>
                        setSelectedVehicle({ ...selectedVehicle, modele: e.target.value })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="couleur" className="form-label">Color</label>
                    <input
                      type="text"
                      className="form-control"
                      id="couleur"
                      value={selectedVehicle.couleur}
                      onChange={(e) =>
                        setSelectedVehicle({ ...selectedVehicle, couleur: e.target.value })
                      }
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="immatriculation" className="form-label">Registration</label>
                    <input
                      type="text"
                      className="form-control"
                      id="immatriculation"
                      value={selectedVehicle.immatriculation}
                      onChange={(e) =>
                        setSelectedVehicle({ ...selectedVehicle, immatriculation: e.target.value })
                      }
                    />
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCloseModal}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Deletion</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDeleteModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete this car? This action cannot be undone.</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDeleteVehicle}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Success</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowSuccessModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="d-flex align-items-center">
                  <i className="ti ti-circle-check text-success me-2" style={{ fontSize: '1.5rem' }} />
                  <p className="mb-0">Car deleted successfully.</p>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setShowSuccessModal(false)}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProviderCars;