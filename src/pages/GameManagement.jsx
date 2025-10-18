import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import SearchableDataTable from '../components/SearchableDataTable'; // Təkmilləşdirilmiş cədvəl

const GameManagement = () => {
    const [games, setGames] = useState([]);
    const [genres, setGenres] = useState([]);
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modal və redaktə vəziyyəti
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentGame, setCurrentGame] = useState(null);

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();
    
    const fetchData = async () => {
        try {
            setLoading(true);
            const [gamesRes, genresRes, tagsRes] = await Promise.all([
                axiosInstance.get('/ApplicationCatalog'),
                axiosInstance.get('/genre/paged?PageSize=1000'),
                axiosInstance.get('/tag/paged?PageSize=1000')
            ]);
            setGames(gamesRes.data.data || []);
            setGenres(genresRes.data.data || []);
            setTags(tagsRes.data.data || []);
        } catch (err) {
            toast.error('Məlumatların yüklənməsi zamanı xəta baş verdi.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleShowModal = (game = null) => {
        reset();
        if (game) {
            setIsEditing(true);
            setCurrentGame(game);
            // Formanı mövcud oyun məlumatları ilə doldururuq
            setValue('name', game.name);
            setValue('description', game.description);
            setValue('price', game.price);
            setValue('developer', game.developer);
            setValue('publisher', game.publisher);
            setValue('releaseDate', new Date(game.releaseDate).toISOString().slice(0, 10));
            setValue('genreIds', game.genres.map(g => g.id.toString()));
            setValue('tagIds', game.tags.map(t => t.id.toString()));
        } else {
            setIsEditing(false);
            setCurrentGame(null);
        }
        setShowModal(true);
    };

    const handleCloseModal = () => setShowModal(false);

    const onSubmit = async (data) => {
        const payload = {
            ...data,
            price: parseFloat(data.price),
            releaseDate: new Date(data.releaseDate).toISOString(),
            genreIds: data.genreIds.map(id => parseInt(id)),
            tagIds: data.tagIds.map(id => parseInt(id))
        };
        
        try {
            if (isEditing) {
                await axiosInstance.put(`/ApplicationCatalog/${currentGame.id}`, { id: currentGame.id, ...payload });
                toast.success(`Oyun uğurla yeniləndi: ${payload.name}`);
            } else {
                await axiosInstance.post('/ApplicationCatalog', payload);
                toast.success(`Yeni oyun uğurla əlavə edildi: ${payload.name}`);
            }
            fetchData();
            handleCloseModal();
        } catch (err) {
             toast.error(`Əməliyyat zamanı xəta: ${err.response?.data?.title || 'Bilinməyən xəta'}`);
        }
    };
    
    const handleDelete = async (id) => {
        if (window.confirm('Bu oyunu silmək istədiyinizə əminsiniz?')) {
            try {
                await axiosInstance.delete(`/ApplicationCatalog/${id}`);
                toast.success('Oyun uğurla silindi.');
                fetchData();
            } catch (err) {
                toast.error('Oyun silinərkən xəta baş verdi.');
            }
        }
    };
    
    const columns = [
        { key: 'name', header: 'Ad', sortable: true },
        { key: 'price', header: 'Qiymət', sortable: true, render: (item) => `$${item.price.toFixed(2)}` },
        { key: 'developer', header: 'İstehsalçı', sortable: true },
        { key: 'publisher', header: 'Nəşriyyatçı', sortable: true },
        { key: 'actions', header: 'Əməliyyatlar', render: (item) => (
            <>
                <button className="btn btn-warning btn-sm mr-2" onClick={() => handleShowModal(item)} title="Redaktə et">
                    <i className="fas fa-edit"></i>
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)} title="Sil">
                    <i className="fas fa-trash"></i>
                </button>
            </>
        )}
    ];

    return (
        <div>
            <h1 className="h3 mb-4 text-gray-800">Oyunların İdarə Olunması</h1>

            <SearchableDataTable
                data={games}
                columns={columns}
                loading={loading}
                title="Oyunların Siyahısı"
                onAddClick={() => handleShowModal()}
            />
            
            <div className={`modal fade ${showModal ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog modal-xl">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">{isEditing ? 'Oyunu Redaktə Et' : 'Yeni Oyun Əlavə Et'}</h5>
                            <button type="button" className="close" onClick={handleCloseModal}><span>&times;</span></button>
                        </div>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label>Ad</label>
                                            <input type="text" className={`form-control ${errors.name ? 'is-invalid' : ''}`} {...register('name', { required: 'Oyun adı məcburidir' })} />
                                        </div>
                                        <div className="form-group">
                                            <label>Təsvir (Description)</label>
                                            <textarea className={`form-control ${errors.description ? 'is-invalid' : ''}`} rows="5" {...register('description', { required: 'Təsvir məcburidir' })}></textarea>
                                        </div>
                                         <div className="form-row">
                                            <div className="form-group col-md-6">
                                                <label>Qiymət ($)</label>
                                                <input type="number" step="0.01" className={`form-control ${errors.price ? 'is-invalid' : ''}`} {...register('price', { required: 'Qiymət məcburidir', valueAsNumber: true })} />
                                            </div>
                                            <div className="form-group col-md-6">
                                                <label>Buraxılış Tarixi</label>
                                                <input type="date" className={`form-control ${errors.releaseDate ? 'is-invalid' : ''}`} {...register('releaseDate', { required: 'Tarix məcburidir' })} />
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group col-md-6">
                                                <label>İstehsalçı</label>
                                                <input type="text" className={`form-control ${errors.developer ? 'is-invalid' : ''}`} {...register('developer', { required: 'İstehsalçı məcburidir' })} />
                                            </div>
                                            <div className="form-group col-md-6">
                                                <label>Nəşriyyatçı</label>
                                                <input type="text" className={`form-control ${errors.publisher ? 'is-invalid' : ''}`} {...register('publisher', { required: 'Nəşriyyatçı məcburidir' })} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <h5>Janrlar</h5>
                                        <div className="overflow-auto p-2" style={{ maxHeight: '300px', border: '1px solid #ddd', borderRadius: '.25rem' }}>
                                            {genres.map(genre => (
                                                <div className="form-check" key={genre.id}>
                                                    <input className="form-check-input" type="checkbox" value={genre.id} {...register('genreIds')} />
                                                    <label className="form-check-label">{genre.name}</label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <h5>Teqlər</h5>
                                        <div className="overflow-auto p-2" style={{ maxHeight: '300px', border: '1px solid #ddd', borderRadius: '.25rem' }}>
                                            {tags.map(tag => (
                                                <div className="form-check" key={tag.id}>
                                                    <input className="form-check-input" type="checkbox" value={tag.id} {...register('tagIds')} />
                                                    <label className="form-check-label">{tag.name}</label>
                                                </div>
                                            ))}
                                        </div>
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

export default GameManagement;
