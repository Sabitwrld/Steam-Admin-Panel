import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const ForgotPassword = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const { register, handleSubmit, formState: { errors } } = useForm();

    const onSubmit = async (data) => {
        setIsLoading(true);
        setMessage('');
        setIsError(false);
        try {
            await axiosInstance.post('/auth/forgot-password', { email: data.email });
            setMessage('If an account with that email exists, a password reset link has been sent.');
        } catch (error) {
            setIsError(true);
            setMessage(error.response?.data?.message || 'An error occurred. Please try again.');
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
                                    <div className="col-lg-6 d-none d-lg-block bg-password-image"></div>
                                    <div className="col-lg-6">
                                        <div className="p-5">
                                            <div className="text-center">
                                                <h1 className="h4 text-gray-900 mb-2">Forgot Your Password?</h1>
                                                <p className="mb-4">We get it, stuff happens. Just enter your email address below and we'll send you a link to reset your password!</p>
                                            </div>
                                            {message && (
                                                <div className={`alert ${isError ? 'alert-danger' : 'alert-success'} text-center small p-2 mb-3`}>
                                                    {message}
                                                </div>
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
                                                <button type="submit" className="btn btn-primary btn-user btn-block" disabled={isLoading}>
                                                    {isLoading ? 'Sending...' : 'Reset Password'}
                                                </button>
                                            </form>
                                            <hr />
                                            <div className="text-center">
                                                <Link className="small" to="/login">Already have an account? Login!</Link>
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

export default ForgotPassword;