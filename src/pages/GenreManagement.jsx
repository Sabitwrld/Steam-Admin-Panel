import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  DialogContentText,
} from '@mui/material';
import {
  DataGrid,
  GridToolbar,
  GridActionsCellItem,
} from '@mui/x-data-grid';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import axiosInstance from '../api/axiosInstance';

const GenreManagement = () => {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [genreDialogOpen, setGenreDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [genreToDelete, setGenreToDelete] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
  });

  useEffect(() => {
    fetchGenres();
  }, []);

  const fetchGenres = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/genres');
      setGenres(response.data);
    } catch (err) {
      console.error('Error fetching genres:', err);
      setError('Failed to load genres');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGenre = () => {
    setSelectedGenre(null);
    setFormData({ name: '' });
    setGenreDialogOpen(true);
  };

  const handleEditGenre = (genre) => {
    setSelectedGenre(genre);
    setFormData({ name: genre.name });
    setGenreDialogOpen(true);
  };

  const handleDeleteGenre = (genre) => {
    setGenreToDelete(genre);
    setDeleteDialogOpen(true);
  };

  const handleSaveGenre = async () => {
    try {
      setSaving(true);
      
      if (selectedGenre) {
        await axiosInstance.put(`/api/genres/${selectedGenre.id}`, formData);
      } else {
        await axiosInstance.post('/api/genres', formData);
      }

      fetchGenres();
      setGenreDialogOpen(false);
    } catch (err) {
      console.error('Error saving genre:', err);
      setError('Failed to save genre');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await axiosInstance.delete(`/api/genres/${genreToDelete.id}`);
      fetchGenres();
      setDeleteDialogOpen(false);
      setGenreToDelete(null);
    } catch (err) {
      console.error('Error deleting genre:', err);
      setError('Failed to delete genre');
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'name', headerName: 'Name', width: 300 },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          onClick={() => handleEditGenre(params.row)}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => handleDeleteGenre(params.row)}
        />,
      ],
    },
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4">
          Genre Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateGenre}
        >
          Create New Genre
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <DataGrid
            rows={genres}
            columns={columns}
            slots={{ toolbar: GridToolbar }}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 10 },
              },
            }}
            pageSizeOptions={[5, 10, 25]}
            disableRowSelectionOnClick
            autoHeight
          />
        </CardContent>
      </Card>

      {/* Genre Form Dialog */}
      <Dialog
        open={genreDialogOpen}
        onClose={() => setGenreDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedGenre ? 'Edit Genre' : 'Create New Genre'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              margin="normal"
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setGenreDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveGenre}
            variant="contained"
            disabled={saving || !formData.name.trim()}
            startIcon={saving ? <CircularProgress size={20} /> : null}
          >
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Genre</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{genreToDelete?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GenreManagement;