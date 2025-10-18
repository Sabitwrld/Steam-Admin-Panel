import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify';
import SearchableDataTable from '../components/SearchableDataTable';

const ReviewManagement = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/review');
            setReviews(response.data.data || []);
        } catch (err) {
            toast.error('Failed to fetch reviews.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const handleApprove = async (review) => {
        try {
            const payload = { ...review, isApproved: !review.isApproved };
            await axiosInstance.put(`/review/${review.id}`, payload);
            toast.success(`Review status changed!`);
            fetchReviews();
        } catch (err) {
            toast.error('Failed to update review status.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to permanently delete this review?')) {
            try {
                await axiosInstance.delete(`/review/${id}`);
                toast.success('Review deleted successfully.');
                fetchReviews();
            } catch (err) {
                toast.error('Failed to delete review.');
            }
        }
    };

    const columns = [
        { key: 'applicationName', header: 'Game', sortable: true },
        { key: 'userName', header: 'User', sortable: true },
        { key: 'content', header: 'Content', sortable: false },
        { key: 'rating', header: 'Rating', sortable: true, render: (item) => `${item.rating}/10` },
        { key: 'actions', header: 'Actions', sortable: false, render: (item) => (
            <>
                <button 
                    className={`btn btn-sm mr-2 ${item.isApproved ? 'btn-outline-secondary' : 'btn-success'}`}
                    onClick={() => handleApprove(item)}
                >
                    <i className={`fas ${item.isApproved ? 'fa-times-circle' : 'fa-check-circle'}`}></i> {item.isApproved ? 'Unapprove' : 'Approve'}
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)}>
                    <i className="fas fa-trash"></i>
                </button>
            </>
        )}
    ];

    return (
        <div>
            <h1 className="h3 mb-2 text-gray-800">Review Management</h1>
            <p className="mb-4">Approve or delete user-submitted reviews.</p>
            
            {loading ? <p>Loading reviews...</p> : <SearchableDataTable data={reviews} columns={columns} />}
        </div>
    );
};

export default ReviewManagement;
