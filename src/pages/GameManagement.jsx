import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import SearchableDataTable from '../components/SearchableDataTable'; // Import the new component

const GameManagement = () => {
    const [games, setGames] = useState([]);
    const [genres, setGenres] = useState([]);
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentGame, setCurrentGame] = useState(null);

    const { register, handleSubmit, reset, setValue, control } = useForm();
    
    const fetchData = async () => {
        try {
            setLoading(true);
            const [gamesRes, genresRes, tagsRes] = await Promise.all([
                axiosInstance.get('/ApplicationCatalog'),
                axiosInstance.get('/genres'),
                axiosInstance.get('/tags')
            ]);
            setGames(gamesRes.data.data || []);
            setGenres(genresRes.data.data || []);
            setTags(tagsRes.data.data || []);
        } catch (err) {
            toast.error('Failed to fetch data.');
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
                toast.success(`Game "${payload.name}" updated successfully!`);
            } else {
                await axiosInstance.post('/ApplicationCatalog', payload);
                toast.success(`Game "${payload.name}" added successfully!`);
            }
            fetchData();
            handleCloseModal();
        } catch (err) {
            toast.error(`Failed to ${isEditing ? 'update' : 'add'} game.`);
        }
    };
    
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this game?')) {
            try {
                await axiosInstance.delete(`/ApplicationCatalog/${id}`);
                toast.success('Game deleted successfully.');
                fetchData();
            } catch (err) {
                toast.error('Failed to delete game.');
            }
        }
    };

    const columns = [
        { key: 'name', header: 'Name', sortable: true },
        { key: 'price', header: 'Price', sortable: true, render: (item) => `$${item.price.toFixed(2)}` },
        { key: 'developer', header: 'Developer', sortable: true },
        { key: 'publisher', header: 'Publisher', sortable: true },
        { key: 'actions', header: 'Actions', sortable: false, render: (item) => (
            <>
                <button className="btn btn-warning btn-sm mr-2" onClick={() => handleShowModal(item)}>
                    <i className="fas fa-edit"></i>
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)}>
                    <i className="fas fa-trash"></i>
                </button>
            </>
        )}
    ];

    return (
        <div>
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <h1 className="h3 mb-0 text-gray-800">Game Management</h1>
                <button className="btn btn-primary btn-sm" onClick={() => handleShowModal()}>
                    <i className="fas fa-plus fa-sm text-white-50"></i> Add New Game
                </button>
            </div>

            {loading ? <p>Loading data...</p> : <SearchableDataTable data={games} columns={columns} />}
            
            {/* Modal */}
            <div className={`modal fade ${showModal ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                {/* ... (Modal content remains the same as previous step) ... */}
                <div className="modal-dialog modal-xl">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">{isEditing ? 'Edit Game' : 'Add New Game'}</h5>
                            <button type="button" className="close" onClick={handleCloseModal}><span>&times;</span></button>
                        </div>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label>Name</label>
                                            <input type="text" className="form-control" {...register('name', { required: true })} />
                                        </div>
                                        <div className="form-group">
                                            <label>Description</label>
                                            <textarea className="form-control" rows="5" {...register('description', { required: true })}></textarea>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group col-md-6">
                                                <label>Price</label>
                                                <input type="number" step="0.01" className="form-control" {...register('price', { required: true, valueAsNumber: true })} />
                                            </div>
                                            <div className="form-group col-md-6">
                                                <label>Release Date</label>
                                                <input type="date" className="form-control" {...register('releaseDate', { required: true })} />
                                            </div>
                                        </div>
                                        <div className="form-row">
                                            <div className="form-group col-md-6">
                                                <label>Developer</label>
                                                <input type="text" className="form-control" {...register('developer', { required: true })} />
                                            </div>
                                            <div className="form-group col-md-6">
                                                <label>Publisher</label>
                                                <input type="text" className="form-control" {...register('publisher', { required: true })} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <h5>Genres</h5>
                                        <div className="overflow-auto" style={{ maxHeight: '300px', border: '1px solid #ddd', padding: '10px' }}>
                                            {genres.map(genre => (
                                                <div className="form-check" key={genre.id}>
                                                    <input className="form-check-input" type="checkbox" value={genre.id} {...register('genreIds')} />
                                                    <label className="form-check-label">{genre.name}</label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <h5>Tags</h5>
                                        <div className="overflow-auto" style={{ maxHeight: '300px', border: '1px solid #ddd', padding: '10px' }}>
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
                                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Close</button>
                                <button type="submit" className="btn btn-primary">Save Game</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GameManagement;
