import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useForm } from 'react-hook-form';

const GenreManagement = () => {
    const [genres, setGenres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentGenre, setCurrentGenre] = useState(null);

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();
    
    const fetchGenres = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/genres');
            setGenres(response.data.data || []);
            setError('');
        } catch (err) {
            setError('Failed to fetch genres.');
            console.error(err);
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

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const onSubmit = async (data) => {
        try {
            if (isEditing) {
                await axiosInstance.put(`/genres/${currentGenre.id}`, { id: currentGenre.id, ...data });
            } else {
                await axiosInstance.post('/genres', data);
            }
            fetchGenres();
            handleCloseModal();
        } catch (err) {
            console.error('Failed to save genre:', err);
            setError(`Failed to ${isEditing ? 'update' : 'add'} genre.`);
        }
    };
    
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this genre?')) {
            try {
                await axiosInstance.delete(`/genres/${id}`);
                fetchGenres();
            } catch (err) {
                console.error('Failed to delete genre:', err);
                setError('Failed to delete genre.');
            }
        }
    };

    return (
        <div>
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <h1 className="h3 mb-0 text-gray-800">Genre Management</h1>
                <button className="btn btn-primary btn-sm" onClick={() => handleShowModal()}>
                    <i className="fas fa-plus fa-sm text-white-50"></i> Add New Genre
                </button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="card shadow mb-4">
                <div className="card-header py-3">
                    <h6 className="m-0 font-weight-bold text-primary">Genres List</h6>
                </div>
                <div className="card-body">
                    <div className="table-responsive">
                        {loading ? <p>Loading...</p> : (
                            <table className="table table-bordered" id="dataTable" width="100%" cellSpacing="0">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {genres.map(genre => (
                                        <tr key={genre.id}>
                                            <td>{genre.id}</td>
                                            <td>{genre.name}</td>
                                            <td>
                                                <button className="btn btn-warning btn-sm mr-2" onClick={() => handleShowModal(genre)}>
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(genre.id)}>
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>

            {/* Bootstrap Modal */}
            <div className={`modal fade ${showModal ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">{isEditing ? 'Edit Genre' : 'Add Genre'}</h5>
                            <button type="button" className="close" onClick={handleCloseModal}>
                                <span>&times;</span>
                            </button>
                        </div>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label htmlFor="name">Genre Name</label>
                                    <input
                                        type="text"
                                        className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                        id="name"
                                        {...register('name', { required: 'Genre name is required' })}
                                    />
                                    {errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Close</button>
                                <button type="submit" className="btn btn-primary">Save changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default GenreManagement;