import React, { useEffect, useState } from 'react'
import { Link , useNavigate} from 'react-router-dom'
import ImageWithBasePath from '../../../../core/img/ImageWithBasePath'
import { InputOtp } from 'primereact/inputotp';
import {register, login } from '../../../../services/authService';
import  { Modal } from 'bootstrap';


const AuthModals = () => {
  const [error, setError] = useState("");
  const [firstname, setFirstName] = useState('')
  const [lastname, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [passwordResponce, setPasswordResponce] = useState({
    passwordResponceText: 'Use 8 or more characters with a mix of letters, numbers, and symbols.',
    passwordResponceKey: ''
  })

  const [registrationSuccess, setRegistrationSuccess] = useState(false);
const [successMessage, setSuccessMessage] = useState('');

  const [registerError, setRegisterError] = useState('')
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotResponse, setForgotResponse] = useState('');

  const navigate = useNavigate() // Using react-router's useNavigate for redirection

  const onChangePassword = (password: string) => {
    setPassword(password)
    if (password.match(/^$|\s+/)) {
      setPasswordResponce({
        passwordResponceText: 'Whitespaces are not allowed',
        passwordResponceKey: ''
      })
    } else if (password.length === 0) {
      setPasswordResponce({
        passwordResponceText: '',
        passwordResponceKey: ''
      })
    } else if (password.length < 8) {
      setPasswordResponce({
        passwordResponceText: 'Weak. Must contain at least 8 characters',
        passwordResponceKey: '0'
      })
    } else if (
      password.search(/[a-z]/) < 0 ||
      password.search(/[A-Z]/) < 0 ||
      password.search(/[0-9]/) < 0
    ) {
      setPasswordResponce({
        passwordResponceText: 'Average. Must contain at least 1 upper case and number',
        passwordResponceKey: '1'
      })
    } else if (password.search(/(?=.*?[#?!@$%^&*-])/) < 0) {
      setPasswordResponce({
        passwordResponceText: 'Almost. Must contain a special symbol',
        passwordResponceKey: '2'
      })
    } else {
      setPasswordResponce({
        passwordResponceText: 'Awesome! You have a secure password.',
        passwordResponceKey: '3'
      })
    }
  }


  
  const [emailError, setEmailError] = useState('');
 
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  const validateEmail = (email: string) => {
    if (!email) {
      setEmailError("Email is required");
    } else if (!emailRegex.test(email)) {
      setEmailError("Invalid email format");
    } else {
      setEmailError('');
    }
  };
  
   
  const handleRegisterSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
  
    const userData = { firstname, lastname, email, phone, password };
  
    try {
      const data = await register(userData);
      console.log('Registration successful:', data);
  
      // Set registration success state
      setRegistrationSuccess(true);
      setSuccessMessage('Registration successful! Please log in.');
  
      // Close the registration modal
      const registerModal = document.getElementById('register-modal');
      if (registerModal) {
        const bsRegisterModal = Modal.getInstance(registerModal);
        bsRegisterModal?.hide();
      }
  
      // Show the login modal
      const loginModal = document.getElementById('login-modal');
      if (loginModal) {
        const bsLoginModal = new Modal(loginModal);
        bsLoginModal.show();
      }
    } catch (error: any) {
      console.error('Error during registration:', error);
      setRegisterError(error.message);
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

  const [user, setUser] = useState<{ email: string } | null>(null);

useEffect(() => {
  // Retrieve user data from localStorage
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    setUser(JSON.parse(storedUser));
  }
}, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email and password before submitting
    validateEmail(email);

    if (emailError || password.length < 8) {
      return;
    }

    try {
      const data = await login(email, password);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
    

      // Close the modal
      const modal = document.getElementById("login-modal");
      if (modal) {
        const bsModal = Modal.getInstance(modal);
        bsModal?.hide();
      }

      // Ensure modal backdrop is removed
      document.querySelectorAll(".modal-backdrop").forEach(backdrop => backdrop.remove());
      document.body.classList.remove("modal-open");

  const role = data.user?.role || "user"; // Default to 'user' if undefined
  localStorage.setItem("role", role);


  setTimeout(() => {
    if (role === "user") {
      navigate("/provider/dashboard");
    } else {
      navigate("/admin/dashboard");
    }}, 100); // Small delay to ensure localStorage is set

} catch (err: any) {
  setError(err);
}};
 const handleForgotPasswordSubmit = async (event:any) => {
    event.preventDefault(); // Empêche la soumission par défaut du formulaire
    try {
      const response = await fetch('http://localhost:4000/api/auth/request-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: forgotEmail }), // Envoyer l'email
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      setForgotResponse(data.message); // Message de succès ou d'erreur
    } catch (error) {
      console.error('Error during password reset request:', error);
      setForgotResponse('Failed to send password reset email. Please try again.');
    }
  };
  

  return (
    <>
  {/* Login Modal */}
  <div
    className="modal fade"
    id="login-modal"
    tabIndex={-1}
    data-bs-backdrop="static"
    aria-hidden="true"
  >
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-header d-flex align-items-center justify-content-end pb-0 border-0">
          <Link
            to="#"
            data-bs-dismiss="modal"
            aria-label="Close"
          >
            <i className="ti ti-circle-x-filled fs-20" />
          </Link>
        </div>
        <div className="modal-body p-4">
          <form onSubmit={handleLogin}>
            <div className="text-center mb-3">
              <h3 className="mb-2">Welcome</h3>
              <p>Enter your credentials to access your account</p>
            </div>
        
          {registrationSuccess && (
            <div className="alert alert-success">{successMessage}</div>
          )}
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
                  {emailError && <small className="form-text text-muted">{emailError}</small>}
            </div>
            <div className="mb-3">
              <div className="d-flex align-items-center justify-content-between flex-wrap">
                <label className="form-label">Password</label>
                <Link
                  to="#"
                  className="text-primary fw-medium text-decoration-underline mb-1 fs-14"
                  data-bs-toggle="modal"
                  data-bs-target="#forgot-modal"
                >
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
                  <input
                    className="form-check-input"
                    type="checkbox"
                    defaultValue=""
                    id="remembers_me"
                  />
                  <label className="form-check-label" htmlFor="remembers_me">
                    Remember Me
                  </label>
                </div>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    defaultValue=""
                    id="otp_signin"
                  />
                  <label className="form-check-label" htmlFor="otp_signin">
                    Sign in with OTP
                  </label>
                </div>
              </div>
            </div>
            <div className="mb-3">
              <button
                type="submit"
              
                className="btn btn-lg btn-linear-primary w-100"
              >
                Sign In
              </button>
            </div>
            <div className="login-or mb-3">
              <span className="span-or">Or sign in with </span>
            </div>
            <div className="d-flex align-items-center mb-3">
              <Link
                to="#"
                className="btn btn-light flex-fill d-flex align-items-center justify-content-center me-3"
              >
                <ImageWithBasePath
                  src="assets/img/icons/google-icon.svg"
                  className="me-2"
                  alt="Img"
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
                  alt="Img"
                />
                Facebook
              </Link>
            </div>
            <div className="d-flex justify-content-center">
              <p>
                Don’t have a account?{" "}
                <Link
                  to="#"
                  className="text-primary"
                  data-bs-toggle="modal"
                  data-bs-target="#register-modal"
                >
                  {" "}
                  Join us Today
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
  {/* /Login Modal */}
  {/* Register Modal */}
  <div
        className="modal fade"
        id="register-modal"
        tabIndex={-1}
        data-bs-backdrop="static"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header d-flex align-items-center justify-content-end pb-0 border-0">
              <Link
                to="#"
                data-bs-dismiss="modal"
                aria-label="Close"
              >
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
                  {passwordResponce.passwordResponceKey && (
                    <small className="form-text text-muted">
                      {passwordResponce.passwordResponceText}
                    </small>
                  )}
                </div>
                {registerError && (
                  <div className="alert alert-danger">{registerError}</div>
                )}
                <div className="mb-3">
                  <button type="submit" className="btn btn-lg btn-linear-primary w-100">
                    Register
                  </button>
                </div>
                <div className="d-flex justify-content-center">
                  <p>
                    Already have an account?{" "}
                    <Link
                      to="#"
                      className="text-primary"
                      data-bs-toggle="modal"
                      data-bs-target="#login-modal"
                    >
                      Sign In
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

  {/* /Register Modal */}
  {/* Forgot Modal */}
<div
  className="modal fade"
  id="forgot-modal"
  tabIndex={-1}
  data-bs-backdrop="static"
  aria-hidden="true"
>
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
          {forgotResponse && (
            <div className="alert alert-info">{forgotResponse}</div>
          )}
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
{/* /Forgot Modal */}

  {/* Email otp Modal */}
  <div
    className="modal fade"
    id="otp-email-modal"
    tabIndex={-1}
    data-bs-backdrop="static"
    aria-hidden="true"
  >
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-header d-flex align-items-center justify-content-end pb-0 border-0">
          <Link
            to="#"
            data-bs-dismiss="modal"
            aria-label="Close"
          >
            <i className="ti ti-circle-x-filled fs-20" />
          </Link>
        </div>
        <div className="modal-body p-4">
          <form action="#" className="digit-group">
            <div className="text-center mb-3">
              <h3 className="mb-2">Email OTP Verification</h3>
              <p className="fs-14">
                OTP sent to your Email Address ending ******doe@example.com
              </p>
            </div>
            <div className="text-center otp-input">
              <div className="d-flex align-items-center justify-content-center mb-3">
              
              </div>
              <div>
                <div className="badge bg-danger-transparent mb-3">
                  <p className="d-flex align-items-center ">
                    <i className="ti ti-clock me-1" />
                    09:59
                  </p>
                </div>
                <div className="mb-3 d-flex justify-content-center">
                  <p>
                    Didn&apos;t get the OTP?{" "}
                    <Link to="#" className="text-primary">
                      Resend OTP
                    </Link>
                  </p>
                </div>
                <div>
                  <button
                    type="button"
                    className="btn btn-lg btn-linear-primary w-100"
                    data-bs-toggle="modal"
                    data-bs-target="#otp-phone-modal"
                  >
                    Verify &amp; Proceed
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
  {/* /Email otp Modal */}
  {/* Phone otp Modal */}
  <div
    className="modal fade"
    id="otp-phone-modal"
    tabIndex={-1}
    data-bs-backdrop="static"
    aria-hidden="true"
  >
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-header d-flex align-items-center justify-content-end pb-0 border-0">
          <Link
            to="#"
            data-bs-dismiss="modal"
            aria-label="Close"
          >
            <i className="ti ti-circle-x-filled fs-20" />
          </Link>
        </div>
        <div className="modal-body p-4">
          <form action="#" className="digit-group">
            <div className="text-center mb-3">
              <h3 className="mb-2">Phone OTP Verification</h3>
              <p>OTP sent to your mobile number ending&nbsp;******9575</p>
            </div>
            <div className="text-center otp-input">
              <div className="d-flex align-items-center justify-content-center mb-3">
              
              </div>
              <div>
                <div className="badge bg-danger-transparent mb-3">
                  <p className="d-flex align-items-center ">
                    <i className="ti ti-clock me-1" />
                    09:59
                  </p>
                </div>
                <div className="mb-3 d-flex justify-content-center">
                  <p>
                    Didn&apos;t get the OTP?{" "}
                    <Link to="#" className="text-primary">
                      Resend OTP
                    </Link>
                  </p>
                </div>
                <div>
                  <button
                    type="button"
                    className="btn btn-lg btn-linear-primary w-100"
                    data-bs-toggle="modal"
                    data-bs-target="#reset-password"
                  >
                    Verify &amp; Proceed
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
  {/* /Phone otp Modal */}
  {/* Reset password Modal */}
  <div
    className="modal fade"
    id="reset-password"
    tabIndex={-1}
    data-bs-backdrop="static"
    aria-hidden="true"
  >
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-header d-flex align-items-center justify-content-end pb-0 border-0">
          <Link
            to="#"
            data-bs-dismiss="modal"
            aria-label="Close"
          >
            <i className="ti ti-circle-x-filled fs-20" />
          </Link>
        </div>
        <div className="modal-body p-4">
          <div className="text-center mb-3">
            <h3 className="mb-2">Reset Password</h3>
            <p className="fs-14">
              Your new password must be different from previous used passwords.
            </p>
          </div>
          <form action="#">
            <div className="input-block mb-3">
              <div className="mb-3">
                <label className="form-label">New Password</label>
                <div className="pass-group" id="passwordInput">
                  <input type="password" value={password} onChange={(e) => onChangePassword(e.target.value)} className="form-control pass-input" />
                </div>
              </div>
              <div
                      className={`password-strength d-flex ${
                        passwordResponce.passwordResponceKey === '0'
                          ? 'poor-active'
                          : passwordResponce.passwordResponceKey === '1'
                          ? 'avg-active'
                          : passwordResponce.passwordResponceKey === '2'
                          ? 'strong-active'
                          : passwordResponce.passwordResponceKey === '3'
                          ? 'heavy-active'
                          : ''
                      }`}
                      id="passwordStrength"
                    >
                      <span id="poor" className="active" />
                      <span id="weak" className="active" />
                      <span id="strong" className="active" />
                      <span id="heavy" className="active" />
                    </div>
              <div id="passwordInfo" className="mb-2" />
              <p className="fs-12">
              {passwordResponce.passwordResponceText}
              </p>
            </div>
            <div className="mb-3">
              <div className="d-flex align-items-center justify-content-between flex-wrap">
                <label className="form-label">Confirm Password</label>
              </div>
              <input type="password" className="form-control" />
            </div>
            <div>
              <button
                type="button"
                className="btn btn-lg btn-linear-primary w-100"
                data-bs-toggle="modal"
                data-bs-target="#success_modal"
              >
                Save Change
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
  {/* /Reset password Modal */}
  {/* success message Modal */}
  <div
    className="modal fade"
    id="success-modal"
    tabIndex={-1}
    data-bs-backdrop="static"
    aria-hidden="true"
  >
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">
        <div className="modal-header d-flex align-items-center justify-content-end pb-0 border-0">
          <Link
            to="#"
            data-bs-dismiss="modal"
            aria-label="Close"
          >
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
              <button
                type="button"
                data-bs-dismiss="modal"
                className="btn btn-lg btn-linear-primary w-100"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  {/* /success message Modal */}
</>

  )
}

export default AuthModals