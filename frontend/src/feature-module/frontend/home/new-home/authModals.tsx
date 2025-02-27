import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ImageWithBasePath from '../../../../core/img/ImageWithBasePath';
import { InputOtp } from 'primereact/inputotp';
import { useGoogleLogin } from '@react-oauth/google';
import { googleAuth } from '../../../../api';
import axios, { AxiosError } from 'axios';
import { register, login } from '../../../../services/authService';
import { Modal } from 'bootstrap';

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
  const navigate = useNavigate();

  const responseGoogle = async (authResult: any) => {
    try {
      if (authResult.code) {
        const result = await googleAuth(authResult.code);
        const { email, name, image } = result.data.user;
        const token = result.data.token;
        const userInfo = { email, name, image, token };
        localStorage.setItem('user-info', JSON.stringify(userInfo));

        const modal = document.getElementById('login-modal');
        if (modal) {
          const bsModal = Modal.getInstance(modal);
          bsModal?.hide();
        }

        document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
        document.body.classList.remove('modal-open');
        navigate('/providers/dashboard');
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
    } else if (password.length < 8) {
      setPasswordResponse({
        passwordResponseText: 'Weak. Must contain at least 8 characters',
        passwordResponseKey: '0',
      });
    } else if (password.search(/[a-z]/) < 0 || password.search(/[A-Z]/) < 0 || password.search(/[0-9]/) < 0) {
      setPasswordResponse({
        passwordResponseText: 'Average. Must contain at least 1 upper case and number',
        passwordResponseKey: '1',
      });
    } else if (password.search(/(?=.*?[#?!@$%^&*-])/) < 0) {
      setPasswordResponse({
        passwordResponseText: 'Almost. Must contain a special symbol',
        passwordResponseKey: '2',
      });
    } else {
      setPasswordResponse({
        passwordResponseText: 'Awesome! You have a secure password.',
        passwordResponseKey: '3',
      });
    }
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
    const userData = { firstname, lastname, email, phone, password };

    try {
      const response = await register(userData);
      setRegistrationSuccess(true);
      setSuccessMessage('Registration successful! Please log in.');
      setQrCodeUrl(response.qrCode);
      setShowQRCodeModal(true);

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

    if (error || password.length < 8) {
      return;
    }

    try {
      const data = await login(email, password);
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
        navigate(role === 'user' ? '/provider/dashboard' : '/admin/dashboard');
      }, 100);
    } catch (error: any) {
      setError(error.message);
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

  return (
    <>
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
                  {error && <small className="form-text text-muted">{error}</small>}
                </div>
                <div className="mb-3">
                  <div className="d-flex align-items-center justify-content-between flex-wrap">
                    <label className="form-label">Password</label>
                    <Link to="#" className="text-primary fw-medium text-decoration-underline mb-1 fs-14" data-bs-toggle="modal" data-bs-target="#forgot-modal">
                      Forgot Password?
                    </Link>
                  </div>
                  <input
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => onChangePassword(e.target.value)}
                    required
                  />
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