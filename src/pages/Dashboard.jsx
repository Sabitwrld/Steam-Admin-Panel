import React, { useState, useEffect } from 'react';
import { Card, CardContent, Typography, Grid, CircularProgress, Box } from '@mui/material';
import axiosInstance from '../api/axiosInstance';
import { MonetizationOn, PersonAdd, ShoppingCart, RateReview } from '@mui/icons-material';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const response = await axiosInstance.get('/admin/statistics');
                setStats(response.data);
            } catch (error) {
                console.error("Failed to fetch dashboard statistics:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const statItems = [
        { title: 'Total Revenue', value: stats ? `$${stats.totalRevenue.toFixed(2)}` : 'N/A', icon: <MonetizationOn sx={{ fontSize: 40 }} color="primary" /> },
        { title: 'New Users (Last 30 Days)', value: stats ? stats.newUsersLast30Days : 'N/A', icon: <PersonAdd sx={{ fontSize: 40 }} color="secondary" /> },
        { title: 'Total Orders', value: stats ? stats.totalOrders : 'N/A', icon: <ShoppingCart sx={{ fontSize: 40 }} color="success" /> },
        { title: 'Pending Reviews', value: stats ? stats.pendingReviews : 'N/A', icon: <RateReview sx={{ fontSize: 40 }} color="error" /> },
    ];

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Dashboard
            </Typography>
            <Grid container spacing={3}>
                {statItems.map((item, index) => (
                    // Düzəliş: Köhnə "item" prop-u silindi və ölçülər birbaşa verildi.
                    <Grid item xs={12} sm={6} md={3} key={index}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    {item.icon}
                                    <Typography variant="h5" component="div" sx={{ ml: 2 }}>
                                        {item.value}
                                    </Typography>
                                </Box>
                                <Typography color="text.secondary">
                                    {item.title}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
};

export default Dashboard;