import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import SearchableDataTable from '../components/SearchableDataTable';
import axiosInstance from '../api/axiosInstance';
import { debounce } from 'lodash';

const CampaignManagement = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCampaign, setEditingCampaign] = useState(null);

    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        pageSize: 10,
    });
    const [searchTerm, setSearchTerm] = useState('');

    const fetchCampaigns = useCallback(async (page = 1, size = 10, search = '') => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/api/campaign', {
                params: { pageNumber: page, pageSize: size, searchTerm: search },
            });
            const { data, currentPage, totalPages, totalCount, pageSize } = response.data;
            setCampaigns(data);
            setPagination({ currentPage, totalPages, totalCount, pageSize });
            setError('');
        } catch (err) {
            setError('Kampaniyaları yükləmək mümkün olmadı.');
        } finally {
            setLoading(false);
        }
    }, []);

    const debouncedFetch = useCallback(debounce(fetchCampaigns, 300), [fetchCampaigns]);

    useEffect(() => {
        debouncedFetch(pagination.currentPage, pagination.pageSize, searchTerm);
    }, [pagination.currentPage, pagination.pageSize, searchTerm, debouncedFetch]);
    
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCampaign(null);
    };

    const handleCreate = () => {
        setEditingCampaign({ name: '', description: '', startDate: '', endDate: '' });
        setIsModalOpen(true);
    };

    const handleEdit = (campaign) => {
        setEditingCampaign({
            ...campaign,
            startDate: new Date(campaign.startDate).toISOString().slice(0, 16),
            endDate: new Date(campaign.endDate).toISOString().slice(0, 16),
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bu kampaniyanı silmək istədiyinizə əminsiniz?')) {
            try {
                await axiosInstance.delete(`/api/campaign/${id}`);
                fetchCampaigns(pagination.currentPage, pagination.pageSize, searchTerm);
            } catch (err) {
                setError('Kampaniyanı silmək mümkün olmadı.');
            }
        }
    };

    const handleSave = async () => {
        const campaignData = {
            ...editingCampaign,
            startDate: new Date(editingCampaign.startDate).toISOString(),
            endDate: new Date(editingCampaign.endDate).toISOString(),
        };

        try {
            if (editingCampaign.id) {
                await axiosInstance.put(`/api/campaign/${editingCampaign.id}`, campaignData);
            } else {
                await axiosInstance.post('/api/campaign', campaignData);
            }
            handleCloseModal();
            fetchCampaigns(pagination.currentPage, pagination.pageSize, searchTerm);
        } catch (err) {
            const errorMsg = editingCampaign.id ? 'yeniləmək' : 'yaratmaq';
            setError(`Kampaniyanı ${errorMsg} mümkün olmadı.`);
        }
    };

    const columns = [
        { Header: 'ID', accessor: 'id' },
        { Header: 'Ad', accessor: 'name' },
        { Header: 'Başlama Tarixi', accessor: 'startDate', Cell: ({ value }) => new Date(value).toLocaleString() },
        { Header: 'Bitmə Tarixi', accessor: 'endDate', Cell: ({ value }) => new Date(value).toLocaleString() },
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
            <h1 className="h3 mb-2 text-gray-800">Kampaniyaların İdarə Olunması</h1>
            <p className="mb-4">Yeni kampaniyalar yaradın, mövcud olanları redaktə edin və ya silin.</p>
            <Button variant="success" onClick={handleCreate} className="mb-3">
                <i className="fas fa-plus mr-2"></i>Yeni Kampaniya Yarat
            </Button>
            {error && <Alert variant="danger">{error}</Alert>}
            <SearchableDataTable
                columns={columns}
                data={campaigns}
                loading={loading}
                onSearch={setSearchTerm}
                pagination={pagination}
                onPageChange={(page) => setPagination(p => ({ ...p, currentPage: page }))}
            />

            <Modal show={isModalOpen} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>{editingCampaign?.id ? 'Kampaniyanı Redaktə Et' : 'Yeni Kampaniya Yarat'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group>
                            <Form.Label>Kampaniya Adı</Form.Label>
                            <Form.Control
                                type="text"
                                value={editingCampaign?.name || ''}
                                onChange={(e) => setEditingCampaign({ ...editingCampaign, name: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mt-3">
                            <Form.Label>Açıqlama</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={editingCampaign?.description || ''}
                                onChange={(e) => setEditingCampaign({ ...editingCampaign, description: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mt-3">
                            <Form.Label>Başlama Tarixi</Form.Label>
                            <Form.Control
                                type="datetime-local"
                                value={editingCampaign?.startDate || ''}
                                onChange={(e) => setEditingCampaign({ ...editingCampaign, startDate: e.target.value })}
                            />
                        </Form.Group>
                        <Form.Group className="mt-3">
                            <Form.Label>Bitmə Tarixi</Form.Label>
                            <Form.Control
                                type="datetime-local"
                                value={editingCampaign?.endDate || ''}
                                onChange={(e) => setEditingCampaign({ ...editingCampaign, endDate: e.target.value })}
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

export default CampaignManagement;