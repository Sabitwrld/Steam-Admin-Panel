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
  FormGroup,
  FormControlLabel,
  Checkbox,
  Chip,
} from '@mui/material';
import {
  DataGrid,
  GridToolbar,
  GridActionsCellItem,
} from '@mui/x-data-grid';
import { Edit as EditIcon } from '@mui/icons-material';
import axiosInstance from '../api/axiosInstance';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/admin/users');
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await axiosInstance.get('/api/admin/roles');
      setRoles(response.data);
    } catch (err) {
      console.error('Error fetching roles:', err);
    }
  };

  const handleEditRoles = (user) => {
    setSelectedUser(user);
    setSelectedRoles(user.roles || []);
    setRoleDialogOpen(true);
  };

  const handleRoleChange = (roleName) => {
    setSelectedRoles(prev => 
      prev.includes(roleName)
        ? prev.filter(role => role !== roleName)
        : [...prev, roleName]
    );
  };

  const handleSaveRoles = async () => {
    if (!selectedUser) return;
    
    try {
      setUpdating(true);
      await axiosInstance.post(`/api/admin/assign-role/${selectedUser.id}`, {
        roles: selectedRoles
      });
      
      // Update the user in the local state
      setUsers(prev => prev.map(user => 
        user.id === selectedUser.id 
          ? { ...user, roles: selectedRoles }
          : user
      ));
      
      setRoleDialogOpen(false);
      setSelectedUser(null);
    } catch (err) {
      console.error('Error updating roles:', err);
      setError('Failed to update user roles');
    } finally {
      setUpdating(false);
    }
  };

  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'username', headerName: 'Username', width: 150 },
    { field: 'email', headerName: 'Email', width: 200 },
    {
      field: 'roles',
      headerName: 'Roles',
      width: 200,
      renderCell: (params) => (
        <Box>
          {params.value?.map((role, index) => (
            <Chip
              key={index}
              label={role}
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
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit Roles"
          onClick={() => handleEditRoles(params.row)}
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
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        User Management
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <DataGrid
            rows={users}
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

      <Dialog
        open={roleDialogOpen}
        onClose={() => setRoleDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Edit Roles for {selectedUser?.username}
        </DialogTitle>
        <DialogContent>
          <FormGroup>
            {roles.map((role) => (
              <FormControlLabel
                key={role}
                control={
                  <Checkbox
                    checked={selectedRoles.includes(role)}
                    onChange={() => handleRoleChange(role)}
                  />
                }
                label={role}
              />
            ))}
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveRoles}
            variant="contained"
            disabled={updating}
            startIcon={updating ? <CircularProgress size={20} /> : null}
          >
            {updating ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserManagement;