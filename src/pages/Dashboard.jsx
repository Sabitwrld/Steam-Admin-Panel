import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        monthlyRevenue: 0,
        newUsers: 0,
        totalOrders: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Qeyd: Bu endpointlər backend-də yaradılmalıdır.
                // Nümunə olaraq, hər şeyi sifarişlər (orders) endpointindən hesablayırıq.
                const response = await axiosInstance.get('/orders');
                const orders = response.data.data || [];

                const totalRevenue = orders.reduce((sum, order) => order.status === 'Completed' ? sum + order.totalPrice : sum, 0);
                const newUsersResponse = await axiosInstance.get('/admin/users'); // Bu endpoint mövcuddur
                const newUsers = newUsersResponse.data.length;

                setStats({
                    totalRevenue: totalRevenue,
                    monthlyRevenue: totalRevenue, // Sadəlik üçün eyni götürülür, backend-də ayrıca hesablanmalıdır
                    newUsers: newUsers,
                    totalOrders: orders.length
                });

            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const salesChartData = {
        labels: ['January', 'February', 'March', 'April', 'May', 'June'],
        datasets: [{
            label: 'Revenue',
            data: [1200, 1900, 3000, 5000, 2300, 3200], // Bu məlumatlar da backend-dən gəlməlidir
            backgroundColor: 'rgba(78, 115, 223, 1)',
        }]
    };

    return (
        <>
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <h1 className="h3 mb-0 text-gray-800">Dashboard</h1>
            </div>

            <div className="row">
                <StatCard title="Total Revenue" value={`$${stats.totalRevenue.toFixed(2)}`} icon="dollar-sign" color="primary" loading={loading} />
                <StatCard title="Orders" value={stats.totalOrders} icon="shopping-cart" color="success" loading={loading} />
                <StatCard title="New Users" value={stats.newUsers} icon="users" color="info" loading={loading} />
                <StatCard title="Pending Reviews" value="18" icon="comments" color="warning" loading={loading} />
            </div>

            <div className="row">
                <div className="col-lg-12">
                    <div className="card shadow mb-4">
                        <div className="card-header py-3">
                            <h6 className="m-0 font-weight-bold text-primary">Revenue Over Time</h6>
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
                            {loading ? 'Loading...' : value}
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