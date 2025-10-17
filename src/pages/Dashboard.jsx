import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button
} from '@mui/material';
import {
  People as PeopleIcon,
  Games as GamesIcon,
  Campaign as CampaignIcon,
  Category as CategoryIcon,
  LocalOffer as LocalOfferIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  const quickActions = [
    { title: 'Users', icon: <PeopleIcon />, path: '/users', color: 'primary' },
    { title: 'Games', icon: <GamesIcon />, path: '/games', color: 'secondary' },
    { title: 'Campaigns', icon: <CampaignIcon />, path: '/campaigns', color: 'success' },
    { title: 'Genres', icon: <CategoryIcon />, path: '/genres', color: 'info' },
    { title: 'Tags', icon: <LocalOfferIcon />, path: '/tags', color: 'warning' },
  ];

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Welcome to the Steam Admin Panel
        </Typography>
        <Typography variant="body1" color="text.secondary">
          You have successfully logged in as an administrator. 
          This is where you can manage your Steam-related operations.
        </Typography>
      </Paper>

      <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
        Quick Actions
      </Typography>
      
      <Grid container spacing={3}>
        {quickActions.map((action) => (
          <Grid item xs={12} sm={6} md={4} key={action.title}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ color: `${action.color}.main`, mr: 1 }}>
                    {action.icon}
                  </Box>
                  <Typography variant="h6" component="div">
                    {action.title}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Manage {action.title.toLowerCase()} in your Steam admin panel
                </Typography>
              </CardContent>
              <CardActions>
                <Button 
                  size="small" 
                  color={action.color}
                  onClick={() => navigate(action.path)}
                >
                  Go to {action.title}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Dashboard;
