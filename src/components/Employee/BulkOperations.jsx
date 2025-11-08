import React, { useState, useEffect } from 'react';
import { FaCheck, FaDownload, FaUpload, FaEdit, FaTrash, FaUsers, FaFilter, FaSpinner, FaCog } from 'react-icons/fa';
import employeeAPI from '../../services/employeeAPI';
import { useAuth } from '../../context/AuthContext';

const BulkOperations = () => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [activeOperation, setActiveOperation] = useState('update');
  const [bulkData, setBulkData] = useState({
    department: '',
    role: '',
    status: '',
    salary: ''
  });
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [employeesRes, departmentsRes, rolesRes] = await Promise.all([
        employeeAPI.getAll(),
        employeeAPI.getDepartments(),
        employeeAPI.getRoles()
      ]);

      if (employeesRes.data.success) {
        setEmployees(employeesRes.data.data);
      }
      if (departmentsRes.data.success) {
        setDepartments(departmentsRes.data.data);
      }
      if (rolesRes.data.success) {
        setRoles(rolesRes.data.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredEmployees = () => {
    return employees.filter(emp => {
      if (filterStatus !== 'all' && emp.status !== filterStatus) return false;
      if (filterDepartment !== 'all') {
        const deptId = emp.department?._id || emp.department;
        if (deptId !== filterDepartment) return false;
      }
      return true;
    });
  };

  const handleSelectEmployee = (employeeId) => {
    setSelectedEmployees(prev => {
      if (prev.includes(employeeId)) {
        return prev.filter(id => id !== employeeId);
      } else {
        return [...prev, employeeId];
      }
    });
  };

  const handleSelectAll = () => {
    const filteredEmployees = getFilteredEmployees();
    if (selectedEmployees.length === filteredEmployees.length) {
      setSelectedEmployees([]);
    } else {
      setSelectedEmployees(filteredEmployees.map(emp => emp._id));
    }
  };

  const handleBulkUpdate = async () => {
    if (selectedEmployees.length === 0) {
      alert('Please select employees to update');
      return;
    }

    const updateData = Object.entries(bulkData)
      .filter(([key, value]) => value !== '')
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});

    if (Object.keys(updateData).length === 0) {
      alert('Please specify at least one field to update');
      return;
    }

    try {
      setProcessing(true);
      
      // This would be implemented in the API
      // await employeeAPI.bulkUpdate(selectedEmployees, updateData);
      
      // Mock implementation - in real scenario, this would be a single API call
      for (const employeeId of selectedEmployees) {
        console.log(`Updating employee ${employeeId} with:`, updateData);
        // await employeeAPI.update(employeeId, { employee: JSON.stringify(updateData) });
      }

      alert(`Successfully updated ${selectedEmployees.length} employees`);
      setSelectedEmployees([]);
      setBulkData({ department: '', role: '', status: '', salary: '' });
      fetchData();
    } catch (error) {
      console.error('Error in bulk update:', error);
      alert('Failed to update employees. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const exportEmployeeData = () => {
    const dataToExport = selectedEmployees.length > 0 
      ? employees.filter(emp => selectedEmployees.includes(emp._id))
      : getFilteredEmployees();

    const csvContent = [
      ['Name', 'Email', 'Phone', 'Department', 'Role', 'Status', 'Salary', 'Joining Date'],
      ...dataToExport.map(emp => [
        emp.fullName || '',
        emp.email || '',
        emp.phoneNumber || '',
        emp.department?.name || '',
        emp.role?.name || '',
        emp.status || '',
        emp.salary || '',
        emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString() : ''
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `employees_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generateReport = () => {
    const filteredEmployees = getFilteredEmployees();
    
    const report = {
      totalEmployees: filteredEmployees.length,
      activeEmployees: filteredEmployees.filter(emp => emp.status === 'ACTIVE').length,
      departmentBreakdown: departments.map(dept => ({
        department: dept.name,
        count: filteredEmployees.filter(emp => {
          const deptId = emp.department?._id || emp.department;
          return deptId === dept._id;
        }).length
      })),
      roleBreakdown: roles.map(role => ({
        role: role.name,
        count: filteredEmployees.filter(emp => {
          const roleId = emp.role?._id || emp.role;
          return roleId === role._id;
        }).length
      })),
      averageSalary: filteredEmployees.reduce((sum, emp) => sum + (emp.salary || 0), 0) / filteredEmployees.length || 0,
      newHires: filteredEmployees.filter(emp => {
        const joiningDate = new Date(emp.joiningDate);
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
        return joiningDate > threeMonthsAgo;
      }).length
    };

    const reportContent = `
Employee Report - Generated on ${new Date().toLocaleDateString()}

SUMMARY
=======
Total Employees: ${report.totalEmployees}
Active Employees: ${report.activeEmployees}
Average Salary: ₹${report.averageSalary.toFixed(2)}
New Hires (Last 3 months): ${report.newHires}

DEPARTMENT BREAKDOWN
==================
${report.departmentBreakdown.map(d => `${d.department}: ${d.count} employees`).join('\n')}

ROLE BREAKDOWN
==============
${report.roleBreakdown.map(r => `${r.role}: ${r.count} employees`).join('\n')}
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `employee_report_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-2">Loading employees...</span>
      </div>
    );
  }

  const filteredEmployees = getFilteredEmployees();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
              <FaCog className="mr-2 text-blue-600" />
              Bulk Operations
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage multiple employees efficiently
            </p>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {selectedEmployees.length} of {filteredEmployees.length} selected
          </div>
        </div>
      </div>

      {/* Operation Tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6">
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveOperation('update')}
            className={`px-4 py-2 rounded-md ${activeOperation === 'update' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Bulk Update
          </button>
          <button
            onClick={() => setActiveOperation('export')}
            className={`px-4 py-2 rounded-md ${activeOperation === 'export' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Export Data
          </button>
          <button
            onClick={() => setActiveOperation('reports')}
            className={`px-4 py-2 rounded-md ${activeOperation === 'reports' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            Reports
          </button>
        </div>

        {/* Bulk Update Tab */}
        {activeOperation === 'update' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Update Selected Employees
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Department
                </label>
                <select
                  value={bulkData.department}
                  onChange={(e) => setBulkData(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                >
                  <option value="">No Change</option>
                  {departments.map(dept => (
                    <option key={dept._id} value={dept._id}>{dept.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Role
                </label>
                <select
                  value={bulkData.role}
                  onChange={(e) => setBulkData(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                >
                  <option value="">No Change</option>
                  {roles.map(role => (
                    <option key={role._id} value={role._id}>{role.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={bulkData.status}
                  onChange={(e) => setBulkData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                >
                  <option value="">No Change</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="TERMINATED">Terminated</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Salary Adjustment (%)
                </label>
                <input
                  type="number"
                  value={bulkData.salary}
                  onChange={(e) => setBulkData(prev => ({ ...prev, salary: e.target.value }))}
                  placeholder="e.g., 10 for 10% increase"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <button
              onClick={handleBulkUpdate}
              disabled={processing || selectedEmployees.length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {processing ? <FaSpinner className="animate-spin mr-2" /> : <FaEdit className="mr-2" />}
              {processing ? 'Updating...' : `Update ${selectedEmployees.length} Employees`}
            </button>
          </div>
        )}

        {/* Export Tab */}
        {activeOperation === 'export' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Export Employee Data
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Export {selectedEmployees.length > 0 ? 'selected' : 'filtered'} employee data to CSV format.
            </p>
            <button
              onClick={exportEmployeeData}
              className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
            >
              <FaDownload className="mr-2" />
              Export {selectedEmployees.length > 0 ? `${selectedEmployees.length} Selected` : `${filteredEmployees.length} Filtered`} Employees
            </button>
          </div>
        )}

        {/* Reports Tab */}
        {activeOperation === 'reports' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Generate Reports
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Generate comprehensive reports on employee statistics and demographics.
            </p>
            <button
              onClick={generateReport}
              className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center"
            >
              <FaDownload className="mr-2" />
              Generate Employee Report
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Filter by Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="TERMINATED">Terminated</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Filter by Department
            </label>
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept._id} value={dept._id}>{dept.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleSelectAll}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {selectedEmployees.length === filteredEmployees.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
        </div>
      </div>

      {/* Employee List */}
      <div className="bg-white dark:bg-slate-900 rounded-lg shadow-md p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-slate-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedEmployees.length === filteredEmployees.length && filteredEmployees.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Salary
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredEmployees.map((employee) => (
                <tr key={employee._id} className="hover:bg-gray-50 dark:hover:bg-slate-800">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedEmployees.includes(employee._id)}
                      onChange={() => handleSelectEmployee(employee._id)}
                      className="h-4 w-4 text-blue-600"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-3">
                        <span className="text-blue-600 dark:text-blue-400 font-semibold text-sm">
                          {employee.fullName ? employee.fullName[0] : 'E'}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {employee.fullName || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {employee.email || 'No email'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {employee.department?.name || 'No Department'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {employee.role?.name || 'No Role'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      employee.status === 'ACTIVE' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : employee.status === 'INACTIVE'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {employee.status || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {employee.salary ? `₹${employee.salary.toLocaleString()}` : 'Not set'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BulkOperations; 