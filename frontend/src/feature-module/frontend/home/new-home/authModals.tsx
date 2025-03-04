import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ImageWithBasePath from '../../../../core/img/ImageWithBasePath';
import { InputOtp } from 'primereact/inputotp';
import { useGoogleLogin } from '@react-oauth/google';
import { googleAuth } from '../../../../api';
import axios, { AxiosError } from 'axios';
import { register, login } from '../../../../services/authService';
import { Modal } from 'bootstrap';
import { Eye, EyeOff } from 'lucide-react';


interface User {
  email: string;
  name: string;
  image: string;
  token: string;
}

const AuthModals = () => {
  const [token, setTokens] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [passwordResponse, setPasswordResponse] = useState({
    passwordResponseText: "Use 8 or more characters with a mix of letters, numbers, and symbols.",
    passwordResponseKey: '',
  });
  const [error, setError] = useState<string>('');
  const [firstname, setFirstName] = useState<string>('');
  const [lastname, setLastName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [registrationSuccess, setRegistrationSuccess] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [showQRCodeModal, setShowQRCodeModal] = useState<boolean>(false);
  const [registerError, setRegisterError] = useState<string>('');
  const [forgotEmail, setForgotEmail] = useState<string>('');
  const [forgotResponse, setForgotResponse] = useState<string>('');
  const [twoFACode, setTwoFACode] = useState<string>('');
  const [user, setUser] = useState<User | null>(null);
  const [show2FAPopup, setShow2FAPopup] = useState<boolean>(false);
  const [showPhoneModal, setShowPhoneModal] = useState<boolean>(false);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const navigate = useNavigate();


  const [passwordValidation, setPasswordValidation] = useState({
    hasMinLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false,
  });


  useEffect(() => {
    // Retrieve user info from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const responseGoogle = async (authResult: any) => {
    try {
      if (authResult.code) {
        const result = await googleAuth(authResult.code);
        const { email, name, image } = result.data.user;
        const token = result.data.token;

        // Save user info in localStorage
        localStorage.setItem('user', JSON.stringify({ email, name, image, token }));
        setEmail(email);
        // Call the backend to check if the user has a phone number
        const response = await axios.post('http://localhost:4000/api/users/check', {
          email,
        });

        if (!response.data.hasPhone) {
          setShowPhoneModal(true); // Show the phone number modal
        } else {
          // Proceed to the dashboard
          navigate('/providers/dashboard');
        }

        // Close the login modal
        const modal = document.getElementById('login-modal');
        if (modal) {
          const bsModal = Modal.getInstance(modal);
          bsModal?.hide();
        }

        document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
        document.body.classList.remove('modal-open');
      }
    } catch (error) {
      console.error('Error during Google login:', error);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: responseGoogle,
    flow: 'auth-code',
  });

  const onChangePassword = (password: string) => {
    setPassword(password);

    // Check each validation rule
    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    // Update the validation state
    setPasswordValidation({
      hasMinLength,
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasSpecialChar,
    });

    // Update the password response text
    if (password.match(/^$|\s+/)) {
      setPasswordResponse({
        passwordResponseText: 'Whitespaces are not allowed',
        passwordResponseKey: '',
      });
    } else if (password.length === 0) {
      setPasswordResponse({
        passwordResponseText: '',
        passwordResponseKey: '',
      });
    } else if (!hasMinLength) {
      setPasswordResponse({
        passwordResponseText: 'Weak. Must contain at least 8 characters',
        passwordResponseKey: '0',
      });
    } else if (!hasUppercase || !hasLowercase || !hasNumber) {
      setPasswordResponse({
        passwordResponseText: 'Average. Must contain at least 1 uppercase letter, 1 lowercase letter, and 1 number',
        passwordResponseKey: '1',
      });
    } else if (!hasSpecialChar) {
      setPasswordResponse({
        passwordResponseText: 'Almost. Must contain a special character',
        passwordResponseKey: '2',
      });
    } else {
      setPasswordResponse({
        passwordResponseText: 'Awesome! You have a secure password.',
        passwordResponseKey: '3',
      });
    }
  };

  const PasswordValidationFeedback = () => {
    return (
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
    );
  };
  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!email) {
      setError('Email is required');
    } else if (!emailRegex.test(email)) {
      setError('Invalid email format');
    } else {
      setError('');
    }
  };

  const handleRegisterSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const userData = { firstname, lastname, email, phone, password, enable2FA: false }; // Default to false

    try {
      const response = await register(userData);
      setRegistrationSuccess(true);
      setSuccessMessage('Registration successful!');

      // Show the 2FA popup
      setShow2FAPopup(true);

      // Show the email confirmation popup
      setShowEmailConfirmation(true);

      const registerModal = document.getElementById('register-modal');
      if (registerModal) {
        const bsRegisterModal = Modal.getInstance(registerModal);
        bsRegisterModal?.hide();
      }
    } catch (error: any) {
      console.error('Error during registration:', error);
      setRegisterError(error.message);
    }
  };

  /*   const handleEnable2FA = async () => {
      try {
        const response = await axios.post('http://localhost:4000/api/auth/enable-2fa', {
          email: user.email,
        });
    
        setQrCodeUrl(response.data.qrCodeUrl);
        setShowQRCodeModal(true);
      } catch (error) {
        console.error('Error enabling 2FA:', error);
      }
    }; 
   */
  const handleVerify2FA = async () => {
    try {
      const response = await axios.post('http://localhost:4000/api/auth/verify-2fa', {
        email,
        code: twoFACode,
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      //alert('2FA verification successful!');
      const modal = document.getElementById('register-modal');
      if (modal) {
        const bsModal = Modal.getInstance(modal);
        bsModal?.hide();
      }

      document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
      document.body.classList.remove('modal-open');
      navigate('/providers/dashboard');
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const errorMessage = axiosError.response?.data?.message || 'Invalid 2FA code';
      alert(errorMessage);
      console.error('2FA verification error:', axiosError.response?.data || axiosError.message);
    }
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    validateEmail(email);
  
    console.log('email', email);
    console.log('password', password
    );
    if (error || password.length < 8) {
      return;
    }
  
    try {
      const data = await login(email, password);
  
      // Vérifier si le compte est activé
      if (!data.user.isActive) {
        setError("Account is not activated. Please check your email.");
        return; // Arrêter le processus de connexion
      }
  
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      const modal = document.getElementById('login-modal');
      if (modal) {
        const bsModal = Modal.getInstance(modal);
        bsModal?.hide();
      }
  
      document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
      document.body.classList.remove('modal-open');
  
      const role = data.user?.role || 'user';
      localStorage.setItem('role', role);
  
      setTimeout(() => {
        navigate(role === 'user' ? '/providers/dashboard' : '/admin/dashboard');
      }, 100);
    } catch (error: any) {
      console.log("Full error response:", error.response); // Ajoutez ce log pour déboguer
      if (error.response) {
        // Si la réponse contient un message d'erreur
if (error.response?.data?.message) {
          setError(error.response.data.message);
        } else if (error.response.statusText) {
          setError(error.response.statusText); // Utiliser le texte du statut HTTP si le message n'est pas disponible
        } else {
          setError("An unexpected error occurred. Please try again.");
        }
      } else if (error.message) {
        setError(error.message); // Utiliser le message d'erreur générique si la réponse n'est pas disponible
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    }
  };

  



  const handleForgotPasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    try {
      const response = await fetch('http://localhost:4000/api/auth/request-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: forgotEmail }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setForgotResponse(data.message);
    } catch (error) {
      console.error('Error during password reset request:', error);
      setForgotResponse('Failed to send password reset email. Please try again.');
    }
  };

  useEffect(() => {
    const loginModal = document.getElementById('login-modal');
    if (loginModal) {
      loginModal.addEventListener('hidden.bs.modal', () => {
        setRegistrationSuccess(false);
        setSuccessMessage('');
      });
    }
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleSkip2FA = () => {
    // Hide the 2FA popup
    setShow2FAPopup(false);

    // Remove the modal backdrop
    document.querySelectorAll('.modal-backdrop').forEach((backdrop) => backdrop.remove());

    // Remove the 'modal-open' class from the body
    document.body.classList.remove('modal-open');

    navigate('/home');

  };

  return (
    <>
      {showPhoneModal && (
        <>
          {/* Semi-transparent backdrop */}
          <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>

          {/* Phone number modal */}
          <div className="modal fade show" id="phone-modal" tabIndex={-1} style={{ display: 'block', zIndex: 1050 }} aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header d-flex align-items-center justify-content-end pb-0 border-0">
                  <Link to="#" onClick={() => setShowPhoneModal(false)} aria-label="Close">
                    <i className="ti ti-circle-x-filled fs-20" />
                  </Link>
                </div>
                <div className="modal-body p-4">
                  <div className="text-center mb-3">
                    <h3 className="mb-2">Enter Your Phone Number</h3>
                    <p>Please provide your phone number to proceed.</p>
                  </div>
                  {/* Display backend or validation errors here */}
                  {error && <div className="alert alert-danger">{error}</div>}
                  <div className="mb-3">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        setError(''); // Clear error when user types
                      }}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div className="mb-3">
                    <button
                      type="button"
                      className="btn btn-lg btn-linear-primary w-100"
                      onClick={async () => {
                        try {
                          // Frontend validation for Tunisian phone number format
                          const tunisiaPhoneRegex = /^(2|5|9)\d{7}$/;
                          if (!tunisiaPhoneRegex.test(phone)) {
                            setError('Invalid Tunisian phone number format.');
                            return;
                          }

                          // Call the backend to update the phone number
                          const response = await axios.post('http://localhost:4000/api/users/update-phone', {
                            email, // Use the email from state
                            phone,
                          });

                          // If successful, close the modal and proceed to the dashboard
                          if (response.status === 200) {
                            setShowPhoneModal(false);
                            navigate('/providers/dashboard');
                          }
                        } catch (error) {
                          // Handle backend errors
                          if (axios.isAxiosError(error)) {
                            const backendError = error.response?.data?.message || 'Failed to update phone number. Please try again.';
                            setError(backendError);
                          } else {
                            setError('An unexpected error occurred. Please try again.');
                          }
                        }
                      }}
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      {show2FAPopup && (
        <div className="modal fade show" id="2fa-popup-modal" tabIndex={-1} style={{ display: 'block' }} aria-hidden="true">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header d-flex align-items-center justify-content-end pb-0 border-0">
                <Link to="#" onClick={() => setShow2FAPopup(false)} aria-label="Close">
                  <i className="ti ti-circle-x-filled fs-20" />
                </Link>
              </div>
              <div className="modal-body p-4">
                <div className="text-center mb-3">
                  <h3 className="mb-2">Enable Two-Factor Authentication (2FA)</h3>
                  <p>Do you want to enable 2FA for added security?</p>
                </div>
                <div className="mb-3">
                  <button
                    type="button"
                    className="btn btn-lg btn-linear-primary w-100 mb-2"
                    onClick={async () => {
                      try {
                        // Call the backend to enable 2FA
                        const response = await axios.post('http://localhost:4000/api/auth/enable-2fa', {
                          email,
                        });

                        // Show the QR code modal
                        setQrCodeUrl(response.data.qrCodeUrl);
                        setShow2FAPopup(false); // Close the 2FA activation popup
                        setShowQRCodeModal(true); // Show the QR code modal
                      } catch (error) {
                        console.error('Error enabling 2FA:', error);
                        alert('Failed to enable 2FA. Please try again.');
                      }
                    }}
                  >
                    Enable 2FA
                  </button>
                  <button
                    type="button"
                    className="btn btn-lg btn-linear-secondary w-100"
                    onClick={handleSkip2FA}
                  >
                    Skip for Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {showEmailConfirmation && (
  <div className="modal fade show" id="email-confirmation-modal" tabIndex={-1} style={{ display: 'block' }} aria-hidden="true">
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-header d-flex align-items-center justify-content-end pb-0 border-0">
          <Link to="#" onClick={() => setShowEmailConfirmation(false)} aria-label="Close">
            <i className="ti ti-circle-x-filled fs-20" />
          </Link>
        </div>
        <div className="modal-body p-4">
          <div className="text-center">
            <span className="success-check mb-3 mx-auto" style={{
              display: 'inline-block',
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              backgroundColor: '#28a745',
              color: 'white',
              fontSize: '24px',
              lineHeight: '50px',
              textAlign: 'center'
            }}>
              <i className="ti ti-check" />
            </span>
            <h4 className="mb-2">Check Your Email</h4>
            <p>We have sent a confirmation email to your address. Please check your inbox.</p>
            <div>
            <button
              type="button"
              className="btn btn-lg btn-linear-primary w-100"
              onClick={() => {
                setShowEmailConfirmation(false); // Fermer la pop-up
                const loginModal = document.getElementById('login-modal');
                if (loginModal) {
                  const bsLoginModal = new Modal(loginModal);
                  bsLoginModal.show(); // Ouvrir le modal de login
                }
              }}
            >
              OK
            </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
      {/* QR Code Modal */}
      {showQRCodeModal && (
        <div className="modal fade show" id="qr-code-modal" tabIndex={-1} style={{ display: 'block' }} aria-hidden="true">
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
                  <button type="button" className="btn btn-lg btn-linear-primary w-100" onClick={handleVerify2FA}>
                    Verify 2FA Code
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OTP Modal */}
      <div className="modal fade" id="otp-modal" tabIndex={-1} data-bs-backdrop="static" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header d-flex align-items-center justify-content-end pb-0 border-0">
              <Link to="#" onClick={googleLogin} className="btn btn-light flex-fill d-flex align-items-center justify-content-center me-3">
                <i className="ti ti-circle-x-filled fs-20" />
              </Link>
            </div>
            <div className="modal-body p-4">
              <form>
                <div className="text-center mb-3">
                  <h3 className="mb-2">OTP Verification</h3>
                  <p>Enter the OTP sent to your email</p>
                </div>
                <div className="mb-3">
                  <label className="form-label">OTP Code</label>
                  <InputOtp integerOnly length={6} />
                </div>
                <div className="mb-3">
                  <button type="button" className="btn btn-lg btn-linear-primary w-100" onClick={handleVerify2FA}>
                    Verify OTP
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      <div className="modal fade" id="login-modal" tabIndex={-1} data-bs-backdrop="static" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header d-flex align-items-center justify-content-end pb-0 border-0">
              <Link to="#" data-bs-dismiss="modal" aria-label="Close">
                <i className="ti ti-circle-x-filled fs-20" />
              </Link>
            </div>
            <div className="modal-body p-4">
              <form onSubmit={handleLogin}>
                <div className="text-center mb-3">
                  <h3 className="mb-2">Welcome</h3>
                  <p>Enter your credentials to access your account</p>
                </div>
                {registrationSuccess && <div className="alert alert-success">{successMessage}</div>}
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      validateEmail(e.target.value);
                    }}
                    required
                  />
                </div>
                <div className="mb-3">
                  <div className="d-flex align-items-center justify-content-between flex-wrap">
                    <label className="form-label">Password</label>
                    <Link to="#" className="text-primary fw-medium text-decoration-underline mb-1 fs-14" data-bs-toggle="modal" data-bs-target="#forgot-modal">
                      Forgot Password?
                    </Link>
                  </div>
                  <div className="input-group">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="mb-3">
                  <div className="d-flex align-items-center justify-content-between flex-wrap row-gap-2">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" defaultValue="" id="remembers_me" />
                      <label className="form-check-label" htmlFor="remembers_me">
                        Remember Me
                      </label>
                    </div>
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" defaultValue="" id="otp_signin" />
                      <label className="form-check-label" htmlFor="otp_signin">
                        Sign in with OTP
                      </label>
                    </div>
                  </div>
                </div>
                <div className="mb-3">
                  <button type="submit" className="btn btn-lg btn-linear-primary w-100" >
                    Sign In
                  </button>
                </div>
                <div className="login-or mb-3">
                  <span className="span-or">Or sign in with </span>
                </div>
                <div className="d-flex align-items-center mb-3">
                  <Link to="#" className="btn btn-light flex-fill d-flex align-items-center justify-content-center me-3" onClick={googleLogin}>
                    <ImageWithBasePath src="assets/img/icons/google-icon.svg" className="me-2" alt="Img" />
                    Google
                  </Link>
                  <Link to="#" className="btn btn-light flex-fill d-flex align-items-center justify-content-center">
                    <ImageWithBasePath src="assets/img/icons/fb-icon.svg" className="me-2" alt="Img" />
                    Facebook
                  </Link>
                </div>
                <div className="d-flex justify-content-center">
                  <p>
                    Don’t have an account?{' '}
                    <Link to="#" className="text-primary" data-bs-toggle="modal" data-bs-target="#register-modal">
                      Join us Today
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Register Modal */}
      <div className="modal fade" id="register-modal" tabIndex={-1} data-bs-backdrop="static" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header d-flex align-items-center justify-content-end pb-0 border-0">
              <Link to="#" data-bs-dismiss="modal" aria-label="Close">
                <i className="ti ti-circle-x-filled fs-20" />
              </Link>
            </div>
            <div className="modal-body p-4">
              <form onSubmit={handleRegisterSubmit}>
                <div className="text-center mb-3">
                  <h3 className="mb-2">Registration</h3>
                  <p>Enter your credentials to access your account</p>
                </div>
                <div className="mb-3">
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={firstname}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={lastname}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Phone</label>
                  <input
                    type="tel"
                    className="form-control"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <div className="input-group">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="form-control"
                      value={password}
                      onChange={(e) => onChangePassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
               
                 
                  </div>
                </div>
                <PasswordValidationFeedback />
                {registerError && <div className="alert alert-danger">{registerError}</div>}
                <div className="mb-3">
                  <button type="submit" className="btn btn-lg btn-linear-primary w-100">
                    Register
                  </button>
                </div>
                <div className="d-flex justify-content-center">
                  <p>
                    Already have an account?{' '}
                    <Link to="#" className="text-primary" data-bs-toggle="modal" data-bs-target="#login-modal">
                      Sign In
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Modal */}
      <div className="modal fade" id="forgot-modal" tabIndex={-1} data-bs-backdrop="static" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header d-flex align-items-center justify-content-end pb-0 border-0">
              <Link to="#" data-bs-dismiss="modal" aria-label="Close">
                <i className="ti ti-circle-x-filled fs-20" />
              </Link>
            </div>
            <div className="modal-body p-4">
              <form onSubmit={handleForgotPasswordSubmit}>
                <div className="text-center mb-3">
                  <h3 className="mb-2">Forgot Password</h3>
                  <p>Please enter your email to receive a password reset link.</p>
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                  />
                </div>
                {forgotResponse && <div className="alert alert-info">{forgotResponse}</div>}
                <div className="mb-3">
                  <button type="submit" className="btn btn-lg btn-linear-primary w-100">
                    Send Reset Link
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Password Modal */}
      <div className="modal fade" id="reset-password" tabIndex={-1} data-bs-backdrop="static" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header d-flex align-items-center justify-content-end pb-0 border-0">
              <Link to="#" data-bs-dismiss="modal" aria-label="Close">
                <i className="ti ti-circle-x-filled fs-20" />
              </Link>
            </div>
            <div className="modal-body p-4">
              <div className="text-center mb-3">
                <h3 className="mb-2">Reset Password</h3>
                <p className="fs-14">Your new password must be different from previous used passwords.</p>
              </div>
              <form>
                <div className="mb-3">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => onChangePassword(e.target.value)}
                  />
                  {passwordResponse.passwordResponseKey && (
                    <small className="form-text text-muted">{passwordResponse.passwordResponseText}</small>
                  )}
                </div>
                <div className="mb-3">
                  <label className="form-label">Confirm Password</label>
                  <input type="password" className="form-control" />
                </div>
                <div>
                  <button type="button" className="btn btn-lg btn-linear-primary w-100" data-bs-toggle="modal" data-bs-target="#success-modal">
                    Save Change
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      <div className="modal fade" id="success-modal" tabIndex={-1} data-bs-backdrop="static" aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header d-flex align-items-center justify-content-end pb-0 border-0">
              <Link to="#" data-bs-dismiss="modal" aria-label="Close">
                <i className="ti ti-circle-x-filled fs-20" />
              </Link>
            </div>
            <div className="modal-body p-4">
              <div className="text-center">
                <span className="success-check mb-3 mx-auto">
                  <i className="ti ti-check" />
                </span>
                <h4 className="mb-2">Success</h4>
                <p>Your new password has been successfully saved</p>
                <div>
                  <button type="button" data-bs-dismiss="modal" className="btn btn-lg btn-linear-primary w-100">
                    Back to Sign In
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthModals;