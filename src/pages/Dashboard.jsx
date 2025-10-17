import React from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {

  const cardItems = [
    { title: 'Users', path: '/users', color: 'primary', icon: 'fa-users' },
    { title: 'Games', path: '/games', color: 'success', icon: 'fa-gamepad' },
    { title: 'Campaigns', path: '/campaigns', color: 'info', icon: 'fa-bullhorn' },
    { title: 'Genres', path: '/genres', color: 'warning', icon: 'fa-theater-masks' },
    { title: 'Tags', path: '/tags', color: 'danger', icon: 'fa-tags' },
  ];

  return (
    <>
      {/* Page Heading */}
      <div className="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 className="h3 mb-0 text-gray-800">Dashboard</h1>
        <a href="#" className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm">
          <i className="fas fa-download fa-sm text-white-50"></i> Generate Report
        </a>
      </div>

      {/* Content Row */}
      <div className="row">
        {/* Welcome Card */}
        <div className="col-lg-12 mb-4">
            <div className="card shadow mb-4">
                <div className="card-header py-3">
                    <h6 className="m-0 font-weight-bold text-primary">Welcome to the Steam Admin Panel</h6>
                </div>
                <div className="card-body">
                    <p>You have successfully logged in as an administrator.</p>
                    <p className="mb-0">This is where you can manage your Steam-related operations using the menu on the left.</p>
                </div>
            </div>
        </div>
      </div>
      
      <h2 className="h4 mb-3 text-gray-800">Quick Actions</h2>
      
      {/* Quick Actions Row */}
      <div className="row">
        {cardItems.map((item) => (
          <div className="col-xl-3 col-md-6 mb-4" key={item.title}>
            <div className={`card border-left-${item.color} shadow h-100 py-2`}>
              <div className="card-body">
                <div className="row no-gutters align-items-center">
                  <div className="col mr-2">
                    <div className={`text-xs font-weight-bold text-${item.color} text-uppercase mb-1`}>
                      {item.title}
                    </div>
                    <div className="h5 mb-0 font-weight-bold text-gray-800">
                      <Link to={item.path} className="text-gray-800 stretched-link" style={{ textDecoration: 'none' }}>
                        Manage {item.title}
                      </Link>
                    </div>
                  </div>
                  <div className="col-auto">
                    <i className={`fas ${item.icon} fa-2x text-gray-300`}></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default Dashboard;