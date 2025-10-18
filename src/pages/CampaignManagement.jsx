import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import SearchableDataTable from '../components/SearchableDataTable';

const CampaignManagement = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentCampaign, setCurrentCampaign] = useState(null);

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

    const fetchCampaigns = async () => {
        try {
            setLoading(true);
            // DÜZƏLİŞ: URL '/campaigns/paged' -> '/campaign/paged'
            const response = await axiosInstance.get('/campaign/paged', { params: { PageSize: 1000 } });
            setCampaigns(response.data.data || []);
        } catch (err) {
            toast.error('Kampaniyaları yükləmək mümkün olmadı.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const handleShowModal = (campaign = null) => {
        reset();
        if (campaign) {
            setIsEditing(true);
            setCurrentCampaign(campaign);
            setValue('name', campaign.name);
            setValue('description', campaign.description);
            setValue('discount', campaign.discount);
            setValue('startDate', new Date(campaign.startDate).toISOString().slice(0, 16));
            setValue('endDate', new Date(campaign.endDate).toISOString().slice(0, 16));
        } else {
            setIsEditing(false);
            setCurrentCampaign(null);
        }
        setShowModal(true);
    };

    const handleCloseModal = () => setShowModal(false);

    const onSubmit = async (data) => {
        const payload = {
            ...data,
            discount: parseFloat(data.discount),
            startDate: new Date(data.startDate).toISOString(),
            endDate: new Date(data.endDate).toISOString()
        };

        try {
            if (isEditing) {
                 // DÜZƏLİŞ: URL '/campaigns' -> '/campaign'
                await axiosInstance.put(`/campaign`, { id: currentCampaign.id, ...payload });
                toast.success("Kampaniya uğurla yeniləndi!");
            } else {
                 // DÜZƏLİŞ: URL '/campaigns' -> '/campaign'
                await axiosInstance.post('/campaign', payload);
                toast.success("Yeni kampaniya uğurla yaradıldı!");
            }
            fetchCampaigns();
            handleCloseModal();
        } catch (err) {
            toast.error("Əməliyyat zamanı xəta baş verdi.");
        }
    };
    
    const handleDelete = async (id) => {
        if (window.confirm('Bu kampaniyanı silməyə əminsiniz?')) {
            try {
                // DÜZƏLİŞ: URL '/campaigns/' -> '/campaign/'
                await axiosInstance.delete(`/campaign/${id}`);
                toast.success('Kampaniya uğurla silindi.');
                fetchCampaigns();
            } catch (err) {
                toast.error('Kampaniyanı silmək mümkün olmadı.');
            }
        }
    };

    const columns = [
        { key: 'name', header: 'Ad', sortable: true },
        { key: 'discount', header: 'Endirim (%)', sortable: true },
        { key: 'startDate', header: 'Başlanğıc', sortable: true, render: (item) => new Date(item.startDate).toLocaleDateString() },
        { key: 'endDate', header: 'Bitiş', sortable: true, render: (item) => new Date(item.endDate).toLocaleDateString() },
        { key: 'actions', header: 'Əməliyyatlar', render: (item) => (
            <>
                <button className="btn btn-warning btn-sm mr-2" onClick={() => handleShowModal(item)}><i className="fas fa-edit"></i></button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)}><i className="fas fa-trash"></i></button>
            </>
        )}
    ];

    return (
        <div>
            <h1 className="h3 mb-4 text-gray-800">Kampaniyaların İdarə Olunması</h1>
            <SearchableDataTable data={campaigns} columns={columns} loading={loading} title="Kampaniya Siyahısı" onAddClick={() => handleShowModal()} />

            <div className={`modal fade ${showModal ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-lg">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">{isEditing ? 'Kampaniyanı Redaktə Et' : 'Yeni Kampaniya Yarat'}</h5>
                            <button type="button" className="close" onClick={handleCloseModal}><span>&times;</span></button>
                        </div>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Ad</label>
                                    <input type="text" className={`form-control ${errors.name ? 'is-invalid' : ''}`} {...register('name', { required: 'Ad məcburidir' })} />
                                </div>
                                <div className="form-group">
                                    <label>Təsvir</label>
                                    <textarea className="form-control" {...register('description')}></textarea>
                                </div>
                                <div className="form-row">
                                    <div className="form-group col-md-4">
                                        <label>Endirim (%)</label>
                                        <input type="number" step="0.01" className={`form-control ${errors.discount ? 'is-invalid' : ''}`} {...register('discount', { required: 'Endirim məcburidir', valueAsNumber: true, min: 0, max: 100 })} />
                                    </div>
                                    <div className="form-group col-md-4">
                                        <label>Başlanğıc Tarixi</label>
                                        <input type="datetime-local" className={`form-control ${errors.startDate ? 'is-invalid' : ''}`} {...register('startDate', { required: 'Başlanğıc tarixi məcburidir' })} />
                                    </div>
                                    <div className="form-group col-md-4">
                                        <label>Bitiş Tarixi</label>
                                        <input type="datetime-local" className={`form-control ${errors.endDate ? 'is-invalid' : ''}`} {...register('endDate', { required: 'Bitiş tarixi məcburidir' })} />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Bağla</button>
                                <button type="submit" className="btn btn-primary">Yadda Saxla</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CampaignManagement;
