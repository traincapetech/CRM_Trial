import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api, { payrollAPI } from '../../services/api';
import { toast } from 'react-hot-toast';
import PayrollSummaryTable from './PayrollSummaryTable';
import { 
  FaPlus, 
  FaEye, 
  FaCheck, 
  FaTimes, 
  FaDownload, 
  FaEdit, 
  FaMoneyBillWave,
  FaSearch,
  FaFilter,
  FaFileAlt,
  FaSpinner,
  FaTrash,
  FaCalculator,
  FaTable,
  FaList
} from 'react-icons/fa';

const PayrollComponent = () => {
  const { user } = useAuth();
  const [payrollRecords, setPayrollRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingPayroll, setEditingPayroll] = useState(null);
  const [deletingPayroll, setDeletingPayroll] = useState(null);
  const [processingPayroll, setProcessingPayroll] = useState(null);
  const [downloadingSlip, setDownloadingSlip] = useState(null);
  const [viewMode, setViewMode] = useState('detailed');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  const statusOptions = [
    { value: 'DRAFT', label: 'Draft', color: 'bg-gray-100 text-gray-800' },
    { value: 'APPROVED', label: 'Approved', color: 'bg-green-100 text-green-800' },
    { value: 'PAID', label: 'Paid', color: 'bg-blue-100 text-blue-800' },
    { value: 'CANCELLED', label: 'Cancelled', color: 'bg-red-100 text-red-800' }
  ];

  useEffect(() => {
    fetchInitialData();
  }, [selectedMonth, selectedYear, selectedEmployee]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchPayrollRecords(),
        fetchEmployees()
      ]);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const fetchPayrollRecords = async () => {
    try {
      const filters = {};
      if (selectedMonth) filters.month = selectedMonth;
      if (selectedYear) filters.year = selectedYear;
      if (selectedEmployee) filters.employeeId = selectedEmployee;

      const response = await payrollAPI.getAll(filters);
      
      if (response.data.success) {
        setPayrollRecords(response.data.data);
      } else {
        toast.error('Failed to fetch payroll records');
      }
    } catch (error) {
      console.error('Error fetching payroll records:', error);
      toast.error('Failed to fetch payroll records');
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await api.get('/employees');
      if (response.data && Array.isArray(response.data)) {
        setEmployees(response.data);
      } else if (response.data.data && Array.isArray(response.data.data)) {
        setEmployees(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast.error('Failed to fetch employees');
    }
  };

  const handleDownloadSalarySlip = async (payrollId) => {
    try {
      setDownloadingSlip(payrollId);
      const response = await payrollAPI.downloadSalarySlip(payrollId);
      
      // Create a blob from the PDF stream
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Create a link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `salary-slip-${payrollId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      toast.success('Salary slip downloaded successfully');
    } catch (error) {
      console.error('Error downloading salary slip:', error);
      toast.error('Failed to download salary slip');
    } finally {
      setDownloadingSlip(null);
    }
  };

  const handleDeletePayroll = async (payroll) => {
    try {
      setDeletingPayroll(payroll._id);
      const response = await payrollAPI.delete(payroll._id);
      if (response.data.success) {
        toast.success('Payroll deleted successfully');
        fetchPayrollRecords();
      } else {
        toast.error(response.data.message || 'Failed to delete payroll');
      }
    } catch (error) {
      console.error('Error deleting payroll:', error);
      toast.error(error.response?.data?.message || 'Failed to delete payroll');
    } finally {
      setDeletingPayroll(null);
      setShowDeleteModal(false);
    }
  };

  const handleEditPayroll = async (payroll) => {
    setEditingPayroll(payroll._id);
    setShowGenerateModal(true);
    setGenerateForm({
      employeeId: payroll.employeeId?._id || payroll.userId?._id,
      month: payroll.month,
      year: payroll.year,
      baseSalary: payroll.baseSalary,
      daysPresent: payroll.daysPresent,
      workingDays: payroll.workingDays,
      calculatedSalary: payroll.calculatedSalary,
      // Manual Allowances
      hra: payroll.hra,
      da: payroll.da,
      conveyanceAllowance: payroll.conveyanceAllowance,
      medicalAllowance: payroll.medicalAllowance,
      specialAllowance: payroll.specialAllowance,
      overtimeAmount: payroll.overtimeAmount,
      // Bonuses
      performanceBonus: payroll.performanceBonus,
      projectBonus: payroll.projectBonus,
      attendanceBonus: payroll.attendanceBonus,
      festivalBonus: payroll.festivalBonus,
      // Manual Deductions
      pf: payroll.pf,
      esi: payroll.esi,
      tax: payroll.tax,
      loan: payroll.loan,
      other: payroll.other,
      notes: payroll.notes
    });
  };

  const handleUpdatePayroll = async (e) => {
    e.preventDefault();
    try {
      setProcessingPayroll(editingPayroll);
      
      const updateData = {
        ...generateForm,
        baseSalary: parseFloat(generateForm.baseSalary) || 0,
        daysPresent: parseFloat(generateForm.daysPresent) || 0,
        workingDays: parseFloat(generateForm.workingDays) || 0,
        // Manual Allowances
        hra: parseFloat(generateForm.hra) || 0,
        da: parseFloat(generateForm.da) || 0,
        conveyanceAllowance: parseFloat(generateForm.conveyanceAllowance) || 0,
        medicalAllowance: parseFloat(generateForm.medicalAllowance) || 0,
        specialAllowance: parseFloat(generateForm.specialAllowance) || 0,
        overtimeAmount: parseFloat(generateForm.overtimeAmount) || 0,
        // Bonuses
        performanceBonus: parseFloat(generateForm.performanceBonus) || 0,
        projectBonus: parseFloat(generateForm.projectBonus) || 0,
        attendanceBonus: parseFloat(generateForm.attendanceBonus) || 0,
        festivalBonus: parseFloat(generateForm.festivalBonus) || 0,
        // Manual Deductions
        pf: parseFloat(generateForm.pf) || 0,
        esi: parseFloat(generateForm.esi) || 0,
        tax: parseFloat(generateForm.tax) || 0,
        loan: parseFloat(generateForm.loan) || 0,
        other: parseFloat(generateForm.other) || 0
      };
      
      const response = await payrollAPI.update(editingPayroll, updateData);
      
      if (response.data.success) {
        toast.success('Payroll updated successfully');
        setShowGenerateModal(false);
        resetForm();
        fetchPayrollRecords();
      } else {
        toast.error(response.data.message || 'Failed to update payroll');
      }
    } catch (error) {
      console.error('Error updating payroll:', error);
      toast.error(error.response?.data?.message || 'Failed to update payroll');
    } finally {
      setProcessingPayroll(null);
      setEditingPayroll(null);
    }
  };

  const resetForm = () => {
    setGenerateForm({
      employeeId: '',
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      baseSalary: '',
      daysPresent: '',
      workingDays: '',
      calculatedSalary: '',
      hra: '',
      da: '',
      conveyanceAllowance: '',
      medicalAllowance: '',
      specialAllowance: '',
      overtimeAmount: '',
      performanceBonus: '',
      projectBonus: '',
      attendanceBonus: '',
      festivalBonus: '',
      pf: '',
      esi: '',
      tax: '',
      loan: '',
      other: '',
      notes: ''
    });
  };

  // Update the form submit handler
  const handleFormSubmit = (e) => {
    if (editingPayroll) {
      handleUpdatePayroll(e);
    } else {
      handleGeneratePayroll(e);
    }
  };

  const filteredPayrollRecords = payrollRecords.filter(payroll => {
    const matchesStatus = !statusFilter || payroll.status === statusFilter;
    const matchesSearch = !searchTerm || 
      (payroll.employeeId?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (payroll.userId?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  // Add this form state if not already present
  const [generateForm, setGenerateForm] = useState({
    employeeId: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    baseSalary: '',
    daysPresent: '',
    workingDays: '',
    calculatedSalary: '',
    // Manual Allowances
    hra: '',
    da: '',
    conveyanceAllowance: '',
    medicalAllowance: '',
    specialAllowance: '',
    overtimeAmount: '',
    // Bonuses
    performanceBonus: '',
    projectBonus: '',
    attendanceBonus: '',
    festivalBonus: '',
    // Manual Deductions
    pf: '',
    esi: '',
    tax: '',
    loan: '',
    other: '',
    notes: ''
  });

  // Add the salary calculation function
  const calculateSalary = (baseSalary, daysPresent) => {
    if (!baseSalary || !daysPresent) return 0;
    const calculatedAmount = (parseFloat(baseSalary) / 30) * parseFloat(daysPresent);
    return calculatedAmount;
  };

  // Update calculated salary when base salary or days present changes
  useEffect(() => {
    if (generateForm.baseSalary && generateForm.daysPresent) {
      const calculated = calculateSalary(generateForm.baseSalary, generateForm.daysPresent);
      setGenerateForm(prev => ({ ...prev, calculatedSalary: calculated.toFixed(2) }));
    }
  }, [generateForm.baseSalary, generateForm.daysPresent]);

  const handleGeneratePayroll = async (e) => {
    e.preventDefault();
    try {
      setProcessingPayroll(generateForm.employeeId);
      
      // Convert empty strings to 0 for numeric fields
      const generateData = {
        ...generateForm,
        baseSalary: parseFloat(generateForm.baseSalary) || 0,
        daysPresent: parseFloat(generateForm.daysPresent) || 0,
        workingDays: parseFloat(generateForm.workingDays) || 0,
        // Manual Allowances
        hra: parseFloat(generateForm.hra) || 0,
        da: parseFloat(generateForm.da) || 0,
        conveyanceAllowance: parseFloat(generateForm.conveyanceAllowance) || 0,
        medicalAllowance: parseFloat(generateForm.medicalAllowance) || 0,
        specialAllowance: parseFloat(generateForm.specialAllowance) || 0,
        overtimeAmount: parseFloat(generateForm.overtimeAmount) || 0,
        // Bonuses
        performanceBonus: parseFloat(generateForm.performanceBonus) || 0,
        projectBonus: parseFloat(generateForm.projectBonus) || 0,
        attendanceBonus: parseFloat(generateForm.attendanceBonus) || 0,
        festivalBonus: parseFloat(generateForm.festivalBonus) || 0,
        // Manual Deductions
        pf: parseFloat(generateForm.pf) || 0,
        esi: parseFloat(generateForm.esi) || 0,
        tax: parseFloat(generateForm.tax) || 0,
        loan: parseFloat(generateForm.loan) || 0,
        other: parseFloat(generateForm.other) || 0
      };
      
      const response = await payrollAPI.generate(generateData);
      
      if (response.data.success) {
        toast.success('Payroll generated successfully');
        setShowGenerateModal(false);
        setGenerateForm({
          employeeId: '',
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          baseSalary: '',
          daysPresent: '',
          workingDays: '',
          calculatedSalary: '',
          hra: '',
          da: '',
          conveyanceAllowance: '',
          medicalAllowance: '',
          specialAllowance: '',
          overtimeAmount: '',
          performanceBonus: '',
          projectBonus: '',
          attendanceBonus: '',
          festivalBonus: '',
          pf: '',
          esi: '',
          tax: '',
          loan: '',
          other: '',
          notes: ''
        });
        fetchPayrollRecords();
      } else {
        toast.error(response.data.message || 'Failed to generate payroll');
      }
    } catch (error) {
      console.error('Error generating payroll:', error);
      toast.error(error.response?.data?.message || 'Failed to generate payroll');
    } finally {
      setProcessingPayroll(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Payroll Management
        </h2>
        <button
          onClick={() => setShowGenerateModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <FaPlus className="inline-block mr-2" />
          Generate Payroll
        </button>
      </div>

      {/* Filters Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Month
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
            >
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Employee
            </label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="">All Employees</option>
              {employees.map((employee) => (
                <option key={employee._id} value={employee._id}>
                  {employee.fullName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="">All Status</option>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Generate Payroll Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              {editingPayroll ? 'Edit Payroll' : 'Generate Payroll'}
            </h2>
            <form onSubmit={handleFormSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4 col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Employee *
                  </label>
                  <select
                    value={generateForm.employeeId}
                    onChange={(e) => setGenerateForm({...generateForm, employeeId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  >
                    <option value="">Select Employee</option>
                    {employees.map(employee => (
                      <option key={employee._id} value={employee._id}>
                        {employee.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Month *
                  </label>
                  <select
                    value={generateForm.month}
                    onChange={(e) => setGenerateForm({...generateForm, month: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  >
                    {months.map(month => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Year *
                  </label>
                  <select
                    value={generateForm.year}
                    onChange={(e) => setGenerateForm({...generateForm, year: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    required
                  >
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2 mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <FaCalculator />
                    Salary Calculation
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Base Salary (Monthly) *
                      </label>
                      <input
                        type="number"
                        value={generateForm.baseSalary}
                        onChange={(e) => setGenerateForm({...generateForm, baseSalary: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        min="0"
                        step="0.01"
                        placeholder="Enter base salary"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Days Present *
                      </label>
                      <input
                        type="number"
                        value={generateForm.daysPresent}
                        onChange={(e) => setGenerateForm({...generateForm, daysPresent: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        min="0"
                        max="31"
                        step="1"
                        placeholder="Enter days present"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Working Days *
                      </label>
                      <input
                        type="number"
                        value={generateForm.workingDays}
                        onChange={(e) => setGenerateForm({...generateForm, workingDays: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        min="0"
                        max="31"
                        step="1"
                        placeholder="Enter working days"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Manual Allowances */}
                <div className="col-span-2 mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Manual Allowances</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">HRA</label>
                      <input
                        type="number"
                        value={generateForm.hra}
                        onChange={(e) => setGenerateForm({...generateForm, hra: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        min="0"
                        step="0.01"
                        placeholder="Enter HRA"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">DA</label>
                      <input
                        type="number"
                        value={generateForm.da}
                        onChange={(e) => setGenerateForm({...generateForm, da: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        min="0"
                        step="0.01"
                        placeholder="Enter DA"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Conveyance Allowance
                      </label>
                      <input
                        type="number"
                        value={generateForm.conveyanceAllowance}
                        onChange={(e) => setGenerateForm({...generateForm, conveyanceAllowance: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        min="0"
                        step="0.01"
                        placeholder="Enter conveyance allowance"
                      />
                    </div>
                  </div>
                </div>

                {/* Bonuses */}
                <div className="col-span-2 mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <FaMoneyBillWave />
                    Bonuses
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Performance Bonus
                      </label>
                      <input
                        type="number"
                        value={generateForm.performanceBonus}
                        onChange={(e) => setGenerateForm({...generateForm, performanceBonus: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        min="0"
                        step="0.01"
                        placeholder="Enter performance bonus"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Incentive Bonus
                      </label>
                      <input
                        type="number"
                        value={generateForm.projectBonus}
                        onChange={(e) => setGenerateForm({...generateForm, projectBonus: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        min="0"
                        step="0.01"
                        placeholder="Enter incentive bonus"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Attendance Bonus
                      </label>
                      <input
                        type="number"
                        value={generateForm.attendanceBonus}
                        onChange={(e) => setGenerateForm({...generateForm, attendanceBonus: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        min="0"
                        step="0.01"
                        placeholder="Enter attendance bonus"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Festival Bonus
                      </label>
                      <input
                        type="number"
                        value={generateForm.festivalBonus}
                        onChange={(e) => setGenerateForm({...generateForm, festivalBonus: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        min="0"
                        step="0.01"
                        placeholder="Enter festival bonus"
                      />
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div className="col-span-2 mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <FaCalculator />
                    Deductions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        PF
                      </label>
                      <input
                        type="number"
                        value={generateForm.pf}
                        onChange={(e) => setGenerateForm({...generateForm, pf: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        min="0"
                        step="0.01"
                        placeholder="Enter PF amount"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        ESI
                      </label>
                      <input
                        type="number"
                        value={generateForm.esi}
                        onChange={(e) => setGenerateForm({...generateForm, esi: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        min="0"
                        step="0.01"
                        placeholder="Enter ESI amount"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Tax
                      </label>
                      <input
                        type="number"
                        value={generateForm.tax}
                        onChange={(e) => setGenerateForm({...generateForm, tax: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        min="0"
                        step="0.01"
                        placeholder="Enter tax amount"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Loan
                      </label>
                      <input
                        type="number"
                        value={generateForm.loan}
                        onChange={(e) => setGenerateForm({...generateForm, loan: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        min="0"
                        step="0.01"
                        placeholder="Enter loan deduction"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Other Deductions
                      </label>
                      <input
                        type="number"
                        value={generateForm.other}
                        onChange={(e) => setGenerateForm({...generateForm, other: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        min="0"
                        step="0.01"
                        placeholder="Enter other deductions"
                      />
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="col-span-2 mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={generateForm.notes}
                    onChange={(e) => setGenerateForm({...generateForm, notes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    rows="3"
                    placeholder="Enter any additional notes"
                  />
                </div>

                {/* Form Actions */}
                <div className="col-span-2 flex justify-end space-x-2 mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowGenerateModal(false);
                      setEditingPayroll(null);
                      resetForm();
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={processingPayroll}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {processingPayroll ? (
                      <>
                        <FaSpinner className="inline-block animate-spin mr-2" />
                        {editingPayroll ? 'Updating...' : 'Generating...'}
                      </>
                    ) : (
                      editingPayroll ? 'Update Payroll' : 'Generate Payroll'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && deletingPayroll && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Confirm Delete
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Are you sure you want to delete this payroll record? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingPayroll(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePayroll(deletingPayroll)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                {deletingPayroll === deletingPayroll._id ? (
                  <>
                    <FaSpinner className="inline-block animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content Section */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <FaSpinner className="animate-spin text-4xl text-indigo-600" />
        </div>
      ) : filteredPayrollRecords.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No payroll records found.</p>
        </div>
      ) : (
        <PayrollSummaryTable
          payrollRecords={filteredPayrollRecords}
          onDownloadSlip={handleDownloadSalarySlip}
          downloadingSlip={downloadingSlip}
          onDelete={handleDeletePayroll}
          onEdit={handleEditPayroll}
          deletingPayroll={deletingPayroll}
          editingPayroll={editingPayroll}
          userRole={user.role}
        />
      )}
    </div>
  );
};

export default PayrollComponent; 