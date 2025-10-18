import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import SearchableDataTable from '../components/SearchableDataTable';

const Campaigns = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentCampaign, setCurrentCampaign] = useState({
        id: null,
        name: '',
        description: '',
        startDate: '',
        endDate: ''
    });

    const fetchCampaigns = async () => {
        try {
            setLoading(true);
            // DÜZƏLİŞ: Endpoint düzəldildi və axiosInstance istifadə edildi
            const response = await axiosInstance.get('/api/Campaign');
            setCampaigns(response.data.data);
            setError(null);
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

    const columns = [
        { Header: 'ID', accessor: 'id' },
        { Header: 'Name', accessor: 'name' },
        { Header: 'Start Date', accessor: 'startDate', Cell: ({ value }) => new Date(value).toLocaleDateString() },
        { Header: 'End Date', accessor: 'endDate', Cell: ({ value }) => new Date(value).toLocaleDateString() },
    ];
    
    const handleAdd = () => {
        setIsEditing(false);
        setCurrentCampaign({ id: null, name: '', description: '', startDate: '', endDate: '' });
        setShowModal(true);
    };

    const handleEdit = (campaign) => {
        setIsEditing(true);
        // Tarixləri input-a uyğun formatla
        setCurrentCampaign({
            ...campaign,
            startDate: campaign.startDate.split('T')[0],
            endDate: campaign.endDate.split('T')[0]
        });
        setShowModal(true);
    };

    const handleDelete = async (campaign) => {
        if (window.confirm(`Are you sure you want to delete ${campaign.name}?`)) {
            try {
                await axiosInstance.delete(`/api/Campaign/${campaign.id}`);
                fetchCampaigns();
            } catch (err) {
                setError('Failed to delete campaign.');
                console.error(err);
            }
        }
    };

    const handleSave = async () => {
        if (!currentCampaign.name || !currentCampaign.startDate || !currentCampaign.endDate) {
            alert("Name, Start Date, and End Date are required.");
            return;
        }

        // Backend-in gözlədiyi formata uyğun data
        const campaignData = {
            name: currentCampaign.name,
            description: currentCampaign.description,
            startDate: new Date(currentCampaign.startDate).toISOString(),
            endDate: new Date(currentCampaign.endDate).toISOString(),
        };

        try {
            if (isEditing) {
                await axiosInstance.put(`/api/Campaign/${currentCampaign.id}`, { id: currentCampaign.id, ...campaignData });
            } else {
                await axiosInstance.post('/api/Campaign', campaignData);
            }
            setShowModal(false);
            fetchCampaigns();
        } catch (err) {
            console.error("Failed to save campaign", err);
            alert("Failed to save campaign. Check console for details.");
        }
    };

    return (
        <div className="container-fluid">
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <h1 className="h3 mb-0 text-gray-800">Campaigns</h1>
                <button className="btn btn-primary" onClick={handleAdd}>
                    <i className="fas fa-plus fa-sm text-white-50"></i> Add New Campaign
                </button>
            </div>
            
            {loading && <p>Loading...</p>}
            {error && <p className="text-danger">{error}</p>}
            {!loading && !error && (
                <SearchableDataTable
                    data={campaigns}
                    columns={columns}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}
            
            {showModal && (
                 <div className="modal show" tabIndex="-1" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-lg">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{isEditing ? 'Edit Campaign' : 'Add Campaign'}</h5>
                                <button type="button" className="close" onClick={() => setShowModal(false)}>
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={currentCampaign.name}
                                        onChange={(e) => setCurrentCampaign({ ...currentCampaign, name: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        value={currentCampaign.description}
                                        onChange={(e) => setCurrentCampaign({ ...currentCampaign, description: e.target.value })}
                                    ></textarea>
                                </div>
                                <div className="form-row">
                                    <div className="form-group col-md-6">
                                        <label>Start Date</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={currentCampaign.startDate}
                                            onChange={(e) => setCurrentCampaign({ ...currentCampaign, startDate: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group col-md-6">
                                        <label>End Date</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={currentCampaign.endDate}
                                            onChange={(e) => setCurrentCampaign({ ...currentCampaign, endDate: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Close</button>
                                <button type="button" className="btn btn-primary" onClick={handleSave}>Save changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Campaigns;