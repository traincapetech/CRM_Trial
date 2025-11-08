import React, { useState, useEffect } from 'react';
import { salesAPI, authAPI, leadPersonSalesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout/Layout';
import { FaPlus, FaTrash, FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';
import LoggingService from '../services/loggingService'; // Add LoggingService import

import { professionalClasses, transitions, shadows } from '../utils/professionalDarkMode';
const LeadSalesUpdatePage = () => {
  const [salesList, setSalesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [salesPersons, setSalesPersons] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSaleId, setEditingSaleId] = useState(null);
  const [formData, setFormData] = useState({
    DATE: new Date().toISOString().split('T')[0],
    NAME: '',
    COUNTRY: '',
    COURSE: '',
    CODE: '',
    NUMBER: '',
    'E-MAIL': '',
    'PSUDO ID': '',
    'SALE PERSON': '',
    'LEAD PERSON': '',
    SOURSE: '',
    'CLIENT REMARK': '',
    FEEDBACK: '',
    'TOTAL COST': 0,
    'TOTAL COST CURRENCY': 'USD',
    'TOKEN AMOUNT': 0,
    'TOKEN AMOUNT CURRENCY': 'USD'
  });
  
  // Get user from auth context
  const { user, loadUser } = useAuth();
  
  // Log user info right away
  console.log('User object in LeadSalesUpdatePage initial load:', user);
  console.log('User ID formats:', user ? {
    id: user.id,
    _id: user._id,
    userId: user.userId
  } : 'No user data');

  // Try to refresh user data if it's missing
  useEffect(() => {
    if (!user) {
      console.log('No user data found, attempting to reload user data');
      loadUser();
    } else {
      console.log('User data available:', user);
      console.log('User ID variations:', {
        id: user.id,
        _id: user._id,
        userId: user.userId
      });
    }
  }, []);

  useEffect(() => {
    // Log user information for debugging
    console.log('User information on load:', user);
    
    // Only try to load data if we have user information
    if (user) {
      loadSalesData();
      loadUsers();
    }
  }, [user]);  // Re-run when user changes

  // Another useEffect to set the initial lead person when user data becomes available
  useEffect(() => {
    if (user) {
      // Try all possible ID formats
      const userId = user.id || user._id || user.userId;
      console.log('Setting lead person ID to:', userId);
      
      if (userId) {
        setFormData(prev => ({
          ...prev,
          'LEAD PERSON': userId
        }));
      }
    }
  }, [user]);

  const loadSalesData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get all lead-related sales (both lead person sales and assigned sales)
      const res = await salesAPI.getLeadSheet();
      setSalesList(res.data.data);
    } catch (err) {
      console.error('Error loading sales data:', err);
      setError('Failed to load sales data. Please try again.');
      toast.error('Failed to load sales data');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      // Get sales persons
      const salesRes = await authAPI.getUsers('Sales Person');
      setSalesPersons(salesRes.data.data || []);
    } catch (err) {
      console.error('Error loading users:', err);
      toast.error('Failed to load sales persons');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Check if user info is available and find the correct ID format
      if (!user) {
        console.error('No user object available');
        throw new Error('User information not available. Please log in again.');
      }

      console.log('Full user object:', user);
      
      // Try all possible ID formats
      const userId = user.id || user._id || user.userId;
      
      if (!userId) {
        console.error('No user ID found in any format:', user);
        throw new Error('User ID not available. Please log in again.');
      }

      console.log('Using user ID:', userId);

      const saleData = {
        date: formData.DATE,
        customerName: formData.NAME,
        country: formData.COUNTRY,
        course: formData.COURSE,
        countryCode: formData.CODE,
        contactNumber: formData.NUMBER,
        email: formData['E-MAIL'],
        pseudoId: formData['PSUDO ID'],
        salesPerson: formData['SALE PERSON'],
        totalCost: parseFloat(formData['TOTAL COST']),
        totalCostCurrency: formData['TOTAL COST CURRENCY'],
        tokenAmount: parseFloat(formData['TOKEN AMOUNT']),
        tokenAmountCurrency: formData['TOKEN AMOUNT CURRENCY'],
        leadPerson: userId,
        source: formData.SOURSE,
        clientRemark: formData['CLIENT REMARK'],
        feedback: formData.FEEDBACK,
        isLeadPersonSale: true // Mark as lead person sale
      };
      
      console.log('Sending sale data:', saleData);
      
      let res;
      
      if (editingSaleId) {
        // Update existing sale
        res = await leadPersonSalesAPI.update(editingSaleId, saleData);
        
        // Log the sale update
        try {
          await LoggingService.logSaleUpdate(editingSaleId, saleData);
        } catch (logError) {
          console.error('Error logging sale update:', logError);
        }
        
        toast.success('Sale updated successfully');
      } else {
        // Create new sale
        res = await leadPersonSalesAPI.create(saleData);
        
        // Log the sale creation
        try {
          await LoggingService.logSaleCreate(res.data.data);
        } catch (logError) {
          console.error('Error logging sale creation:', logError);
        }
        
        toast.success('Sale created successfully');
      }
      
      if (res.data.success) {
        // Reset form
        setFormData({
          DATE: new Date().toISOString().split('T')[0],
          NAME: '',
          COUNTRY: '',
          COURSE: '',
          CODE: '',
          NUMBER: '',
          'E-MAIL': '',
          'PSUDO ID': '',
          'SALE PERSON': '',
          'LEAD PERSON': userId,
          SOURSE: '',
          'CLIENT REMARK': '',
          FEEDBACK: '',
          'TOTAL COST': 0,
          'TOTAL COST CURRENCY': 'USD',
          'TOKEN AMOUNT': 0,
          'TOKEN AMOUNT CURRENCY': 'USD'
        });
        
        setShowForm(false);
        setEditingSaleId(null);
        loadSalesData();
      }
    } catch (err) {
      console.error('Error with sale:', err);
      setError(err.response?.data?.message || 'Failed to process sale. Please try again.');
      toast.error(err.response?.data?.message || 'Failed to process sale');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete sale
  const handleDeleteSale = async (saleId) => {
    if (!window.confirm('Are you sure you want to delete this sale?')) {
      return;
    }
    
    try {
      setLoading(true);
      await leadPersonSalesAPI.delete(saleId);
      toast.success('Sale deleted successfully');
      loadSalesData();
    } catch (err) {
      console.error('Error deleting sale:', err);
      toast.error('Failed to delete sale');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit sale
  const handleEditSale = (sale) => {
    setEditingSaleId(sale._id);
    
    // Map the sale data to form fields
    setFormData({
      DATE: new Date(sale.date).toISOString().split('T')[0],
      NAME: sale.customerName || '',
      COUNTRY: sale.country || '',
      COURSE: sale.course || '',
      CODE: sale.countryCode || '',
      NUMBER: sale.contactNumber || '',
      'E-MAIL': sale.email || '',
      'PSUDO ID': sale.pseudoId || '',
      'SALE PERSON': sale.salesPerson?._id || sale.salesPerson || '',
      'LEAD PERSON': sale.leadPerson?._id || sale.leadPerson || '',
      SOURSE: sale.source || '',
      'CLIENT REMARK': sale.clientRemark || '',
      FEEDBACK: sale.feedback || '',
      'TOTAL COST': sale.totalCost || 0,
      'TOTAL COST CURRENCY': sale.totalCostCurrency || 'USD',
      'TOKEN AMOUNT': sale.tokenAmount || 0,
      'TOKEN AMOUNT CURRENCY': sale.tokenAmountCurrency || 'USD'
    });
    
    setShowForm(true);
    
    // Scroll to form
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Reset form and cancel editing
  const handleCancelEdit = () => {
    setEditingSaleId(null);
    setFormData({
      DATE: new Date().toISOString().split('T')[0],
      NAME: '',
      COUNTRY: '',
      COURSE: '',
      CODE: '',
      NUMBER: '',
      'E-MAIL': '',
      'PSUDO ID': '',
      'SALE PERSON': '',
      'LEAD PERSON': user?.id || user?._id || user?.userId || '',
      SOURSE: '',
      'CLIENT REMARK': '',
      FEEDBACK: '',
      'TOTAL COST': 0,
      'TOTAL COST CURRENCY': 'USD',
      'TOKEN AMOUNT': 0,
      'TOKEN AMOUNT CURRENCY': 'USD'
    });
    setShowForm(false);
  };

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Lead Sales Management</h1>
          <button
            onClick={() => {
              setEditingSaleId(null);
              setShowForm(!showForm);
            }}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-sm dark:shadow-xl hover:shadow-md transition-all duration-200 text-white rounded-md"
          >
            {showForm ? 'Cancel' : <>
              <FaPlus className="mr-2" /> Add New Sale
            </>}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            {error}
          </div>
        )}

        {showForm && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 transition-all duration-200 ease-out shadow-md dark:shadow-2xl rounded-lg p-6 mb-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">
              {editingSaleId ? 'Edit Sale' : 'Add New Sale'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    name="DATE"
                    value={formData.DATE}
                    onChange={handleChange}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md"
                    required
                  />
                </div>

                {/* Customer Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Customer Name</label>
                  <input
                    type="text"
                    name="NAME"
                    value={formData.NAME}
                    onChange={handleChange}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md"
                    required
                  />
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Country</label>
                  <input
                    type="text"
                    name="COUNTRY"
                    value={formData.COUNTRY}
                    onChange={handleChange}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md"
                    required
                  />
                </div>

                {/* Course */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Course</label>
                  <input
                    type="text"
                    name="COURSE"
                    value={formData.COURSE}
                    onChange={handleChange}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md"
                    required
                  />
                </div>

                {/* Country Code */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Country Code</label>
                  <input
                    type="text"
                    name="CODE"
                    value={formData.CODE}
                    onChange={handleChange}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    name="NUMBER"
                    value={formData.NUMBER}
                    onChange={handleChange}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    name="E-MAIL"
                    value={formData['E-MAIL']}
                    onChange={handleChange}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md"
                  />
                </div>

                {/* Pseudo ID */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Pseudo ID</label>
                  <input
                    type="text"
                    name="PSUDO ID"
                    value={formData['PSUDO ID']}
                    onChange={handleChange}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md"
                  />
                </div>

                {/* Sales Person */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Sales Person</label>
                  <select
                    name="SALE PERSON"
                    value={formData['SALE PERSON']}
                    onChange={handleChange}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md"
                  >
                    <option value="">Select Sales Person</option>
                    {salesPersons.map(person => (
                      <option key={person._id} value={person._id}>
                        {person.fullName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Source */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Source</label>
                  <input
                    type="text"
                    name="SOURSE"
                    value={formData.SOURSE}
                    onChange={handleChange}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md"
                  />
                </div>

                {/* Total Cost */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Total Cost</label>
                  <div className="flex">
                    <input
                      type="number"
                      name="TOTAL COST"
                      value={formData['TOTAL COST']}
                      onChange={handleChange}
                      className="w-2/3 p-2 border border-slate-300 dark:border-slate-600 rounded-l-md"
                      required
                    />
                    <select
                      name="TOTAL COST CURRENCY"
                      value={formData['TOTAL COST CURRENCY']}
                      onChange={handleChange}
                      className="w-1/3 p-2 border border-slate-300 dark:border-slate-600 rounded-r-md"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="INR">INR</option>
                    </select>
                  </div>
                </div>

                {/* Token Amount */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Token Amount</label>
                  <div className="flex">
                    <input
                      type="number"
                      name="TOKEN AMOUNT"
                      value={formData['TOKEN AMOUNT']}
                      onChange={handleChange}
                      className="w-2/3 p-2 border border-slate-300 dark:border-slate-600 rounded-l-md"
                      required
                    />
                    <select
                      name="TOKEN AMOUNT CURRENCY"
                      value={formData['TOKEN AMOUNT CURRENCY']}
                      onChange={handleChange}
                      className="w-1/3 p-2 border border-slate-300 dark:border-slate-600 rounded-r-md"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="INR">INR</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Client Remark */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Client Remark</label>
                <textarea
                  name="CLIENT REMARK"
                  value={formData['CLIENT REMARK']}
                  onChange={handleChange}
                  rows="2"
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md"
                ></textarea>
              </div>

              {/* Feedback */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Feedback</label>
                <textarea
                  name="FEEDBACK"
                  value={formData.FEEDBACK}
                  onChange={handleChange}
                  rows="2"
                  className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md"
                ></textarea>
              </div>

              <div className="mt-6 flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-gray-300 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-sm dark:shadow-xl hover:shadow-md transition-all duration-200 text-white rounded-md disabled:bg-blue-300"
                >
                  {loading ? 'Processing...' : (editingSaleId ? 'Update Sale' : 'Add Sale')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Sales List */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 transition-all duration-200 ease-out shadow-md dark:shadow-2xl rounded-lg overflow-hidden shadow-sm">
          <h2 className="text-xl font-semibold p-4 bg-gray-50 dark:bg-slate-800 transition-all duration-200 ease-out">Sales List</h2>
          
          {loading && !showForm ? (
            <div className="flex justify-center items-center p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : salesList.length === 0 ? (
            <div className="p-6 text-center text-slate-500 dark:text-gray-400">
              No sales found. Add your first sale above.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-gray-50 dark:bg-slate-800 transition-all duration-200 ease-out">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">Course</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">Sales Person</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">Token</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-900 transition-all duration-200 ease-out divide-y divide-slate-200 dark:divide-slate-700">
                  {salesList.map(sale => (
                    <tr key={sale._id} className="hover:bg-slate-50 dark:hover:bg-slate-800 dark:bg-slate-800 transition-all duration-200 ease-out">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                        {new Date(sale.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                        <div>{sale.customerName}</div>
                        <div className="text-xs text-slate-500 dark:text-gray-400">{sale.country}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">{sale.course}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                        {sale.salesPerson?.fullName || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                        {sale.totalCost} {sale.totalCostCurrency}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
                        {sale.tokenAmount} {sale.tokenAmountCurrency}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${sale.saleType === 'Lead Person Sale' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                          {sale.saleType || (sale.isLeadPersonSale ? 'Lead Person Sale' : 'Sales Person Sale')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-gray-400">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditSale(sale)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <FaEdit className="h-5 w-5" />
                          </button>
                          {/* Only allow deleting lead person sales */}
                          {(!sale.saleType || sale.saleType === 'Lead Person Sale' || sale.isLeadPersonSale) && (
                            <button
                              onClick={() => handleDeleteSale(sale._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <FaTrash className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default LeadSalesUpdatePage; 