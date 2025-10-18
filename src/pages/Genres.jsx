import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import SearchableDataTable from '../components/SearchableDataTable';

const Genres = () => {
    const [genres, setGenres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentGenre, setCurrentGenre] = useState({ id: null, name: '' });

    const fetchGenres = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/api/genres');
            setGenres(response.data.data);
            setError(null);
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

    const columns = [
        { Header: 'ID', accessor: 'id' },
        { Header: 'Name', accessor: 'name' },
    ];

    const handleAdd = () => {
        setIsEditing(false);
        setCurrentGenre({ id: null, name: '' });
        setShowModal(true);
    };

    const handleEdit = (genre) => {
        setIsEditing(true);
        setCurrentGenre(genre);
        setShowModal(true);
    };

    const handleDelete = async (genre) => {
        if (window.confirm(`Are you sure you want to delete ${genre.name}?`)) {
            try {
                await axiosInstance.delete(`/api/genres/${genre.id}`);
                fetchGenres(); // Silindikdən sonra siyahını yenilə
            } catch (err) {
                setError('Failed to delete genre.');
                console.error(err);
            }
        }
    };

    const handleSave = async () => {
        try {
            if (isEditing) {
                await axiosInstance.put(`/api/genres/${currentGenre.id}`, { name: currentGenre.name });
            } else {
                await axiosInstance.post('/api/genres', { name: currentGenre.name });
            }
            setShowModal(false);
            fetchGenres(); // Əlavə etdikdən/redaktə etdikdən sonra siyahını yenilə
        } catch (err) {
            console.error("Failed to save genre", err);
            alert("Failed to save genre.");
        }
    };

    return (
        <div className="container-fluid">
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <h1 className="h3 mb-0 text-gray-800">Genres</h1>
                <button className="btn btn-primary" onClick={handleAdd}>
                    <i className="fas fa-plus fa-sm text-white-50"></i> Add New Genre
                </button>
            </div>
            
            {loading && <p>Loading...</p>}
            {error && <p className="text-danger">{error}</p>}
            {!loading && !error && (
                <SearchableDataTable
                    data={genres}
                    columns={columns}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            )}

            {showModal && (
                 <div className="modal show" tabIndex="-1" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{isEditing ? 'Edit Genre' : 'Add Genre'}</h5>
                                <button type="button" className="close" onClick={() => setShowModal(false)}>
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label htmlFor="genreName">Genre Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="genreName"
                                        value={currentGenre.name}
                                        onChange={(e) => setCurrentGenre({ ...currentGenre, name: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Close</button>
                                <button type="button" className="btn btn-primary" onClick={handleSave}>Save changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Genres;