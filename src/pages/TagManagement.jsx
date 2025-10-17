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

const TagManagement = () => {
  const [tags, setTags] = useState([]);
  const [newTagName, setNewTagName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch tags data
  const fetchTags = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/tags'); // Dəyişdirildi
      setTags(response.data.data);
    } catch (error) {
      console.error('Error fetching tags:', error);
      setError('Failed to fetch tags');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  // Handle add new tag
  const handleAddTag = async () => {
    if (!newTagName.trim()) {
      setError('Tag name is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      await axiosInstance.post('/tags', { // Dəyişdirildi
        name: newTagName.trim()
      });

      setNewTagName('');
      fetchTags();
    } catch (error) {
      console.error('Error adding tag:', error);
      setError(error.response?.data?.message || 'Failed to add tag');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete tag
  const handleDeleteTag = async (tagId, tagName) => {
    if (!window.confirm(`Are you sure you want to delete the tag "${tagName}"?`)) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      
     await axiosInstance.delete(`/tags/${tagId}`); // Dəyişdirildi
      fetchTags();
    } catch (error) {
      console.error('Error deleting tag:', error);
      setError(error.response?.data?.message || 'Failed to delete tag');
    } finally {
      setLoading(false);
    }
  };

  // Handle key press for adding tag
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleAddTag();
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Tag Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Add Tag Section */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Add New Tag
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            label="Tag Name"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyPress={handleKeyPress}
            fullWidth
            disabled={loading}
            placeholder="Enter tag name..."
          />
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
            onClick={handleAddTag}
            disabled={loading || !newTagName.trim()}
          >
            Add Tag
          </Button>
        </Box>
      </Paper>

      {/* Tags List */}
      <Paper>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Existing Tags ({tags.length})
          </Typography>
        </Box>
        <Divider />
        
        {loading && tags.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : tags.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No tags found. Add your first tag above.
            </Typography>
          </Box>
        ) : (
          <List>
            {tags.map((tag, index) => (
              <React.Fragment key={tag.id}>
                <ListItem>
                  <ListItemText
                    primary={tag.name}
                    secondary={`ID: ${tag.id}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => handleDeleteTag(tag.id, tag.name)}
                      disabled={loading}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                {index < tags.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default TagManagement;
