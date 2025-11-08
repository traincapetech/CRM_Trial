import api from './api';

export const employeeAPI = {
  // Employee operations
  getAll: () => api.get('/employees'),
  getById: (id) => api.get(`/employees/${id}`),
  getByUserId: (userId) => api.get(`/employees/user/${userId}`),
  create: (employeeData) => {
    // Always use FormData for employee creation to handle both data and files
    if (!(employeeData instanceof FormData)) {
      const formData = new FormData();
      formData.append('employee', JSON.stringify(employeeData));
      employeeData = formData;
    }
    return api.post('/employees', employeeData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  update: (id, employeeData) => {
    // Check if employeeData is FormData (for file uploads)
    if (employeeData instanceof FormData) {
      return api.put(`/employees/${id}`, employeeData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    }
    return api.put(`/employees/${id}`, employeeData);
  },
  delete: (id) => api.delete(`/employees/${id}`),

  // Department and Role operations
  getDepartments: () => api.get('/employees/departments'),
  getRoles: () => api.get('/employees/roles'),

  // Document operations
  uploadDocument: (id, documentType, file) => {
    const formData = new FormData();
    formData.append('document', file);
    return api.post(`/employees/${id}/documents/${documentType}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  getDocument: (filename) => api.get(`/employees/documents/${filename}`, {
    responseType: 'blob'
  }),
};

export default employeeAPI; 