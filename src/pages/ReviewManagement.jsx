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
            const response = await axiosInstance.get('/review/paged', { params: { PageSize: 1000 } });
            setReviews(response.data.data || []);
        } catch (err) {
            toast.error('Rəyləri yükləmək mümkün olmadı.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const handleApproveToggle = async (review) => {
        try {
            const payload = { 
                id: review.id,
                content: review.content,
                rating: review.rating,
                isApproved: !review.isApproved 
            };
            await axiosInstance.put(`/review`, payload);
            toast.success(`Rəyin statusu dəyişdirildi.`);
            fetchReviews();
        } catch (err) {
            toast.error('Rəy statusunu yeniləmək mümkün olmadı.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bu rəyi silmək istədiyinizə əminsiniz?')) {
            try {
                await axiosInstance.delete(`/review/${id}`);
                toast.success('Rəy uğurla silindi.');
                fetchReviews();
            } catch (err) {
                toast.error('Rəyi silmək mümkün olmadı.');
            }
        }
    };

    const columns = [
        { key: 'applicationName', header: 'Oyun', sortable: true },
        { key: 'userName', header: 'İstifadəçi', sortable: true },
        { key: 'content', header: 'Rəy', sortable: false, render: (item) => <small>{item.content}</small> },
        { key: 'rating', header: 'Reytinq', sortable: true, render: (item) => `${item.rating}/5` },
        { key: 'isApproved', header: 'Status', sortable: true, render: (item) => (
            item.isApproved
                ? <span className="badge badge-success">Təsdiqlənib</span>
                : <span className="badge badge-warning">Gözləmədə</span>
        )},
        { key: 'actions', header: 'Əməliyyatlar', render: (item) => (
            <>
                <button 
                    className={`btn btn-sm mr-2 ${item.isApproved ? 'btn-outline-secondary' : 'btn-success'}`}
                    onClick={() => handleApproveToggle(item)}
                    title={item.isApproved ? 'Ləğv et' : 'Təsdiqlə'}
                >
                    <i className={`fas ${item.isApproved ? 'fa-times-circle' : 'fa-check-circle'}`}></i>
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)} title="Sil">
                    <i className="fas fa-trash"></i>
                </button>
            </>
        )}
    ];

    return (
        <div>
            <h1 className="h3 mb-4 text-gray-800">Rəylərin İdarə Olunması</h1>
            <SearchableDataTable data={reviews} columns={columns} loading={loading} title="Rəylərin Siyahısı" />
        </div>
    );
};

export default ReviewManagement;
