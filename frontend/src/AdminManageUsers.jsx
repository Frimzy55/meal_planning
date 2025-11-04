import React, { useState, useEffect } from 'react';

export default function AdminManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    role: 'user'
  });

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/users');
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Start editing a user
  const handleEdit = (user) => {
    setEditingUser(user.id);
    setFormData({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role
    });
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingUser(null);
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      role: 'user'
    });
  };

  // Update user
  const handleUpdateUser = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to update user');

      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, ...formData } : user
      ));
      
      setEditingUser(null);
      alert('User updated successfully!');
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete user
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete user');

      // Remove from local state
      setUsers(users.filter(user => user.id !== userId));
      alert('User deleted successfully!');
    } catch (err) {
      setError(err.message);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) return <div className="loading">Loading users...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="admin-manage-users">
      <h2>👥 Manage Users</h2>
      <p>This section allows the admin to view, edit, and manage all registered users in the system.</p>
      
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Created At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>
                  {editingUser === user.id ? (
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                    />
                  ) : (
                    user.first_name
                  )}
                </td>
                <td>
                  {editingUser === user.id ? (
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                    />
                  ) : (
                    user.last_name
                  )}
                </td>
                <td>
                  {editingUser === user.id ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                    />
                  ) : (
                    user.email
                  )}
                </td>
                <td>
                  {editingUser === user.id ? (
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : (
                    <span className={`role-badge ${user.role}`}>
                      {user.role}
                    </span>
                  )}
                </td>
                <td>{formatDate(user.created_at)}</td>
                <td className="actions">
                  {editingUser === user.id ? (
                    <>
                      <button 
                        className="btn-save"
                        onClick={() => handleUpdateUser(user.id)}
                      >
                        Save
                      </button>
                      <button 
                        className="btn-cancel"
                        onClick={handleCancelEdit}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button 
                        className="btn-edit"
                        onClick={() => handleEdit(user)}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={() => handleDeleteUser(user.id)}
                        disabled={user.role === 'admin'} // Prevent deleting admin users
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {users.length === 0 && (
          <div className="no-users">No users found.</div>
        )}
      </div>

      <style jsx>{`
        .admin-manage-users {
          padding: 20px;
        }
        
        .users-table-container {
          margin-top: 20px;
          overflow-x: auto;
        }
        
        .users-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .users-table th,
        .users-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #eee;
        }
        
        .users-table th {
          background-color: #f8f9fa;
          font-weight: 600;
          color: #333;
        }
        
        .users-table tr:hover {
          background-color: #f8f9fa;
        }
        
        input, select {
          padding: 6px;
          border: 1px solid #ddd;
          border-radius: 4px;
          width: 100%;
        }
        
        .role-badge {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
          text-transform: capitalize;
        }
        
        .role-badge.admin {
          background-color: #e3f2fd;
          color: #1976d2;
        }
        
        .role-badge.user {
          background-color: #f3e5f5;
          color: #7b1fa2;
        }
        
        .actions {
          display: flex;
          gap: 8px;
        }
        
        button {
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          transition: background-color 0.2s;
        }
        
        .btn-edit {
          background-color: #ffc107;
          color: white;
        }
        
        .btn-edit:hover {
          background-color: #e0a800;
        }
        
        .btn-delete {
          background-color: #dc3545;
          color: white;
        }
        
        .btn-delete:hover:not(:disabled) {
          background-color: #c82333;
        }
        
        .btn-delete:disabled {
          background-color: #6c757d;
          cursor: not-allowed;
        }
        
        .btn-save {
          background-color: #28a745;
          color: white;
        }
        
        .btn-save:hover {
          background-color: #218838;
        }
        
        .btn-cancel {
          background-color: #6c757d;
          color: white;
        }
        
        .btn-cancel:hover {
          background-color: #5a6268;
        }
        
        .loading, .error, .no-users {
          text-align: center;
          padding: 40px;
          font-size: 16px;
        }
        
        .error {
          color: #dc3545;
        }
      `}</style>
    </div>
  );
}