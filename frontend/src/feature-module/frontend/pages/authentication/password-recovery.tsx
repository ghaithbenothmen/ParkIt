import React, { useState } from 'react';
import PagesAuthHeader from './common/header';
import { Link, useNavigate } from 'react-router-dom';
import { all_routes } from '../../../../core/data/routes/all_routes';
import AuthFooter from './common/footer';
import ImageWithBasePath from '../../../../core/img/ImageWithBasePath';

const PasswordRecovery = () => {
  const routes = all_routes;
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleForgotPasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(''); // Reset any previous errors

    // Basic email validation
    if (!email || !email.trim()) {
      setError('Please enter an email address');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      // TODO: Replace with your actual API call to send password reset request
      const response = await fetch('http://localhost:4000/api/auth/request-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to send password reset request');
      }

      const data = await response.json();
      
      // Navigate to OTP page or show success message
      navigate(routes.phoneOtp);
    } catch (err) {
      setError('Failed to send password reset email. Please try again.');
      console.error('Password reset error:', err);
    }
  };

  return (
    <>
      <PagesAuthHeader />
      <div className="main-wrapper">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-5 mx-auto">
              <form onSubmit={handleForgotPasswordSubmit}>
                <div className="d-flex flex-column justify-content-center">
                  <div className="card p-sm-4 my-5">
                    <div className="card-body">
                      <div className="text-center mb-3">
                        <h3 className="mb-2">Forgot Password?</h3>
                        <p>
                          Enter your email, we will send you a OTP to reset your
                          password.
                        </p>
                      </div>
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
                      {error && (
                        <div className="alert alert-danger mb-3">
                          {error}
                        </div>
                      )}
                      <div className="mb-3">
                        <button
                          type="submit"
                          className="btn btn-lg btn-linear-primary w-100"
                        >
                          Submit
                        </button>
                      </div>
                      <div className="d-flex justify-content-center">
                        <p>
                          Remember Password?{" "}
                          <Link to={routes.login} className="text-primary">
                            Sign In
                          </Link>
                        </p>
                      </div>
                      <div>
                        <ImageWithBasePath
                          src="assets/img/bg/authentication-bg.png"
                          className="bg-left-top"
                          alt="Img"
                        />
                        <ImageWithBasePath
                          src="assets/img/bg/authentication-bg.png"
                          className="bg-right-bottom"
                          alt="Img"
                        />
                      </div>
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

export default PasswordRecovery;