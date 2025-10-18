import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import SearchableDataTable from '../components/SearchableDataTable';

const TagManagement = () => {
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentTag, setCurrentTag] = useState(null);
    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

    const fetchTags = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/tag/paged', { params: { PageSize: 1000 } });
            setTags(response.data.data || []);
        } catch (err) {
            toast.error('Teqləri yükləmək mümkün olmadı.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTags();
    }, []);

    const handleShowModal = (tag = null) => {
        reset();
        if (tag) {
            setIsEditing(true);
            setCurrentTag(tag);
            setValue('name', tag.name);
        } else {
            setIsEditing(false);
            setCurrentTag(null);
        }
        setShowModal(true);
    };

    const handleCloseModal = () => setShowModal(false);

    const onSubmit = async (data) => {
        try {
            if (isEditing) {
                await axiosInstance.put(`/tag`, { id: currentTag.id, ...data });
                toast.success("Teq uğurla yeniləndi!");
            } else {
                await axiosInstance.post('/tag', data);
                toast.success("Yeni teq uğurla yaradıldı!");
            }
            fetchTags();
            handleCloseModal();
        } catch (err) {
            toast.error("Əməliyyat zamanı xəta baş verdi.");
        }
    };
    
    const handleDelete = async (id) => {
        if (window.confirm('Bu teqi silməyə əminsiniz?')) {
            try {
                await axiosInstance.delete(`/tag/${id}`);
                toast.success('Teq uğurla silindi.');
                fetchTags();
            } catch (err) {
                toast.error('Teqi silmək mümkün olmadı.');
            }
        }
    };

    const columns = [
        { key: 'name', header: 'Ad', sortable: true },
        { key: 'actions', header: 'Əməliyyatlar', render: (item) => (
            <>
                <button className="btn btn-warning btn-sm mr-2" onClick={() => handleShowModal(item)}><i className="fas fa-edit"></i></button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)}><i className="fas fa-trash"></i></button>
            </>
        )}
    ];

    return (
        <div>
            <h1 className="h3 mb-4 text-gray-800">Teqlərin İdarə Olunması</h1>
            <SearchableDataTable data={tags} columns={columns} loading={loading} title="Teq Siyahısı" onAddClick={() => handleShowModal()} />

            <div className={`modal fade ${showModal ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">{isEditing ? 'Teqi Redaktə Et' : 'Yeni Teq Yarat'}</h5>
                            <button type="button" className="close" onClick={handleCloseModal}><span>&times;</span></button>
                        </div>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Teq Adı</label>
                                    <input type="text" className={`form-control ${errors.name ? 'is-invalid' : ''}`} {...register('name', { required: 'Ad məcburidir' })} />
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

export default TagManagement;