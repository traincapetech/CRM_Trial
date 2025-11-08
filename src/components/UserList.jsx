import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaUser, FaCalendarAlt, FaExclamationTriangle } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import api, { authAPI } from '../services/api';

const UserList = ({ users, employees, onUserUpdated, onUserDeleted, canManage }) => {
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState({});

  const handleEdit = (user) => {
    // Find corresponding employee data
    const employee = employees.find(e => (e.userId || e._id) === user._id);
    // Safely extract role name - handle both string and object
    const roleName = typeof user.role === 'string' ? user.role : (user.role?.name || '');
    setEditForm({
      fullName: user.fullName || '',
      email: user.email || '',
      role: roleName,
      skills: employee?.skills?.join(', ') || '',
      internshipStartDate: employee?.internshipStartDate ? new Date(employee.internshipStartDate).toISOString().split('T')[0] : '',
      internshipEndDate: employee?.internshipEndDate ? new Date(employee.internshipEndDate).toISOString().split('T')[0] : '',
    });
    setEditingUser(user._id);
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditForm({});
  };

  const handleUpdate = async (userId) => {
    setLoading({ ...loading, [userId]: true });
    try {
      const formData = new FormData();
      Object.keys(editForm).forEach(key => {
        if (editForm[key] !== undefined && editForm[key] !== '') {
          formData.append(key, editForm[key]);
        }
      });

      await authAPI.updateUserWithDocuments(userId, formData);
      toast.success('User updated successfully');
      setEditingUser(null);
      setEditForm({});
      onUserUpdated?.();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user');
    } finally {
      setLoading({ ...loading, [userId]: false });
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    setLoading({ ...loading, [userId]: true });
    try {
      await authAPI.deleteUser(userId);
      toast.success('User deleted successfully');
      onUserDeleted?.();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    } finally {
      setLoading({ ...loading, [userId]: false });
    }
  };

  const handleToggleActive = async (userId) => {
    setLoading({ ...loading, [`toggle-${userId}`]: true });
    try {
      const response = await api.put(`/auth/users/${userId}/toggle-active`);
      toast.success(response.data.message || 'User status updated');
      onUserUpdated?.();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to toggle user status');
    } finally {
      setLoading({ ...loading, [`toggle-${userId}`]: false });
    }
  };

  const calculateRemainingDays = (endDate) => {
    if (!endDate) return null;
    const today = new Date();
    const end = new Date(endDate);
    today.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getEmployeeData = (userId) => {
    return employees.find(e => (e.userId || e._id) === userId);
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <FaUser className="text-indigo-600" />
          IT Team Members
        </CardTitle>
      </CardHeader>
      <CardContent>
        {users.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No team members yet. Create a new user to get started.
          </div>
        ) : (
          <div className="space-y-4">
            {users.map(user => {
              const employee = getEmployeeData(user._id);
              // Safely extract role name - handle both string and object
              const roleName = typeof user.role === 'string' ? user.role : (user.role?.name || user.role || 'Unknown');
              const isIntern = roleName === 'IT Intern';
              const remainingDays = isIntern && employee?.internshipEndDate 
                ? calculateRemainingDays(employee.internshipEndDate) 
                : null;
              const isExpired = remainingDays !== null && remainingDays < 0;
              const isEditing = editingUser === user._id;

              return (
                <Card key={user._id} className={`border ${isExpired ? 'border-red-300 bg-red-50 dark:bg-red-900/10' : ''}`}>
                  <CardContent className="p-4">
                    {!isEditing ? (
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold">{user.fullName}</h3>
                            <Badge variant={roleName === 'IT Manager' ? 'default' : roleName === 'IT Permanent' ? 'secondary' : 'outline'}>
                              {roleName}
                            </Badge>
                            {user.active === false && (
                              <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                Inactive
                              </Badge>
                            )}
                            {isExpired && (
                              <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 flex items-center gap-1">
                                <FaExclamationTriangle /> Expired
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{user.email}</p>
                          
                          {employee && employee.skills && employee.skills.length > 0 && (
                            <div className="mb-2">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Skills: </span>
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {employee.skills.join(', ')}
                              </span>
                            </div>
                          )}

                          {isIntern && employee?.internshipEndDate && (
                            <div className="flex items-center gap-2 text-sm">
                              <FaCalendarAlt className="text-gray-500" />
                              <span className="text-gray-700 dark:text-gray-300">
                                End Date: {new Date(employee.internshipEndDate).toLocaleDateString()}
                              </span>
                              {remainingDays !== null && (
                                <span className={`font-semibold ${isExpired ? 'text-red-600' : remainingDays <= 7 ? 'text-orange-600' : 'text-green-600'}`}>
                                  {isExpired 
                                    ? `(${Math.abs(remainingDays)} days overdue)` 
                                    : remainingDays === 0 
                                    ? '(Ends today)' 
                                    : `(${remainingDays} days remaining)`
                                  }
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {canManage && (
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(user)}
                              disabled={loading[user._id]}
                              title="Edit User"
                            >
                              <FaEdit />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleActive(user._id)}
                              disabled={loading[`toggle-${user._id}`]}
                              title={user.active ? "Deactivate" : "Activate"}
                              className={user.active ? "text-green-600" : "text-red-600"}
                            >
                              {user.active ? <FaToggleOn /> : <FaToggleOff />}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(user._id)}
                              disabled={loading[user._id]}
                              title="Delete User"
                              className="text-red-600 hover:bg-red-50"
                            >
                              <FaTrash />
                            </Button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium mb-1">Full Name</label>
                            <input
                              type="text"
                              value={editForm.fullName}
                              onChange={e => setEditForm({ ...editForm, fullName: e.target.value })}
                              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Email</label>
                            <input
                              type="email"
                              value={editForm.email}
                              onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Skills (comma-separated)</label>
                            <input
                              type="text"
                              value={editForm.skills}
                              onChange={e => setEditForm({ ...editForm, skills: e.target.value })}
                              placeholder="MERN, Java, HTML"
                              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800"
                            />
                          </div>
                          {roleName === 'IT Intern' && (
                            <>
                              <div>
                                <label className="block text-sm font-medium mb-1">Internship Start Date</label>
                                <input
                                  type="date"
                                  value={editForm.internshipStartDate}
                                  onChange={e => setEditForm({ ...editForm, internshipStartDate: e.target.value })}
                                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">Internship End Date</label>
                                <input
                                  type="date"
                                  value={editForm.internshipEndDate}
                                  onChange={e => setEditForm({ ...editForm, internshipEndDate: e.target.value })}
                                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800"
                                />
                              </div>
                            </>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleUpdate(user._id)}
                            disabled={loading[user._id]}
                            size="sm"
                          >
                            {loading[user._id] ? 'Saving...' : 'Save'}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={handleCancelEdit}
                            disabled={loading[user._id]}
                            size="sm"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UserList;
