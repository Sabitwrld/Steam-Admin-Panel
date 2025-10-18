import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Typography, Button, Modal, TextField, IconButton, Paper } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import axiosInstance from '../api/axiosInstance';

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

const GenreManagement = () => {
    const [genres, setGenres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({ id: null, name: '' });
    const [isEditing, setIsEditing] = useState(false);

    const fetchGenres = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/genres');
            setGenres(response.data);
        } catch (error) {
            console.error("Failed to fetch genres:", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchGenres();
    }, []);

    const handleOpenModal = (genre = null) => {
        if (genre) {
            setFormData({ id: genre.id, name: genre.name });
            setIsEditing(true);
        } else {
            setFormData({ id: null, name: '' });
            setIsEditing(false);
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
            if (isEditing) {
                await axiosInstance.put(`/genres/${formData.id}`, { name: formData.name });
            } else {
                await axiosInstance.post('/genres', { name: formData.name });
            }
            fetchGenres();
            handleCloseModal();
        } catch (error) {
            console.error("Failed to save genre:", error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this genre?')) {
            try {
                await axiosInstance.delete(`/genres/${id}`);
                fetchGenres();
            } catch (error) {
                console.error("Failed to delete genre:", error);
            }
        }
    };

    const columns = [
        { field: 'id', headerName: 'ID', width: 300 },
        { field: 'name', headerName: 'Name', width: 300, editable: true },
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
                Genre Management
            </Typography>
            <Button variant="contained" onClick={() => handleOpenModal()} sx={{ mb: 2 }}>
                Add New Genre
            </Button>
            <Paper sx={{ height: 650, width: '100%' }}>
                <DataGrid
                    rows={genres}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[10]}
                    checkboxSelection
                    disableSelectionOnClick
                    loading={loading}
                />
            </Paper>

            <Modal open={modalOpen} onClose={handleCloseModal}>
                <Box sx={style}>
                    <Typography variant="h6">{isEditing ? 'Edit' : 'Add New'} Genre</Typography>
                    <form onSubmit={handleFormSubmit}>
                        <TextField
                            name="name"
                            label="Genre Name"
                            value={formData.name}
                            onChange={handleFormChange}
                            fullWidth
                            margin="normal"
                            required
                        />
                        <Button type="submit" variant="contained" sx={{ mt: 2 }}>Save</Button>
                    </form>
                </Box>
            </Modal>
        </Box>
    );
};

export default GenreManagement;