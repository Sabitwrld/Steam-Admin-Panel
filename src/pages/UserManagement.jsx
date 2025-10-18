import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { toast } from 'react-toastify';
import SearchableDataTable from '../components/SearchableDataTable';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Modal vəziyyəti
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [userRoles, setUserRoles] = useState([]);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const [usersRes, rolesRes] = await Promise.all([
                axiosInstance.get('/admin/users'),
                axiosInstance.get('/admin/roles')
            ]);
            setUsers(usersRes.data || []);
            setRoles(rolesRes.data || []);
        } catch (err) {
            toast.error("İstifadəçi və rol məlumatları yüklənərkən xəta baş verdi.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllData();
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
            toast.success(`${selectedUser.userName} üçün rollar yeniləndi.`);
            fetchAllData(); // Siyahını yenilə
            handleCloseModal();
        } catch (err) {
            toast.error("Rollar yenilənərkən xəta baş verdi.");
        }
    };

    const columns = [
        { key: 'userName', header: 'İstifadəçi Adı', sortable: true },
        { key: 'email', header: 'Email', sortable: true },
        { key: 'roles', header: 'Rollar', sortable: false, render: (item) => item.roles.join(', ') },
        { key: 'actions', header: 'Əməliyyatlar', render: (item) => (
            <button 
                className="btn btn-info btn-sm"
                onClick={() => handleOpenRoleModal(item)}
            >
                <i className="fas fa-user-shield fa-sm"></i> Rolları İdarə Et
            </button>
        )}
    ];

    return (
        <div>
            <h1 className="h3 mb-4 text-gray-800">İstifadəçilərin İdarə Olunması</h1>
            
            <SearchableDataTable
                data={users}
                columns={columns}
                loading={loading}
                title="İstifadəçi Siyahısı"
                keyField="id"
            />

            {/* Rol İdarəetmə Modal Pəncərəsi */}
            <div className={`modal fade ${showModal ? 'show d-block' : ''}`} tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                <div className="modal-dialog">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">{selectedUser?.userName} üçün Rollar</h5>
                            <button type="button" className="close" onClick={handleCloseModal}><span>&times;</span></button>
                        </div>
                        <div className="modal-body">
                            <p>Bu istifadəçi üçün rolları seçin:</p>
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
                            <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Ləğv Et</button>
                            <button type="button" className="btn btn-primary" onClick={handleSaveRoles}>Yadda Saxla</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;