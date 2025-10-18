import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import {
  DataGrid,
  GridToolbar,
  GridActionsCellItem,
} from '@mui/x-data-grid';
import { Check as CheckIcon, Close as CloseIcon } from '@mui/icons-material';
import axiosInstance from '../api/axiosInstance';

const ReviewManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('pending');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter !== 'all') {
        params.isApproved = filter === 'approved';
      }
      const response = await axiosInstance.get('/reviews/paged', { params });
      // Düzəliş: Məlumatlar .items içindədir
      setReviews(response.data.items); 
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
    setLoading(false);
  };

  fetchReviews();
}, [filter]); // filter dəyişdikdə yenidən sorğu göndər

  const handleApprove = async (reviewId) => {
    try {
      setProcessing(true);
      await axiosInstance.put(`/api/reviews/${reviewId}`, {
        isApproved: true
      });
      
      // Remove the review from the list if filtering by pending
      if (filter === 'pending') {
        setReviews(prev => prev.filter(review => review.id !== reviewId));
      } else {
        fetchReviews();
      }
    } catch (err) {
      console.error('Error approving review:', err);
      setError('Failed to approve review');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = (review) => {
    setReviewToDelete(review);
    setDeleteDialogOpen(true);
  };

  const handleConfirmReject = async () => {
    try {
      setProcessing(true);
      await axiosInstance.delete(`/api/reviews/${reviewToDelete.id}`);
      
      // Remove the review from the list
      setReviews(prev => prev.filter(review => review.id !== reviewToDelete.id));
      setDeleteDialogOpen(false);
      setReviewToDelete(null);
    } catch (err) {
      console.error('Error rejecting review:', err);
      setError('Failed to reject review');
    } finally {
      setProcessing(false);
    }
  };

  const handleFilterChange = (event, newFilter) => {
    if (newFilter !== null) {
      setFilter(newFilter);
    }
  };

  const getStatusChip = (isApproved) => {
    return (
      <Chip
        label={isApproved ? 'Approved' : 'Pending'}
        color={isApproved ? 'success' : 'warning'}
        size="small"
      />
    );
  };

  const getRecommendationChip = (isRecommended) => {
    return (
      <Chip
        label={isRecommended ? 'Recommended' : 'Not Recommended'}
        color={isRecommended ? 'success' : 'error'}
        size="small"
      />
    );
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { 
      field: 'gameTitle', 
      headerName: 'Game', 
      width: 200,
      valueGetter: (params) => params.row.game?.title || 'N/A'
    },
    { 
      field: 'username', 
      headerName: 'User', 
      width: 150,
      valueGetter: (params) => params.row.user?.username || 'N/A'
    },
    {
      field: 'content',
      headerName: 'Review Content',
      width: 300,
      renderCell: (params) => (
        <Typography
          variant="body2"
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'isRecommended',
      headerName: 'Recommendation',
      width: 150,
      renderCell: (params) => getRecommendationChip(params.value),
    },
    {
      field: 'isApproved',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => getStatusChip(params.value),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      getActions: (params) => {
        const actions = [];
        
        if (!params.row.isApproved) {
          actions.push(
            <GridActionsCellItem
              icon={<CheckIcon />}
              label="Approve"
              onClick={() => handleApprove(params.row.id)}
              disabled={processing}
            />
          );
        }
        
        actions.push(
          <GridActionsCellItem
            icon={<CloseIcon />}
            label="Reject"
            onClick={() => handleReject(params.row)}
            disabled={processing}
          />
        );
        
        return actions;
      },
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
          Review Management
        </Typography>
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={handleFilterChange}
          aria-label="review filter"
        >
          <ToggleButton value="pending" aria-label="pending">
            Pending
          </ToggleButton>
          <ToggleButton value="approved" aria-label="approved">
            Approved
          </ToggleButton>
          <ToggleButton value="all" aria-label="all">
            All
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <DataGrid
            rows={reviews}
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

      {/* Delete/Reject Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Reject Review</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to reject this review? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmReject} 
            color="error" 
            variant="contained"
            disabled={processing}
            startIcon={processing ? <CircularProgress size={20} /> : null}
          >
            {processing ? 'Rejecting...' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReviewManagement;