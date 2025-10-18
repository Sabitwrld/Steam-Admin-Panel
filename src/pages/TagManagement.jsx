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

const TagManagement = () => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState(null);
  const [tagToDelete, setTagToDelete] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
  });

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/tags');
      setTags(response.data);
    } catch (err) {
      console.error('Error fetching tags:', err);
      setError('Failed to load tags');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTag = () => {
    setSelectedTag(null);
    setFormData({ name: '' });
    setTagDialogOpen(true);
  };

  const handleEditTag = (tag) => {
    setSelectedTag(tag);
    setFormData({ name: tag.name });
    setTagDialogOpen(true);
  };

  const handleDeleteTag = (tag) => {
    setTagToDelete(tag);
    setDeleteDialogOpen(true);
  };

  const handleSaveTag = async () => {
    try {
      setSaving(true);
      
      if (selectedTag) {
        await axiosInstance.put(`/api/tags/${selectedTag.id}`, formData);
      } else {
        await axiosInstance.post('/api/tags', formData);
      }

      fetchTags();
      setTagDialogOpen(false);
    } catch (err) {
      console.error('Error saving tag:', err);
      setError('Failed to save tag');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      await axiosInstance.delete(`/api/tags/${tagToDelete.id}`);
      fetchTags();
      setDeleteDialogOpen(false);
      setTagToDelete(null);
    } catch (err) {
      console.error('Error deleting tag:', err);
      setError('Failed to delete tag');
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
          onClick={() => handleEditTag(params.row)}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => handleDeleteTag(params.row)}
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
          Tag Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateTag}
        >
          Create New Tag
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
            rows={tags}
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

      {/* Tag Form Dialog */}
      <Dialog
        open={tagDialogOpen}
        onClose={() => setTagDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedTag ? 'Edit Tag' : 'Create New Tag'}
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
          <Button onClick={() => setTagDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveTag}
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
        <DialogTitle>Delete Tag</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{tagToDelete?.name}"? This action cannot be undone.
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

export default TagManagement;