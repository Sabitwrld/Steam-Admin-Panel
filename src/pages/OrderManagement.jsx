import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify';
import SearchableDataTable from '../components/SearchableDataTable';

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/orders');
            setOrders(response.data.data || []);
        } catch (err) {
            toast.error('Failed to fetch orders.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleShowDetails = (order) => {
        setSelectedOrder(order);
        setShowDetailModal(true);
    };
    
    const handleStatusChange = async (orderId, newStatus) => {
        if (!window.confirm(`Are you sure you want to change the status to "${newStatus}"?`)) return;

        try {
            const orderToUpdate = orders.find(o => o.id === orderId);
            const payload = { id: orderToUpdate.id, userId: orderToUpdate.userId, status: newStatus };
            await axiosInstance.put(`/orders/${orderId}`, payload);
            toast.success(`Order #${orderId} status updated to ${newStatus}`);
            fetchOrders();
        } catch (err) {
            toast.error('Failed to update order status.');
        }
    };

    const getStatusBadge = (status) => {
        const statusClasses = {
            'Pending': 'badge-warning',
            'Completed': 'badge-success',
            'Canceled': 'badge-danger',
        };
        return statusClasses[status] || 'badge-secondary';
    };

    const columns = [
        { key: 'id', header: 'ID', sortable: true },
        { key: 'userEmail', header: 'User Email', sortable: true },
        { key: 'totalPrice', header: 'Total Price', sortable: true, render: (item) => `$${item.totalPrice.toFixed(2)}` },
        { key: 'orderDate', header: 'Order Date', sortable: true, render: (item) => new Date(item.orderDate).toLocaleString() },
        { key: 'status', header: 'Status', sortable: true, render: (item) => <span className={`badge ${getStatusBadge(item.status)}`}>{item.status}</span> },
        { key: 'actions', header: 'Actions', sortable: false, render: (item) => (
            <>
                <button className="btn btn-info btn-sm mr-2" onClick={() => handleShowDetails(item)}>
                    <i className="fas fa-eye"></i> Details
                </button>
                <div className="btn-group">
                    <button type="button" className="btn btn-secondary btn-sm dropdown-toggle" data-toggle="dropdown">
                        Update Status
                    </button>
                    <div className="dropdown-menu">
                        <a className="dropdown-item" href="#" onClick={() => handleStatusChange(item.id, 'Pending')}>Pending</a>
                        <a className="dropdown-item" href="#" onClick={() => handleStatusChange(item.id, 'Completed')}>Completed</a>
                        <a className="dropdown-item" href="#" onClick={() => handleStatusChange(item.id, 'Canceled')}>Canceled</a>
                    </div>
                </div>
            </>
        )}
    ];

    return (
        <div>
            <h1 className="h3 mb-2 text-gray-800">Order Management</h1>
            <p className="mb-4">View and manage all user orders.</p>
            
            {loading ? <p>Loading orders...</p> : <SearchableDataTable data={orders} columns={columns} />}
            
            {/* Order Details Modal */}
            <div className={`modal fade ${showDetailModal ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                 <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Order Details #{selectedOrder?.id}</h5>
                            <button type="button" className="close" onClick={() => setShowDetailModal(false)}><span>&times;</span></button>
                        </div>
                        <div className="modal-body">
                            {selectedOrder && (
                                <>
                                    <p><strong>User:</strong> {selectedOrder.userEmail}</p>
                                    <p><strong>Total:</strong> ${selectedOrder.totalPrice.toFixed(2)}</p>
                                    <hr/>
                                    <h6>Items:</h6>
                                    <ul className="list-group">
                                        {selectedOrder.orderItems.map(item => (
                                            <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
                                                {item.applicationName}
                                                <span>${item.price.toFixed(2)}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderManagement;
