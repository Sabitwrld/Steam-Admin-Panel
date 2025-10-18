import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import SearchableDataTable from '../components/SearchableDataTable';

const Tags = () => {
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentTag, setCurrentTag] = useState({ id: null, name: '' });

    const fetchTags = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/api/tags');
            setTags(response.data.data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch tags.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTags();
    }, []);

    const columns = [
        { Header: 'ID', accessor: 'id' },
        { Header: 'Name', accessor: 'name' },
    ];
    
    const handleAdd = () => {
        setIsEditing(false);
        setCurrentTag({ id: null, name: '' });
        setShowModal(true);
    };

    const handleEdit = (tag) => {
        setIsEditing(true);
        setCurrentTag(tag);
        setShowModal(true);
    };

    const handleDelete = async (tag) => {
        if (window.confirm(`Are you sure you want to delete ${tag.name}?`)) {
            try {
                await axiosInstance.delete(`/api/tags/${tag.id}`);
                fetchTags();
            } catch (err) {
                setError('Failed to delete tag.');
                console.error(err);
            }
        }
    };

    const handleSave = async () => {
        try {
            if (isEditing) {
                await axiosInstance.put(`/api/tags/${currentTag.id}`, { name: currentTag.name });
            } else {
                await axiosInstance.post('/api/tags', { name: currentTag.name });
            }
            setShowModal(false);
            fetchTags();
        } catch (err) {
            console.error("Failed to save tag", err);
            alert("Failed to save tag.");
        }
    };

    return (
        <div className="container-fluid">
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <h1 className="h3 mb-0 text-gray-800">Tags</h1>
                <button className="btn btn-primary" onClick={handleAdd}>
                    <i className="fas fa-plus fa-sm text-white-50"></i> Add New Tag
                </button>
            </div>
            
            {loading && <p>Loading...</p>}
            {error && <p className="text-danger">{error}</p>}
            {!loading && !error && (
                <SearchableDataTable
                    data={tags}
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
                                <h5 className="modal-title">{isEditing ? 'Edit Tag' : 'Add Tag'}</h5>
                                <button type="button" className="close" onClick={() => setShowModal(false)}>
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label htmlFor="tagName">Tag Name</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        id="tagName"
                                        value={currentTag.name}
                                        onChange={(e) => setCurrentTag({ ...currentTag, name: e.target.value })}
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

export default Tags;