import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { all_routes } from '../../../../core/data/routes/all_routes';
import PhoneInput from 'react-phone-input-2';
import axios from 'axios';
import SuccessModal from '../../../../modals/SuccessModal';
import { Modal } from 'bootstrap';
import { jwtDecode } from 'jwt-decode';
import ImageWithBasePath from '../../../../core/img/ImageWithBasePath';

const ProviderSecuritySettings = () => {
  const routes = all_routes;
  const [selectedItems, setSelectedItems] = useState(Array(6).fill(false));
  const handleItemClick = (index: number) => {
    setSelectedItems((prevSelectedItems) => {
      const updatedSelectedItems = [...prevSelectedItems];
      updatedSelectedItems[index] = !updatedSelectedItems[index];
      return updatedSelectedItems;
    });
  };
  const [phone, setPhone] = useState('');
  const [phone2, setPhone2] = useState('');
  const handleOnChange = (value: string, country: string) => {
    console.log(value, country);
    setPhone(value);
  };
  const handleOnChange2 = (value: string, country: string) => {
    console.log(value, country);
    setPhone2(value);
  };

  const [is2FAEnabled, setIs2FAEnabled] = useState(false); // State for 2FA toggle
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null); // State for QR code URL
  const [showQRCodeModal, setShowQRCodeModal] = useState(false); // State for QR code modal
  const [twoFACode, setTwoFACode] = useState(''); // State for 2FA code input
  const [showSuccessModal, setShowSuccessModal] = useState(false); // State for success modal
  const [successMessage, setSuccessMessage] = useState('');

  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null; // Get user data from local storage
  const email = user?.email; // Extract the user's email
  const id = user?._id;

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordValidation, setPasswordValidation] = useState({
    hasMinLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });

  const validatePassword = (password: string) => {
    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    setPasswordValidation({
      hasMinLength,
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasSpecialChar,
    });
  };

  useEffect(() => {
    const fetch2FAStatus = async () => {
      try {
        const response = await axios.get('http://localhost:4000/api/auth/profile', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        setIs2FAEnabled(response.data.twoFactorEnabled); // Update 2FA status
      } catch (error) {
        console.error('Error fetching 2FA status:', error);
      }
    };

    fetch2FAStatus();
  }, []);
  const handleFaceRegistration = async () => {
    try {
      const userId = id;
  
      const response = await axios.post('http://localhost:4000/api/auth/register_face', 
        { userId }, // <- send as JSON, not FormData
        {
          headers: {
            'Content-Type': 'application/json', // <- tell server it's JSON
            Authorization: `Bearer ${localStorage.getItem('token')}`, // if your endpoint needs auth
          },
        }
      );
  
      if (response.data.message) {
        alert('Face registration successful!');
      } else {
        alert('Face registration failed!');
      }
    } catch (error) {
      console.error('Error registering face data:', error);
      alert('An error occurred during face registration.');
    }
  };
  

  // Handle 2FA toggle
  const handle2FAToggle = async () => {
    try {
      if (is2FAEnabled) {
        // Disable 2FA
        await axios.post('http://localhost:4000/api/auth/disable-2fa', {
          email,
        });
        setIs2FAEnabled(false);
        setSuccessMessage('2FA has been disabled successfully!');
        setShowSuccessModal(true);
      } else {
        // Enable 2FA
        const response = await axios.post('http://localhost:4000/api/auth/enable-2fa', {
          email,
        });
        setQrCodeUrl(response.data.qrCodeUrl);
        setShowQRCodeModal(true);
      }
    } catch (error) {
      console.error('Error toggling 2FA:', error);
      alert('Failed to toggle 2FA. Please try again.');
    }
  };

  // Handle 2FA code verification
  const handleVerify2FA = async () => {
    try {
      const response = await axios.post('http://localhost:4000/api/auth/verify-2fa', {
        email,
        code: twoFACode,
      });

      setIs2FAEnabled(true);
      setShowQRCodeModal(false);
      setSuccessMessage('2FA has been enabled successfully!');
      setShowSuccessModal(true);
    } catch (error) {
      console.error('2FA verification error:', error);
      alert('Invalid 2FA code. Please try again.');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
  
    // Validate new password and confirm password
    if (newPassword !== confirmNewPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
  
    // Validate password strength
    if (
      !passwordValidation.hasMinLength ||
      !passwordValidation.hasUppercase ||
      !passwordValidation.hasLowercase ||
      !passwordValidation.hasNumber ||
      !passwordValidation.hasSpecialChar
    ) {
      setPasswordError('Password does not meet the requirements.');
      return;
    }
  
    try {
      const response = await axios.post(
        'http://localhost:4000/api/auth/change-password',
        {
          currentPassword,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
  
      if (response.data.success) {
        setSuccessMessage('Password changed successfully!');
        setShowSuccessModal(true);
  
        // Clear the form fields and error message
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        setPasswordError('');
  
        // Hide the change password modal
        const changePasswordModal = document.getElementById('change-password');
        if (changePasswordModal) {
          const modalInstance = Modal.getInstance(changePasswordModal);
          if (modalInstance) {
            modalInstance.hide();
          }
        }
        document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordError('Failed to change password. Please try again.');
    }
  };

  
  return (
    <>
      {/* Page Wrapper */}
      <div className="page-wrapper">
        <div className="content container-fluid">
          <div className="row">
            <div className="d-flex justify-content-between align-items-center flex-wrap mb-4">
              <h5>Security Settings</h5>
            </div>
          </div>
          {/* Security Settings */}
          <div className="row">
            <div className="col-xl-4 col-md-4 d-flex mb-3">
              <div className="linked-item flex-fill">
                <div className="linked-wrap">
                  <div className="linked-acc">
                    <span className="link-icon rounded-circle">
                      <i className="ti ti-lock" />
                    </span>
                    <div className="linked-info">
                      <h6 className="fs-16">Password</h6>
                      <p className="text-gray fs-12">
                        Last Changed :{" "}
                        <span className="text-dark fs-12">
                          22 Sep 2023, 10:30:55 AM
                        </span>
                      </p>
                    </div>
                  </div>
                  <div className="linked-action">
                    <button
                      className="btn btn-dark btn-sm"
                      data-bs-toggle="modal"
                      data-bs-target="#change-password"
                    >
                      Change Password
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xxl-4 col-md-6">
                    <div className="card dash-widget-2">
                      <div className="card-body">
                        <div className="d-flex align-items-center mb-3">
                          <span className="set-icon bg-light d-flex justify-content-center align-items-center rounded-circle p-1 me-2">
                            <i className="ti ti-camera text-dark fs-20" /> {/* Camera icon */}
                          </span>
                          <div>
                            <p className="mb-0 text-gray-9 fw-medium">Face Registration</p>
                            <span className="fs-12 text-truncate">
                              Register your face for future logins.
                            </span>
                          </div>
                        </div>
                        <button
                          className="btn btn-dark"
                          onClick={handleFaceRegistration} // Trigger face registration
                        >
                          Register Face
                        </button>
                      </div>
                    </div>
                  </div>
            {/* 2FA Section */}
            {/* 2FA Section */}
            <div className="col-xl-4 col-md-4 d-flex mb-3">
              <div className="linked-item flex-fill">
                <div className="linked-wrap">
                  <div className="linked-acc">
                    <span className="link-icon rounded-circle">
                      <i className="ti ti-lock" />
                    </span>
                    <div className="linked-info row align-items-center">
                      <div className="col-md-9">
                        <h6 className="fs-16">Two Factor Authentication</h6>
                        <p className="text-gray fs-12 text-truncate">
                          Strengthens security with an extra step.
                        </p>
                      </div>
                      <div className="col-md-3">
                        <div className="d-flex align-items-center justify-content-end form-check form-switch mb-3">
                          <input
                            type="checkbox"
                            id="status-two"
                            className="form-check-input"
                            checked={is2FAEnabled}
                            onChange={handle2FAToggle}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="linked-action">
                    <button
                      className="btn btn-dark btn-sm"
                      onClick={handle2FAToggle}
                    >
                      {is2FAEnabled ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {/* Succes modal */}
            {showSuccessModal && (
              <SuccessModal
                message={successMessage}
                onClose={() => setShowSuccessModal(false)}
              />
            )}

            {/* QR Code Modal */}
            {showQRCodeModal && (
              <div className="modal fade show" id="qr-code-modal" tabIndex={-1} style={{ display: 'block', backgroundColor: 'rgba(0, 0, 0, 0.5)' }} aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                  <div className="modal-content">
                    <div className="modal-header d-flex align-items-center justify-content-end pb-0 border-0">
                      <Link to="#" onClick={() => setShowQRCodeModal(false)} aria-label="Close">
                        <i className="ti ti-circle-x-filled fs-20" />
                      </Link>
                    </div>
                    <div className="modal-body p-4">
                      <div className="text-center mb-3">
                        <h3 className="mb-2">Scan QR Code</h3>
                        <p>Scan the QR code below with your authenticator app.</p>
                      </div>
                      <div className="mb-3 text-center">
                        {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code" />}
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Enter 2FA Code</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter 6-digit code"
                          value={twoFACode}
                          onChange={(e) => setTwoFACode(e.target.value)}
                        />
                      </div>
                      <div className="mb-3">
                        <button
                          type="button"
                          className="btn btn-lg btn-linear-primary w-100"
                          onClick={handleVerify2FA}
                        >
                          Verify 2FA Code
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

      
            <div className="col-xl-4 col-md-4 d-flex mb-3">
              <div className="linked-item flex-fill">
                <div className="linked-wrap">
                  <div className="linked-acc">
                    <span className="link-icon rounded-circle">
                      <i className="ti ti-mail" />
                    </span>
                    <div className="linked-info row align-items-center">
                      <div className="col-md-9">
                        <h6 className="fs-16 text-truncate">Email Verification</h6>
                        <p className="text-gray fs-12 text-truncate">
                          Verified Email :
                          <span className="text-dark fs-12"> info@example.com</span>
                        </p>
                      </div>
                      <div className="col-md-3">
                        <div className="d-flex justify-content-end">
                          <span>
                            <i className="ti ti-circle-check-filled text-success" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="linked-action">
                    <button
                      className="btn btn-dark btn-sm"
                      data-bs-toggle="modal"
                      data-bs-target="#change-email"
                    >
                      Change
                    </button>
                    <button className="btn btn-light btn-sm">Remove</button>
                  </div>
                </div>
              </div>
            </div>
            
          </div>
          {/* /Security Settings */}
        </div>
      </div>
      {/* /Page Wrapper */}
      {/* Change Password */}
      <div className="modal fade custom-modal" id="change-password">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content doctor-profile">
            <div className="modal-header d-flex align-items-center justify-content-between border-bottom">
              <h5 className="modal-title">Change Password</h5>
              <Link
                to="#"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <i className="ti ti-circle-x-filled fs-20" />
              </Link>
            </div>
            <div className="modal-body p-4">
              <form onSubmit={handleChangePassword}>
                <div className="mb-3">
                  <label className="form-label">Current Password</label>
                  <div className="pass-group">
                    <input
                      type={selectedItems[1] ? 'text' : 'password'}
                      className="form-control pass-input"
                      placeholder="*************"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                    <span onClick={() => handleItemClick(1)} className={`toggle-password feather ${selectedItems[1] ? 'icon-eye' : 'icon-eye-off'}`} />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">New Password</label>
                  <div className="pass-group" id="passwordInput">
                    <input
                      type={selectedItems[2] ? 'text' : 'password'}
                      className="form-control pass-input"
                      placeholder="*************"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        validatePassword(e.target.value);
                      }}
                    />
                    <span onClick={() => handleItemClick(2)} className={`toggle-password feather ${selectedItems[2] ? 'icon-eye' : 'icon-eye-off'}`} />
                  </div>
                  <div className="password-strength" id="passwordStrength">
                    <span id="poor" />
                    <span id="weak" />
                    <span id="strong" />
                    <span id="heavy" />
                  </div>
                  <div className="password-validation-feedback">
                    <div className={`validation-rule ${passwordValidation.hasMinLength ? 'valid' : 'invalid'}`}>
                      {passwordValidation.hasMinLength ? '✓' : '✗'} At least 8 characters
                    </div>
                    <div className={`validation-rule ${passwordValidation.hasUppercase ? 'valid' : 'invalid'}`}>
                      {passwordValidation.hasUppercase ? '✓' : '✗'} At least 1 uppercase letter
                    </div>
                    <div className={`validation-rule ${passwordValidation.hasLowercase ? 'valid' : 'invalid'}`}>
                      {passwordValidation.hasLowercase ? '✓' : '✗'} At least 1 lowercase letter
                    </div>
                    <div className={`validation-rule ${passwordValidation.hasNumber ? 'valid' : 'invalid'}`}>
                      {passwordValidation.hasNumber ? '✓' : '✗'} At least 1 number
                    </div>
                    <div className={`validation-rule ${passwordValidation.hasSpecialChar ? 'valid' : 'invalid'}`}>
                      {passwordValidation.hasSpecialChar ? '✓' : '✗'} At least 1 special character
                    </div>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Confirm New Password</label>
                  <div className="pass-group">
                    <input
                      type={selectedItems[3] ? 'text' : 'password'}
                      className="form-control pass-input"
                      placeholder="*************"
                      value={confirmNewPassword}
                      onChange={(e) => {
                        setConfirmNewPassword(e.target.value);
                        if (newPassword !== e.target.value) {
                          setPasswordError('New passwords do not match.');
                        } else {
                          setPasswordError('');
                        }
                      }}
                    />
                    <span onClick={() => handleItemClick(3)} className={`toggle-password feather ${selectedItems[3] ? 'icon-eye' : 'icon-eye-off'}`} />
                  </div>
                  {passwordError && (
                    <div className="alert alert-danger mt-3" role="alert">
                      {passwordError}
                    </div>
                  )}
                </div>
                <div className="modal-footer border-top">
                  <div className="acc-submit">
                    <Link
                      to="#"
                      className="btn btn-light me-2"
                      data-bs-dismiss="modal"
                    >
                      Cancel
                    </Link>
                    <button className="btn btn-dark" type="submit">
                      Update Password
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      {/* /Change Password */}
      {/* Change Email */}
      <div className="modal fade custom-modal" id="change-email">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content doctor-profile">
            <div className="modal-header d-flex align-items-center justify-content-between border-bottom">
              <h5 className="modal-title">Change Email</h5>
              <Link
                to="#"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <i className="ti ti-circle-x-filled fs-20" />
              </Link>
            </div>
            <div className="modal-body p-4">
              <form>
                <div className="wallet-add">
                  <div className="mb-3">
                    <label className="form-label">Current Email Address</label>
                    <input type="email" className="form-control" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      New Email Address <span className="text-danger">*</span>
                    </label>
                    <input type="email" className="form-control" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Confirm New Password</label>
                    <div className="pass-group">
                      <input
                        type={selectedItems[4] ? 'text' : 'password'}
                        className="form-control pass-input"
                        placeholder="*************"
                      />
                      <span onClick={() => handleItemClick(4)} className={`toggle-password feather ${selectedItems[4] ? 'icon-eye' : 'icon-eye-off'}`} />
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer border-top">
              <div className="acc-submit">
                <Link
                  to="#"
                  className="btn btn-light me-2"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </Link>
                <button className="btn btn-dark" type="button" data-bs-dismiss="modal">
                  Change Email
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Change Email */}
      {/* Change Phone */}
      <div className="modal fade custom-modal" id="change-phone">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content doctor-profile">
            <div className="modal-header d-flex align-items-center justify-content-between border-bottom">
              <h5 className="modal-title">Change Phone Number</h5>
              <Link
                to="#"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
                <i className="ti ti-circle-x-filled fs-20" />
              </Link>
            </div>
            <div className="modal-body p-4">
              <form >
                <div className="wallet-add">
                  <div className="mb-3">
                    <label className="form-label">Current Phone Number</label>

                    <PhoneInput
                      country={'us'}
                      value={phone}
                      onChange={handleOnChange}
                      placeholder="Enter Phone Number"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">
                      New Phone Number <span className="text-danger">*</span>
                    </label>
                    <PhoneInput
                      country={'us'}
                      value={phone2}
                      onChange={handleOnChange2}
                      placeholder="Enter New Phone Number"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Confirm New Password</label>
                    <div className="pass-group">
                      <input
                        type={selectedItems[5] ? 'text' : 'password'}
                        className="form-control pass-input"
                        placeholder="*************"
                      />
                      <span onClick={() => handleItemClick(5)} className={`toggle-password feather ${selectedItems[5] ? 'icon-eye' : 'icon-eye-off'}`} />
                    </div>
                  </div>
                </div>
              </form>
            </div>
            <div className="modal-footer border-top">
              <div className="acc-submit">
                <Link
                  to="#"
                  className="btn btn-light me-2"
                  data-bs-dismiss="modal"
                >
                  Cancel
                </Link>
                <button className="btn btn-dark" type="button" data-bs-dismiss="modal">
                  Change Number
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* /Change Phone */}
    </>


  )
}

export default ProviderSecuritySettings