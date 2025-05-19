import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react'; // Using lucide-react for icons
import ImageWithBasePath from '../../../../core/img/ImageWithBasePath';
import PagesAuthHeader from './common/header';
import { Link, useNavigate } from 'react-router-dom';
import { all_routes } from '../../../../core/data/routes/all_routes';
import AuthFooter from './common/footer';
import { login } from '../../../../services/authService';

const Login2 = () => {
  const routes = all_routes;
  const navigate = useNavigate();

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

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
      const role = data.user?.role || 'user';
      localStorage.setItem('role', role);

      setTimeout(() => {
        navigate(role === 'user' ? '/providers/dashboard' : '/admin/dashboard');
      }, 100);
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <>
      <PagesAuthHeader />
      <div className="main-wrapper">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-5 mx-auto">
              <form onSubmit={handleLogin}>
                <div className="d-flex flex-column justify-content-center">
                  <div className="card p-sm-4 my-5">
                    <div className="card-body">
                      <div className="text-center mb-3">
                        <h3 className="mb-2">Welcome</h3>
                        <p>Enter your credentials to access your account</p>
                      </div>
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
                          <Link
                            to={routes.forgotPassword}
                            className="text-primary fw-medium text-decoration-underline mb-1 fs-14"
                          >
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
                        <button
                          type="submit"
                          className="btn btn-lg btn-linear-primary w-100"
                        >
                          Sign In
                        </button>
                      </div>
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
              </form>
            </div>
          </div>
        </div>
      </div>
      <AuthFooter />
    </>
  );
};

export default Login2;
