import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useForm } from 'react-hook-form';

const CampaignManagement = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentCampaign, setCurrentCampaign] = useState(null);

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

    const fetchCampaigns = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/campaigns');
            setCampaigns(response.data.data || []);
            setError('');
        } catch (err) {
            setError('Failed to fetch campaigns.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const handleShowModal = (campaign = null) => {
        reset();
        if (campaign) {
            setIsEditing(true);
            setCurrentCampaign(campaign);
            setValue('name', campaign.name);
            setValue('description', campaign.description);
            setValue('discount', campaign.discount);
            setValue('startDate', new Date(campaign.startDate).toISOString().slice(0, 16));
            setValue('endDate', new Date(campaign.endDate).toISOString().slice(0, 16));
        } else {
            setIsEditing(false);
            setCurrentCampaign(null);
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const onSubmit = async (data) => {
        const payload = {
            ...data,
            discount: parseFloat(data.discount),
            startDate: new Date(data.startDate).toISOString(),
            endDate: new Date(data.endDate).toISOString()
        };

        try {
            if (isEditing) {
                await axiosInstance.put(`/campaigns/${currentCampaign.id}`, { id: currentCampaign.id, ...payload });
            } else {
                await axiosInstance.post('/campaigns', payload);
            }
            fetchCampaigns();
            handleCloseModal();
        } catch (err) {
            console.error('Failed to save campaign:', err);
            setError(`Failed to ${isEditing ? 'update' : 'add'} campaign.`);
        }
    };
    
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this campaign?')) {
            try {
                await axiosInstance.delete(`/campaigns/${id}`);
                fetchCampaigns();
            } catch (err) {
                console.error('Failed to delete campaign:', err);
                setError('Failed to delete campaign.');
            }
        }
    };

    return (
        <div>
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <h1 className="h3 mb-0 text-gray-800">Campaign Management</h1>
                <button className="btn btn-primary btn-sm" onClick={() => handleShowModal()}>
                    <i className="fas fa-plus fa-sm text-white-50"></i> Add New Campaign
                </button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="card shadow mb-4">
                <div className="card-header py-3">
                    <h6 className="m-0 font-weight-bold text-primary">Campaigns List</h6>
                </div>
                <div className="card-body">
                    <div className="table-responsive">
                        {loading ? <p>Loading...</p> : (
                            <table className="table table-bordered" width="100%" cellSpacing="0">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Discount (%)</th>
                                        <th>Start Date</th>
                                        <th>End Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {campaigns.map(c => (
                                        <tr key={c.id}>
                                            <td>{c.name}</td>
                                            <td>{c.discount}</td>
                                            <td>{new Date(c.startDate).toLocaleString()}</td>
                                            <td>{new Date(c.endDate).toLocaleString()}</td>
                                            <td>
                                                <button className="btn btn-warning btn-sm mr-2" onClick={() => handleShowModal(c)}>
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id)}>
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
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">{isEditing ? 'Edit Campaign' : 'Add Campaign'}</h5>
                            <button type="button" className="close" onClick={handleCloseModal}><span>&times;</span></button>
                        </div>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Name</label>
                                    <input type="text" className={`form-control ${errors.name ? 'is-invalid' : ''}`} {...register('name', { required: 'Name is required' })} />
                                    {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea className={`form-control ${errors.description ? 'is-invalid' : ''}`} {...register('description', { required: 'Description is required' })}></textarea>
                                    {errors.description && <div className="invalid-feedback">{errors.description.message}</div>}
                                </div>
                                <div className="form-row">
                                    <div className="form-group col-md-4">
                                        <label>Discount (%)</label>
                                        <input type="number" step="0.01" className={`form-control ${errors.discount ? 'is-invalid' : ''}`} {...register('discount', { required: 'Discount is required', valueAsNumber: true, min: 0, max: 100 })} />
                                        {errors.discount && <div className="invalid-feedback">{errors.discount.message || 'Value must be between 0 and 100'}</div>}
                                    </div>
                                    <div className="form-group col-md-4">
                                        <label>Start Date</label>
                                        <input type="datetime-local" className={`form-control ${errors.startDate ? 'is-invalid' : ''}`} {...register('startDate', { required: 'Start date is required' })} />
                                        {errors.startDate && <div className="invalid-feedback">{errors.startDate.message}</div>}
                                    </div>
                                    <div className="form-group col-md-4">
                                        <label>End Date</label>
                                        <input type="datetime-local" className={`form-control ${errors.endDate ? 'is-invalid' : ''}`} {...register('endDate', { required: 'End date is required' })} />
                                        {errors.endDate && <div className="invalid-feedback">{errors.endDate.message}</div>}
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

export default CampaignManagement;