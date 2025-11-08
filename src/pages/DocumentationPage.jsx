import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { FaDownload, FaSpinner } from 'react-icons/fa';

const DocumentationPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/documentation/project', {
        responseType: 'blob'
      });

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'CRM_Project_Documentation.pdf');
      
      // Append to html link element page
      document.body.appendChild(link);
      
      // Start download
      link.click();
      
      // Clean up and remove the link
      link.parentNode.removeChild(link);
      toast.success('Documentation downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download documentation');
    } finally {
      setLoading(false);
    }
  };

  if (!['Admin', 'HR', 'Manager'].includes(user?.role)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center text-red-600">
          Not authorized to access documentation.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Project Documentation
          </h1>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">
              CRM System Documentation
            </h2>
            <p className="text-gray-600 mb-4">
              This documentation provides a comprehensive overview of the CRM system including:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
              <li>Authentication System</li>
              <li>Employee Management</li>
              <li>Payroll System</li>
              <li>Chat System</li>
              <li>Technical Stack</li>
              <li>API Endpoints</li>
              <li>Future Enhancements</li>
            </ul>
          </div>

          <button
            onClick={handleDownload}
            disabled={loading}
            className={`flex items-center justify-center w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
              loading ? 'opacity-75 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <FaSpinner className="animate-spin mr-2" />
            ) : (
              <FaDownload className="mr-2" />
            )}
            {loading ? 'Downloading...' : 'Download Documentation'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentationPage; 