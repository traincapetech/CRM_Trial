import axios from 'axios';

// API URL configuration
const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://crm-backend-o36v.onrender.com/api'
  : 'http://localhost:8080/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token might be expired or invalid
      const token = localStorage.getItem('token');
      if (token) {
        // Clear invalid token
        localStorage.removeItem('token');
        // Optionally redirect to login
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (userData) => api.put('/auth/me', userData),
  updateProfilePicture: (formData) => api.put('/auth/profile-picture', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  getUsers: (role) => api.get(`/auth/users${role ? `?role=${role}` : ''}`),
  createUser: (userData) => api.post('/auth/users', userData),
  updateUser: (userId, userData) => api.put(`/auth/users/${userId}`, userData),
  deleteUser: (userId) => api.delete(`/auth/users/${userId}`),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  verifyOTP: (data) => api.post('/auth/verifyOtp', data),
  resetPassword: (data) => api.post('/auth/reset_password', data),
  createUserWithDocuments: (formData) =>
    api.post('/auth/users/with-documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  updateUserWithDocuments: (userId, formData) =>
    api.put(`/auth/users/${userId}/with-documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
};

// Sales API
export const salesAPI = {
  create: async (saleData) => {
    try {
      console.log('Creating sale with data:', saleData);
      const response = await api.post('/sales', saleData);
      console.log('Sale creation response:', response.data);
      return response;
    } catch (error) {
      console.error('Error creating sale:', error.response?.data || error.message);
      throw error;
    }
  },
  getAll: async () => {
    try {
      console.log('Fetching all sales...');
      const response = await api.get('/sales');
      console.log('Sales API response:', response.data);
      return response;
    } catch (error) {
      console.error('Error fetching sales:', error.response?.data || error.message);
      throw error;
    }
  },
  getAllForced: async () => {
    try {
      console.log('Fetching all sales (forced)...');
      const response = await api.get('/sales?full=true&nocache=' + new Date().getTime());
      console.log('Forced sales API response:', response.data);
      return response;
    } catch (error) {
      console.error('Error fetching sales (forced):', error.response?.data || error.message);
      throw error;
    }
  },
  getById: (id) => api.get(`/sales/${id}`),
  update: (id, saleData) => api.put(`/sales/${id}`, saleData),
  delete: (id) => api.delete(`/sales/${id}`),
  getCount: () => api.get('/sales/count'),
  import: (salesData) => api.post('/sales/import', { sales: salesData }),
  importSales: (salesData) => api.post('/sales/import', { sales: salesData }),
  getCourseAnalysis: (period = 'monthly') => api.get(`/sales/reports/course-analysis?period=${period}`),
  getRevenueAnalysis: (period = '1month') => api.get(`/sales/reports/revenue-analysis?period=${period}`),
  getTopCourses: (period = 'all', limit = 10) => api.get(`/sales/reports/top-courses?period=${period}&limit=${limit}`),
  getStatusAnalysis: (period = '1month', status = null) => {
    const url = status 
      ? `/sales/reports/status-analysis?period=${period}&status=${status}`
      : `/sales/reports/status-analysis?period=${period}`;
    return api.get(url);
  },
};

// Leads API
export const leadsAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    const queryString = params.toString();
    return api.get(queryString ? `/leads?${queryString}` : '/leads');
  },
  getById: (id) => api.get(`/leads/${id}`),
  create: (leadData) => api.post('/leads', leadData),
  update: (id, leadData) => api.put(`/leads/${id}`, leadData),
  delete: (id) => api.delete(`/leads/${id}`),
  getAssigned: () => api.get('/leads/assigned'),
  getRepeatCustomers: () => api.get('/leads/repeat-customers'),
  import: (leadsData) => api.post('/leads/import', { leads: leadsData }),
  importLeads: (leadsData) => api.post('/leads/import', { leads: leadsData }),
  importCSV: (formData) => api.post('/leads/import-csv', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  }),
  getStats: () => api.get('/leads/stats'),
  updateFeedback: (id, feedback) => api.put(`/leads/${id}/feedback`, { feedback }),
};

// Prospects API
export const prospectsAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    const queryString = params.toString();
    return api.get(queryString ? `/prospects?${queryString}` : '/prospects');
  },
  getById: (id) => api.get(`/prospects/${id}`),
  create: (prospectData) => api.post('/prospects', prospectData),
  update: (id, prospectData) => api.put(`/prospects/${id}`, prospectData),
  delete: (id) => api.delete(`/prospects/${id}`),
  convertToLead: (id) => api.post(`/prospects/${id}/convert`),
  getStats: () => api.get('/prospects/stats'),
};

// Currency API
export const currencyAPI = {
  getRates: () => api.get('/currency/rates'),
  getRate: (from, to) => api.get(`/currency/rate?from=${from}&to=${to}`),
  refreshRates: () => api.post('/currency/refresh'),
  convert: (amount, from, to) => api.get(`/currency/convert?amount=${amount}&from=${from}&to=${to}`)
};

// Activity API
export const activityAPI = {
  startSession: () => api.post('/activity/start-session'),
  endSession: (duration) => api.post('/activity/end-session', { duration }),
  trackActivity: (duration, isActive = true) => api.post('/activity/track', { duration, isActive }),
  getMyActivity: (date = null) => {
    const url = date ? `/activity/my-activity?date=${date}` : '/activity/my-activity';
    return api.get(url);
  },
  getAllUsersActivity: () => api.get('/activity/all-users'),
  getStatistics: (days = 7) => api.get(`/activity/statistics?days=${days}`),
};

// Lead Person Sales API
export const leadPersonSalesAPI = {
  getAll: () => api.get('/lead-person-sales'),
  getById: (id) => api.get(`/lead-person-sales/${id}`),
  create: (saleData) => api.post('/lead-person-sales', saleData),
  update: (id, saleData) => api.put(`/lead-person-sales/${id}`, saleData),
  delete: (id) => api.delete(`/lead-person-sales/${id}`),
};

// Tasks API
export const tasksAPI = {
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.date) queryParams.append('date', params.date);
    if (params.salesPerson) queryParams.append('salesPerson', params.salesPerson);
    const queryString = queryParams.toString();
    return api.get(`/tasks${queryString ? `?${queryString}` : ''}`);
  },
  getById: (id) => api.get(`/tasks/${id}`),
  create: (taskData) => api.post('/tasks', taskData),
  update: (id, taskData) => api.put(`/tasks/${id}`, taskData),
  delete: (id) => api.delete(`/tasks/${id}`),
  markCompleted: (id, completed) => api.put(`/tasks/${id}`, { completed }),
  getSalesPersons: () => api.get('/tasks/sales-persons'),
};

// Attendance API
export const attendanceAPI = {
  getTodayAttendance: () => api.get('/attendance/today'),
  checkIn: (data) => api.post('/attendance/checkin', data),
  checkOut: (data) => api.put('/attendance/checkout', data),
  getHistory: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/attendance/history${queryString ? `?${queryString}` : ''}`);
  },
  getSummary: (month, year) => api.get(`/attendance/summary/${month}/${year}`),
  getAllAttendance: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/attendance/all${queryString ? `?${queryString}` : ''}`);
  },
  updateAttendance: (id, data) => api.put(`/attendance/${id}`, data),
  createAttendance: (data) => api.post('/attendance', data)
};

// Leave API
export const leaveAPI = {
  getMyLeaves: () => api.get('/leaves/my-leaves'),
  getLeaveBalance: () => api.get('/leaves/balance'),
  createLeave: (leaveData) => api.post('/leaves', leaveData),
  updateLeave: (id, leaveData) => api.put(`/leaves/${id}`, leaveData),
  deleteLeave: (id) => api.delete(`/leaves/${id}`),
  approveLeave: (id) => api.put(`/leaves/${id}/approve`),
  rejectLeave: (id, reason) => api.put(`/leaves/${id}/reject`, { reason })
};

// Invoice API
export const invoiceAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    const queryString = params.toString();
    return api.get(queryString ? `/invoices?${queryString}` : '/invoices');
  },
  getById: (id) => api.get(`/invoices/${id}`),
  create: (invoiceData) => api.post('/invoices', invoiceData),
  update: (id, invoiceData) => api.put(`/invoices/${id}`, invoiceData),
  delete: (id) => api.delete(`/invoices/${id}`),
  generatePDF: (id) => api.get(`/invoices/${id}/pdf`, { responseType: 'blob' }),
  downloadPDF: (id) => api.get(`/invoices/${id}/download`, { responseType: 'blob' }),
  recordPayment: (id, paymentData) => api.post(`/invoices/${id}/payment`, paymentData),
  getStats: () => api.get('/invoices/stats')
};

// Payroll API
export const payrollAPI = {
  getAll: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.month) queryParams.append('month', params.month);
    if (params.year) queryParams.append('year', params.year);
    if (params.employeeId) queryParams.append('employeeId', params.employeeId);
    const queryString = queryParams.toString();
    return api.get(`/payroll${queryString ? `?${queryString}` : ''}`);
  },
  getById: (id) => api.get(`/payroll/${id}`),
  generate: (payrollData) => api.post('/payroll/generate', payrollData),
  update: (id, payrollData) => api.put(`/payroll/${id}`, payrollData),
  delete: (id) => api.delete(`/payroll/${id}`),
  approve: (id) => api.put(`/payroll/${id}/approve`),
  generateSalarySlip: (id) => api.get(`/payroll/${id}/salary-slip`, { responseType: 'blob' }),
  downloadSalarySlip: (id) => api.get(`/payroll/${id}/download`, { responseType: 'blob' })
};

// Export the api instance as default
export default api;