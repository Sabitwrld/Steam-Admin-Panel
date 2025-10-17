import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  OutlinedInput,
  IconButton,
  Typography,
  Alert,
  CircularProgress,
  DialogContentText,
  DialogContentText as ConfirmDialog
} from '@mui/material';
import {
  DataGrid,
  GridActionsCellItem,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
  GridToolbarDensitySelector
} from '@mui/x-data-grid';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import axiosInstance from '../api/axiosInstance';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const GameManagement = () => {
  const [games, setGames] = useState([]);
  const [genres, setGenres] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [gameToDelete, setGameToDelete] = useState(null);
  const [error, setError] = useState('');

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    watch
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      price: '',
      releaseDate: '',
      developer: '',
      publisher: '',
      genreIds: [],
      tagIds: []
    }
  });

  // Fetch games data
  const fetchGames = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/catalog');
      setGames(response.data);
    } catch (error) {
      console.error('Error fetching games:', error);
      setError('Failed to fetch games');
    } finally {
      setLoading(false);
    }
  };

  // Fetch genres data
  const fetchGenres = async () => {
    try {
      const response = await axiosInstance.get('/genre');
      setGenres(response.data);
    } catch (error) {
      console.error('Error fetching genres:', error);
    }
  };

  // Fetch tags data
  const fetchTags = async () => {
    try {
      const response = await axiosInstance.get('/tag');
      setTags(response.data);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  useEffect(() => {
    fetchGames();
    fetchGenres();
    fetchTags();
  }, []);

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError('');

      const gameData = {
        ...data,
        price: parseFloat(data.price),
        releaseDate: new Date(data.releaseDate).toISOString()
      };

      if (selectedGame) {
        // Update existing game
        await axiosInstance.put(`/catalog/${selectedGame.id}`, gameData);
      } else {
        // Create new game
        await axiosInstance.post('/catalog', gameData);
      }

      setDialogOpen(false);
      reset();
      setSelectedGame(null);
      fetchGames();
    } catch (error) {
      console.error('Error saving game:', error);
      setError(error.response?.data?.message || 'Failed to save game');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit game
  const handleEditGame = (game) => {
    setSelectedGame(game);
    reset({
      name: game.name || '',
      description: game.description || '',
      price: game.price || '',
      releaseDate: game.releaseDate ? new Date(game.releaseDate).toISOString().split('T')[0] : '',
      developer: game.developer || '',
      publisher: game.publisher || '',
      genreIds: game.genreIds || [],
      tagIds: game.tagIds || []
    });
    setDialogOpen(true);
  };

  // Handle delete game
  const handleDeleteGame = async () => {
    try {
      setLoading(true);
      await axiosInstance.delete(`/catalog/${gameToDelete.id}`);
      setDeleteDialogOpen(false);
      setGameToDelete(null);
      fetchGames();
    } catch (error) {
      console.error('Error deleting game:', error);
      setError(error.response?.data?.message || 'Failed to delete game');
    } finally {
      setLoading(false);
    }
  };

  // Handle add new game
  const handleAddGame = () => {
    setSelectedGame(null);
    reset();
    setDialogOpen(true);
  };

  // DataGrid columns
  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'name', headerName: 'Name', width: 200, flex: 1 },
    { field: 'price', headerName: 'Price', width: 120, type: 'number' },
    { 
      field: 'releaseDate', 
      headerName: 'Release Date', 
      width: 150,
      valueFormatter: (params) => {
        if (!params.value) return '';
        return new Date(params.value).toLocaleDateString();
      }
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
          onClick={() => {
            setGameToDelete(params.row);
            setDeleteDialogOpen(true);
          }}
        />
      ]
    }
  ];

  // Custom toolbar
  const CustomToolbar = () => (
    <GridToolbarContainer>
      <Button
        color="primary"
        startIcon={<AddIcon />}
        onClick={handleAddGame}
      >
        Add New Game
      </Button>
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      <GridToolbarExport />
    </GridToolbarContainer>
  );

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Game Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={games}
          columns={columns}
          loading={loading}
          pageSizeOptions={[5, 10, 25]}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          slots={{
            toolbar: CustomToolbar,
          }}
          disableRowSelectionOnClick
        />
      </Box>

      {/* Add/Edit Game Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedGame ? 'Edit Game' : 'Add New Game'}
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <Controller
                name="name"
                control={control}
                rules={{ required: 'Name is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Name"
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name?.message}
                  />
                )}
              />

              <Controller
                name="description"
                control={control}
                rules={{ required: 'Description is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Description"
                    fullWidth
                    multiline
                    rows={3}
                    error={!!errors.description}
                    helperText={errors.description?.message}
                  />
                )}
              />

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Controller
                  name="price"
                  control={control}
                  rules={{ 
                    required: 'Price is required',
                    min: { value: 0, message: 'Price must be positive' }
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Price"
                      type="number"
                      fullWidth
                      error={!!errors.price}
                      helperText={errors.price?.message}
                    />
                  )}
                />

                <Controller
                  name="releaseDate"
                  control={control}
                  rules={{ required: 'Release date is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Release Date"
                      type="date"
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      error={!!errors.releaseDate}
                      helperText={errors.releaseDate?.message}
                    />
                  )}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <Controller
                  name="developer"
                  control={control}
                  rules={{ required: 'Developer is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Developer"
                      fullWidth
                      error={!!errors.developer}
                      helperText={errors.developer?.message}
                    />
                  )}
                />

                <Controller
                  name="publisher"
                  control={control}
                  rules={{ required: 'Publisher is required' }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Publisher"
                      fullWidth
                      error={!!errors.publisher}
                      helperText={errors.publisher?.message}
                    />
                  )}
                />
              </Box>

              <Controller
                name="genreIds"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Genres</InputLabel>
                    <Select
                      {...field}
                      multiple
                      input={<OutlinedInput label="Genres" />}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => {
                            const genre = genres.find(g => g.id === value);
                            return (
                              <Chip key={value} label={genre?.name || value} />
                            );
                          })}
                        </Box>
                      )}
                      MenuProps={MenuProps}
                    >
                      {genres.map((genre) => (
                        <MenuItem key={genre.id} value={genre.id}>
                          {genre.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />

              <Controller
                name="tagIds"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth>
                    <InputLabel>Tags</InputLabel>
                    <Select
                      {...field}
                      multiple
                      input={<OutlinedInput label="Tags" />}
                      renderValue={(selected) => (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {selected.map((value) => {
                            const tag = tags.find(t => t.id === value);
                            return (
                              <Chip key={value} label={tag?.name || value} />
                            );
                          })}
                        </Box>
                      )}
                      MenuProps={MenuProps}
                    >
                      {tags.map((tag) => (
                        <MenuItem key={tag.id} value={tag.id}>
                          {tag.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? <CircularProgress size={20} /> : 'Save'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the game "{gameToDelete?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleDeleteGame} 
            color="error" 
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GameManagement;
