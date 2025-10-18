import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import SearchableDataTable from '../components/SearchableDataTable';
import axiosInstance from '../api/axiosInstance';
import { debounce } from 'lodash';

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingOrder, setEditingOrder] = useState(null);

    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        pageSize: 10,
    });
    const [searchTerm, setSearchTerm] = useState('');

    const fetchOrders = useCallback(async (page = 1, size = 10, search = '') => {
        setLoading(true);
        try {
            // DÜZƏLİŞ: Admin üçün yaradılmış yeni endpoint-ə müraciət edilir
            const response = await axiosInstance.get('/api/order/all-paged', {
                params: {
                    pageNumber: page,
                    pageSize: size,
                    searchTerm: search,
                },
            });
            const { data, currentPage, totalPages, totalCount, pageSize } = response.data;
            setOrders(data);
            setPagination({ currentPage, totalPages, totalCount, pageSize });
            setError('');
        } catch (err) {
            setError('Sifarişləri yükləmək mümkün olmadı.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const debouncedFetch = useCallback(debounce(fetchOrders, 300), [fetchOrders]);

    useEffect(() => {
        debouncedFetch(pagination.currentPage, pagination.pageSize, searchTerm);
    }, [pagination.currentPage, pagination.pageSize, searchTerm, debouncedFetch]);

    const handleEdit = (order) => {
        setEditingOrder({ ...order });
    };

    const handleSave = async () => {
        if (!editingOrder) return;
        try {
            // DÜZƏLİŞ: Statusu yeniləmək üçün düzgün endpoint-ə müraciət
            await axiosInstance.put(`/api/order/${editingOrder.id}/status?status=${editingOrder.status}`);
            setEditingOrder(null);
            fetchOrders(pagination.currentPage, pagination.pageSize, searchTerm); // Cədvəli yenilə
        } catch (err) {
            setError('Sifariş statusunu yeniləmək mümkün olmadı.');
            console.error(err);
        }
    };

    const handleStatusChange = (e) => {
        setEditingOrder(prev => ({ ...prev, status: e.target.value }));
    };

    const columns = [
        { Header: 'ID', accessor: 'id' },
        // DÜZƏLİŞ: İstifadəçi e-poçtunu göstərən yeni sütun
        { Header: 'İstifadəçi', accessor: 'userEmail' },
        {
            Header: 'Sifariş Tarixi',
            accessor: 'orderDate',
            Cell: ({ value }) => new Date(value).toLocaleDateString(),
        },
        { Header: 'Məhsul Sayı', accessor: 'itemCount' },
        { Header: 'Toplam Məbləğ', accessor: 'totalPrice', Cell: ({ value }) => `${value.toFixed(2)} AZN` },
        { Header: 'Status', accessor: 'status' },
        {
            Header: 'Əməliyyatlar',
            accessor: 'actions',
            Cell: ({ row }) => (
                <Button variant="primary" size="sm" onClick={() => handleEdit(row.original)}>
                    Redaktə Et
                </Button>
            ),
        },
    ];

    return (
        <div>
            <h1 className="h3 mb-4 text-gray-800">Sifarişlərin İdarə Olunması</h1>
            {error && <Alert variant="danger">{error}</Alert>}
            <SearchableDataTable
                columns={columns}
                data={orders}
                loading={loading}
                onSearch={setSearchTerm}
                pagination={pagination}
                onPageChange={(page) => setPagination(prev => ({ ...prev, currentPage: page }))}
            />

            <Modal show={editingOrder !== null} onHide={() => setEditingOrder(null)}>
                <Modal.Header closeButton>
                    <Modal.Title>Sifariş Statusunu Redaktə Et</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group>
                            <Form.Label>Status</Form.Label>
                            <Form.Control
                                as="select"
                                value={editingOrder?.status || ''}
                                onChange={handleStatusChange}
                            >
                                <option value="Pending">Gözləmədə</option>
                                <option value="Completed">Tamamlanıb</option>
                                <option value="Cancelled">Ləğv Edilib</option>
                            </Form.Control>
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setEditingOrder(null)}>Bağla</Button>
                    <Button variant="primary" onClick={handleSave}>Yadda Saxla</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default OrderManagement;