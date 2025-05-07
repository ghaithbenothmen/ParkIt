import React, { useState, useEffect } from 'react';
import ImageWithBasePath from '../../../../core/img/ImageWithBasePath';
import { Link } from 'react-router-dom';
import { all_routes } from '../../../../core/data/routes/all_routes';
import { jwtDecode } from 'jwt-decode';
const routes = all_routes;

const ProviderCars = () => {
  console.log("ProvidersCars component rendered");
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null); // Selected vehicle for editing
  const [showEditModal, setShowEditModal] = useState(false); // Controls the display of the edit pop-up
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Controls the display of the delete confirmation pop-up
  const [showSuccessModal, setShowSuccessModal] = useState(false); // Controls the display of the success pop-up
  const [vehicleToDelete, setVehicleToDelete] = useState(null); // Vehicle to be deleted
  const [expandedImage, setExpandedImage] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    marque: '',
    modele: '',
    couleur: '',
    immatriculation: ''
  });
  const [errors, setErrors] = useState({
    marque: '',
    modele: '',
    couleur: '',
    immatriculation: ''
  });

  const [leftNumbers, setLeftNumbers] = useState('');
  const [rightNumbers, setRightNumbers] = useState('');

  const fetchVehicles = async () => {
    try {
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

      // Ajouter l'URL de l'image pour chaque véhicule
      const vehiclesWithImages = await Promise.all(
        data.vehicules.map(async (vehicle) => {
          const imageUrl = await fetchCarImage(vehicle.marque, vehicle.modele);
          return { ...vehicle, imageUrl };
        })
      );

      setVehicles(vehiclesWithImages); // Mettre à jour l'état des véhicules avec les images
    } catch (error) {
      console.error(error);
    }
  };

  const fetchCarImage = async (marque, modele) => {
    try {
      const apiKey = process.env.REACT_APP_PEXELS_API_KEY; // Clé API Pexels
      const query = `${marque} ${modele} car`; // Recherche par marque et modèle
      const response = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`,
        {
          headers: {
            Authorization: apiKey, // Utiliser la clé API Pexels
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération de l\'image');
      }

      const data = await response.json();
      if (data.photos.length > 0) {
        return data.photos[0].src.medium; // Retourne l'URL de la première image trouvée
      } else {
        return 'https://via.placeholder.com/300'; // Image par défaut si aucune image n'est trouvée
      }
    } catch (error) {
      console.error(error);
      return 'https://via.placeholder.com/300'; // Image par défaut en cas d'erreur
    }
  };

  // Function to handle delete confirmation
  const handleDeleteConfirmation = (vehicleId) => {
    setVehicleToDelete(vehicleId); // Set the vehicle to delete
    setShowDeleteModal(true); // Show the delete confirmation pop-up
  };

  // Function to delete a vehicle
  const handleDeleteVehicle = async () => {
    try {
      const response = await fetch(`http://localhost:4000/api/vehicules/${vehicleToDelete}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Error deleting vehicle');
      }
      // Update local state by filtering out the deleted vehicle
      setVehicles(vehicles.filter((vehicle) => vehicle._id !== vehicleToDelete));

      // Close the delete confirmation pop-up
      setShowDeleteModal(false);

      // Show the success pop-up
      setShowSuccessModal(true);

      // Hide the success pop-up after 2 seconds
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 2000);
    } catch (error) {
      console.error(error);
    }
  };

  // Function to open the edit pop-up
  const handleEditClick = (vehicle) => {
    setSelectedVehicle(vehicle); // Set the selected vehicle
    setShowEditModal(true); // Open the edit pop-up
  };

  // Function to close the edit pop-up
  const handleCloseModal = () => {
    setShowEditModal(false);
    setSelectedVehicle(null);
  };

  // Function to submit edits
  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:4000/api/vehicules/${selectedVehicle._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedVehicle),
      });
      if (!response.ok) {
        throw new Error('Error updating vehicle');
      }

      // Close the edit pop-up
      handleCloseModal();

      // Refresh the data
      fetchVehicles();
    } catch (error) {
      console.error(error);
    }
  };

  // Ajouter cette fonction pour gérer le clic sur l'image
  const handleImageClick = (imageUrl) => {
    setExpandedImage(imageUrl);
  };

  // Ajouter cette fonction pour fermer l'image agrandie
  const handleCloseImage = () => {
    setExpandedImage(null);
  };

  // Ajouter ces fonctions de validation
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      marque: '',
      modele: '',
      couleur: '',
      immatriculation: ''
    };

    // Validation de la marque
    if (!newVehicle.marque.trim()) {
      newErrors.marque = 'Brand is required';
      isValid = false;
    } else if (newVehicle.marque.length < 2) {
      newErrors.marque = 'Brand must be at least 2 characters';
      isValid = false;
    }

    // Validation du modèle
    if (!newVehicle.modele.trim()) {
      newErrors.modele = 'Model is required';
      isValid = false;
    } else if (newVehicle.modele.length < 2) {
      newErrors.modele = 'Model must be at least 2 characters';
      isValid = false;
    }

    // Validation de la couleur
    if (!newVehicle.couleur.trim()) {
      newErrors.couleur = 'Color is required';
      isValid = false;
    } else if (!/^[a-zA-Z]+$/.test(newVehicle.couleur)) {
      newErrors.couleur = 'Color must contain only letters';
      isValid = false;
    }

    // Validation de l'immatriculation
    if (!leftNumbers || !rightNumbers) {
      newErrors.immatriculation = 'Both number fields are required';
      isValid = false;
    } else if (!/^\d{1,3}$/.test(leftNumbers)) {
      newErrors.immatriculation = 'Left side must be 1-3 digits';
      isValid = false;
    } else if (!/^\d{1,4}$/.test(rightNumbers)) {
      newErrors.immatriculation = 'Right side must be 1-4 digits';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Créer l'immatriculation complète
    const fullImmatriculation = `${leftNumbers} Tunisia ${rightNumbers}`;
    
    // Validation du format
    const immatriculationRegex = /^\d{1,3} Tunisia \d{1,4}$/;
    if (!immatriculationRegex.test(fullImmatriculation)) {
      setErrors({
        ...errors,
        immatriculation: 'Invalid format. Left side should be 1-3 digits, right side should be 1-4 digits'
      });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const vehicleData = {
        ...newVehicle,
        immatriculation: fullImmatriculation
      };

      const response = await fetch('http://localhost:4000/api/vehicules', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(vehicleData)
      });

      if (!response.ok) {
        const data = await response.json();
        if (data.errors) {
          setErrors(data.errors);
        }
        throw new Error('Error adding vehicle');
      }

      // Rafraîchir la liste des véhicules
      fetchVehicles();
      
      // Réinitialiser le formulaire et fermer la modal
      setNewVehicle({
        marque: '',
        modele: '',
        couleur: '',
        immatriculation: ''
      });
      setLeftNumbers('');
      setRightNumbers('');
      setShowAddModal(false);
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 2000);
    } catch (error) {
      console.error(error);
    }
  };

  // Fetch vehicles on component mount
  useEffect(() => {
    fetchVehicles();
  }, []);

  return (
    <>
      {/* Page Wrapper */}
      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="row">
            <div className="d-flex justify-content-between align-items-center flex-wrap mb-4">
              <h5>My Cars</h5>
              <div className="d-flex align-items-center">
                <button
                  className="btn btn-dark d-flex align-items-center"
                  onClick={() => setShowAddModal(true)}
                >
                  <i className="ti ti-circle-plus me-2" />
                  Add Cars
                </button>
              </div>
            </div>
          </div>
          <div className="row justify-content-center">
            <div className="col-xl-12 col-lg-12">
              <div className="tab-content pt-0">
                <div
                  className="tab-pane active"
                  id="active-service"
                  role="tabpanel"
                  aria-labelledby="active-service"
                >
                  <div className="row justify-content-center align-items-center">
                    {vehicles.length === 0 ? (
                      <div className="col-12 text-center">
                        <p>No vehicles found.</p>
                      </div>
                    ) : (
                      vehicles.map((vehicle) => (
                        <div className="col-xl-4 col-md-6" key={vehicle._id}>
                          <div className="card p-0">
                            <div className="card-body p-0">
                            <div 
                              className="img-sec w-200 image-container" 
                              style={{ 
                                height: '200px', 
                                overflow: 'hidden', 
                                cursor: 'pointer' 
                              }}
                              onClick={() => handleImageClick(vehicle.imageUrl)}
                            >
                              <img
                                src={vehicle.imageUrl}
                                className="img-fluid rounded-top"
                                alt={`${vehicle.marque} ${vehicle.modele}`}
                                style={{ 
                                  height: '100%', 
                                  width: '100%',
                                  objectFit: 'cover'
                                }}
                              />
                            </div>
                              <div className="p-3">
                                <h5 className="mb-2 text-truncate">
                                  <Link to={routes.serviceDetails1}>
                                    {vehicle.marque} {vehicle.modele}
                                  </Link>
                                </h5>
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                  <p className="fs-14 mb-0">
                                    <i className="ti ti-map-pin me-2" />
                                    {vehicle.couleur}
                                  </p>
                                </div>
                                <div className="d-flex justify-content-between align-items-center">
                                  <div className="d-flex gap-2">
                                    <button
                                      onClick={() => handleEditClick(vehicle)}
                                      className="action-button action-button-edit"
                                    >
                                      <i className="fa fa-edit"></i>
                                      <span>Edit</span>
                                    </button>
                                    <button
                                      onClick={() => handleDeleteConfirmation(vehicle._id)}
                                      className="action-button action-button-delete"
                                    >
                                      <i className="fa fa-trash"></i>
                                      <span>Delete</span>
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {expandedImage && (
        <div 
          className="modal fade show" 
          style={{ 
            display: 'block', 
            backgroundColor: 'rgba(0,0,0,0.8)' 
          }}
          onClick={handleCloseImage}
        >
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content bg-transparent border-0">
              <img
                src={expandedImage}
                alt="Expanded car"
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '80vh',
                  objectFit: 'contain'
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Add Vehicle Modal */}
      {showAddModal && (
        <>
          {/* Add modal backdrop with blur effect */}
          <div className="modal-backdrop fade show" style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(5px)',
            WebkitBackdropFilter: 'blur(5px)'
          }}></div>
          
          <div className="modal fade show" style={{ display: 'block' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Add New Vehicle</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowAddModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <form onSubmit={handleAddVehicle}>
                    <div className="mb-3">
                      <label htmlFor="marque" className="form-label">Brand</label>
                      <input
                        type="text"
                        className={`form-control ${errors.marque ? 'is-invalid' : ''}`}
                        id="marque"
                        value={newVehicle.marque}
                        onChange={(e) => setNewVehicle({...newVehicle, marque: e.target.value})}
                        required
                      />
                      {errors.marque && (
                        <div className="invalid-feedback d-block">
                          {errors.marque}
                        </div>
                      )}
                    </div>
                    <div className="mb-3">
                      <label htmlFor="modele" className="form-label">Model</label>
                      <input
                        type="text"
                        className={`form-control ${errors.modele ? 'is-invalid' : ''}`}
                        id="modele"
                        value={newVehicle.modele}
                        onChange={(e) => setNewVehicle({...newVehicle, modele: e.target.value})}
                        required
                      />
                      {errors.modele && (
                        <div className="invalid-feedback d-block">
                          {errors.modele}
                        </div>
                      )}
                    </div>
                    <div className="mb-3">
                      <label htmlFor="couleur" className="form-label">Color</label>
                      <input
                        type="text"
                        className={`form-control ${errors.couleur ? 'is-invalid' : ''}`}
                        id="couleur"
                        value={newVehicle.couleur}
                        onChange={(e) => setNewVehicle({...newVehicle, couleur: e.target.value})}
                        required
                      />
                      {errors.couleur && (
                        <div className="invalid-feedback d-block">
                          {errors.couleur}
                        </div>
                      )}
                    </div>
                    <div className="mb-3">
                      <label htmlFor="immatriculation" className="form-label">Registration</label>
                      <div className="input-group">
                        <input
                          type="number"
                          className="form-control"
                          placeholder="123"
                          value={leftNumbers}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value.length <= 3 && /^\d*$/.test(value)) {
                              setLeftNumbers(value);
                            }
                          }}
                          min="1"
                          max="999"
                        />
                        <span className="input-group-text"> Tunisia </span>
                        <input
                          type="number"
                          className="form-control"
                          placeholder="1234"
                          value={rightNumbers}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value.length <= 4 && /^\d*$/.test(value)) {
                              setRightNumbers(value);
                            }
                          }}
                          min="1"
                          max="9999"
                        />
                      </div>
                      {errors.immatriculation && (
                        <div className="invalid-feedback d-block">
                          {errors.immatriculation}
                        </div>
                      )}
                    </div>
                    <div className="modal-footer">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => setShowAddModal(false)}
                      >
                        Cancel
                      </button>
                      <button type="submit" className="btn btn-primary">
                        Add Vehicle
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Edit pop-up */}
      {showEditModal && selectedVehicle && (
        <div className="modal fade show" style={{ display: 'block' }}>
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
                      Save
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation pop-up */}
      {showDeleteModal && (
        <div className="modal fade show" style={{ display: 'block' }}>
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
                <p>Are you sure you want to delete this car?</p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteModal(false)}
                >
                  No
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDeleteVehicle}
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success pop-up */}
      {showSuccessModal && (
        <div className="modal fade show" style={{ display: 'block' }}>
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
                <p>Operation completed successfully.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProviderCars;