import React from 'react';
import { Typography, Paper, Box } from '@mui/material';

const Campaigns = () => {
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Campaigns Management
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1">
          This is the Campaigns management page. Here you can view, add, edit, and delete marketing campaigns.
        </Typography>
      </Paper>
    </Box>
  );
};

export default Campaigns;
