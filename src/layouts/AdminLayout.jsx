import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';

const AdminLayout = () => {
  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  return (
    <div id="wrapper">
      {/* Sidebar */}
      <ul className="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion" id="accordionSidebar">
        <a className="sidebar-brand d-flex align-items-center justify-content-center" href="/dashboard">
          <div className="sidebar-brand-icon rotate-n-15">
            <i className="fas fa-laugh-wink"></i>
          </div>
          <div className="sidebar-brand-text mx-3">Steam Admin</div>
        </a>
        <hr className="sidebar-divider my-0" />
        <li className="nav-item active">
          <Link className="nav-link" to="/dashboard">
            <i className="fas fa-fw fa-tachometer-alt"></i>
            <span>Dashboard</span>
          </Link>
        </li>
        <hr className="sidebar-divider" />
        <div className="sidebar-heading">Management</div>
        <li className="nav-item">
          <Link className="nav-link" to="/users">
            <i className="fas fa-fw fa-users"></i>
            <span>Users</span>
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/reviews"> {/* YENİ */}
            <i className="fas fa-fw fa-comments"></i>
            <span>Reviews</span>
          </Link>
        </li>
        <hr className="sidebar-divider" />
        <div className="sidebar-heading">Catalog & Store</div>
        <li className="nav-item">
          <Link className="nav-link" to="/games">
             <i className="fas fa-fw fa-gamepad"></i>
            <span>Games</span>
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/genres">
            <i className="fas fa-fw fa-theater-masks"></i>
            <span>Genres</span>
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/tags">
            <i className="fas fa-fw fa-tags"></i>
            <span>Tags</span>
          </Link>
        </li>
         <li className="nav-item">
          <Link className="nav-link" to="/campaigns">
             <i className="fas fa-fw fa-bullhorn"></i>
            <span>Campaigns</span>
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/coupons">
            <i className="fas fa-fw fa-ticket-alt"></i>
            <span>Coupons</span>
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link" to="/vouchers">
            <i className="fas fa-fw fa-money-check-alt"></i>
            <span>Vouchers</span>
          </Link>
        </li>
        <li className="nav-item"> {/* YENİ */}
          <Link className="nav-link" to="/orders">
            <i className="fas fa-fw fa-shopping-cart"></i>
            <span>Orders</span>
          </Link>
        </li>
        <hr className="sidebar-divider d-none d-md-block" />
        <div className="text-center d-none d-md-inline">
          <button className="rounded-circle border-0" id="sidebarToggle"></button>
        </div>
      </ul>
      {/* End of Sidebar */}

      {/* Content Wrapper */}
      <div id="content-wrapper" className="d-flex flex-column">
        <div id="content">
          {/* Topbar */}
          <nav className="navbar navbar-expand navbar-light bg-white topbar mb-4 static-top shadow">
            <button id="sidebarToggleTop" className="btn btn-link d-md-none rounded-circle mr-3">
              <i className="fa fa-bars"></i>
            </button>
            <ul className="navbar-nav ml-auto">
              <li className="nav-item dropdown no-arrow">
                <a className="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                  <span className="mr-2 d-none d-lg-inline text-gray-600 small">Admin</span>
                  <img className="img-profile rounded-circle" src="/img/undraw_profile.svg" alt="Profile" />
                </a>
                <div className="dropdown-menu dropdown-menu-right shadow animated--grow-in" aria-labelledby="userDropdown">
                  <a className="dropdown-item" href="#" onClick={handleLogout} data-toggle="modal" data-target="#logoutModal">
                    <i className="fas fa-sign-out-alt fa-sm fa-fw mr-2 text-gray-400"></i>
                    Logout
                  </a>
                </div>
              </li>
            </ul>
          </nav>
          {/* End of Topbar */}

          {/* Begin Page Content */}
          <div className="container-fluid">
            <Outlet />
          </div>
          {/* /.container-fluid */}
        </div>
        {/* End of Main Content */}

        {/* Footer */}
        <footer className="sticky-footer bg-white">
          <div className="container my-auto">
            <div className="copyright text-center my-auto">
              <span>Copyright &copy; Your Website 2024</span>
            </div>
          </div>
        </footer>
        {/* End of Footer */}
      </div>
      {/* End of Content Wrapper */}
    </div>
  );
};

export default AdminLayout;