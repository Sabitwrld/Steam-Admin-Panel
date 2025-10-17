import React from 'react';
import { Typography, Paper, Box } from '@mui/material';

const Users = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Users Management
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          This is the Users management page. Here you can view, add, edit, and delete user accounts.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Users;
