import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import SearchableDataTable from '../components/SearchableDataTable';
import axiosInstance from '../api/axiosInstance';
import { debounce } from 'lodash';

const VoucherManagement = () => {
    const [vouchers, setVouchers] = useState([]);
    const [games, setGames] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newVoucher, setNewVoucher] = useState({ code: '', applicationId: '', expirationDate: '' });

    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        pageSize: 10,
    });
    
    const fetchVouchers = useCallback(async (page = 1, size = 10) => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/api/voucher', {
                params: { pageNumber: page, pageSize: size },
            });
            const { data, currentPage, totalPages, totalCount, pageSize } = response.data;
            setVouchers(data);
            setPagination({ currentPage, totalPages, totalCount, pageSize });
            setError('');
        } catch (err) {
            setError('Voucherləri yükləmək mümkün olmadı.');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchGames = async () => {
        try {
            // Səhifələmə olmadan bütün oyunları çəkmək üçün böyük bir pageSize göndəririk
            const response = await axiosInstance.get('/api/catalog', { params: { pageNumber: 1, pageSize: 1000 } });
            setGames(response.data.data);
        } catch (err) {
            console.error("Oyunları yükləmək mümkün olmadı.");
        }
    };
    
    useEffect(() => {
        fetchVouchers(pagination.currentPage, pagination.pageSize);
    }, [pagination.currentPage, pagination.pageSize, fetchVouchers]);
    
    useEffect(() => {
        fetchGames();
    }, []);

    const handleCreate = () => {
        setNewVoucher({ code: '', applicationId: '', expirationDate: '' });
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!newVoucher.code || !newVoucher.applicationId || !newVoucher.expirationDate) {
            setError("Bütün sahələri doldurun.");
            return;
        }
        try {
            await axiosInstance.post('/api/voucher', {
                ...newVoucher,
                applicationId: parseInt(newVoucher.applicationId),
                expirationDate: new Date(newVoucher.expirationDate).toISOString()
            });
            setIsModalOpen(false);
            fetchVouchers(1, pagination.pageSize); // İlk səhifəyə qayıt
        } catch (err) {
            setError('Voucher yaratmaq mümkün olmadı.');
        }
    };

    const columns = [
        { Header: 'ID', accessor: 'id' },
        { Header: 'Kod', accessor: 'code' },
        { Header: 'Oyun ID', accessor: 'applicationId' },
        { Header: 'İstifadə Edilib?', accessor: 'isUsed', Cell: ({ value }) => (value ? 'Bəli' : 'Xeyr') },
    ];
    
    return (
        <div>
            <h1 className="h3 mb-2 text-gray-800">Voucherlərin İdarə Olunması</h1>
            <p className="mb-4">Yeni voucherlər yaradın və mövcud olanları izləyin.</p>
            <Button variant="success" onClick={handleCreate} className="mb-3">
                <i className="fas fa-plus mr-2"></i>Yeni Voucher Yarat
            </Button>
            {error && <Alert variant="danger">{error}</Alert>}
            <SearchableDataTable
                columns={columns}
                data={vouchers}
                loading={loading}
                onSearch={() => {}} // Bu səhifədə axtarış yoxdur
                pagination={pagination}
                onPageChange={(page) => setPagination(p => ({ ...p, currentPage: page }))}
            />

            <Modal show={isModalOpen} onHide={() => setIsModalOpen(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Yeni Voucher Yarat</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group>
                            <Form.Label>Voucher Kodu</Form.Label>
                            <Form.Control
                                type="text"
                                value={newVoucher.code}
                                onChange={(e) => setNewVoucher({ ...newVoucher, code: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mt-3">
                            <Form.Label>Oyun</Form.Label>
                            <Form.Control
                                as="select"
                                value={newVoucher.applicationId}
                                onChange={(e) => setNewVoucher({ ...newVoucher, applicationId: e.target.value })}
                            >
                                <option value="">Oyun seçin...</option>
                                {games.map(game => (
                                    <option key={game.id} value={game.id}>{game.name}</option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                        <Form.Group className="mt-3">
                            <Form.Label>Bitmə Tarixi</Form.Label>
                            <Form.Control
                                type="datetime-local"
                                value={newVoucher.expirationDate}
                                onChange={(e) => setNewVoucher({ ...newVoucher, expirationDate: e.target.value })}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Bağla</Button>
                    <Button variant="primary" onClick={handleSave}>Yadda Saxla</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default VoucherManagement;