import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import axiosInstance from '../api/axiosInstance';

const GenreManagement = () => {
  const [genres, setGenres] = useState([]);
  const [newGenreName, setNewGenreName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch genres data
  const fetchGenres = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/genre');
      setGenres(response.data);
    } catch (error) {
      console.error('Error fetching genres:', error);
      setError('Failed to fetch genres');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGenres();
  }, []);

  // Handle add new genre
  const handleAddGenre = async () => {
    if (!newGenreName.trim()) {
      setError('Genre name is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await axiosInstance.post('/genre', {
        name: newGenreName.trim()
      });

      setNewGenreName('');
      fetchGenres();
    } catch (error) {
      console.error('Error adding genre:', error);
      setError(error.response?.data?.message || 'Failed to add genre');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete genre
  const handleDeleteGenre = async (genreId, genreName) => {
    if (!window.confirm(`Are you sure you want to delete the genre "${genreName}"?`)) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await axiosInstance.delete(`/genre/${genreId}`);
      fetchGenres();
    } catch (error) {
      console.error('Error deleting genre:', error);
      setError(error.response?.data?.message || 'Failed to delete genre');
    } finally {
      setLoading(false);
    }
  };

  // Handle key press for adding genre
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleAddGenre();
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Genre Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Add Genre Section */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Add New Genre
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            label="Genre Name"
            value={newGenreName}
            onChange={(e) => setNewGenreName(e.target.value)}
            onKeyPress={handleKeyPress}
            fullWidth
            disabled={loading}
            placeholder="Enter genre name..."
          />
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
            onClick={handleAddGenre}
            disabled={loading || !newGenreName.trim()}
          >
            Add Genre
          </Button>
        </Box>
      </Paper>

      {/* Genres List */}
      <Paper>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Existing Genres ({genres.length})
          </Typography>
        </Box>
        <Divider />
        
        {loading && genres.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : genres.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No genres found. Add your first genre above.
            </Typography>
          </Box>
        ) : (
          <List>
            {genres.map((genre, index) => (
              <React.Fragment key={genre.id}>
                <ListItem>
                  <ListItemText
                    primary={genre.name}
                    secondary={`ID: ${genre.id}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDeleteGenre(genre.id, genre.name)}
                      disabled={loading}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < genres.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default GenreManagement;
