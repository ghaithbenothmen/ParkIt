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
    'Payment Issue',
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
      const response = await fetch('http://localhost:4000/api/parking');
      if (!response.ok) throw new Error('Failed to fetch parkings');
      const data = await response.json();
      setParkings(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchClaimDetails = async (claimId: string) => {
    try {
      const response = await fetch(`http://localhost:4000/api/claims/${claimId}`);
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
        ? `http://localhost:4000/api/claims/${id}`
        : 'http://localhost:4000/api/claims';
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
     <BreadCrumb title='Claim' item1='customers' item2='customer-claim'/>
     <div className="page-wrapper">
      <div className="content">
        <div className="container">
          <div className="contacts">
            <div className="contacts-overlay-img d-none d-lg-block">
              <ImageWithBasePath src="assets/img/bg/bg-07.png" alt="img" className="img-fluid" />
            </div>
            <div className="contacts-overlay-sm d-none d-lg-block">
              <ImageWithBasePath src="assets/img/bg/bg-08.png" alt="img" className="img-fluid" />
            </div>

            {/* Contact Details */}
            <div className="contact-details">
              <div className="row justify-content-center">
                <div className="col-md-6 col-lg-4 d-flex">
                  <div className="card flex-fill">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <span className="rounded-circle">
                          <i className="ti ti-phone text-primary" />
                        </span>
                        <div>
                          <h6 className="fs-18 mb-1">Phone Number</h6>
                          <p className="fs-14">(888) 888-8888</p>
                          <p className="fs-14">(123) 456-7890</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 col-lg-4 d-flex">
                  <div className="card flex-fill">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <span className="rounded-circle">
                          <i className="ti ti-mail text-primary" />
                        </span>
                        <div>
                          <h6 className="fs-18 mb-1">Email Address</h6>
                          <p className="fs-14">truelysell@example.com</p>
                          <p className="fs-14">johnsmith@example.com</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 col-lg-4 d-flex">
                  <div className="card flex-fill">
                    <div className="card-body">
                      <div className="d-flex align-items-center">
                        <span className="rounded-circle">
                          <i className="ti ti-map-pin text-primary" />
                        </span>
                        <div>
                          <h6 className="fs-18 mb-1">Address</h6>
                          <p className="fs-14">
                            367 Hillcrest Lane, Irvine, California, United States
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* /Contact Details */}

            {/* Get In Touch */}
            <div className="row">
              <div className="col-md-6 d-flex align-items-center">
                <div className="contact-img flex-fill">
                                <img
                  src={imagePreview || ''}
                  alt="Image"
                  style={{ maxHeight: '700px', width: 'auto', objectFit: 'contain' }}
                />

                </div>
              </div>
              <div className="col-md-6 d-flex align-items-center justify-content-center">
                <div className="contact-queries flex-fill">
                  <h2>Report an Issue</h2>
                  <form onSubmit={handleSubmit}>
                    <div className="row">
                      <div className="col-md-12">
                        <div className="mb-3">
                          <div className="form-group">
                          <Dropdown
                                value={claimType}
                                onChange={(e) => setclaimType(e.value)}  // Update claimType on change
                                options={claimTypes}  // Dropdown options
                                placeholder="Select Claim Type"
                                className="w-100"  // Full width, if needed, adjust the width here
                              />
                            {errors.claimType && <small className="text-danger">{errors.claimType}</small>}
                          </div>
                        </div>
                      </div>
                      <div className="col-md-12">
                          <div className="mb-3">
                            <div className="form-group">
                              <Dropdown
                                value={parkingId}
                                onChange={(e) => setParkingId(e.value)}
                                options={parkings}
                                optionLabel="nom"
                                optionValue="_id"
                                placeholder="Select Parking"
                                className="w-100" // Full width, if needed, adjust the width here
                              />
                            </div>
                            {errors.parkingId && (
                              <div className="invalid-feedback">{errors.parkingId}</div>
                            )}
                          </div>
                        </div>
                      <div className="col-md-12">
                      <div className="card-body">
          <h6 className="user-title">Proof Picture</h6>
          <div className="pro-picture">
            <div className="pro-info">
              <div className="d-flex mb-2">
                <label
                  htmlFor="image-upload"
                  className="btn btn-dark btn-sm d-flex align-items-center me-3"
                >
                  <i className="ti ti-cloud-upload me-1" />
                  Upload
                </label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleImageChange}
                />
                <button
                  className="btn btn-light btn-sm d-flex align-items-center"
                  onClick={() => {
                    setImage(null);
                    setImagePreview(null);
                  }}
                >
                  Remove
                </button>
              </div>
              <p className="fs-14">
                *image size should be at least 320px big, and less than 500kb. Allowed files .png and .jpg.
              </p>
            </div>
          </div>
        </div>
                        <div className="mb-3">
                          <div className="form-group">
                          <textarea
                                className="form-control"
                                placeholder="Type Message"
                                value={message}  // Bind message state
                                onChange={(e) => setMessage(e.target.value)}  // Update message state
                                id="floatingTextarea"
                              />
                          </div>
                        </div>
                      </div>
                      <div className="col-md-12 submit-btn">
                        <button
                          className="btn btn-dark d-flex align-items-center"
                          type="submit"
                        >
                          Send Message
                          <i className="feather icon-arrow-right-circle ms-2" />
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              </div>
            </div>
            {/* /Get In Touch */}
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
                <h4 className="mb-2"> Report Sent Successfully</h4>
                <p>Your issue has been reported for evaluation.</p>
                <div className="d-flex align-items-center justify-content-center mt-3">
                  <button className="btn btn-light me-3" onClick={() => setShowModal(false)}>
                    Close
                  </button>
                  <Link to={routes.providerClaims} className="btn btn-linear-primary">
                    View List
                  </Link>
                </div>
              </div>
            </div>
          </Modal>
        </>
    
  );
};

export default CreateClaim;
