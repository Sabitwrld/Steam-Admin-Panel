import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { GoogleLogin } from '@react-oauth/google';

const LoginPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const handleBackendLogin = async (token) => {
    localStorage.setItem('authToken', token);
    // Tokeni yoxlamaq üçün kiçik bir sorğu göndərə bilərik və ya birbaşa yönləndirə bilərik.
    // Təhlükəsizlik üçün istifadəçi məlumatlarını alıb rolu yoxlamaq daha yaxşıdır.
    try {
        const response = await axiosInstance.get('/auth/me'); // Backend-də belə bir endpoint olmalıdır.
        if (response.data.roles && response.data.roles.includes('Admin')) {
            navigate('/dashboard');
        } else {
             setErrorMessage('Access denied. Admin role required.');
             localStorage.removeItem('authToken');
        }
    } catch(e) {
        setErrorMessage('Failed to verify user role.');
        localStorage.removeItem('authToken');
    }
  };


  const onSubmit = async (data) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const response = await axiosInstance.post('/auth/login', data);
      if (response.status === 200 && response.data.token) {
        handleBackendLogin(response.data.token);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Invalid email or password.';
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGoogleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
        const response = await axiosInstance.post('/auth/externallogin', {
            provider: 'Google',
            idToken: credentialResponse.credential,
        });
        if (response.status === 200 && response.data.token) {
            handleBackendLogin(response.data.token);
        }
    } catch (error) {
        const errorMsg = error.response?.data?.message || 'Google login failed.';
        setErrorMessage(errorMsg);
    } finally {
        setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setErrorMessage('Google login failed. Please try again.');
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
                        <div className="alert alert-danger text-center small p-2 mb-3">{errorMessage}</div>
                      )}
                      <form className="user" onSubmit={handleSubmit(onSubmit)}>
                        <div className="form-group">
                          <input
                            type="email"
                            className={`form-control form-control-user ${errors.email ? 'is-invalid' : ''}`}
                            placeholder="Enter Email Address..."
                            {...register('email', { required: 'Email is required' })}
                          />
                        </div>
                        <div className="form-group">
                          <input
                            type="password"
                            className={`form-control form-control-user ${errors.password ? 'is-invalid' : ''}`}
                            placeholder="Password"
                            {...register('password', { required: 'Password is required' })}
                          />
                        </div>
                        <button type="submit" className="btn btn-primary btn-user btn-block" disabled={isLoading}>
                          {isLoading ? 'Logging in...' : 'Login'}
                        </button>
                        <hr />
                         <div className="d-flex justify-content-center">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={handleGoogleError}
                                useOneTap
                            />
                         </div>
                      </form>
                      <hr />
                      <div className="text-center">
                        <Link className="small" to="/forgot-password">Forgot Password?</Link>
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