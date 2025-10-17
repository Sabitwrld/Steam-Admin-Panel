import React, { useState, useEffect } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Typography,
  Alert,
  CircularProgress,
  IconButton
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
  ManageAccounts as ManageRolesIcon
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

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [availableRoles] = useState(['Admin', 'User', 'Moderator', 'Editor']);
  const [error, setError] = useState('');

  // Fetch users data
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/Admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle manage roles click
  const handleManageRoles = (user) => {
    setSelectedUser(user);
    setSelectedRoles(user.roles || []);
    setRoleDialogOpen(true);
  };

  // Handle role selection change
  const handleRoleChange = (event) => {
    setSelectedRoles(event.target.value);
  };

  // Handle save roles
  const handleSaveRoles = async () => {
    if (!selectedUser) return;

    try {
      setLoading(true);
      setError('');

      // Get the roles that were added (not removed)
      const currentRoles = selectedUser.roles || [];
      const newRoles = selectedRoles.filter(role => !currentRoles.includes(role));

      // Assign new roles
      for (const roleName of newRoles) {
        await axiosInstance.post('/Admin/roles/assign', {
          email: selectedUser.email,
          roleName: roleName
        });
      }

      // Close dialog and refresh data
      setRoleDialogOpen(false);
      setSelectedUser(null);
      setSelectedRoles([]);
      fetchUsers();
    } catch (error) {
      console.error('Error updating roles:', error);
      setError(error.response?.data?.message || 'Failed to update user roles');
    } finally {
      setLoading(false);
    }
  };

  // Handle close dialog
  const handleCloseDialog = () => {
    setRoleDialogOpen(false);
    setSelectedUser(null);
    setSelectedRoles([]);
  };

  // DataGrid columns
  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'userName', headerName: 'Username', width: 200, flex: 1 },
    { field: 'email', headerName: 'Email', width: 250, flex: 1 },
    { 
      field: 'roles', 
      headerName: 'Roles', 
      width: 200,
      valueFormatter: (params) => {
        if (!params.value || !Array.isArray(params.value)) return 'No roles';
        return params.value.join(', ');
      }
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 150,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<ManageRolesIcon />}
          label="Manage Roles"
          onClick={() => handleManageRoles(params.row)}
        />
      ]
    }
  ];

  // Custom toolbar
  const CustomToolbar = () => (
    <GridToolbarContainer>
      <Typography variant="h6" sx={{ flexGrow: 1 }}>
        User Management
      </Typography>
      <GridToolbarFilterButton />
      <GridToolbarDensitySelector />
      <GridToolbarExport />
    </GridToolbarContainer>
  );

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        User Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={users}
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

      {/* Role Management Dialog */}
      <Dialog open={roleDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Manage Roles for {selectedUser?.email}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body1" gutterBottom>
              Current user: <strong>{selectedUser?.userName}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Email: {selectedUser?.email}
            </Typography>
            
            <FormControl fullWidth sx={{ mt: 3 }}>
              <InputLabel>Roles</InputLabel>
              <Select
                multiple
                value={selectedRoles}
                onChange={handleRoleChange}
                input={<OutlinedInput label="Roles" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value} />
                    ))}
                  </Box>
                )}
                MenuProps={MenuProps}
              >
                {availableRoles.map((role) => (
                  <MenuItem key={role} value={role}>
                    {role}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Note: Only new roles will be assigned. To remove roles, contact a system administrator.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSaveRoles} 
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Save Roles'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;
