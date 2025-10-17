import React from 'react';
import { Typography, Paper, Box } from '@mui/material';

const Games = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Games Management
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          This is the Games management page. Here you can view, add, edit, and delete game entries.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Games;
