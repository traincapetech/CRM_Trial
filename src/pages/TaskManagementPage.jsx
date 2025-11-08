import React, { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import { format } from "date-fns";
import { toast } from "react-toastify";
import { leadsAPI, tasksAPI } from "../services/api";
import notificationService from "../services/notificationService";

import { professionalClasses, transitions, shadows } from '../utils/professionalDarkMode';
// Get API URL for Vite (fixes "process is not defined" error)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Directly get token from localStorage instead of only relying on AuthContext
const getToken = () => localStorage.getItem('token');

const TaskManagementPage = () => {
  const { user } = useAuth();
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [tasks, setTasks] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  // New states for manual entry and search
  const [manualCustomerMode, setManualCustomerMode] = useState(false);
  const [leadSearchQuery, setLeadSearchQuery] = useState('');
  
  // Filter states
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSalesPerson, setSelectedSalesPerson] = useState('');
  const [salesPersons, setSalesPersons] = useState([]);
  const [loadingSalesPersons, setLoadingSalesPersons] = useState(false);

  // Debug token information
  useEffect(() => {
    // Get fresh token for each API call
    const freshToken = getToken();
    setToken(freshToken);
    
    if (!freshToken) {
      toast.error("No authentication token found. Please try logging out and back in.");
    }
  }, []);
  
  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    taskType: "Exam",
    customer: "",
    examDate: "",
    examTime: "",
    // New fields for manual customer entry
    manualCustomerName: "",
    manualCustomerEmail: "",
    manualCustomerPhone: "",
    manualCustomerCourse: ""
  });
  
  const fetchTasks = async () => {
    try {
      setLoading(true);
      
      // Get fresh token for API call
      const freshToken = getToken();
      
      // Check token validity first
      if (!freshToken) {
        toast.error("Authentication token missing. Please log in again.");
        setLoading(false);
        return;
      }
      
      // Build filter parameters
      const filterParams = {};
      if (selectedDate) filterParams.date = selectedDate;
      if (selectedSalesPerson) filterParams.salesPerson = selectedSalesPerson;
      
      // Use tasksAPI service with filters
      const response = await tasksAPI.getAll(filterParams);
      
      if (response.data && response.data.data) {
        console.log('Tasks loaded:', response.data.data);
        
        // Check if customer data is properly populated
        const tasksWithValidCustomers = response.data.data.map(task => {
          // If customer isn't properly populated, add a placeholder
          if (!task.customer || typeof task.customer === 'string') {
            console.log('Task has unpopulated customer:', task);
            // Try to find matching customer from leads list
            const matchingLead = leads.find(lead => lead._id === task.customer);
            if (matchingLead) {
              task.customer = matchingLead;
            }
          }
          return task;
        });
        
        setTasks(tasksWithValidCustomers);
      } else {
        setTasks([]);
        console.log('No tasks found in response');
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      if (error.response && error.response.status === 401) {
        toast.error("Authentication failed. Please log in again.");
      } else {
        toast.error("Failed to fetch tasks: " + (error.message || "Unknown error"));
      }
      
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchSalesPersons = async () => {
    // Only fetch for admin/manager users
    if (user?.role !== 'Admin' && user?.role !== 'Manager') {
      return;
    }
    
    try {
      setLoadingSalesPersons(true);
      const response = await tasksAPI.getSalesPersons();
      if (response.data && response.data.data) {
        setSalesPersons(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching sales persons:', error);
      toast.error('Failed to fetch sales persons');
    } finally {
      setLoadingSalesPersons(false);
    }
  };

  const fetchLeads = async () => {
    setLeadsLoading(true);
    
    try {
      // Get fresh token for API call
      const freshToken = getToken();
      
      // Check token validity first
      if (!freshToken) {
        toast.error("Authentication token missing. Please log in again.");
        setLeadsLoading(false);
        return;
      }
      
      // Use the API service to get all leads
      const response = await leadsAPI.getAll();
      
      // Extract customers data from response
      let apiCustomers = [];
      if (response.data?.data && Array.isArray(response.data.data)) {
        apiCustomers = response.data.data;
      } else if (response.data?.leads && Array.isArray(response.data.leads)) {
        apiCustomers = response.data.leads;
      } else if (Array.isArray(response.data)) {
        apiCustomers = response.data;
      }
      
      if (apiCustomers.length > 0) {
        setLeads(apiCustomers);
        
        // Show success message with breakdown
        const leadCount = apiCustomers.filter(c => !c.isReferenceSale).length;
        const refCount = apiCustomers.filter(c => c.isReferenceSale).length;
        
        if (leadCount === 0 && refCount === 0) {
          toast.info("No customer data available");
        }
      }
    } catch (error) {
      // Detailed error logging
      if (error.response) {
        if (error.response.status === 401) {
          toast.error("Authentication failed. Your session may have expired.");
        } else {
          toast.error("Could not fetch customer data: " + (error.response.data?.message || "Server error"));
        }
      } else if (error.request) {
        toast.error("No response from server. Check your connection.");
      } else {
        toast.error("Error: " + error.message);
      }
    } finally {
      setLeadsLoading(false);
    }
  };
  
  useEffect(() => {
    if (token) {
      fetchTasks();
      fetchLeads();
      fetchSalesPersons();
    }
  }, [token]);

  // Refetch tasks when filters change
  useEffect(() => {
    if (token) {
      fetchTasks();
    }
  }, [selectedDate, selectedSalesPerson]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Client-side validation
      if (manualCustomerMode) {
        // Validate required manual customer fields
        if (!formData.manualCustomerName) {
          toast.error("Please enter customer name");
          return;
        }
        if (!formData.manualCustomerPhone) {
          toast.error("Please enter customer phone number");
          return;
        }
        if (!formData.manualCustomerCourse) {
          toast.error("Please enter course/exam name");
          return;
        }
      } else {
        // Validate customer selection
        if (!formData.customer) {
          toast.error("Please select a customer");
          return;
        }
      }
      
      // Combine date and time
      const combinedDateTime = new Date(`${formData.examDate}T${formData.examTime}`);
      
      let taskData = {
        title: formData.title,
        description: formData.description,
        taskType: formData.taskType,
        examDate: combinedDateTime,
        examDateTime: combinedDateTime,
        assignedTo: user._id,
        salesPerson: user._id,
        course: manualCustomerMode ? formData.manualCustomerCourse : (formData.customer ? 'Selected Customer Course' : 'General Course')
      };
      
      // Handle manual customer entry vs. selecting existing customer
      if (manualCustomerMode) {
        // Create a custom customer object for the task
        taskData.manualCustomer = {
          name: formData.manualCustomerName,
          email: formData.manualCustomerEmail,
          contactNumber: formData.manualCustomerPhone,
          course: formData.manualCustomerCourse
        };
      } else {
        // Use selected customer from dropdown
        taskData.customer = formData.customer;
      }
      
      let response;
      if (currentTask) {
        // Update existing task
        response = await tasksAPI.update(currentTask._id, taskData);
      } else {
        // Create new task
        response = await tasksAPI.create(taskData);
      }
      
      if (response.data.success) {
        toast.success(currentTask ? "Task updated successfully" : "Task created successfully");
        
        // Reset form and close modal
        resetForm();
        
        // Refresh tasks list
        fetchTasks();
      } else {
        toast.error(response.data.message || "Error saving task");
      }
    } catch (error) {
      // Detailed error handling
      if (error.response) {
        if (error.response.status === 401) {
          toast.error("Authentication failed. Please log out and log back in.");
        } else {
          toast.error(error.response?.data?.message || "Failed to save task");
        }
      } else {
        toast.error("Network error - could not connect to server");
      }
    }
  };
  
  const handleEditTask = (task) => {
    console.log('Editing task:', task);
    
    const examDate = format(new Date(task.examDate), "yyyy-MM-dd");
    const examTime = format(new Date(task.examDate), "HH:mm");
    
    // Check if this is a manual customer entry
    const isManualCustomer = task.customer?.isManualEntry || 
                           (!task.customer && task.manualCustomer);
    
    // Handle different customer data formats
    let customerId = '';
    if (!isManualCustomer && task.customer) {
      if (typeof task.customer === 'string') {
        customerId = task.customer;
      } else if (task.customer._id && task.customer._id !== 'manual') {
        customerId = task.customer._id;
      }
    }
    
    // Set manual mode based on the task type
    setManualCustomerMode(isManualCustomer);
    
    // Get customer data for manual entry fields
    const customerData = isManualCustomer ? 
      (task.manualCustomer || task.customer) : null;
    
    setFormData({
      title: task.title,
      description: task.description,
      taskType: task.taskType || 'Exam',
      customer: customerId,
      examDate,
      examTime,
      // Populate manual customer fields if this is a manual entry
      manualCustomerName: customerData?.name || '',
      manualCustomerEmail: customerData?.email || '',
      manualCustomerPhone: customerData?.contactNumber || '',
      manualCustomerCourse: customerData?.course || ''
    });
    
    setCurrentTask(task);
    setModalOpen(true);
    
    // If customer ID is missing or invalid, show a message
    if (!isManualCustomer && !customerId) {
      toast.warning("Customer data may be incomplete. Please select a customer again.");
    }
  };
  
  const handleDeleteTask = async (id) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        const response = await tasksAPI.delete(id);
        
        if (response.data && response.data.success) {
          toast.success("Task deleted successfully");
          // Refresh tasks list
          fetchTasks();
        } else {
          toast.error(response.data?.message || "Failed to delete task");
        }
      } catch (error) {
        if (error.response && error.response.status === 401) {
          toast.error("Authentication failed. Please log in again.");
        } else {
          toast.error("Failed to delete task");
        }
      }
    }
  };
  
  const handleMarkCompleted = async (id, completed) => {
    try {
      const response = await tasksAPI.markCompleted(id, completed);
      
      if (response.data && response.data.success) {
        toast.success("Task status updated");
        // Refresh tasks list
        fetchTasks();
      } else {
        toast.error(response.data?.message || "Failed to update task status");
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        toast.error("Authentication failed. Please log in again.");
      } else {
        toast.error("Failed to update task status");
      }
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return format(date, "MMM dd, yyyy 'at' h:mm a");
  };
  
  // Helper function to display lead/customer name
  const getLeadName = (lead) => {
    // Handle different data structures for leads
    if (!lead) return 'No Name';
    console.log('Getting name for lead:', lead);
    
    // Check if lead is just an ID (string) rather than an object
    if (typeof lead === 'string') {
      return `Customer (ID: ${lead.substring(0, 6)}...)`;
    }
    
    // If lead is not populated properly
    if (!Object.keys(lead).length) {
      return 'Unknown Customer';
    }
    
    let name = '';
    
    // Try all possible name fields
    const possibleNameFields = ['name', 'NAME', 'customerName', 'fullName'];
    
    for (const field of possibleNameFields) {
      if (lead[field] && typeof lead[field] === 'string' && lead[field].trim() !== '') {
        name = lead[field];
        break;
      }
    }
    
    // If still no name found, look for any field containing 'name'
    if (!name) {
      const nameKeys = Object.keys(lead).filter(key => 
        key.toLowerCase().includes('name') && 
        lead[key] && 
        typeof lead[key] === 'string' &&
        lead[key].trim() !== ''
      );
      
      if (nameKeys.length > 0) {
        name = lead[nameKeys[0]];
      }
    }
    
    // If still no name, use course info or ID as fallback
    if (!name || name === 'Unnamed Customer') {
      if (lead.course || lead.COURSE) {
        name = `Student for ${lead.course || lead.COURSE}`;
      } else if (lead._id) {
        name = `Customer ${lead._id.substring(0, 6)}...`;
      } else {
        name = 'Unnamed Customer';
      }
    }
    
    // Add Reference tag if it's a reference customer
    if (lead.isReferenceSale) {
      return `${name} [Reference]`;
    }
    
    // Add course info if available
    const course = lead.course || lead.COURSE;
    if (course && !name.includes(course)) {
      return `${name} (${course})`;
    }
    
    return name;
  };

  // Helper function to get lead contact info (email or phone)
  const getLeadContact = (lead) => {
    if (!lead) return '';
    let contact = '';
    
    // Try to find email
    if (lead.email) {
      contact = lead.email;
    } else if (lead.EMAIL) {
      contact = lead.EMAIL;
    } else if (lead["E-MAIL"]) {
      contact = lead["E-MAIL"];
    } 
    // If no email, try phone/mobile
    else if (lead.contactNumber) {
      contact = lead.contactNumber;
    } else if (lead.phone) {
      contact = lead.phone;
    } else if (lead.MOBILE) {
      contact = lead.MOBILE;
    } else if (lead.CONTACT) {
      contact = lead.CONTACT;
    } else if (lead.NUMBER) {
      contact = lead.NUMBER;
    }
    
    return contact ? ` (${contact})` : '';
  };
  
  // Function to reset the form state
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      taskType: "Exam",
      customer: "",
      examDate: "",
      examTime: "",
      manualCustomerName: "",
      manualCustomerEmail: "",
      manualCustomerPhone: "",
      manualCustomerCourse: ""
    });
    setCurrentTask(null);
    setManualCustomerMode(false);
    setLeadSearchQuery('');
  };
  
  return (
    <Layout>
      <div className="bg-gray-50 dark:bg-slate-800 transition-all duration-200 ease-out min-h-screen py-4 md:py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-200">Task Management</h1>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  console.log('🔊 Testing notification sound...');
                  notificationService.playNotificationSound();
                  toast.success('🔊 Test sound played! (You need to interact with the page first for sound to work)');
                }}
                className="w-full sm:w-auto px-3 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 text-sm sm:text-base flex items-center gap-2"
                title="Test the exam reminder sound"
              >
                🔊 Test Sound
              </button>
              <button
                onClick={() => {
                  resetForm();
                  setModalOpen(true);
                }}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-sm dark:shadow-xl hover:shadow-md transition-all duration-200 text-white rounded-md text-sm sm:text-base"
              >
                Schedule New Exam
              </button>
            </div>
          </div>
          
          {/* Filters Section */}
          <div className="mb-6 p-4 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700">
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              {/* Date Filter */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Filter by Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:text-white"
                />
              </div>
              
              {/* Sales Person Filter (Admin/Manager only) */}
              {(user?.role === 'Admin' || user?.role === 'Manager') && (
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Filter by Sales Person
                  </label>
                  <select
                    value={selectedSalesPerson}
                    onChange={(e) => setSelectedSalesPerson(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:text-white"
                    disabled={loadingSalesPersons}
                  >
                    <option value="">All Sales Persons</option>
                    {salesPersons.map((person) => (
                      <option key={person._id} value={person._id}>
                        {person.fullName} ({person.role})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              {/* Clear Filters Button */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedDate('');
                    setSelectedSalesPerson('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-md transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
            
            {/* Active Filters Display */}
            {(selectedDate || selectedSalesPerson) && (
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
                {selectedDate && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    Date: {new Date(selectedDate).toLocaleDateString()}
                    <button
                      onClick={() => setSelectedDate('')}
                      className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                    >
                      ×
                    </button>
                  </span>
                )}
                {selectedSalesPerson && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Sales Person: {salesPersons.find(p => p._id === selectedSalesPerson)?.fullName || 'Unknown'}
                    <button
                      onClick={() => setSelectedSalesPerson('')}
                      className="ml-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
                    >
                      ×
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
          
          {/* Add a notification for authentication issues */}
          {!getToken() && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-md text-sm">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-medium">Authentication Error</p>
                  <p className="text-sm">No authentication token found. Please log out and log back in to refresh your session.</p>
                  <button 
                    onClick={() => window.location.href = '/login'} 
                    className="mt-2 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                  >
                    Go to Login
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Task List */}
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-500">Loading tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 transition-all duration-200 ease-out p-4 sm:p-8 rounded-md shadow text-center">
              <p className="text-gray-600 dark:text-gray-500">No tasks scheduled yet.</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-gray-400">Click "Schedule New Exam" to create your first task.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {tasks.map((task) => (
                <div
                  key={task._id}
                  className={`bg-white dark:bg-slate-900 rounded-lg shadow p-4 border-l-4 ${
                    task.completed
                      ? "border-green-500"
                      : new Date(task.examDate) < new Date()
                      ? "border-red-500"
                      : "border-blue-500"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-base sm:text-lg mb-2">{task.title}</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditTask(task)}
                        className="p-1 text-blue-600 hover:text-blue-800"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task._id)}
                        className="p-1 text-red-600 hover:text-red-800"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-500 mb-3">{task.description}</p>
                  
                  <div className="mb-3">
                    <div className="flex items-center mb-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 text-slate-500 dark:text-gray-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">{getLeadName(task.customer)}</p>
                    </div>
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 sm:h-4 sm:w-4 text-slate-500 dark:text-gray-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300">{formatDateTime(task.examDate)}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row justify-between items-center mt-4 pt-3 border-t border-gray-100 gap-2">
                    <span className={`text-xs px-2 py-1 rounded mb-2 sm:mb-0 ${task.completed ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}>
                      {task.completed ? "Completed" : "Pending"}
                    </span>
                    <button
                      onClick={() => handleMarkCompleted(task._id, !task.completed)}
                      className={`text-xs w-full sm:w-auto px-3 py-1 rounded-full ${
                        task.completed
                          ? "bg-gray-200 dark:bg-slate-600 text-gray-700 dark:text-gray-300 dark:text-gray-400 hover:bg-gray-300"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                    >
                      {task.completed ? "Mark Incomplete" : "Mark Complete"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Modal for creating/editing tasks */}
          {modalOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 transition-all duration-200 ease-out rounded-lg shadow-lg dark:shadow-lg w-full max-w-md my-8 shadow-sm">
                <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-700">
                  <h3 className="font-bold text-base sm:text-lg">
                    {currentTask ? "Edit Task" : "Schedule New Exam"}
                  </h3>
                </div>
                <form onSubmit={handleSubmit} className="p-4 sm:p-5">
                  <div className="mb-4">
                    <label className="block text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-medium mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500 text-sm"
                      placeholder="Exam Title"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-medium mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500 text-sm"
                      placeholder="Exam details"
                      rows="3"
                    ></textarea>
                  </div>
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <label className="block text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-medium">
                        Customer
                      </label>
                      <div className="flex items-center">
                        <span className="text-xs text-gray-600 dark:text-gray-500 mr-2">Manual Entry</span>
                        <button
                          type="button"
                          onClick={() => setManualCustomerMode(!manualCustomerMode)}
                          className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors focus:outline-none ${
                            manualCustomerMode ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-slate-900 transition-transform ${
                              manualCustomerMode ? 'translate-x-5' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                    
                    {manualCustomerMode ? (
                      // Manual Customer Entry Form
                      <div className="space-y-3">
                        <div>
                          <input
                            type="text"
                            name="manualCustomerName"
                            value={formData.manualCustomerName}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500 text-sm"
                            placeholder="Customer Name *"
                            required
                          />
                        </div>
                        <div>
                          <input
                            type="email"
                            name="manualCustomerEmail"
                            value={formData.manualCustomerEmail}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500 text-sm"
                            placeholder="Email Address"
                          />
                        </div>
                        <div>
                          <input
                            type="tel"
                            name="manualCustomerPhone"
                            value={formData.manualCustomerPhone}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500 text-sm"
                            placeholder="Phone Number *"
                            required
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            name="manualCustomerCourse"
                            value={formData.manualCustomerCourse}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500 text-sm"
                            placeholder="Course/Exam Name *"
                            required
                          />
                        </div>
                      </div>
                    ) : (
                      // Customer Selection from Leads
                      <div>
                        {/* Search input for leads */}
                        <div className="mb-2">
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Search leads by name, email, or course..."
                              value={leadSearchQuery}
                              onChange={(e) => setLeadSearchQuery(e.target.value)}
                              className="w-full px-3 py-2 pl-9 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500 text-sm"
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                        
                        <select
                          name="customer"
                          value={formData.customer}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500 text-sm"
                          required
                        >
                          <option value="">Select Customer</option>
                          
                          {/* Filter leads based on search query */}
                          {(() => {
                            const filteredLeads = leads.filter(lead => {
                              if (!leadSearchQuery) return true;
                              
                              const searchLower = leadSearchQuery.toLowerCase();
                              const name = (lead.name || lead.NAME || '').toLowerCase();
                              const email = (lead.email || lead.EMAIL || lead['E-MAIL'] || '').toLowerCase();
                              const course = (lead.course || lead.COURSE || '').toLowerCase();
                              const phone = (lead.contactNumber || lead.phone || lead.MOBILE || lead.NUMBER || '').toLowerCase();
                              
                              return name.includes(searchLower) || 
                                    email.includes(searchLower) || 
                                    course.includes(searchLower) ||
                                    phone.includes(searchLower);
                            });
                            
                            // Count filtered leads for each category
                            const regularLeads = filteredLeads.filter(lead => !lead.isReferenceSale);
                            const referenceLeads = filteredLeads.filter(lead => lead.isReferenceSale);
                            
                            return (
                              <>
                                {/* Group: Actual Leads from CRM */}
                                {regularLeads.length > 0 && (
                                  <optgroup label={`Leads (${regularLeads.length})`}>
                                    {regularLeads.map(lead => (
                                      <option key={lead._id} value={lead._id}>
                                        {lead.name || lead.NAME || "Unknown"} - {lead.course || lead.COURSE || "No course"} 
                                        {lead.status ? ` (${lead.status})` : ""}
                                      </option>
                                    ))}
                                  </optgroup>
                                )}
                                
                                {/* Group: Reference Customers */}
                                {referenceLeads.length > 0 && (
                                  <optgroup label={`Reference Customers (${referenceLeads.length})`}>
                                    {referenceLeads.map(lead => (
                                      <option key={lead._id} value={lead._id}>
                                        {lead.name || "Unknown"} - {lead.course || "No course"} 
                                        {lead.status ? ` (${lead.status})` : ""} [Reference]
                                      </option>
                                    ))}
                                  </optgroup>
                                )}
                                
                                {filteredLeads.length === 0 && (
                                  <option disabled value="">No leads match your search</option>
                                )}
                              </>
                            );
                          })()}
                        </select>
                        
                        {leadsLoading ? (
                          <p className="mt-1 text-xs text-slate-500 dark:text-gray-400">Loading customers...</p>
                        ) : (
                          <p className="mt-1 text-xs text-slate-500 dark:text-gray-400">
                            {leads.filter(lead => !lead.isReferenceSale).length} leads + 
                            {leads.filter(lead => lead.isReferenceSale).length} reference customers available
                            {leadSearchQuery && (
                              <button 
                                type="button" 
                                onClick={() => setLeadSearchQuery('')}
                                className="ml-2 text-blue-600 hover:text-blue-800"
                              >
                                Clear search
                              </button>
                            )}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-medium mb-2">
                        Exam Date
                      </label>
                      <input
                        type="date"
                        name="examDate"
                        value={formData.examDate}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500 text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-medium mb-2">
                        Exam Time
                      </label>
                      <input
                        type="time"
                        name="examTime"
                        value={formData.examTime}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500 text-sm"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row justify-end sm:space-x-3 mt-6 space-y-2 sm:space-y-0">
                    <button
                      type="button"
                      onClick={() => setModalOpen(false)}
                      className="w-full sm:w-auto px-4 py-2 bg-gray-200 dark:bg-slate-600 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 text-sm order-2 sm:order-1"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-sm dark:shadow-xl hover:shadow-md transition-all duration-200 text-white rounded-md text-sm order-1 sm:order-2"
                    >
                      {currentTask ? "Update Task" : "Create Task"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TaskManagementPage; 