// src/pages/CouponManagement.jsx

import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Typography, TextField, Paper, Button, Modal, TextField as FormTextField, IconButton } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import axiosInstance from '../api/axiosInstance';

const CouponManagement = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({ id: null, code: '', percentage: '', expirationDate: '' });

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/coupons');
            setCoupons(response.data);
        } catch (error) {
            console.error("Failed to fetch coupons:", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    const handleOpenModal = (coupon = null) => {
        if (coupon) {
            setFormData({
                id: coupon.id,
                code: coupon.code,
                percentage: coupon.percentage,
                expirationDate: new Date(coupon.expirationDate).toISOString().split('T')[0],
            });
        } else {
            setFormData({ id: null, code: '', percentage: '', expirationDate: '' });
        }
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
    };

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const apiData = {
            ...formData,
            percentage: parseFloat(formData.percentage)
        };

        try {
            if (formData.id) {
                await axiosInstance.put(`/coupons/${formData.id}`, apiData);
            } else {
                await axiosInstance.post('/coupons', apiData);
            }
            fetchCoupons();
            handleCloseModal();
        } catch (error) {
            console.error("Failed to save coupon:", error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this coupon?')) {
            try {
                await axiosInstance.delete(`/coupons/${id}`);
                fetchCoupons();
            } catch (error) {
                console.error("Failed to delete coupon:", error);
            }
        }
    };

    const columns = [
        { field: 'id', headerName: 'ID', width: 250 },
        { field: 'code', headerName: 'Code', width: 200 },
        { field: 'percentage', headerName: 'Discount %', width: 150 },
        { field: 'expirationDate', headerName: 'Expires On', width: 200, type: 'dateTime', valueGetter: ({ value }) => value && new Date(value) },
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

    const filteredData = coupons.filter((item) =>
        item.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Box sx={{ width: '100%' }}>
            <Typography variant="h4" gutterBottom>
                Coupon Management
            </Typography>
            <Button variant="contained" onClick={() => handleOpenModal()} sx={{ mb: 2 }}>
                Add New Coupon
            </Button>
            <TextField
                label="Search Coupons"
                variant="outlined"
                fullWidth
                margin="normal"
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Paper sx={{ height: 650, width: '100%' }}>
                <DataGrid
                    rows={filteredData}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[10]}
                    checkboxSelection
                    disableSelectionOnClick
                    loading={loading}
                />
            </Paper>

            <Modal open={modalOpen} onClose={handleCloseModal}>
                <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4 }}>
                    <Typography variant="h6">{formData.id ? 'Edit' : 'Add'} Coupon</Typography>
                    <form onSubmit={handleFormSubmit}>
                        <FormTextField name="code" label="Coupon Code" value={formData.code} onChange={handleFormChange} fullWidth margin="normal" required />
                        <FormTextField name="percentage" label="Percentage" type="number" value={formData.percentage} onChange={handleFormChange} fullWidth margin="normal" required />
                        <FormTextField name="expirationDate" label="Expiration Date" type="date" value={formData.expirationDate} onChange={handleFormChange} fullWidth margin="normal" InputLabelProps={{ shrink: true }} required />
                        <Button type="submit" variant="contained" sx={{ mt: 2 }}>Save</Button>
                    </form>
                </Box>
            </Modal>
        </Box>
    );
};

export default CouponManagement;