import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Modal } from 'react-bootstrap';
import { all_routes } from '../../../../core/data/routes/all_routes';
import BreadCrumb from '../../common/breadcrumb/breadCrumb';
import { jwtDecode } from 'jwt-decode'; // Import correct de jwt-decode
import ImageWithBasePath from '../../../../core/img/ImageWithBasePath';

import { Dropdown } from 'primereact/dropdown';

const routes = all_routes;


const CreateClaim = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const [claimType, setclaimType] = useState('');
  const [message, setMessage] = useState('');
  const [parkingId, setParkingId] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [parkings, setParkings] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [errors, setErrors] = useState({
    message: '',
    claimType: '',
    parkingId: '',
  });

  const token = localStorage.getItem('token');
  const [userId, setUserId] = useState('');
  const claimTypes = [
    'Spot Occupied',
    'Wrong Parking',
    'Security',
    'Other',
  ];

  useEffect(() => {
    if (token) {
      const decoded = jwtDecode<{ id: string }>(token);
      setUserId(decoded.id);
    }
  }, [token]);

  useEffect(() => {
    fetchParkings();
  }, []);

  useEffect(() => {
    if (id) {
      setIsEditMode(true);
      fetchClaimDetails(id);
    }
  }, [id]);

  const fetchParkings = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/parking`);
      if (!response.ok) throw new Error('Failed to fetch parkings');
      const data = await response.json();
      setParkings(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchClaimDetails = async (claimId: string) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/claims/${claimId}`);
      if (!response.ok) throw new Error('Error fetching claim details');
      const data = await response.json();
      setclaimType(data.claimType);
      setMessage(data.message);
      setParkingId(data.parkingId?._id || '');
    } catch (error) {
      console.error(error);
    }
  };

  const validateFields = () => {
    const newErrors = {
        message: '',
      claimType: '',
      parkingId: '',
    };
    let isValid = true;

    if (!claimType.trim()) {
      newErrors.claimType = 'Type of Claim is required.';
      isValid = false;
    }
    
    if (!parkingId.trim()) {
      newErrors.parkingId = 'Parking selection is required.';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateFields()) return;

    const claimData = new FormData();
    if (image) {
      claimData.append('image', image); // Append the selected image
    }    claimData.append('message', message);
    claimData.append('claimType', claimType);
    claimData.append('userId', userId); // Replace with actual userId
    claimData.append('parkingId', parkingId); // Replace with actual parkingId
      console.log("testestestestestestestestes");
claimData.forEach((value, key) => {
  console.log(key, value);
});
    try {
      const url = isEditMode
        ? `${process.env.REACT_APP_API_BASE_URL}/claims/${id}`
        : `${process.env.REACT_APP_API_BASE_URL}/claims`;
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: claimData,
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error saving claim');
      }

      setShowModal(true);
    } catch (error) {
      console.error(error);
    }
  };
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

 return (
  <>
    <BreadCrumb title="Submit a Claim" item1="Service" item2="Submit a Claim" />
    <div className="page-wrapper">
      <div className="content">
        <div className="container">
          <div className="fieldset-wizard request-wizard">
                      <div className="row">
            <form onSubmit={handleSubmit}>
              <fieldset style={{ display: 'flex' }}>
                <div className="card flex-fill mb-0">
                  <div className="card-body">
                    <h5 className="mb-3">Report an issue</h5>

                    {/* Image Upload */}
                    <div className="mb-3">
                      <label className="form-label d-block">Please add Pictures or Videos</label>
                      <div className="d-flex align-items-center justify-content-center upload-field flex-column">
                        <span className="d-block text-center mb-2">
                            <ImageWithBasePath
                              src="assets/img/icons/icon-upload.svg"
                              alt=""
                            />
                          </span>
                          <p className="fs-14 text-center mb-2">
                            Drag and drop your files here to upload{" "}
                            <span className="d-block mt-2">Or</span>
                          </p>
                        {imagePreview && <img src={imagePreview} alt="Preview" style={{ width: 200 }} />}
                        <div className="file-upload btn btn-linear-primary h-auto mb-2">
                          Browse Files
                          <input
                            type="file"
                            accept="image/*,video/*"
                            onChange={handleImageChange}
                          />
                        </div>
                        <p className="text-center fs-14">
                          Only .jpg .png file types allowed and file <br />
                          size must be less than 100 MB
                        </p>
                      </div>
                    </div>

                      <div className="col-md-12">
                            <div className="mb-4 border-top pt-4">
                              <div className="position-relative">
                                <label className="fs-12 select-floating-label">
                                  Claim Type{" "}
                                  <span className="text-danger">*</span>
                                </label>
                               
                                <Dropdown
                                    value={claimType}
                                onChange={(e) => setclaimType(e.value)}  // Update claimType on change
                                options={claimTypes}  // Dropdown options
                                    placeholder="Select"
                                    className="w-100 select"
                                    />
                              </div>
                            </div>
                          </div>
                    
<div className="col-md-12">
                            <div className="mb-4 border-top pt-4">
                              <div className="position-relative">
                                <label className="fs-12 select-floating-label">
                                  Parking Lot{" "}
                                  <span className="text-danger">*</span>
                                </label>
                               
                                <Dropdown
                                    value={parkingId}
      options={parkings.map((p: any) => ({
        label: p.name || p.address || `Parking ${p.nom}`,
        value: p._id,
      }))}
      onChange={(e) => setParkingId(e.value)}
                                    placeholder="Select"
                                    className="w-100 select"
                                    />
                              </div>
                            </div>
                          </div>

                    

                    {/* Message */}
                    <div className="mb-3">
                      <label className="form-label">Additional Notes/Special Requirements</label>
                      <textarea
                        rows={3}
                        className="form-control"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                      />
                    </div>

                    {/* Submit Button */}
                    <button type="submit" className="file-upload btn btn-linear-primary h-auto mb-2">
                      {isEditMode ? 'Update Claim' : 'Submit Claim'}
                    </button>
                  </div>
                </div>
              </fieldset>
            </form>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Modal */}
    <Modal show={showModal} onHide={() => setShowModal(false)} centered>
      <Modal.Header closeButton>
        <Modal.Title>Success</Modal.Title>
      </Modal.Header>
      <Modal.Body>Your claim has been {isEditMode ? 'updated' : 'submitted'} successfully.</Modal.Body>
      <Modal.Footer>
        <button className="btn btn-secondary" onClick={() => navigate(routes.providerClaims)}>
          Go to Claims
        </button>
      </Modal.Footer>
    </Modal>
  </>
);
};

export default CreateClaim;
