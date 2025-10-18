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

const TagManagement = () => {
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({ id: null, name: '' });
    const [isEditing, setIsEditing] = useState(false);

    const fetchTags = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/tags');
            setTags(response.data);
        } catch (error) {
            console.error("Failed to fetch tags:", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchTags();
    }, []);

    const handleOpenModal = (tag = null) => {
        if (tag) {
            setFormData({ id: tag.id, name: tag.name });
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
                await axiosInstance.put(`/tags/${formData.id}`, { name: formData.name });
            } else {
                await axiosInstance.post('/tags', { name: formData.name });
            }
            fetchTags();
            handleCloseModal();
        } catch (error) {
            console.error("Failed to save tag:", error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this tag?')) {
            try {
                await axiosInstance.delete(`/tags/${id}`);
                fetchTags();
            } catch (error) {
                console.error("Failed to delete tag:", error);
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
                Tag Management
            </Typography>
            <Button variant="contained" onClick={() => handleOpenModal()} sx={{ mb: 2 }}>
                Add New Tag
            </Button>
            <Paper sx={{ height: 650, width: '100%' }}>
                <DataGrid
                    rows={tags}
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
                    <Typography variant="h6">{isEditing ? 'Edit' : 'Add New'} Tag</Typography>
                    <form onSubmit={handleFormSubmit}>
                        <TextField
                            name="name"
                            label="Tag Name"
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

export default TagManagement;