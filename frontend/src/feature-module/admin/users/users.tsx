import React, { useEffect, useState, useRef } from 'react';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Link } from 'react-router-dom';
import * as Icon from 'react-feather';
import axios from 'axios';
import { Toast } from 'primereact/toast';
import { Modal } from 'bootstrap';
import UsersModal from '../common/modals/users-modal';

const Users = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLetter, setSelectedLetter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const toast = useRef<Toast>(null);
  const deleteModalRef = useRef<any>(null);

  const alphabet = ['All', ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')];

  // Load users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/users`);
        setUsers(response.data);
        setFilteredUsers(response.data);
      } catch (error) {
        showToast('error', 'Error', 'Failed to load users');
        console.error('Error loading users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
    deleteModalRef.current = new Modal(document.getElementById('delete-user-modal'));
  }, []);

  // Show toast notification
  const showToast = (severity: string, summary: string, detail: string) => {
    toast.current?.show({ severity, summary, detail, life: 3000 });
  };

  // Apply all filters
  const applyFilters = (query: string, letter: string, role: string | null) => {
    let filtered = [...users];

    if (letter !== 'All') {
      filtered = filtered.filter((user: any) =>
        user.firstname?.charAt(0).toUpperCase() === letter
      );
    }

    if (query) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter((user: any) =>
        user.firstname.toLowerCase().includes(lowerQuery) ||
        user.lastname.toLowerCase().includes(lowerQuery) ||
        user.email.toLowerCase().includes(lowerQuery) ||
        user.role.toLowerCase().includes(lowerQuery) ||
        user.phone.includes(query)
      );
    }

    if (role) {
      filtered = filtered.filter((user: any) => user.role.toLowerCase() === role.toLowerCase());
    }

    setFilteredUsers(filtered);
  };

  // Filter handlers
  const filterByLetter = (letter: string) => {
    setSelectedLetter(letter);
    applyFilters(searchQuery, letter, roleFilter);
  };

  const filterBySearch = (query: string) => {
    setSearchQuery(query);
    applyFilters(query, selectedLetter, roleFilter);
  };

  const filterByRole = (role: string) => {
    const newRoleFilter = role === roleFilter ? null : role;
    setRoleFilter(newRoleFilter);
    applyFilters(searchQuery, selectedLetter, newRoleFilter);
  };

  // User deletion
  const confirmDeleteUser = (user: any) => {
    setUserToDelete(user);
    deleteModalRef.current?.show();
  };

  const deleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/users/${userToDelete._id}`);
      const updatedUsers = users.filter((user) => user._id !== userToDelete._id);
      setUsers(updatedUsers);
      setFilteredUsers(updatedUsers);
      deleteModalRef.current?.hide();
      showToast('success', 'Success', 'User deleted successfully');
    } catch (error) {
      console.error("Error deleting user:", error);
      showToast('error', 'Error', 'Failed to delete user');
    } finally {
      setUserToDelete(null);
    }
  };

  // Form validation
  const validateForm = (data: any) => {
    const errors: any = {};

    if (!data.firstname || data.firstname.trim().length < 2 || data.firstname.trim().length > 50) {
      errors.firstname = "First name must be between 2-50 characters";
    }

    if (!data.lastname || data.lastname.trim().length < 2 || data.lastname.trim().length > 50) {
      errors.lastname = "Last name must be between 2-50 characters";
    }

    if (!data.email || !/^\S+@\S+\.\S+$/.test(data.email)) {
      errors.email = "Please provide a valid email address";
    }

    if (!data.phone || !/^(2|5|9)\d{7}$/.test(data.phone)) {
      errors.phone = "Please provide a valid Tunisian phone number";
    }

    if (!data.password || data.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])/.test(data.password)) {
      errors.password = "Password must contain at least one lowercase letter";
    } else if (!/(?=.*[A-Z])/.test(data.password)) {
      errors.password = "Password must contain at least one uppercase letter";
    } else if (!/(?=.*\d)/.test(data.password)) {
      errors.password = "Password must contain at least one digit";
    } else if (!/(?=.*[@$!%*?&])/.test(data.password)) {
      errors.password = "Password must contain at least one special character";
    }

    return errors;
  };

  // Action buttons for each user
  const actionButton = (user: any) => {
    return (
      <div className="table-actions d-flex">
        <Link 
          className="delete-table me-2" 
          to="#" 
          data-bs-toggle="modal" 
          data-bs-target="#edit-user"
          data-user={JSON.stringify(user)}
        >
          <Icon.Edit className="react-feather-custom" />
        </Link>
        <Link 
          className="delete-table" 
          to="#" 
          onClick={(e) => {
            e.preventDefault();
            confirmDeleteUser(user);
          }}
        >
          <Icon.Trash2 className="react-feather-custom" />
        </Link>
      </div>
    );
  };

  return (
    <>
      <Toast ref={toast} />
      <div className="page-wrapper page-settings" style={{ height: '100vh', overflow: 'hidden' }}>
        <div className="content" style={{ height: 'calc(100% - 60px)', overflowY: 'auto' }}>
          <div className="content-page-header">
            <h5>Users</h5>
            <div className="list-btn">
              <ul className="d-flex flex-wrap gap-2">
                {/* Search bar */}
                <li>
                  <div className="input-group">
                    <span className="input-group-text">
                      <Icon.Search size={18} />
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => filterBySearch(e.target.value)}
                    />
                  </div>
                </li>

                {/* Alphabet filter */}
                <li>
                  <div className="filter-sorting">
                    <select
                      className="form-select"
                      value={selectedLetter}
                      onChange={(e) => filterByLetter(e.target.value)}
                    >
                      {alphabet.map((letter) => (
                        <option key={letter} value={letter}>
                          {letter}
                        </option>
                      ))}
                    </select>
                  </div>
                </li>

                {/* Role filters */}
                <li>
                  <div className="btn-group" role="group">
                    <button
                      type="button"
                      className="btn"
                      style={{ 
                        backgroundColor: roleFilter === 'admin' ? '#4169E1' : 'white',
                        borderColor: '#4169E1',
                        color: roleFilter === 'admin' ? 'white' : '#4169E1',
                        transition: 'all 0.3s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (roleFilter !== 'admin') {
                          e.currentTarget.style.backgroundColor = '#4169E1';
                          e.currentTarget.style.color = 'white';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (roleFilter !== 'admin') {
                          e.currentTarget.style.backgroundColor = 'white';
                          e.currentTarget.style.color = '#4169E1';
                        }
                      }}
                      onClick={() => filterByRole('admin')}
                    >
                      Admin
                    </button>
                    <button
                      type="button"
                      className="btn"
                      style={{ 
                        backgroundColor: roleFilter === 'user' ? '#4169E1' : 'white',
                        borderColor: '#4169E1',
                        color: roleFilter === 'user' ? 'white' : '#4169E1',
                        transition: 'all 0.3s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (roleFilter !== 'user') {
                          e.currentTarget.style.backgroundColor = '#4169E1';
                          e.currentTarget.style.color = 'white';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (roleFilter !== 'user') {
                          e.currentTarget.style.backgroundColor = 'white';
                          e.currentTarget.style.color = '#4169E1';
                        }
                      }}
                      onClick={() => filterByRole('user')}
                    >
                      User
                    </button>
                  </div>
                </li>

                {/* Add user button */}
                <li>
                  <button 
                    className="btn text-white" 
                    type="button" 
                    data-bs-toggle="modal" 
                    data-bs-target="#add-user"
                    style={{ backgroundColor: '#4169E1' }}
                  >
                    <i className="fa fa-plus me-2" />
                    Add User
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Users table */}
          <div className="row">
            <div className="col-12">
              <div className="table-responsive">
                <DataTable 
                  value={filteredUsers} 
                  paginator
                  rows={10}
                  rowsPerPageOptions={[5, 10, 25]}
                  loading={loading}
                  emptyMessage="No users found"
                  className="mt-3"
                >
                  <Column sortable field="firstname" header="First Name" />
                  <Column sortable field="lastname" header="Last Name" />
                  <Column sortable field="email" header="Email" />
                  <Column 
                    sortable 
                    field="role" 
                    header="Role" 
                    body={(rowData) => (
                      <span className="badge" style={{
                        backgroundColor: rowData.role === 'admin' ? '#4169E1' : '#808080',
                        color: 'white'
                      }}>
                        {rowData.role}
                      </span>
                    )}
                  />
                  <Column sortable field="phone" header="Phone" />
                  <Column header="Actions" body={actionButton} />
                </DataTable>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User modals (add/edit) */}
      <UsersModal 
        validateForm={validateForm}
        showToast={showToast}
        refreshUsers={() => {
          axios.get(`${process.env.REACT_APP_API_BASE_URL}/users`)
            .then((response) => {
              setUsers(response.data);
              setFilteredUsers(response.data);
            })
            .catch((error) => {
              showToast('error', 'Error', 'Failed to refresh users');
              console.error('Error refreshing users:', error);
            });
        }}
      />

      {/* Delete confirmation modal */}
      <div className="modal fade" id="delete-user-modal" tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header border-0">
              <h5 className="modal-title">Confirm Deletion</h5>
              <button 
                type="button" 
                className="btn-close" 
                data-bs-dismiss="modal" 
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body py-4">
              <p>Are you sure you want to delete user <strong>{userToDelete?.firstname} {userToDelete?.lastname}</strong>?</p>
              <p className="text-muted">This action cannot be undone.</p>
            </div>
            <div className="modal-footer border-0">
              <button 
                type="button" 
                className="btn btn-secondary" 
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-danger" 
                onClick={deleteUser}
              >
                Delete User
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Users;