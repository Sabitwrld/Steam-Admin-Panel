// src/pages/OrderManagement.jsx

import React, { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Typography, TextField, Paper } from '@mui/material';
import axiosInstance from '../api/axiosInstance';

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const response = await axiosInstance.get('/admin/orders');
                // Backend-dən gələn hər bir order-in "id"si olduğundan əmin olun
                const ordersWithId = response.data.map(order => ({
                    ...order,
                    id: order.id || order.orderId, // Əgər id yoxdursa, alternativ bir unikal sahə
                }));
                setOrders(ordersWithId);
            } catch (error) {
                console.error("Failed to fetch orders:", error);
            }
            setLoading(false);
        };

        fetchOrders();
    }, []);

    const columns = [
        { field: 'id', headerName: 'Order ID', width: 250 },
        { field: 'userName', headerName: 'User', width: 150 },
        { field: 'totalPrice', headerName: 'Total Price', width: 130, type: 'number', valueFormatter: ({ value }) => `$${value.toFixed(2)}` },
        { field: 'orderDate', headerName: 'Order Date', width: 200, type: 'dateTime', valueGetter: ({ value }) => value && new Date(value) },
        { field: 'status', headerName: 'Status', width: 130 },
        // Gələcəkdə "Actions" sütunu əlavə edə bilərsiniz
    ];

    const filteredData = orders.filter((item) =>
        Object.values(item).some(val =>
            String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    return (
        <Box sx={{ width: '100%' }}>
            <Typography variant="h4" gutterBottom>
                Order Management
            </Typography>
            <TextField
                label="Search Orders"
                variant="outlined"
                fullWidth
                margin="normal"
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Paper sx={{ height: 650, width: '100%' }}>
                <DataGrid
                    rows={filteredData}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[10]}
                    checkboxSelection
                    disableSelectionOnClick
                    loading={loading}
                />
            </Paper>
        </Box>
    );
};

export default OrderManagement;