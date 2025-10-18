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
  Autocomplete,
  Chip,
  DialogContentText,
} from '@mui/material';
import {
  DataGrid,
  GridToolbar,
  GridActionsCellItem,
} from '@mui/x-data-grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import axiosInstance from '../api/axiosInstance';

const GameManagement = () => {
  const [games, setGames] = useState([]);
  const [genres, setGenres] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gameDialogOpen, setGameDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [gameToDelete, setGameToDelete] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    developer: '',
    publisher: '',
    releaseDate: null,
    price: '',
    genreIds: [],
    tagIds: [],
  });

  useEffect(() => {
    fetchGames();
    fetchGenres();
    fetchTags();
  }, []);

  const fetchGames = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/catalog');
      setGames(response.data);
    } catch (err) {
      console.error('Error fetching games:', err);
      setError('Failed to load games');
    } finally {
      setLoading(false);
    }
  };

  const fetchGenres = async () => {
    try {
      const response = await axiosInstance.get('/api/genres');
      setGenres(response.data);
    } catch (err) {
      console.error('Error fetching genres:', err);
    }
  };

  const fetchTags = async () => {
    try {
      const response = await axiosInstance.get('/api/tags');
      setTags(response.data);
    } catch (err) {
      console.error('Error fetching tags:', err);
    }
  };

  const handleCreateGame = () => {
    setSelectedGame(null);
    setFormData({
      name: '',
      description: '',
      developer: '',
      publisher: '',
      releaseDate: null,
      price: '',
      genreIds: [],
      tagIds: [],
    });
    setGameDialogOpen(true);
  };

  const handleEditGame = (game) => {
    setSelectedGame(game);
    setFormData({
      name: game.name || '',
      description: game.description || '',
      developer: game.developer || '',
      publisher: game.publisher || '',
      releaseDate: game.releaseDate ? new Date(game.releaseDate) : null,
      price: game.price?.toString() || '',
      genreIds: game.genreIds || [],
      tagIds: game.tagIds || [],
    });
    setGameDialogOpen(true);
  };

  const handleDeleteGame = (game) => {
    setGameToDelete(game);
    setDeleteDialogOpen(true);
  };

  const handleSaveGame = async () => {
    try {
      setSaving(true);
      const gameData = {
        ...formData,
        price: parseFloat(formData.price),
        releaseDate: formData.releaseDate?.toISOString(),
      };

      if (selectedGame) {
        await axiosInstance.put(`/api/catalog/${selectedGame.id}`, gameData);
      } else {
        await axiosInstance.post('/api/catalog', gameData);
      }

      fetchGames();
      setGameDialogOpen(false);
    } catch (err) {
      console.error('Error saving game:', err);
      setError('Failed to save game');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await axiosInstance.delete(`/api/catalog/${gameToDelete.id}`);
      fetchGames();
      setDeleteDialogOpen(false);
      setGameToDelete(null);
    } catch (err) {
      console.error('Error deleting game:', err);
      setError('Failed to delete game');
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'name', headerName: 'Name', width: 200 },
    { field: 'developer', headerName: 'Developer', width: 150 },
    { field: 'publisher', headerName: 'Publisher', width: 150 },
    {
      field: 'releaseDate',
      headerName: 'Release Date',
      width: 150,
      renderCell: (params) => 
        params.value ? new Date(params.value).toLocaleDateString() : '-',
    },
    {
      field: 'price',
      headerName: 'Price',
      width: 100,
      renderCell: (params) => `$${params.value}`,
    },
    {
      field: 'genres',
      headerName: 'Genres',
      width: 200,
      renderCell: (params) => (
        <Box>
          {params.row.genres?.map((genre, index) => (
            <Chip
              key={index}
              label={genre.name}
              size="small"
              color="primary"
              sx={{ mr: 0.5, mb: 0.5 }}
            />
          ))}
        </Box>
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          onClick={() => handleEditGame(params.row)}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => handleDeleteGame(params.row)}
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
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h4">
            Game Management
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateGame}
          >
            Create New Game
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
              rows={games}
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

        {/* Game Form Dialog */}
        <Dialog
          open={gameDialogOpen}
          onClose={() => setGameDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {selectedGame ? 'Edit Game' : 'Create New Game'}
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
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                margin="normal"
                multiline
                rows={3}
              />
              <TextField
                fullWidth
                label="Developer"
                value={formData.developer}
                onChange={(e) => setFormData({ ...formData, developer: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Publisher"
                value={formData.publisher}
                onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                margin="normal"
                required
              />
              <DatePicker
                label="Release Date"
                value={formData.releaseDate}
                onChange={(date) => setFormData({ ...formData, releaseDate: date })}
                sx={{ mt: 2, width: '100%' }}
              />
              <Autocomplete
                multiple
                options={genres}
                getOptionLabel={(option) => option.name}
                value={genres.filter(genre => formData.genreIds.includes(genre.id))}
                onChange={(event, newValue) => {
                  setFormData({
                    ...formData,
                    genreIds: newValue.map(genre => genre.id)
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Genres"
                    margin="normal"
                  />
                )}
              />
              <Autocomplete
                multiple
                options={tags}
                getOptionLabel={(option) => option.name}
                value={tags.filter(tag => formData.tagIds.includes(tag.id))}
                onChange={(event, newValue) => {
                  setFormData({
                    ...formData,
                    tagIds: newValue.map(tag => tag.id)
                  });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Tags"
                    margin="normal"
                  />
                )}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setGameDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveGame}
              variant="contained"
              disabled={saving}
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
          <DialogTitle>Delete Game</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete "{gameToDelete?.name}"? This action cannot be undone.
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
    </LocalizationProvider>
  );
};

export default GameManagement;