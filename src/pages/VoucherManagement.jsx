// src/pages/VoucherManagement.jsx

import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Typography, TextField, Paper, Button, Modal, IconButton, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import axiosInstance from '../api/axiosInstance';

const VoucherManagement = () => {
    const [vouchers, setVouchers] = useState([]);
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({ id: null, code: '', applicationId: '' });

    const fetchVouchers = async () => {
        setLoading(true);
        try {
            const [voucherRes, gamesRes] = await Promise.all([
                axiosInstance.get('/vouchers'),
                axiosInstance.get('/catalog'),
            ]);
            setVouchers(voucherRes.data);
            setGames(gamesRes.data);
        } catch (error) {
            console.error("Failed to fetch data:", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchVouchers();
    }, []);

    const handleOpenModal = (voucher = null) => {
        if (voucher) {
            setFormData({
                id: voucher.id,
                code: voucher.code,
                applicationId: voucher.applicationId,
            });
        } else {
            setFormData({ id: null, code: '', applicationId: '' });
        }
        setModalOpen(true);
    };
    
    const handleCloseModal = () => setModalOpen(false);

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            if (formData.id) {
                // Update endpoint yoxdursa, bu hissəni kommentə alın
                // await axiosInstance.put(`/vouchers/${formData.id}`, formData);
            } else {
                await axiosInstance.post('/vouchers', formData);
            }
            fetchVouchers();
            handleCloseModal();
        } catch (error) {
            console.error("Failed to save voucher:", error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this voucher?')) {
            try {
                await axiosInstance.delete(`/vouchers/${id}`);
                fetchVouchers();
            } catch (error) {
                console.error("Failed to delete voucher:", error);
            }
        }
    };

    const columns = [
        { field: 'id', headerName: 'ID', width: 250 },
        { field: 'code', headerName: 'Code', width: 250 },
        { field: 'gameName', headerName: 'Game', width: 250 },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            renderCell: (params) => (
                <IconButton onClick={() => handleDelete(params.id)}><Delete /></IconButton>
            ),
        },
    ];

    const filteredData = vouchers.filter((item) =>
        item.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Box sx={{ width: '100%' }}>
            <Typography variant="h4" gutterBottom>
                Voucher Management
            </Typography>
            <Button variant="contained" onClick={() => handleOpenModal()} sx={{ mb: 2 }}>
                Add New Voucher
            </Button>
            <TextField
                label="Search Vouchers"
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
                    <Typography variant="h6">Add New Voucher</Typography>
                    <form onSubmit={handleFormSubmit}>
                        <TextField name="code" label="Voucher Code" value={formData.code} onChange={handleFormChange} fullWidth margin="normal" required />
                        <FormControl fullWidth margin="normal">
                            <InputLabel id="game-select-label">Game</InputLabel>
                            <Select
                                labelId="game-select-label"
                                name="applicationId"
                                value={formData.applicationId}
                                label="Game"
                                onChange={handleFormChange}
                                required
                            >
                                {games.map(game => (
                                    <MenuItem key={game.id} value={game.id}>{game.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Button type="submit" variant="contained" sx={{ mt: 2 }}>Save</Button>
                    </form>
                </Box>
            </Modal>
        </Box>
    );
};

export default VoucherManagement;