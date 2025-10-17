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
  IconButton,
  Typography,
  Alert,
  CircularProgress,
  DialogContentText
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
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

const CampaignManagement = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [campaignToDelete, setCampaignToDelete] = useState(null);
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
      startDate: null,
      endDate: null
    }
  });

  // Watch startDate to validate endDate
  const startDate = watch('startDate');

  // Fetch campaigns data
  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/Campaign');
      setCampaigns(response.data);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      setError('Failed to fetch campaigns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError('');

      const campaignData = {
        ...data,
        startDate: data.startDate ? new Date(data.startDate).toISOString() : null,
        endDate: data.endDate ? new Date(data.endDate).toISOString() : null
      };

      if (selectedCampaign) {
        // Update existing campaign
        await axiosInstance.put(`/Campaign/${selectedCampaign.id}`, campaignData);
      } else {
        // Create new campaign
        await axiosInstance.post('/Campaign', campaignData);
      }

      setDialogOpen(false);
      reset();
      setSelectedCampaign(null);
      fetchCampaigns();
    } catch (error) {
      console.error('Error saving campaign:', error);
      setError(error.response?.data?.message || 'Failed to save campaign');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit campaign
  const handleEditCampaign = (campaign) => {
    setSelectedCampaign(campaign);
    reset({
      name: campaign.name || '',
      description: campaign.description || '',
      startDate: campaign.startDate ? new Date(campaign.startDate) : null,
      endDate: campaign.endDate ? new Date(campaign.endDate) : null
    });
    setDialogOpen(true);
  };

  // Handle delete campaign
  const handleDeleteCampaign = async () => {
    try {
      setLoading(true);
      await axiosInstance.delete(`/Campaign/${campaignToDelete.id}`);
      setDeleteDialogOpen(false);
      setCampaignToDelete(null);
      fetchCampaigns();
    } catch (error) {
      console.error('Error deleting campaign:', error);
      setError(error.response?.data?.message || 'Failed to delete campaign');
    } finally {
      setLoading(false);
    }
  };

  // Handle add new campaign
  const handleAddCampaign = () => {
    setSelectedCampaign(null);
    reset();
    setDialogOpen(true);
  };

  // DataGrid columns
  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'name', headerName: 'Name', width: 200, flex: 1 },
    { field: 'description', headerName: 'Description', width: 300, flex: 1 },
    { 
      field: 'startDate', 
      headerName: 'Start Date', 
      width: 150,
      valueFormatter: (params) => {
        if (!params.value) return '';
        return new Date(params.value).toLocaleDateString();
      }
    },
    { 
      field: 'endDate', 
      headerName: 'End Date', 
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
          onClick={() => handleEditCampaign(params.row)}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => {
            setCampaignToDelete(params.row);
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
        onClick={handleAddCampaign}
      >
        Add New Campaign
      </Button>
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      <GridToolbarExport />
    </GridToolbarContainer>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          Campaign Management
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={campaigns}
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

        {/* Add/Edit Campaign Dialog */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {selectedCampaign ? 'Edit Campaign' : 'Add New Campaign'}
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
                      label="Campaign Name"
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
                      rows={4}
                      error={!!errors.description}
                      helperText={errors.description?.message}
                    />
                  )}
                />

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Controller
                    name="startDate"
                    control={control}
                    rules={{ required: 'Start date is required' }}
                    render={({ field }) => (
                      <DatePicker
                        {...field}
                        label="Start Date"
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: !!errors.startDate,
                            helperText: errors.startDate?.message
                          }
                        }}
                      />
                    )}
                  />

                  <Controller
                    name="endDate"
                    control={control}
                    rules={{ 
                      required: 'End date is required',
                      validate: (value) => {
                        if (value && startDate && new Date(value) <= new Date(startDate)) {
                          return 'End date must be after start date';
                        }
                        return true;
                      }
                    }}
                    render={({ field }) => (
                      <DatePicker
                        {...field}
                        label="End Date"
                        minDate={startDate}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            error: !!errors.endDate,
                            helperText: errors.endDate?.message
                          }
                        }}
                      />
                    )}
                  />
                </Box>
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
              Are you sure you want to delete the campaign "{campaignToDelete?.name}"? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleDeleteCampaign} 
              color="error" 
              variant="contained"
              disabled={loading}
            >
              {loading ? <CircularProgress size={20} /> : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default CampaignManagement;
