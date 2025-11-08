import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import { authAPI, salesAPI } from '../services/api';
import { FaEdit, FaTrash, FaPlus, FaTimes, FaLock, FaChartLine, FaUsers, FaFileAlt, FaMoneyBillWave, FaCalendarAlt } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { getDirectSalesCount } from '../utils/helpers';
import leaveAPI from '../services/leaveAPI';

import { professionalClasses, transitions, shadows } from '../utils/professionalDarkMode';
const ManagerDashboard = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    role: 'Sales Person'
  });
  
  // Add dashboard stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSales: 0,
    totalLeads: 0,
    userCounts: {
      salesPerson: 0,
      leadPerson: 0,
      manager: 0,
      admin: 0
    }
  });
  const [pendingLeaves, setPendingLeaves] = useState(0);
  const navigate = useNavigate();

  // Check if current user is admin
  const isAdmin = currentUser?.role === 'Admin';

  useEffect(() => {
    fetchUsers();
    fetchDashboardStats();
    fetchPendingLeaves();
  }, []);

  // New function to fetch dashboard stats
  const fetchDashboardStats = async () => {
    try {
      // Try to get direct sales count first
      let salesCount = 0;
      let leadCount = 0;
      
      // NEW APPROACH: Use direct sales count utility
      try {
        salesCount = await getDirectSalesCount();
        console.log("Manager Dashboard - Got direct sales count:", salesCount);
      } catch (directCountError) {
        console.error("Manager Dashboard - Error getting direct sales count:", directCountError);
      }
      
      // Also fetch leads count
      const isDevelopment = import.meta.env.DEV && import.meta.env.MODE !== 'production';
      const apiUrl = isDevelopment ? 'http://localhost:8080' : 'https://crm-backend-o36v.onrender.com/api';
      const leadsResponse = await axios.get(`${apiUrl}${isDevelopment ? '/api' : ''}/leads`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (leadsResponse.data && leadsResponse.data.data && Array.isArray(leadsResponse.data.data)) {
        leadCount = leadsResponse.data.data.length;
      }
      
      console.log("Final counts - Sales:", salesCount, "Leads:", leadCount);
      
      // Update stats with the fetched counts
      setStats(prev => ({
        ...prev,
        totalSales: salesCount,
        totalLeads: leadCount,
        totalUsers: users.length,
        userCounts: {
          salesPerson: users.filter(u => u.role === "Sales Person").length,
          leadPerson: users.filter(u => u.role === "Lead Person").length,
          manager: users.filter(u => u.role === "Manager").length,
          admin: users.filter(u => u.role === "Admin").length
        }
      }));
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getUsers();
      if (response.data.success) {
        setUsers(response.data.data);
        
        // Update user counts in stats
        setStats(prev => ({
          ...prev,
          totalUsers: response.data.data.length,
          userCounts: {
            salesPerson: response.data.data.filter(u => u.role === "Sales Person").length,
            leadPerson: response.data.data.filter(u => u.role === "Lead Person").length,
            manager: response.data.data.filter(u => u.role === "Manager").length,
            admin: response.data.data.filter(u => u.role === "Admin").length
          }
        }));
      } else {
        setError('Failed to load users');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch pending leave requests
  const fetchPendingLeaves = async () => {
    try {
      // Only fetch if manager or admin
      if (currentUser?.role === 'Manager' || currentUser?.role === 'Admin') {
        const response = await leaveAPI.getAllLeaves({ status: 'pending' });
        if (response.data && response.data.success) {
          setPendingLeaves(response.data.data.length);
        }
      }
    } catch (err) {
      setPendingLeaves(0);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent non-admin users from creating or editing Admin accounts
    if (!isAdmin && (formData.role === 'Admin' || (editUser && editUser.role === 'Admin'))) {
      toast.error('Only Admins can manage Admin accounts');
      return;
    }
    
    setLoading(true);
    
    try {
      let response;
      
      if (editUser) {
        // Update existing user
        const userData = { ...formData };
        // Only include password if it's provided
        if (!userData.password) delete userData.password;
        
        response = await authAPI.updateUser(editUser._id, userData);
        toast.success('User updated successfully');
      } else {
        // Create new user
        response = await authAPI.createUser(formData);
        toast.success('User created successfully');
      }
      
      setShowModal(false);
      resetForm();
      fetchUsers();
    } catch (err) {
      console.error('Error with user:', err);
      toast.error(err.response?.data?.message || 'Failed to process user');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    // Prevent non-admin users from deleting Admin accounts
    const userToDelete = users.find(u => u._id === userId);
    if (!isAdmin && userToDelete.role === 'Admin') {
      toast.error('Only Admins can delete Admin accounts');
      return;
    }
    
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }
    
    try {
      setLoading(true);
      await authAPI.deleteUser(userId);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      toast.error('Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user) => {
    // Prevent non-admin users from editing Admin accounts
    if (!isAdmin && user.role === 'Admin') {
      toast.error('Only Admins can edit Admin accounts');
      return;
    }
    
    setEditUser(user);
    setFormData({
      fullName: user.fullName,
      email: user.email,
      password: '', // Empty password field
      role: user.role
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      email: '',
      password: '',
      role: 'Sales Person'
    });
    setEditUser(null);
  };

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Manager Dashboard</h1>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-sm dark:shadow-xl hover:shadow-md transition-all duration-200 text-white rounded-md"
          >
            <FaPlus className="mr-2" /> Add New User
          </button>
        </div>

        {/* Leave Requests Button */}
        {(currentUser?.role === 'Manager' || currentUser?.role === 'Admin') && (
          <div className="mb-6 flex justify-end">
            <button
              onClick={() => navigate('/employees?tab=leave')}
              className="relative flex items-center px-5 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition-all duration-200"
            >
              <FaCalendarAlt className="mr-2" />
              Review Leave Requests
              {pendingLeaves > 0 && (
                <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                  {pendingLeaves}
                </span>
              )}
            </button>
          </div>
        )}

        {/* Dashboard Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 transition-all duration-200 ease-out rounded-lg shadow-md dark:shadow-2xl p-4 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-slate-500 dark:text-gray-400 text-sm font-medium">Total Users</h3>
                <p className="text-2xl font-bold mt-1">{stats.totalUsers}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <FaUsers className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 transition-all duration-200 ease-out rounded-lg shadow-md dark:shadow-2xl p-4 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-slate-500 dark:text-gray-400 text-sm font-medium">Total Sales</h3>
                <p className="text-2xl font-bold mt-1">{stats.totalSales}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <FaMoneyBillWave className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="mt-2">
              <Link to="/sales-tracking" className="text-sm text-blue-600 hover:underline">View all sales</Link>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 transition-all duration-200 ease-out rounded-lg shadow-md dark:shadow-2xl p-4 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-slate-500 dark:text-gray-400 text-sm font-medium">Total Leads</h3>
                <p className="text-2xl font-bold mt-1">{stats.totalLeads}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <FaFileAlt className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 transition-all duration-200 ease-out rounded-lg shadow-md dark:shadow-2xl p-4 shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-slate-500 dark:text-gray-400 text-sm font-medium">Team Breakdown</h3>
                <p className="text-sm mt-1">Sales: {stats.userCounts.salesPerson}</p>
                <p className="text-sm">Leads: {stats.userCounts.leadPerson}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-full">
                <FaChartLine className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* User Management Section */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 transition-all duration-200 ease-out shadow-md dark:shadow-2xl rounded-lg p-6 mb-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">User Management</h2>
          
          {!isAdmin && (
            <div className="bg-yellow-50 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-4">
              <strong>Note:</strong> As a Manager, you cannot modify Admin accounts.
            </div>
          )}
          
          {loading && !showModal ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
              {error}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-gray-50 dark:bg-slate-800 transition-all duration-200 ease-out">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-900 transition-all duration-200 ease-out divide-y divide-slate-200 dark:divide-slate-700">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-slate-500 dark:text-gray-400">No users found</td>
                    </tr>
                  ) : (
                    users.map(user => (
                      <tr key={user._id} className={`hover:bg-slate-50 dark:hover:bg-slate-800 ${!isAdmin && user.role === 'Admin' ? 'bg-gray-50 dark:bg-slate-800' : ''}`}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">{user.fullName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${user.role === 'Admin' ? 'bg-purple-100 text-purple-800' : 
                              user.role === 'Manager' ? 'bg-blue-100 text-blue-800' :
                              user.role === 'Lead Person' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-gray-400">
                          <div className="flex space-x-3">
                            {(!isAdmin && user.role === 'Admin') ? (
                              <span className="text-gray-400 dark:text-gray-400" title="Admin users can only be managed by other Admins">
                                <FaLock className="h-5 w-5" />
                              </span>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleEditUser(user)}
                                  className="text-indigo-600 hover:text-indigo-900"
                                  title="Edit user"
                                >
                                  <FaEdit className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(user._id)}
                                  className="text-red-600 hover:text-red-900"
                                  title="Delete user"
                                >
                                  <FaTrash className="h-5 w-5" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 transition-all duration-200 ease-out rounded-lg p-6 max-w-md w-full shadow-sm dark:shadow-black/25">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {editUser ? 'Edit User' : 'Add New User'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-500 dark:text-slate-300 hover:text-slate-700"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {editUser ? 'Password (leave empty to keep current)' : 'Password'}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md"
                  required={!editUser}
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md"
                  disabled={!isAdmin && formData.role === 'Admin'}
                >
                  <option value="Sales Person">Sales Person</option>
                  <option value="Lead Person">Lead Person</option>
                  <option value="Manager">Manager</option>
                  {isAdmin && <option value="Admin">Admin</option>}
                </select>
                {!isAdmin && (
                  <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">Only Admins can create or modify Admin accounts</p>
                )}
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || (!isAdmin && formData.role === 'Admin')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-sm dark:shadow-xl hover:shadow-md transition-all duration-200 text-white rounded-md disabled:bg-blue-300"
                >
                  {loading ? 'Processing...' : (editUser ? 'Update User' : 'Add User')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default ManagerDashboard; 