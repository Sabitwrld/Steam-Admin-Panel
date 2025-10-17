import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const LoginPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await axiosInstance.post('/auth/login', {
        email: data.email,
        password: data.password,
      });

      if (response.status === 200) {
        const { user, token } = response.data;
        if (user.roles && user.roles.includes('Admin')) {
          localStorage.setItem('authToken', token);
          navigate('/dashboard');
        } else {
          setErrorMessage('Access denied. Admin role required.');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMsg = error.response?.data?.message || 'Invalid email or password.';
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gradient-primary" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-10 col-lg-12 col-md-9">
            <div className="card o-hidden border-0 shadow-lg my-5">
              <div className="card-body p-0">
                <div className="row">
                  <div className="col-lg-6 d-none d-lg-block bg-login-image"></div>
                  <div className="col-lg-6">
                    <div className="p-5">
                      <div className="text-center">
                        <h1 className="h4 text-gray-900 mb-4">Welcome Back!</h1>
                      </div>
                      {errorMessage && (
                        <div className="alert alert-danger text-center">{errorMessage}</div>
                      )}
                      <form className="user" onSubmit={handleSubmit(onSubmit)}>
                        <div className="form-group">
                          <input
                            type="email"
                            className={`form-control form-control-user ${errors.email ? 'is-invalid' : ''}`}
                            placeholder="Enter Email Address..."
                            {...register('email', {
                              required: 'Email is required',
                              pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: 'Invalid email address',
                              },
                            })}
                          />
                           {errors.email && <div className="invalid-feedback text-center small">{errors.email.message}</div>}
                        </div>
                        <div className="form-group">
                          <input
                            type="password"
                            className={`form-control form-control-user ${errors.password ? 'is-invalid' : ''}`}
                            placeholder="Password"
                            {...register('password', {
                              required: 'Password is required',
                            })}
                          />
                           {errors.password && <div className="invalid-feedback text-center small">{errors.password.message}</div>}
                        </div>
                        <div className="form-group">
                          <div className="custom-control custom-checkbox small">
                            <input type="checkbox" className="custom-control-input" id="customCheck" />
                            <label className="custom-control-label" htmlFor="customCheck">Remember Me</label>
                          </div>
                        </div>
                        <button type="submit" className="btn btn-primary btn-user btn-block" disabled={isLoading}>
                          {isLoading ? 'Logging in...' : 'Login'}
                        </button>
                        <hr />
                        {/* --- DƏYİŞİKLİK BURADADIR --- */}
                        <a href="#" className="btn btn-google btn-user btn-block">
                          <i className="fab fa-google fa-fw"></i> Login with Google
                        </a>
                        <a href="#" className="btn btn-facebook btn-user btn-block">
                          <i className="fab fa-facebook-f fa-fw"></i> Login with Facebook
                        </a>
                      </form>
                      <hr />
                      <div className="text-center">
                        <a className="small" href="#">Forgot Password?</a>
                      </div>
                      <div className="text-center">
                        <a className="small" href="#">Create an Account!</a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;