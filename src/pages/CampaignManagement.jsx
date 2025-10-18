// src/pages/CampaignManagement.jsx

import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Typography, Button, Modal, TextField, IconButton, Paper } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import axiosInstance from '../api/axiosInstance';

// Modal üçün stil
const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const CampaignManagement = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({ id: null, name: '', startDate: '', endDate: '' });
    const [isEditing, setIsEditing] = useState(false);

    // Kampaniyaları API-dən çəkmək üçün funksiya
    const fetchCampaigns = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/store/campaigns');
            setCampaigns(response.data);
        } catch (error) {
            console.error("Failed to fetch campaigns:", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchCampaigns();
    }, []);

    // Modal pəncərəsini açmaq
    const handleOpenModal = (campaign = null) => {
        if (campaign) {
            // Tarix formatlarını düzgün formata (YYYY-MM-DD) salırıq
            const startDate = new Date(campaign.startDate).toISOString().split('T')[0];
            const endDate = new Date(campaign.endDate).toISOString().split('T')[0];
            setFormData({ id: campaign.id, name: campaign.name, startDate, endDate });
            setIsEditing(true);
        } else {
            setFormData({ id: null, name: '', startDate: '', endDate: '' });
            setIsEditing(false);
        }
        setModalOpen(true);
    };

    // Modal pəncərəsini bağlamaq
    const handleCloseModal = () => setModalOpen(false);

    // Formadakı dəyişiklikləri izləmək
    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Formu göndərmək (Yaratmaq və ya Yeniləmək)
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await axiosInstance.put(`/store/campaigns/${formData.id}`, formData);
            } else {
                await axiosInstance.post('/store/campaigns', formData);
            }
            fetchCampaigns(); // Cədvəli yenilə
            handleCloseModal();
        } catch (error) {
            console.error("Failed to save campaign:", error);
        }
    };

    // Silmə əməliyyatı
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this campaign?')) {
            try {
                await axiosInstance.delete(`/store/campaigns/${id}`);
                fetchCampaigns(); // Cədvəli yenilə
            } catch (error) {
                console.error("Failed to delete campaign:", error);
            }
        }
    };

    // DataGrid üçün sütunlar
    const columns = [
        { field: 'id', headerName: 'ID', width: 250 },
        { field: 'name', headerName: 'Campaign Name', width: 250 },
        {
            field: 'startDate',
            headerName: 'Start Date',
            width: 200,
            type: 'dateTime',
            valueGetter: ({ value }) => value && new Date(value),
        },
        {
            field: 'endDate',
            headerName: 'End Date',
            width: 200,
            type: 'dateTime',
            valueGetter: ({ value }) => value && new Date(value),
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            renderCell: (params) => (
                <>
                    <IconButton onClick={() => handleOpenModal(params.row)}><Edit /></IconButton>
                    <IconButton onClick={() => handleDelete(params.id)}><Delete /></IconButton>
                </>
            ),
        },
    ];

    return (
        <Box sx={{ width: '100%' }}>
            <Typography variant="h4" gutterBottom>
                Campaign Management
            </Typography>
            <Button variant="contained" onClick={() => handleOpenModal()} sx={{ mb: 2 }}>
                Add New Campaign
            </Button>
            <Paper sx={{ height: 650, width: '100%' }}>
                <DataGrid
                    rows={campaigns}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[10]}
                    checkboxSelection
                    disableSelectionOnClick
                    loading={loading}
                />
            </Paper>

            {/* Yaratma/Redaktə Modalı */}
            <Modal open={modalOpen} onClose={handleCloseModal}>
                <Box sx={style}>
                    <Typography variant="h6">{isEditing ? 'Edit' : 'Add New'} Campaign</Typography>
                    <form onSubmit={handleFormSubmit}>
                        <TextField name="name" label="Campaign Name" value={formData.name} onChange={handleFormChange} fullWidth margin="normal" required />
                        <TextField name="startDate" label="Start Date" type="date" value={formData.startDate} onChange={handleFormChange} fullWidth margin="normal" InputLabelProps={{ shrink: true }} required />
                        <TextField name="endDate" label="End Date" type="date" value={formData.endDate} onChange={handleFormChange} fullWidth margin="normal" InputLabelProps={{ shrink: true }} required />
                        <Button type="submit" variant="contained" sx={{ mt: 2 }}>Save</Button>
                    </form>
                </Box>
            </Modal>
        </Box>
    );
};

export default CampaignManagement;