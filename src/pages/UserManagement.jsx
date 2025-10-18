import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [userRoles, setUserRoles] = useState([]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/admin/users');
            setUsers(response.data || []);
            setError('');
        } catch (err) {
            setError('Failed to fetch users.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await axiosInstance.get('/admin/roles');
            setRoles(response.data || []);
        } catch (err) {
            console.error('Failed to fetch roles:', err);
        }
    };

    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, []);

    const handleOpenRoleModal = (user) => {
        setSelectedUser(user);
        setUserRoles(user.roles || []);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedUser(null);
        setUserRoles([]);
    };

    const handleRoleChange = (roleName) => {
        setUserRoles(prevRoles =>
            prevRoles.includes(roleName)
                ? prevRoles.filter(r => r !== roleName)
                : [...prevRoles, roleName]
        );
    };

    const handleSaveRoles = async () => {
        if (!selectedUser) return;
        try {
            await axiosInstance.post(`/admin/assign-role/${selectedUser.id}`, { roles: userRoles });
            fetchUsers(); // Refresh user list to show updated roles
            handleCloseModal();
        } catch (err) {
            console.error('Failed to update roles:', err);
            setError('Failed to update roles.');
        }
    };

    return (
        <div>
            <h1 className="h3 mb-2 text-gray-800">User Management</h1>
            <p className="mb-4">Manage user roles and permissions.</p>
            
            {error && <div className="alert alert-danger">{error}</div>}

            <div className="card shadow mb-4">
                <div className="card-header py-3">
                    <h6 className="m-0 font-weight-bold text-primary">Users and Roles</h6>
                </div>
                <div className="card-body">
                    <div className="table-responsive">
                        {loading ? <p>Loading...</p> : (
                            <table className="table table-bordered" width="100%" cellSpacing="0">
                                <thead>
                                    <tr>
                                        <th>User ID</th>
                                        <th>Username</th>
                                        <th>Email</th>
                                        <th>Roles</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map(user => (
                                        <tr key={user.id}>
                                            <td>{user.id}</td>
                                            <td>{user.userName}</td>
                                            <td>{user.email}</td>
                                            <td>{user.roles.join(', ')}</td>
                                            <td>
                                                <button 
                                                    className="btn btn-info btn-sm"
                                                    onClick={() => handleOpenRoleModal(user)}
                                                >
                                                    <i className="fas fa-user-shield fa-sm"></i> Manage Roles
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

            {/* Role Management Modal */}
            <div className={`modal fade ${showModal ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">Manage Roles for {selectedUser?.userName}</h5>
                            <button type="button" className="close" onClick={handleCloseModal}><span>&times;</span></button>
                        </div>
                        <div className="modal-body">
                            <p>Select the roles for this user:</p>
                            {roles.map(role => (
                                <div className="form-check" key={role.id}>
                                    <input
                                        className="form-check-input"
                                        type="checkbox"
                                        id={`role-${role.id}`}
                                        value={role.name}
                                        checked={userRoles.includes(role.name)}
                                        onChange={() => handleRoleChange(role.name)}
                                    />
                                    <label className="form-check-label" htmlFor={`role-${role.id}`}>
                                        {role.name}
                                    </label>
                                </div>
                            ))}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancel</button>
                            <button type="button" className="btn btn-primary" onClick={handleSaveRoles}>Save Changes</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;