import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Typography, Paper, Button, ToggleButtonGroup, ToggleButton, IconButton } from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';
import axiosInstance from '../api/axiosInstance';

const ReviewManagement = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending'); // Default olaraq təsdiqlənməmişləri göstər

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filter !== 'all') {
                params.isApproved = filter === 'approved';
            }
            const response = await axiosInstance.get('/reviews/paged', { params });
            // API cavabı paged olduğu üçün .items-dən götürürük
            setReviews(response.data.items || []);
        } catch (error) {
            console.error('Failed to fetch reviews:', error);
            setReviews([]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchReviews();
    }, [filter]);

    const handleFilterChange = (event, newFilter) => {
        if (newFilter !== null) {
            setFilter(newFilter);
        }
    };

    const handleApprove = async (id) => {
        try {
            await axiosInstance.put(`/reviews/${id}`, { isApproved: true });
            fetchReviews(); // Cədvəli yenilə
        } catch (error) {
            console.error("Failed to approve review:", error);
        }
    };

    const handleReject = async (id) => {
        if (window.confirm('Are you sure you want to delete this review?')) {
            try {
                await axiosInstance.delete(`/reviews/${id}`);
                fetchReviews(); // Cədvəli yenilə
            } catch (error) {
                console.error("Failed to delete review:", error);
            }
        }
    };

    const columns = [
        { field: 'id', headerName: 'ID', width: 200 },
        { field: 'userName', headerName: 'User', width: 130 },
        { field: 'applicationName', headerName: 'Game', width: 150 },
        { field: 'contentShort', headerName: 'Review Content', width: 300 },
        {
            field: 'isRecommended',
            headerName: 'Recommended',
            width: 130,
            type: 'boolean'
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            renderCell: (params) => (
                <>
                    {!params.row.isApproved && (
                        <IconButton color="success" onClick={() => handleApprove(params.id)}>
                            <CheckCircle />
                        </IconButton>
                    )}
                    <IconButton color="error" onClick={() => handleReject(params.id)}>
                        <Cancel />
                    </IconButton>
                </>
            ),
        },
    ];

    return (
        <Box sx={{ width: '100%' }}>
            <Typography variant="h4" gutterBottom>
                Review Moderation
            </Typography>
            <ToggleButtonGroup
                color="primary"
                value={filter}
                exclusive
                onChange={handleFilterChange}
                sx={{ mb: 2 }}
            >
                <ToggleButton value="pending">Pending</ToggleButton>
                <ToggleButton value="approved">Approved</ToggleButton>
                <ToggleButton value="all">All</ToggleButton>
            </ToggleButtonGroup>
            <Paper sx={{ height: 650, width: '100%' }}>
                <DataGrid
                    rows={reviews}
                    columns={columns}
                    loading={loading}
                    pageSize={10}
                    rowsPerPageOptions={[10]}
                    checkboxSelection
                />
            </Paper>
        </Box>
    );
};

export default ReviewManagement;