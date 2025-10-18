import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useForm } from 'react-hook-form';

const VoucherManagement = () => {
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentVoucher, setCurrentVoucher] = useState(null);

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

    const fetchVouchers = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/vouchers');
            setVouchers(response.data.data || []);
            setError('');
        } catch (err) {
            setError('Failed to fetch vouchers.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVouchers();
    }, []);

    const handleShowModal = (voucher = null) => {
        reset();
        if (voucher) {
            setIsEditing(true);
            setCurrentVoucher(voucher);
            setValue('code', voucher.code);
            setValue('amount', voucher.amount);
            setValue('expiryDate', new Date(voucher.expiryDate).toISOString().slice(0, 16));
            setValue('isRedeemed', voucher.isRedeemed);
        } else {
            setIsEditing(false);
            setCurrentVoucher(null);
            setValue('isRedeemed', false); // Default
        }
        setShowModal(true);
    };

    const handleCloseModal = () => setShowModal(false);

    const onSubmit = async (data) => {
        const payload = {
            ...data,
            amount: parseFloat(data.amount),
            expiryDate: new Date(data.expiryDate).toISOString()
        };

        try {
            if (isEditing) {
                await axiosInstance.put(`/vouchers/${currentVoucher.id}`, { id: currentVoucher.id, ...payload });
            } else {
                await axiosInstance.post('/vouchers', payload);
            }
            fetchVouchers();
            handleCloseModal();
        } catch (err) {
            console.error('Failed to save voucher:', err);
            setError(`Failed to ${isEditing ? 'update' : 'add'} voucher.`);
        }
    };
    
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this voucher?')) {
            try {
                await axiosInstance.delete(`/vouchers/${id}`);
                fetchVouchers();
            } catch (err) {
                console.error('Failed to delete voucher:', err);
                setError('Failed to delete voucher.');
            }
        }
    };

    return (
        <div>
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <h1 className="h3 mb-0 text-gray-800">Voucher Management</h1>
                <button className="btn btn-primary btn-sm" onClick={() => handleShowModal()}>
                    <i className="fas fa-plus fa-sm text-white-50"></i> Add New Voucher
                </button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="card shadow mb-4">
                <div className="card-header py-3">
                    <h6 className="m-0 font-weight-bold text-primary">Vouchers List</h6>
                </div>
                <div className="card-body">
                    <div className="table-responsive">
                        {loading ? <p>Loading...</p> : (
                            <table className="table table-bordered" width="100%" cellSpacing="0">
                                <thead>
                                    <tr>
                                        <th>Code</th>
                                        <th>Amount</th>
                                        <th>Expiry Date</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {vouchers.map(voucher => (
                                        <tr key={voucher.id}>
                                            <td>{voucher.code}</td>
                                            <td>${voucher.amount.toFixed(2)}</td>
                                            <td>{new Date(voucher.expiryDate).toLocaleString()}</td>
                                            <td>
                                                {voucher.isRedeemed 
                                                    ? <span className="badge badge-secondary">Redeemed</span> 
                                                    : <span className="badge badge-primary">Available</span>}
                                            </td>
                                            <td>
                                                <button className="btn btn-warning btn-sm mr-2" onClick={() => handleShowModal(voucher)}>
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(voucher.id)}>
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
                            <h5 className="modal-title">{isEditing ? 'Edit Voucher' : 'Add Voucher'}</h5>
                            <button type="button" className="close" onClick={handleCloseModal}><span>&times;</span></button>
                        </div>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Code</label>
                                    <input type="text" className={`form-control ${errors.code ? 'is-invalid' : ''}`} {...register('code', { required: 'Code is required' })} />
                                </div>
                                <div className="form-row">
                                    <div className="form-group col-md-6">
                                        <label>Amount ($)</label>
                                        <input type="number" step="0.01" className={`form-control ${errors.amount ? 'is-invalid' : ''}`} {...register('amount', { required: 'Amount is required', valueAsNumber: true, min: 0 })} />
                                    </div>
                                    <div className="form-group col-md-6">
                                        <label>Expiry Date</label>
                                        <input type="datetime-local" className={`form-control ${errors.expiryDate ? 'is-invalid' : ''}`} {...register('expiryDate', { required: 'Expiry date is required' })} />
                                    </div>
                                </div>
                                {isEditing && ( // Only show this when editing
                                    <div className="form-group">
                                        <div className="custom-control custom-switch">
                                            <input type="checkbox" className="custom-control-input" id="isRedeemedSwitch" {...register('isRedeemed')} />
                                            <label className="custom-control-label" htmlFor="isRedeemedSwitch">Is Redeemed</label>
                                        </div>
                                    </div>
                                )}
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

export default VoucherManagement;