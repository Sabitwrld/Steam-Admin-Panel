import React from 'react';
import { Typography, Paper, Box } from '@mui/material';

const Genres = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Genres Management
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          This is the Genres management page. Here you can view, add, edit, and delete game genres.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Genres;
