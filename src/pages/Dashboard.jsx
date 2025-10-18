import React, { useEffect, useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { toast } from 'react-toastify';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        newUsersLast30Days: 0,
        totalOrders: 0,
        pendingReviews: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // DÜZƏLİŞ: Vahid statistika endpoint-inə sorğu göndərilir
                const response = await axiosInstance.get('/admin/statistics');
                setStats(response.data);
            } catch (error) {
                toast.error("Dashboard statistikası yüklənərkən xəta baş verdi.");
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const salesChartData = {
        labels: ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'İyun'],
        datasets: [{
            label: 'Gəlir',
            data: [1200, 1900, 3000, 5000, 2300, 3200], // Gələcəkdə bu məlumatlar backend-dən gəlməlidir
            backgroundColor: 'rgba(78, 115, 223, 1)',
        }]
    };

    return (
        <>
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <h1 className="h3 mb-0 text-gray-800">İdarəetmə Paneli</h1>
            </div>

            <div className="row">
                <StatCard title="Cəmi Gəlir" value={`$${stats.totalRevenue.toFixed(2)}`} icon="dollar-sign" color="primary" loading={loading} />
                <StatCard title="Cəmi Sifarişlər" value={stats.totalOrders} icon="shopping-cart" color="success" loading={loading} />
                <StatCard title="Yeni İstifadəçilər (30 gün)" value={stats.newUsersLast30Days} icon="users" color="info" loading={loading} />
                <StatCard title="Gözləyən Rəylər" value={stats.pendingReviews} icon="comments" color="warning" loading={loading} />
            </div>
            
            <div className="row">
                <div className="col-lg-12">
                    <div className="card shadow mb-4">
                        <div className="card-header py-3">
                            <h6 className="m-0 font-weight-bold text-primary">Gəlir Qrafiki</h6>
                        </div>
                        <div className="card-body">
                            <div style={{ height: '320px' }}>
                                <Bar options={{ responsive: true, maintainAspectRatio: false }} data={salesChartData} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

const StatCard = ({ title, value, icon, color, loading }) => (
    <div className="col-xl-3 col-md-6 mb-4">
        <div className={`card border-left-${color} shadow h-100 py-2`}>
            <div className="card-body">
                <div className="row no-gutters align-items-center">
                    <div className="col mr-2">
                        <div className={`text-xs font-weight-bold text-${color} text-uppercase mb-1`}>{title}</div>
                        <div className="h5 mb-0 font-weight-bold text-gray-800">
                            {loading ? 'Yüklənir...' : value}
                        </div>
                    </div>
                    <div className="col-auto">
                        <i className={`fas fa-${icon} fa-2x text-gray-300`}></i>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export default Dashboard;
