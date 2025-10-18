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
            const response = await axiosInstance.get('/orders/paged', { params: { PageSize: 1000 } }); 
            setOrders(response.data.data || []);
        } catch (err) {
            toast.error('Sifarişləri yükləmək mümkün olmadı.');
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
        if (!window.confirm(`Statusu "${newStatus}" olaraq dəyişməyə əminsiniz?`)) return;

        try {
            const orderToUpdate = orders.find(o => o.id === orderId);
            const payload = {
                id: orderToUpdate.id,
                userId: orderToUpdate.userId,
                status: newStatus,
            };

            await axiosInstance.put(`/orders/${orderId}`, payload);
            toast.success(`#${orderId} nömrəli sifarişin statusu yeniləndi`);
            fetchOrders();
        } catch (err) {
            toast.error('Statusu yeniləmək mümkün olmadı.');
        }
    };
    
    const getStatusBadge = (status) => {
        const statusClasses = { 'Pending': 'badge-warning', 'Completed': 'badge-success', 'Canceled': 'badge-danger' };
        return statusClasses[status] || 'badge-secondary';
    };

    const columns = [
        { key: 'id', header: 'ID', sortable: true },
        { key: 'userEmail', header: 'İstifadəçi Email', sortable: true },
        { key: 'totalPrice', header: 'Cəmi Qiymət', sortable: true, render: (item) => `$${item.totalPrice.toFixed(2)}` },
        { key: 'orderDate', header: 'Sifariş Tarixi', sortable: true, render: (item) => new Date(item.orderDate).toLocaleString() },
        { key: 'status', header: 'Status', sortable: true, render: (item) => <span className={`badge ${getStatusBadge(item.status)}`}>{item.status}</span> },
        { key: 'actions', header: 'Əməliyyatlar', render: (item) => (
            <div className="btn-group">
                <button className="btn btn-info btn-sm" onClick={() => handleShowDetails(item)}>
                    <i className="fas fa-eye"></i> Detallar
                </button>
                <button type="button" className="btn btn-secondary btn-sm dropdown-toggle dropdown-toggle-split" data-toggle="dropdown" />
                <div className="dropdown-menu">
                    <a className="dropdown-item" href="#" onClick={() => handleStatusChange(item.id, 'Pending')}>Gözləmədə</a>
                    <a className="dropdown-item" href="#" onClick={() => handleStatusChange(item.id, 'Completed')}>Tamamlanıb</a>
                    <a className="dropdown-item" href="#" onClick={() => handleStatusChange(item.id, 'Canceled')}>Ləğv Edilib</a>
                </div>
            </div>
        )}
    ];

    return (
        <div>
            <h1 className="h3 mb-4 text-gray-800">Sifarişlərin İdarə Olunması</h1>
            <SearchableDataTable data={orders} columns={columns} loading={loading} title="Sifarişlərin Siyahısı" />
            
            <div className={`modal fade ${showDetailModal ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                 <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Sifariş Detalları #{selectedOrder?.id}</h5>
                            <button type="button" className="close" onClick={() => setShowDetailModal(false)}><span>&times;</span></button>
                        </div>
                        <div className="modal-body">
                            {selectedOrder && (
                                <>
                                    <p><strong>İstifadəçi:</strong> {selectedOrder.userEmail}</p>
                                    <p><strong>Cəmi Məbləğ:</strong> ${selectedOrder.totalPrice.toFixed(2)}</p>
                                    <hr/>
                                    <h6>Məhsullar:</h6>
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
