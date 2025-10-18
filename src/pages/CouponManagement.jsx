import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useForm } from 'react-hook-form';

const CouponManagement = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentCoupon, setCurrentCoupon] = useState(null);

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

    const fetchCoupons = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/coupons');
            setCoupons(response.data.data || []);
            setError('');
        } catch (err) {
            setError('Failed to fetch coupons.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    const handleShowModal = (coupon = null) => {
        reset();
        if (coupon) {
            setIsEditing(true);
            setCurrentCoupon(coupon);
            setValue('code', coupon.code);
            setValue('discountAmount', coupon.discountAmount);
            setValue('expiryDate', new Date(coupon.expiryDate).toISOString().slice(0, 16));
            setValue('isActive', coupon.isActive);
        } else {
            setIsEditing(false);
            setCurrentCoupon(null);
            setValue('isActive', true); // Default to active for new coupons
        }
        setShowModal(true);
    };

    const handleCloseModal = () => setShowModal(false);

    const onSubmit = async (data) => {
        const payload = {
            ...data,
            discountAmount: parseFloat(data.discountAmount),
            expiryDate: new Date(data.expiryDate).toISOString()
        };

        try {
            if (isEditing) {
                await axiosInstance.put(`/coupons/${currentCoupon.id}`, { id: currentCoupon.id, ...payload });
            } else {
                await axiosInstance.post('/coupons', payload);
            }
            fetchCoupons();
            handleCloseModal();
        } catch (err) {
            console.error('Failed to save coupon:', err);
            setError(`Failed to ${isEditing ? 'update' : 'add'} coupon.`);
        }
    };
    
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this coupon?')) {
            try {
                await axiosInstance.delete(`/coupons/${id}`);
                fetchCoupons();
            } catch (err) {
                console.error('Failed to delete coupon:', err);
                setError('Failed to delete coupon.');
            }
        }
    };

    return (
        <div>
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <h1 className="h3 mb-0 text-gray-800">Coupon Management</h1>
                <button className="btn btn-primary btn-sm" onClick={() => handleShowModal()}>
                    <i className="fas fa-plus fa-sm text-white-50"></i> Add New Coupon
                </button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="card shadow mb-4">
                <div className="card-header py-3">
                    <h6 className="m-0 font-weight-bold text-primary">Coupons List</h6>
                </div>
                <div className="card-body">
                    <div className="table-responsive">
                        {loading ? <p>Loading...</p> : (
                            <table className="table table-bordered" width="100%" cellSpacing="0">
                                <thead>
                                    <tr>
                                        <th>Code</th>
                                        <th>Discount</th>
                                        <th>Expiry Date</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {coupons.map(coupon => (
                                        <tr key={coupon.id}>
                                            <td>{coupon.code}</td>
                                            <td>{coupon.discountAmount}</td>
                                            <td>{new Date(coupon.expiryDate).toLocaleString()}</td>
                                            <td>
                                                {coupon.isActive 
                                                    ? <span className="badge badge-success">Active</span> 
                                                    : <span className="badge badge-danger">Inactive</span>}
                                            </td>
                                            <td>
                                                <button className="btn btn-warning btn-sm mr-2" onClick={() => handleShowModal(coupon)}>
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(coupon.id)}>
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal */}
            <div className={`modal fade ${showModal ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">{isEditing ? 'Edit Coupon' : 'Add Coupon'}</h5>
                            <button type="button" className="close" onClick={handleCloseModal}><span>&times;</span></button>
                        </div>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Code</label>
                                    <input type="text" className={`form-control ${errors.code ? 'is-invalid' : ''}`} {...register('code', { required: 'Code is required' })} />
                                    {errors.code && <div className="invalid-feedback">{errors.code.message}</div>}
                                </div>
                                <div className="form-row">
                                    <div className="form-group col-md-6">
                                        <label>Discount Amount</label>
                                        <input type="number" step="0.01" className={`form-control ${errors.discountAmount ? 'is-invalid' : ''}`} {...register('discountAmount', { required: 'Amount is required', valueAsNumber: true, min: 0 })} />
                                        {errors.discountAmount && <div className="invalid-feedback">{errors.discountAmount.message}</div>}
                                    </div>
                                    <div className="form-group col-md-6">
                                        <label>Expiry Date</label>
                                        <input type="datetime-local" className={`form-control ${errors.expiryDate ? 'is-invalid' : ''}`} {...register('expiryDate', { required: 'Expiry date is required' })} />
                                        {errors.expiryDate && <div className="invalid-feedback">{errors.expiryDate.message}</div>}
                                    </div>
                                </div>
                                <div className="form-group">
                                    <div className="custom-control custom-switch">
                                        <input type="checkbox" className="custom-control-input" id="isActiveSwitch" {...register('isActive')} />
                                        <label className="custom-control-label" htmlFor="isActiveSwitch">Is Active</label>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Close</button>
                                <button type="submit" className="btn btn-primary">Save changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CouponManagement;