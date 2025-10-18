// src/pages/GameManagement.jsx

import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Typography, Button, Modal, TextField, IconButton, Paper, Autocomplete, Grid } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import axiosInstance from '../api/axiosInstance';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  maxHeight: '90vh',
  overflowY: 'auto'
};

const initialFormData = {
  id: null,
  name: '',
  description: '',
  releaseDate: '',
  developer: '',
  publisher: '',
  applicationType: '',
  genreIds: [],
  tagIds: [],
};

const GameManagement = () => {
    const [games, setGames] = useState([]);
    const [genres, setGenres] = useState([]);
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState(initialFormData);
    const [isEditing, setIsEditing] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [gamesRes, genresRes, tagsRes] = await Promise.all([
                axiosInstance.get('/catalog'),
                axiosInstance.get('/genres'),
                axiosInstance.get('/tags'),
            ]);
            setGames(gamesRes.data);
            setGenres(genresRes.data);
            setTags(tagsRes.data);
        } catch (error) {
            console.error("Failed to fetch game data:", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenModal = (game = null) => {
        if (game) {
            setFormData({
                id: game.id,
                name: game.name || '',
                description: game.description || '',
                releaseDate: game.releaseDate ? new Date(game.releaseDate).toISOString().split('T')[0] : '',
                developer: game.developer || '',
                publisher: game.publisher || '',
                applicationType: game.applicationType || '',
                genreIds: game.genres ? game.genres.map(g => g.id) : [],
                tagIds: game.tags ? game.tags.map(t => t.id) : [],
            });
            setIsEditing(true);
        } else {
            setFormData(initialFormData);
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
                await axiosInstance.put(`/catalog/${formData.id}`, formData);
            } else {
                await axiosInstance.post('/catalog', formData);
            }
            fetchData();
            handleCloseModal();
        } catch (error) {
            console.error("Failed to save game:", error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this game?')) {
            try {
                await axiosInstance.delete(`/catalog/${id}`);
                fetchData();
            } catch (error) {
                console.error("Failed to delete game:", error);
            }
        }
    };

    const columns = [
        { field: 'id', headerName: 'ID', width: 250 },
        { field: 'name', headerName: 'Name', width: 200 },
        { field: 'developer', headerName: 'Developer', width: 150 },
        { field: 'publisher', headerName: 'Publisher', width: 150 },
        {
            field: 'releaseDate', headerName: 'Release Date', width: 150, type: 'date',
            valueGetter: ({ value }) => value && new Date(value)
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
            <Typography variant="h4" gutterBottom>Game Management</Typography>
            <Button variant="contained" onClick={() => handleOpenModal()} sx={{ mb: 2 }}>
                Add New Game
            </Button>
            <Paper sx={{ height: 650, width: '100%' }}>
                <DataGrid
                    rows={games}
                    columns={columns}
                    loading={loading}
                    pageSize={10}
                    rowsPerPageOptions={[10]}
                    checkboxSelection
                />
            </Paper>

            <Modal open={modalOpen} onClose={handleCloseModal}>
                <Box sx={style}>
                    <Typography variant="h6">{isEditing ? 'Edit' : 'Add New'} Game</Typography>
                    <form onSubmit={handleFormSubmit}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}><TextField name="name" label="Name" value={formData.name} onChange={handleFormChange} fullWidth required /></Grid>
                            <Grid item xs={12}><TextField name="description" label="Description" value={formData.description} onChange={handleFormChange} fullWidth multiline rows={4} /></Grid>
                            <Grid item xs={6}><TextField name="developer" label="Developer" value={formData.developer} onChange={handleFormChange} fullWidth /></Grid>
                            <Grid item xs={6}><TextField name="publisher" label="Publisher" value={formData.publisher} onChange={handleFormChange} fullWidth /></Grid>
                            <Grid item xs={6}><TextField name="releaseDate" label="Release Date" type="date" value={formData.releaseDate} onChange={handleFormChange} fullWidth InputLabelProps={{ shrink: true }} /></Grid>
                            <Grid item xs={6}><TextField name="applicationType" label="Application Type" value={formData.applicationType} onChange={handleFormChange} fullWidth /></Grid>
                            <Grid item xs={12}>
                                <Autocomplete
                                    multiple
                                    options={genres}
                                    getOptionLabel={(option) => option.name}
                                    value={genres.filter(genre => formData.genreIds.includes(genre.id))}
                                    onChange={(event, newValue) => setFormData({ ...formData, genreIds: newValue.map(item => item.id) })}
                                    renderInput={(params) => <TextField {...params} label="Genres" />}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <Autocomplete
                                    multiple
                                    options={tags}
                                    getOptionLabel={(option) => option.name}
                                    value={tags.filter(tag => formData.tagIds.includes(tag.id))}
                                    onChange={(event, newValue) => setFormData({ ...formData, tagIds: newValue.map(item => item.id) })}
                                    renderInput={(params) => <TextField {...params} label="Tags" />}
                                />
                            </Grid>
                        </Grid>
                        <Button type="submit" variant="contained" sx={{ mt: 3 }}>Save Game</Button>
                    </form>
                </Box>
            </Modal>
        </Box>
    );
};

export default GameManagement;