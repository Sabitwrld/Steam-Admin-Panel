import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import SearchableDataTable from '../components/SearchableDataTable';
import axiosInstance from '../api/axiosInstance';
import { debounce } from 'lodash';

const CouponManagement = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);

    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        pageSize: 10,
    });
    const [searchTerm, setSearchTerm] = useState('');

    const fetchCoupons = useCallback(async (page = 1, size = 10, search = '') => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/api/coupon', {
                params: { pageNumber: page, pageSize: size, searchTerm: search },
            });
            const { data, currentPage, totalPages, totalCount, pageSize } = response.data;
            setCoupons(data);
            setPagination({ currentPage, totalPages, totalCount, pageSize });
            setError('');
        } catch (err) {
            setError('Kuponları yükləmək mümkün olmadı.');
        } finally {
            setLoading(false);
        }
    }, []);

    const debouncedFetch = useCallback(debounce(fetchCoupons, 300), [fetchCoupons]);

    useEffect(() => {
        debouncedFetch(pagination.currentPage, pagination.pageSize, searchTerm);
    }, [pagination.currentPage, pagination.pageSize, searchTerm, debouncedFetch]);

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCoupon(null);
    };

    const handleCreate = () => {
        setEditingCoupon({ code: '', percentage: 0, expirationDate: '', isActive: true });
        setIsModalOpen(true);
    };

    const handleEdit = (coupon) => {
        setEditingCoupon({
            ...coupon,
            expirationDate: new Date(coupon.expirationDate).toISOString().slice(0, 16),
        });
        setIsModalOpen(true);
    };
    
    const handleDelete = async (id) => {
        if (window.confirm('Bu kuponu silmək istədiyinizə əminsiniz?')) {
            try {
                await axiosInstance.delete(`/api/coupon/${id}`);
                fetchCoupons(pagination.currentPage, pagination.pageSize, searchTerm);
            } catch (err) {
                setError('Kuponu silmək mümkün olmadı.');
            }
        }
    };
    
    const handleSave = async () => {
        const couponData = {
            ...editingCoupon,
            percentage: parseFloat(editingCoupon.percentage),
            expirationDate: new Date(editingCoupon.expirationDate).toISOString(),
        };

        try {
            if (editingCoupon.id) {
                await axiosInstance.put(`/api/coupon/${editingCoupon.id}`, couponData);
            } else {
                await axiosInstance.post('/api/coupon', couponData);
            }
            handleCloseModal();
            fetchCoupons(pagination.currentPage, pagination.pageSize, searchTerm);
        } catch (err) {
             const errorMsg = editingCoupon.id ? 'yeniləmək' : 'yaratmaq';
            setError(`Kuponu ${errorMsg} mümkün olmadı.`);
        }
    };
    
    const columns = [
        { Header: 'ID', accessor: 'id' },
        { Header: 'Kod', accessor: 'code' },
        { Header: 'Endirim Faizi', accessor: 'percentage', Cell: ({ value }) => `${value}%` },
        { Header: 'Bitmə Tarixi', accessor: 'expirationDate', Cell: ({ value }) => new Date(value).toLocaleString() },
        { Header: 'Aktivdir?', accessor: 'isActive', Cell: ({ value }) => (value ? 'Bəli' : 'Xeyr') },
        {
            Header: 'Əməliyyatlar',
            accessor: 'actions',
            Cell: ({ row }) => (
                <>
                    <Button variant="primary" size="sm" onClick={() => handleEdit(row.original)} className="mr-2">Redaktə</Button>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(row.original.id)}>Sil</Button>
                </>
            ),
        },
    ];

    return (
        <div>
            <h1 className="h3 mb-2 text-gray-800">Kuponların İdarə Olunması</h1>
            <p className="mb-4">Yeni kuponlar yaradın, mövcud olanları redaktə edin və ya silin.</p>
            <Button variant="success" onClick={handleCreate} className="mb-3">
                <i className="fas fa-plus mr-2"></i>Yeni Kupon Yarat
            </Button>
            {error && <Alert variant="danger">{error}</Alert>}
            <SearchableDataTable
                columns={columns}
                data={coupons}
                loading={loading}
                onSearch={setSearchTerm}
                pagination={pagination}
                onPageChange={(page) => setPagination(p => ({ ...p, currentPage: page }))}
            />

            <Modal show={isModalOpen} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{editingCoupon?.id ? 'Kuponu Redaktə Et' : 'Yeni Kupon Yarat'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group>
                            <Form.Label>Kupon Kodu</Form.Label>
                            <Form.Control
                                type="text"
                                value={editingCoupon?.code || ''}
                                onChange={(e) => setEditingCoupon({ ...editingCoupon, code: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mt-3">
                            <Form.Label>Endirim Faizi (%)</Form.Label>
                            <Form.Control
                                type="number"
                                value={editingCoupon?.percentage || 0}
                                onChange={(e) => setEditingCoupon({ ...editingCoupon, percentage: e.target.value })}
                            />
                        </Form.Group>
                         <Form.Group className="mt-3">
                            <Form.Label>Bitmə Tarixi</Form.Label>
                            <Form.Control
                                type="datetime-local"
                                value={editingCoupon?.expirationDate || ''}
                                onChange={(e) => setEditingCoupon({ ...editingCoupon, expirationDate: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mt-3">
                            <Form.Check
                                type="switch"
                                label="Aktivdir"
                                checked={editingCoupon?.isActive || false}
                                onChange={(e) => setEditingCoupon({ ...editingCoupon, isActive: e.target.checked })}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>Bağla</Button>
                    <Button variant="primary" onClick={handleSave}>Yadda Saxla</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default CouponManagement;