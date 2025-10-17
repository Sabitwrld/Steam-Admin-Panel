import React from 'react';
import { Typography, Paper, Box } from '@mui/material';

const Tags = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Tags Management
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          This is the Tags management page. Here you can view, add, edit, and delete game tags.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Tags;
