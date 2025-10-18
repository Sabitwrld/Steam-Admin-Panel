import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import SearchableDataTable from '../components/SearchableDataTable';

const GenreManagement = () => {
    const [genres, setGenres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentGenre, setCurrentGenre] = useState(null);
    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

    const fetchGenres = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/genre/paged', { params: { PageSize: 1000 } });
            setGenres(response.data.data || []);
        } catch (err) {
            toast.error('Janrları yükləmək mümkün olmadı.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGenres();
    }, []);

    const handleShowModal = (genre = null) => {
        reset();
        if (genre) {
            setIsEditing(true);
            setCurrentGenre(genre);
            setValue('name', genre.name);
        } else {
            setIsEditing(false);
            setCurrentGenre(null);
        }
        setShowModal(true);
    };

    const handleCloseModal = () => setShowModal(false);

    const onSubmit = async (data) => {
        try {
            if (isEditing) {
                await axiosInstance.put(`/genre`, { id: currentGenre.id, ...data });
                toast.success("Janr uğurla yeniləndi!");
            } else {
                await axiosInstance.post('/genre', data);
                toast.success("Yeni janr uğurla yaradıldı!");
            }
            fetchGenres();
            handleCloseModal();
        } catch (err) {
            toast.error("Əməliyyat zamanı xəta baş verdi.");
        }
    };
    
    const handleDelete = async (id) => {
        if (window.confirm('Bu janrı silməyə əminsiniz?')) {
            try {
                await axiosInstance.delete(`/genre/${id}`);
                toast.success('Janr uğurla silindi.');
                fetchGenres();
            } catch (err) {
                toast.error('Janrı silmək mümkün olmadı.');
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
            <h1 className="h3 mb-4 text-gray-800">Janrların İdarə Olunması</h1>
            <SearchableDataTable data={genres} columns={columns} loading={loading} title="Janr Siyahısı" onAddClick={() => handleShowModal()} />

            <div className={`modal fade ${showModal ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">{isEditing ? 'Janrı Redaktə Et' : 'Yeni Janr Yarat'}</h5>
                            <button type="button" className="close" onClick={handleCloseModal}><span>&times;</span></button>
                        </div>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label>Janr Adı</label>
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

export default GenreManagement;