import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PhoneInput from 'react-phone-input-2';
import ImageWithBasePath from '../../../../core/img/ImageWithBasePath';
import PagesAuthHeader from './common/header';
import { all_routes } from '../../../../core/data/routes/all_routes';
import AuthFooter from './common/footer';
import axios from 'axios';
import 'react-phone-input-2/lib/style.css';
import QRCodeModal from '../../home/new-home/QRCodeModal'; // Import the modal component

const UserSignup = () => {
  const navigate = useNavigate();
  const routes = all_routes;

  // Form fields state
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [showQRCodeModal, setShowQRCodeModal] = useState(false); // State to control modal visibility

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent the default form submission behavior

    try {
      const { data } = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/auth/register`, {
        firstname,
        lastname,
        phone,
        email,
        password,
      });

      // Handle the response
      if (data.qrCode) {
        setQrCodeUrl(data.qrCode); // Set the QR code URL
        setShowQRCodeModal(true); // Show the QR code modal
      } else {
        console.error('QR code URL not found in response:', data);
        setErrorMessage('Registration successful, but QR code not generated.');
      }
    } catch (error) {
      console.error('Signup error:', error);
      setErrorMessage('Registration failed. Please try again.');
    }
  };

  // Close the modal
  const closeQRCodeModal = () => {
    setShowQRCodeModal(false);
  };

  return (
    <>
      <PagesAuthHeader />
      <div className="main-wrapper">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-5 mx-auto">
              <form onSubmit={handleSubmit}>
                <div className="d-flex flex-column justify-content-center">
                  <div className="card p-sm-4 my-5">
                    <div className="card-body">
                      <div className="text-center mb-3">
                        <h3 className="mb-2">User Signup</h3>
                        <p>Enter your credentials to access your account</p>
                      </div>

                      {errorMessage && <p className="text-danger">{errorMessage}</p>}

                      {/* First Name Field */}
                      <div className="mb-3">
                        <label className="form-label">First Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={firstname}
                          onChange={(e) => setFirstname(e.target.value)}
                          required
                        />
                      </div>

                      {/* Last Name Field */}
                      <div className="mb-3">
                        <label className="form-label">Last Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={lastname}
                          onChange={(e) => setLastname(e.target.value)}
                          required
                        />
                      </div>

                      {/* Email Field */}
                      <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input
                          type="email"
                          className="form-control"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>

                      {/* Phone Number Field */}
                      <div className="mb-3">
                        <label className="form-label">Phone Number</label>
                        <PhoneInput
                          country={'us'}
                          value={phone}
                          onChange={setPhone}
                          placeholder="1 (702) 123-4567"
                          isValid={(value) => {
                            if (value && value.length >= 10) return true;
                            return 'Invalid phone number';
                          }}
                        />
                      </div>

                      {/* Password Field */}
                      <div className="mb-3">
                        <div className="d-flex align-items-center justify-content-between flex-wrap">
                          <label className="form-label">Password</label>
                          <p className="text-gray-6 fw-medium mb-1">
                            Must be 8 Characters at Least
                          </p>
                        </div>
                        <input
                          type="password"
                          className="form-control"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>

                      {/* Terms and Conditions Checkbox */}
                      <div className="mb-3">
                        <div className="form-check">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="remember_me"
                            required
                          />
                          <label className="form-check-label" htmlFor="remember_me">
                            I agree to{' '}
                            <Link to="#" className="text-primary text-decoration-underline">
                              Terms of use
                            </Link>{' '}
                            &amp;{' '}
                            <Link to="#" className="text-primary text-decoration-underline">
                              Privacy policy
                            </Link>
                          </label>
                        </div>
                      </div>

                      {/* Sign Up Button */}
                      <div className="mb-3">
                        <button type="submit" className="btn btn-lg btn-linear-primary w-100">
                          Sign Up
                        </button>
                      </div>

                      {/* Social Sign Up Options */}
                      <div className="login-or mb-3">
                        <span className="span-or">Or sign up with</span>
                      </div>

                      <div className="d-flex align-items-center mb-3">
                        <Link
                          to="#"
                          className="btn btn-light flex-fill d-flex align-items-center justify-content-center me-3"
                        >
                          <ImageWithBasePath
                            src="assets/img/icons/google-icon.svg"
                            className="me-2"
                            alt="Google"
                          />
                          Google
                        </Link>
                        <Link
                          to="#"
                          className="btn btn-light flex-fill d-flex align-items-center justify-content-center"
                        >
                          <ImageWithBasePath
                            src="assets/img/icons/fb-icon.svg"
                            className="me-2"
                            alt="Facebook"
                          />
                          Facebook
                        </Link>
                      </div>

                      {/* Login Link */}
                      <div className="d-flex justify-content-center">
                        <p>
                          Already have an account?{' '}
                          <Link to={routes.login} className="text-primary">
                            Sign In
                          </Link>
                        </p>
                      </div>
                    </div>

                    {/* Background Images */}
                    <div>
                      <ImageWithBasePath
                        src="assets/img/bg/authentication-bg.png"
                        className="bg-left-top"
                        alt="Background"
                      />
                      <ImageWithBasePath
                        src="assets/img/bg/authentication-bg.png"
                        className="bg-right-bottom"
                        alt="Background"
                      />
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <AuthFooter />

      {/* QR Code Modal */}
      {showQRCodeModal && qrCodeUrl && (
        <QRCodeModal qrCodeUrl={qrCodeUrl} onClose={closeQRCodeModal} />
      )}
    </>
  );
};

export default UserSignup;