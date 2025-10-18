import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';

const ResetPassword = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    
    const location = useLocation();
    const [token, setToken] = useState('');
    const [email, setEmail] = useState('');

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const tokenFromUrl = queryParams.get('token');
        const emailFromUrl = queryParams.get('email');
        if (tokenFromUrl && emailFromUrl) {
            setToken(tokenFromUrl);
            setEmail(emailFromUrl);
        } else {
            setIsError(true);
            setMessage('Invalid password reset link. Token or email is missing.');
        }
    }, [location]);

    const onSubmit = async (data) => {
        if (!token || !email) return;

        setIsLoading(true);
        setMessage('');
        setIsError(false);
        try {
            await axiosInstance.post('/auth/reset-password', { ...data, email, token });
            setMessage('Your password has been reset successfully! You can now log in.');
            setTimeout(() => navigate('/login'), 3000);
        } catch (error) {
            setIsError(true);
            setMessage(error.response?.data?.message || 'Failed to reset password. The link may have expired.');
        } finally {
            setIsLoading(false);
        }
    };

    const password = watch('password');

    return (
        <div className="bg-gradient-primary" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center' }}>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-xl-6 col-lg-8 col-md-9">
                        <div className="card o-hidden border-0 shadow-lg my-5">
                            <div className="card-body p-0">
                                <div className="p-5">
                                    <div className="text-center">
                                        <h1 className="h4 text-gray-900 mb-4">Reset Your Password</h1>
                                    </div>
                                    {message && (
                                        <div className={`alert ${isError ? 'alert-danger' : 'alert-success'} text-center`}>
                                            {message}
                                        </div>
                                    )}
                                    <form className="user" onSubmit={handleSubmit(onSubmit)}>
                                        <div className="form-group">
                                            <input
                                                type="password"
                                                className={`form-control form-control-user ${errors.password ? 'is-invalid' : ''}`}
                                                placeholder="New Password"
                                                {...register('password', { required: 'New password is required' })}
                                            />
                                            {errors.password && <div className="text-danger small mt-1">{errors.password.message}</div>}
                                        </div>
                                        <div className="form-group">
                                            <input
                                                type="password"
                                                className={`form-control form-control-user ${errors.confirmPassword ? 'is-invalid' : ''}`}
                                                placeholder="Confirm New Password"
                                                {...register('confirmPassword', {
                                                    required: 'Please confirm your password',
                                                    validate: value => value === password || 'Passwords do not match'
                                                })}
                                            />
                                            {errors.confirmPassword && <div className="text-danger small mt-1">{errors.confirmPassword.message}</div>}
                                        </div>
                                        <button type="submit" className="btn btn-primary btn-user btn-block" disabled={isLoading || !token || !email}>
                                            {isLoading ? 'Resetting...' : 'Reset Password'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;