import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Modal } from 'react-bootstrap';
import { all_routes } from '../../../../core/data/routes/all_routes';
import BreadCrumb from '../../common/breadcrumb/breadCrumb';
import { jwtDecode } from 'jwt-decode'; // Import correct de jwt-decode
const routes = all_routes;

const CreateVehicule = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const [marque, setMarque] = useState('');
  const [modele, setModele] = useState('');
  const [couleur, setCouleur] = useState('');
  const [immatriculation, setImmatriculation] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // État pour les messages d'erreur
  const [errors, setErrors] = useState({
    marque: '',
    modele: '',
    couleur: '',
    immatriculation: '',
  });

  // Récupérer l'ID de l'utilisateur depuis le token JWT
  const token = localStorage.getItem('token');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      const decoded = jwtDecode<{ id: string }>(token); // Décoder le token JWT
      setUserId(decoded.id); // Récupérer l'ID de l'utilisateur
    }
  }, [token]);

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      fetchVehiculeDetails(id);
    }
  }, [id]);

  const fetchVehiculeDetails = async (vehiculeId: string) => {
    try {
      const response = await fetch(`http://localhost:4000/api/vehicules/${vehiculeId}`);
      if (!response.ok) {
        throw new Error('Error fetching vehicle details');
      }
      const data = await response.json();
      setMarque(data.marque);
      setModele(data.modele);
      setCouleur(data.couleur);
      setImmatriculation(data.immatriculation);
    } catch (error) {
      console.error(error);
    }
  };

  // Fonction pour valider les champs
  const validateFields = () => {
    const newErrors = {
      marque: '',
      modele: '',
      couleur: '',
      immatriculation: '',
    };

    let isValid = true;

    if (!marque.trim()) {
      newErrors.marque = 'Brand is required.';
      isValid = false;
    }

    if (!modele.trim()) {
      newErrors.modele = 'Model is required.';
      isValid = false;
    }

    if (!couleur.trim()) {
      newErrors.couleur = 'Color is required.';
      isValid = false;
    }

    if (!immatriculation.trim()) {
      newErrors.immatriculation = 'Registration is required.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Valider les champs avant la soumission
    if (!validateFields()) {
      return; // Arrêter la soumission si des champs sont vides
    }

    const vehiculeData = { marque, modele, couleur, immatriculation };
    console.log("Data to send:", vehiculeData);

    try {
      const url = isEditMode
        ? `http://localhost:4000/api/vehicules/${id}`
        : 'http://localhost:4000/api/vehicules';
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(vehiculeData),
      });

      if (!response.ok) {
        const errorData = await response.json(); // Récupérer les détails de l'erreur
        throw new Error(errorData.message || 'Error saving vehicle');
      }

      setShowModal(true); // Afficher la modal sans redirection automatique
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <BreadCrumb
        title={isEditMode ? 'Edit Vehicle' : 'Add Vehicle'}
        item1="Vehicles"
        item2={isEditMode ? 'Edit Vehicle' : 'Add Vehicle'}
      />
      <div className="page-wrapper">
        <div className="content">
          <div className="container">
            <div className="row">
              <div className="col-lg-9">
                <div className="service-inform-fieldset">
                  <fieldset style={{ display: 'block' }}>
                    <h4 className="mb-3">{isEditMode ? 'Edit Vehicle' : 'Add Vehicle'}</h4>
                    <form onSubmit={handleSubmit}>
                      <div className="card">
                        <div className="card-body">
                          <div className="row">
                            <div className="col-md-6">
                              <div className="mb-3">
                                <label className="form-label">
                                  Brand <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className={`form-control ${errors.marque ? 'is-invalid' : ''}`}
                                  value={marque}
                                  onChange={(e) => setMarque(e.target.value)}
                                />
                                {errors.marque && (
                                  <div className="invalid-feedback">{errors.marque}</div>
                                )}
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="mb-3">
                                <label className="form-label">
                                  Model <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className={`form-control ${errors.modele ? 'is-invalid' : ''}`}
                                  value={modele}
                                  onChange={(e) => setModele(e.target.value)}
                                />
                                {errors.modele && (
                                  <div className="invalid-feedback">{errors.modele}</div>
                                )}
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="mb-3">
                                <label className="form-label">
                                  Color <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className={`form-control ${errors.couleur ? 'is-invalid' : ''}`}
                                  value={couleur}
                                  onChange={(e) => setCouleur(e.target.value)}
                                />
                                {errors.couleur && (
                                  <div className="invalid-feedback">{errors.couleur}</div>
                                )}
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="mb-3">
                                <label className="form-label">
                                  Registration <span className="text-danger">*</span>
                                </label>
                                <input
                                  type="text"
                                  className={`form-control ${errors.immatriculation ? 'is-invalid' : ''}`}
                                  value={immatriculation}
                                  onChange={(e) => setImmatriculation(e.target.value)}
                                />
                                {errors.immatriculation && (
                                  <div className="invalid-feedback">{errors.immatriculation}</div>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-end">
                            <button type="submit" className="btn btn-dark">
                              {isEditMode ? 'Update Vehicle' : 'Add Vehicle'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </form>
                  </fieldset>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Modal
        centered
        show={showModal}
        onHide={() => setShowModal(false)}
        backdrop="static"
        keyboard={false}
      >
        <div className="modal-body">
          <div className="text-center py-4">
            <span className="success-check mb-3 mx-auto">
              <i className="ti ti-check" />
            </span>
            <h4 className="mb-2">Vehicle {isEditMode ? 'Updated' : 'Added'} Successfully</h4>
            <p>The vehicle has been {isEditMode ? 'updated' : 'added'} to your list.</p>
            <div className="d-flex align-items-center justify-content-center mt-3">
              <button className="btn btn-light me-3" onClick={() => setShowModal(false)}>
                Close
              </button>
              <Link to={routes.providerServices} className="btn btn-linear-primary">
                View List
              </Link>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default CreateVehicule;