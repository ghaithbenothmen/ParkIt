import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PagesAuthHeader from './common/header';
import AuthFooter from './common/footer';
import ImageWithBasePath from '../../../../core/img/ImageWithBasePath';

const EmailForgetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordResponse, setPasswordResponse] = useState({
    passwordResponseText: "Use 8 or more characters with a mix of letters, numbers, and symbols.",
    passwordResponseKey: '',
  });
  const [token, setToken] = useState('');

  // Récupérer le token depuis l'URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tokenFromUrl = queryParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    }
  }, [location]);

  const onChangePassword = (password) => {
    setPassword(password);
    if (password.match(/^$|\s+/)) {
      setPasswordResponse({
        passwordResponseText: 'Whitespaces are not allowed',
        passwordResponseKey: '',
      });
    } else if (password.length < 8) {
      setPasswordResponse({
        passwordResponseText: 'Weak. Must contain at least 8 characters',
        passwordResponseKey: '0',
      });
    } else if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      setPasswordResponse({
        passwordResponseText: 'Average. Must contain at least 1 uppercase letter and a number',
        passwordResponseKey: '1',
      });
    } else if (!/(?=.*?[#?!@$%^&*-])/.test(password)) {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/api/auth/reset-password?token=' + token, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: password }),
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message);
        navigate('/login');
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    }
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
                        <h3 className="mb-2">Reset Password</h3>
                        <p className="fs-14">
                          Your new password must be different from previously used passwords.
                        </p>
                      </div>
                      <div>
                        <div className="input-block mb-3">
                          <label className="form-label">New Password</label>
                          <input
                            type="password"
                            value={password}
                            onChange={(e) => onChangePassword(e.target.value)}
                            className="form-control"
                          />
                          <p className="fs-12">{passwordResponse.passwordResponseText}</p>
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Confirm Password</label>
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="form-control"
                          />
                        </div>
                        <div>
                          <button type="submit" className="btn btn-lg btn-linear-primary w-100">
                            Save Change
                          </button>
                        </div>
                      </div>
                      <ImageWithBasePath src="assets/img/bg/authentication-bg.png" className="bg-left-top" alt="Img" />
                      <ImageWithBasePath src="assets/img/bg/authentication-bg.png" className="bg-right-bottom" alt="Img" />
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <AuthFooter />
    </>
  );
};

export default EmailForgetPassword;
