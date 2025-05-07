import React, { useState, useEffect, useRef } from 'react';
import { Modal } from 'bootstrap';
import * as Icon from 'react-feather';
import axios from 'axios';
import { Dropdown } from 'primereact/dropdown';
import ImageWithBasePath from '../../../../core/img/ImageWithBasePath';

const UsersModal = ({ validateForm, showToast, refreshUsers }: any) => {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    phone: '',
    email: '',
    password: '',
    role: 'user',
    image: null,
    _id: ''
  });
  const [errors, setErrors] = useState<any>({});
  const [isEditMode, setIsEditMode] = useState(false);
  const addModalRef = useRef<any>(null);
  const editModalRef = useRef<any>(null);

  const roles = [{ name: 'Admin' }, { name: 'User' }];

  const cleanUpModal = () => {
    document.body.classList.remove('modal-open');
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(backdrop => backdrop.remove());
  };

  useEffect(() => {
    addModalRef.current = new Modal(document.getElementById('add-user'));
    editModalRef.current = new Modal(document.getElementById('edit-user'));
    
    // Setup edit modal event listener
    const editModal = document.getElementById('edit-user');
    if (editModal) {
      editModal.addEventListener('show.bs.modal', (event: any) => {
        const button = event.relatedTarget;
        const user = JSON.parse(button.getAttribute('data-user'));
        setFormData({
          firstname: user.firstname,
          lastname: user.lastname,
          phone: user.phone,
          email: user.email,
          password: '',
          role: user.role,
          image: null,
          _id: user._id
        });
        setIsEditMode(true);
        setErrors({});
      });
    }

    // Reset form when modal is hidden
    const resetFormOnHide = () => {
      setFormData({
        firstname: '',
        lastname: '',
        phone: '',
        email: '',
        password: '',
        role: 'user',
        image: null,
        _id: ''
      });
      setErrors({});
      setIsEditMode(false);
    };

    const handleModalHide = () => {
      resetFormOnHide();
      setTimeout(cleanUpModal, 100);
    };

    document.getElementById('add-user')?.addEventListener('hidden.bs.modal', handleModalHide);
    document.getElementById('edit-user')?.addEventListener('hidden.bs.modal', handleModalHide);

    return () => {
      document.getElementById('add-user')?.removeEventListener('hidden.bs.modal', handleModalHide);
      document.getElementById('edit-user')?.removeEventListener('hidden.bs.modal', handleModalHide);
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({ ...formData, image: e.target.files[0] });
    }
  };

  const handleRoleChange = (e: any) => {
    setFormData({ ...formData, role: e.value.name.toLowerCase() });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm(formData);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== '') {
          formDataToSend.append(key, formData[key]);
        }
      });

      const url = isEditMode 
        ? `http://localhost:4000/api/users/${formData._id}`
        : 'http://localhost:4000/api/auth/register';
      
      const method = isEditMode ? 'put' : 'post';

      await axios[method](url, formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      showToast(
        'success', 
        'Success', 
        isEditMode ? 'User updated successfully' : 'User created successfully'
      );
      
      if (isEditMode) {
        editModalRef.current?.hide();
      } else {
        addModalRef.current?.hide();
      }
      cleanUpModal();
      
      refreshUsers();
    } catch (error: any) {
      console.error('Error saving user:', error);
      showToast(
        'error', 
        'Error', 
        error.response?.data?.message || 
        (isEditMode ? 'Failed to update user' : 'Failed to create user')
      );
    }
  };

  return (
    <>
      {/* Add User Modal */}
      <div className="modal fade" id="add-user" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header border-0">
              <h5 className="modal-title">Add New User</h5>
              <button 
                type="button" 
                className="btn-close" 
                data-bs-dismiss="modal" 
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body py-4">
              <form onSubmit={handleSubmit}>
                <div className="profile-upload mb-3">
                  <div className="profile-upload-img">
                    <ImageWithBasePath 
                      src={formData.image ? URL.createObjectURL(formData.image) : "assets/admin/img/customer/user-01.jpg"} 
                      alt="img" 
                    />
                  </div>
                  <div className="profile-upload-content">
                    <div className="profile-upload-btn">
                      <div className="profile-upload-file">
                        <input 
                          type="file" 
                          id="imgInp" 
                          onChange={handleFileChange}
                          accept="image/*"
                        />
                        <label htmlFor="imgInp" className="btn btn-upload">
                          Upload
                        </label>
                      </div>
                      <button 
                        type="button" 
                        className="btn btn-remove"
                        onClick={() => setFormData({...formData, image: null})}
                      >
                        Remove
                      </button>
                    </div>
                    <div className="profile-upload-para">
                      <p>* Recommends a minimum size of 320 x 320 pixels. Allowed files .png and .jpg.</p>
                    </div>
                  </div>
                </div>
                
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label">First Name*</label>
                      <input
                        type="text"
                        name="firstname"
                        value={formData.firstname}
                        onChange={handleChange}
                        className={`form-control ${errors.firstname ? 'is-invalid' : ''}`}
                        maxLength={50}
                      />
                      {errors.firstname && (
                        <div className="text-danger small mt-1" style={{fontSize: '0.8rem'}}>
                          {errors.firstname}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label">Last Name*</label>
                      <input
                        type="text"
                        name="lastname"
                        value={formData.lastname}
                        onChange={handleChange}
                        className={`form-control ${errors.lastname ? 'is-invalid' : ''}`}
                        maxLength={50}
                      />
                      {errors.lastname && (
                        <div className="text-danger small mt-1" style={{fontSize: '0.8rem'}}>
                          {errors.lastname}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label">Email*</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      />
                      {errors.email && (
                        <div className="text-danger small mt-1" style={{fontSize: '0.8rem'}}>
                          {errors.email}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label">Phone*</label>
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                        placeholder="e.g. 50123456"
                      />
                      {errors.phone && (
                        <div className="text-danger small mt-1" style={{fontSize: '0.8rem'}}>
                          {errors.phone}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label">Password*</label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                      />
                      {errors.password && (
                        <div className="text-danger small mt-1" style={{fontSize: '0.8rem'}}>
                          {errors.password}
                        </div>
                      )}
                      <small className="text-muted">
                        Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character
                      </small>
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label">Role*</label>
                      <Dropdown 
                        value={roles.find(r => r.name.toLowerCase() === formData.role)} 
                        onChange={handleRoleChange} 
                        options={roles} 
                        optionLabel="name" 
                        placeholder="Select Role" 
                        className="w-100" 
                      />
                    </div>
                  </div>
                </div>
                
                <div className="modal-footer border-0 pt-4">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    data-bs-dismiss="modal"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Save User
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      <div className="modal fade" id="edit-user" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header border-0">
              <h5 className="modal-title">Edit User</h5>
              <button 
                type="button" 
                className="btn-close" 
                data-bs-dismiss="modal" 
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body py-4">
              <form onSubmit={handleSubmit}>
                <div className="profile-upload mb-3">
                  <div className="profile-upload-img">
                    <ImageWithBasePath 
                      src={formData.image ? URL.createObjectURL(formData.image) : "assets/admin/img/customer/user-01.jpg"} 
                      alt="img" 
                    />
                  </div>
                  <div className="profile-upload-content">
                    <div className="profile-upload-btn">
                      <div className="profile-upload-file">
                        <input 
                          type="file" 
                          id="imgInp" 
                          onChange={handleFileChange}
                          accept="image/*"
                        />
                        <label htmlFor="imgInp" className="btn btn-upload">
                          Upload
                        </label>
                      </div>
                      <button 
                        type="button" 
                        className="btn btn-remove"
                        onClick={() => setFormData({...formData, image: null})}
                      >
                        Remove
                      </button>
                    </div>
                    <div className="profile-upload-para">
                      <p>* Recommends a minimum size of 320 x 320 pixels. Allowed files .png and .jpg.</p>
                    </div>
                  </div>
                </div>
                
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label">First Name*</label>
                      <input
                        type="text"
                        name="firstname"
                        value={formData.firstname}
                        onChange={handleChange}
                        className={`form-control ${errors.firstname ? 'is-invalid' : ''}`}
                        maxLength={50}
                      />
                      {errors.firstname && (
                        <div className="text-danger small mt-1" style={{fontSize: '0.8rem'}}>
                          {errors.firstname}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label">Last Name*</label>
                      <input
                        type="text"
                        name="lastname"
                        value={formData.lastname}
                        onChange={handleChange}
                        className={`form-control ${errors.lastname ? 'is-invalid' : ''}`}
                        maxLength={50}
                      />
                      {errors.lastname && (
                        <div className="text-danger small mt-1" style={{fontSize: '0.8rem'}}>
                          {errors.lastname}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label">Email*</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      />
                      {errors.email && (
                        <div className="text-danger small mt-1" style={{fontSize: '0.8rem'}}>
                          {errors.email}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label">Phone*</label>
                      <input
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                        placeholder="e.g. 50123456"
                      />
                      {errors.phone && (
                        <div className="text-danger small mt-1" style={{fontSize: '0.8rem'}}>
                          {errors.phone}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label">New Password</label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                        placeholder="Leave blank to keep current"
                      />
                      {errors.password && (
                        <div className="text-danger small mt-1" style={{fontSize: '0.8rem'}}>
                          {errors.password}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className="form-group">
                      <label className="form-label">Role*</label>
                      <Dropdown 
                        value={roles.find(r => r.name.toLowerCase() === formData.role)} 
                        onChange={handleRoleChange} 
                        options={roles} 
                        optionLabel="name" 
                        placeholder="Select Role" 
                        className="w-100" 
                      />
                    </div>
                  </div>
                </div>
                
                <div className="modal-footer border-0 pt-4">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    data-bs-dismiss="modal"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Update User
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

export default UsersModal;