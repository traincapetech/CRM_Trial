import React, { useState } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import Layout from "../components/Layout/Layout";
import { useAuth } from "../context/AuthContext";
import { leadsAPI, salesAPI } from "../services/api";

import { professionalClasses, transitions, shadows } from '../utils/professionalDarkMode';
const AdminImportPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("leads");
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [importSummary, setImportSummary] = useState(null);
  const [csvFileLeads, setCsvFileLeads] = useState(null);
  const [csvFileSales, setCsvFileSales] = useState(null);
  const [csvFileGoogleForms, setCsvFileGoogleForms] = useState(null);

  // Ensure user is admin
  if (user?.role !== "Admin") {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            Access denied. Only administrators can access this page.
          </div>
        </div>
      </Layout>
    );
  }

  const handleFileChangeLeads = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "text/csv") {
      setCsvFileLeads(file);
    } else {
      toast.error("Please upload a valid CSV file");
      e.target.value = null;
    }
  };

  const handleFileChangeSales = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "text/csv") {
      setCsvFileSales(file);
    } else {
      toast.error("Please upload a valid CSV file");
      e.target.value = null;
    }
  };

  const handleFileChangeGoogleForms = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "text/csv") {
      setCsvFileGoogleForms(file);
    } else {
      toast.error("Please upload a valid CSV file");
      e.target.value = null;
    }
  };

  const parseCsvFile = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const text = event.target.result;
          const lines = text.split("\n");
          const headers = lines[0].split(",").map(h => h.trim());
          
          const data = [];
          for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim() === "") continue;
            
            // Handle quoted fields properly
            const values = [];
            let currentValue = "";
            let insideQuotes = false;
            
            for (let char of lines[i]) {
              if (char === '"') {
                insideQuotes = !insideQuotes;
              } else if (char === ',' && !insideQuotes) {
                values.push(currentValue);
                currentValue = "";
              } else {
                currentValue += char;
              }
            }
            values.push(currentValue); // Add the last value
            
            const row = {};
            headers.forEach((header, index) => {
              if (index < values.length) {
                row[header] = values[index].replace(/^"|"$/g, "").trim();
              }
            });
            
            data.push(row);
          }
          
          resolve(data);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  };

  const importLeads = async () => {
    if (!csvFileLeads) {
      toast.error("Please select a CSV file to import");
      return;
    }

    setLoading(true);
    setUploadProgress(10);
    setImportSummary(null);

    try {
      // Parse the CSV file client-side
      const leads = await parseCsvFile(csvFileLeads);
      setUploadProgress(50);
      
      if (leads.length === 0) {
        toast.error("No data found in the CSV file");
        setLoading(false);
        setUploadProgress(0);
        return;
      }

      // Send the parsed data to the server
      const response = await leadsAPI.importLeads(leads);
      
      setUploadProgress(100);
      setImportSummary({
        total: leads.length,
        imported: response.data.count,
        errors: leads.length - response.data.count
      });
      
      toast.success(`Successfully imported ${response.data.count} leads`);
    } catch (error) {
      console.error("Import error:", error);
      toast.error(error.response?.data?.message || "Failed to import leads");
    } finally {
      setLoading(false);
    }
  };

  const importSales = async () => {
    if (!csvFileSales) {
      toast.error("Please select a CSV file to import");
      return;
    }

    setLoading(true);
    setUploadProgress(10);
    setImportSummary(null);

    try {
      // Parse the CSV file client-side
      const sales = await parseCsvFile(csvFileSales);
      setUploadProgress(50);
      
      if (sales.length === 0) {
        toast.error("No data found in the CSV file");
        setLoading(false);
        setUploadProgress(0);
        return;
      }

      // Send the parsed data to the server
      const response = await salesAPI.importSales(sales);
      
      setUploadProgress(100);
      setImportSummary({
        total: sales.length,
        imported: response.data.count,
        errors: response.data.errorCount || 0,
        errorDetails: response.data.errors
      });
      
      toast.success(`Successfully imported ${response.data.count} sales`);
    } catch (error) {
      console.error("Import error:", error);
      toast.error(error.response?.data?.message || "Failed to import sales");
    } finally {
      setLoading(false);
    }
  };

  const importGoogleForms = async () => {
    if (!csvFileGoogleForms) {
      toast.error("Please select a CSV file to import");
      return;
    }

    setLoading(true);
    setUploadProgress(10);
    setImportSummary(null);

    try {
      // Parse the CSV file client-side
      const leads = await parseCsvFile(csvFileGoogleForms);
      setUploadProgress(50);
      
      if (leads.length === 0) {
        toast.error("No data found in the CSV file");
        setLoading(false);
        setUploadProgress(0);
        return;
      }

      // Map Google Forms fields to our lead structure
      const mappedLeads = leads.map(lead => ({
        name: lead["Name"] || lead["Full Name"] || lead["Your name"],
        email: lead["Email"] || lead["Email Address"] || lead["Your email"],
        phone: lead["Phone"] || lead["Phone Number"] || lead["Mobile"],
        countryCode: lead["Country Code"] || "+1",
        country: lead["Country"] || "Unknown",
        course: lead["Course"] || lead["Program"] || lead["Interest"] || "General Inquiry",
        source: "Google Forms",
        sourceLink: lead["Form URL"] || "",
        remarks: lead["Comments"] || lead["Message"] || "",
      }));

      // Send the parsed data to the server
      const response = await leadsAPI.importLeads(mappedLeads);
      
      setUploadProgress(100);
      setImportSummary({
        total: mappedLeads.length,
        imported: response.data.count,
        errors: mappedLeads.length - response.data.count
      });
      
      toast.success(`Successfully imported ${response.data.count} leads from Google Forms`);
    } catch (error) {
      console.error("Import error:", error);
      toast.error(error.response?.data?.message || "Failed to import Google Forms data");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Data Import</h1>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 transition-all duration-200 ease-out rounded-lg shadow-md dark:shadow-2xl overflow-hidden mb-6 shadow-sm">
          <div className="border-b border-slate-200 dark:border-slate-700">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("leads")}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === "leads"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 dark:text-gray-400 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 dark:text-gray-400 hover:border-gray-300 dark:border-slate-600"
                }`}
              >
                Import Leads
              </button>
              <button
                onClick={() => setActiveTab("sales")}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === "sales"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 dark:text-gray-400 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 dark:text-gray-400 hover:border-gray-300 dark:border-slate-600"
                }`}
              >
                Import Sales
              </button>
              <button
                onClick={() => setActiveTab("google-forms")}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === "google-forms"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 dark:text-gray-400 dark:text-gray-400 hover:text-gray-700 dark:text-gray-300 dark:text-gray-400 hover:border-gray-300 dark:border-slate-600"
                }`}
              >
                Import Google Forms
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "leads" && (
              <div>
                <h2 className="text-lg font-medium mb-4">Import Leads from CSV</h2>
                <p className="mb-4 text-gray-600 dark:text-gray-500">
                  Upload a CSV file exported from Google Sheets containing lead information.
                  Make sure your file has headers for: Name, Email, Phone, Country, Course,
                  and other lead properties. For dates, you can use either YYYY-MM-DD (e.g., 2025-04-15) 
                  or DD-MM-YYYY (e.g., 15-04-2025) format.
                </p>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Upload CSV File
                  </label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChangeLeads}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500"
                    disabled={loading}
                  />
                  {csvFileLeads && (
                    <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">
                      Selected file: {csvFileLeads.name}
                    </p>
                  )}
                </div>

                <button
                  onClick={importLeads}
                  disabled={loading || !csvFileLeads}
                  className={`px-4 py-2 rounded-md text-white ${
                    loading || !csvFileLeads
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  } transition`}
                >
                  {loading ? "Importing..." : "Import Leads"}
                </button>
              </div>
            )}

            {activeTab === "sales" && (
              <div>
                <h2 className="text-lg font-medium mb-4">Import Sales from CSV</h2>
                <p className="mb-4 text-gray-600 dark:text-gray-500">
                  Upload a CSV file exported from Google Sheets containing sales information.
                  Make sure your file has headers for: Email or Phone (to identify the lead),
                  Amount, Product, Status, and other sales properties.
                </p>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Upload CSV File
                  </label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChangeSales}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500"
                    disabled={loading}
                  />
                  {csvFileSales && (
                    <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">
                      Selected file: {csvFileSales.name}
                    </p>
                  )}
                </div>

                <button
                  onClick={importSales}
                  disabled={loading || !csvFileSales}
                  className={`px-4 py-2 rounded-md text-white ${
                    loading || !csvFileSales
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  } transition`}
                >
                  {loading ? "Importing..." : "Import Sales"}
                </button>
              </div>
            )}

            {activeTab === "google-forms" && (
              <div>
                <h2 className="text-lg font-medium mb-4">Import Google Forms Responses</h2>
                <p className="mb-4 text-gray-600 dark:text-gray-500">
                  Upload a CSV file exported from Google Forms containing lead information.
                  The system will try to map common Google Forms fields to the appropriate lead properties.
                  For dates, you can use either YYYY-MM-DD (e.g., 2025-04-15) or DD-MM-YYYY (e.g., 15-04-2025) format.
                </p>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Upload CSV File
                  </label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChangeGoogleForms}
                    className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:border-blue-400 focus:ring-offset-2 focus:border-blue-500"
                    disabled={loading}
                  />
                  {csvFileGoogleForms && (
                    <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">
                      Selected file: {csvFileGoogleForms.name}
                    </p>
                  )}
                </div>

                <button
                  onClick={importGoogleForms}
                  disabled={loading || !csvFileGoogleForms}
                  className={`px-4 py-2 rounded-md text-white ${
                    loading || !csvFileGoogleForms
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700"
                  } transition`}
                >
                  {loading ? "Importing..." : "Import Google Forms Data"}
                </button>
              </div>
            )}

            {loading && (
              <div className="mt-6">
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                        Progress
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold inline-block text-blue-600">
                        {uploadProgress}%
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                    <div
                      style={{ width: `${uploadProgress}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500"
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {importSummary && (
              <div className="mt-6 p-4 bg-gray-50 dark:bg-slate-800 transition-all duration-200 ease-out rounded-lg">
                <h3 className="text-lg font-medium mb-2">Import Summary</h3>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="bg-blue-50 p-3 rounded-md">
                    <p className="text-sm text-gray-600 dark:text-gray-500">Total Records</p>
                    <p className="text-xl font-bold">{importSummary.total}</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-md">
                    <p className="text-sm text-gray-600 dark:text-gray-500">Successfully Imported</p>
                    <p className="text-xl font-bold text-green-600">{importSummary.imported}</p>
                  </div>
                  <div className="bg-red-50 p-3 rounded-md">
                    <p className="text-sm text-gray-600 dark:text-gray-500">Failed Records</p>
                    <p className="text-xl font-bold text-red-600">{importSummary.errors}</p>
                  </div>
                </div>

                {importSummary.errorDetails && importSummary.errorDetails.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-md font-medium mb-2">Error Details</h4>
                    <div className="max-h-40 overflow-y-auto bg-white dark:bg-slate-900 transition-all duration-200 ease-out p-2 rounded border border-slate-300 dark:border-slate-600">
                      <ul className="text-sm text-slate-700 dark:text-slate-300">
                        {importSummary.errorDetails.slice(0, 10).map((error, index) => (
                          <li key={index} className="mb-1 pb-1 border-b border-slate-200 dark:border-slate-700">
                            {error.message}
                          </li>
                        ))}
                        {importSummary.errorDetails.length > 10 && (
                          <li className="text-slate-500 dark:text-gray-400 italic">
                            ...and {importSummary.errorDetails.length - 10} more errors
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 transition-all duration-200 ease-out rounded-lg shadow-md dark:shadow-2xl overflow-hidden p-6 shadow-sm">
          <h2 className="text-lg font-medium mb-4">Import Instructions</h2>
          
          <div className="mb-4">
            <h3 className="text-md font-semibold mb-2">Required Fields</h3>
            
            <div className="mb-4">
              <h4 className="font-medium text-blue-600">Leads Sheet:</h4>
              <ul className="list-disc ml-5 text-sm text-gray-600 dark:text-gray-500">
                <li><strong>Name</strong> - Lead's full name</li>
                <li><strong>Email</strong> - Lead's email address</li>
                <li><strong>Phone</strong> - Lead's phone number</li>
                <li><strong>CountryCode</strong> - Phone country code (e.g., +1, +91)</li>
                <li><strong>Country</strong> - Lead's country</li>
                <li><strong>Course</strong> - Course/product of interest</li>
                <li>Optional: PseudoId, Company, Client, Status, Source, SourceLink, Remarks, Feedback</li>
              </ul>
            </div>
            
            <div className="mb-4">
              <h4 className="font-medium text-blue-600">Sales Sheet:</h4>
              <ul className="list-disc ml-5 text-sm text-gray-600 dark:text-gray-500">
                <li><strong>Email</strong> or <strong>Phone</strong> - To identify the associated lead</li>
                <li><strong>Amount</strong> - Sale amount</li>
                <li><strong>Product</strong> - Product/service sold</li>
                <li>Optional: Token, Status (Pending/Closed), Notes</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-blue-600">Google Forms:</h4>
              <ul className="list-disc ml-5 text-sm text-gray-600 dark:text-gray-500">
                <li>The system automatically maps common Google Forms field names</li>
                <li>Ensure your form includes name, email, phone, and course interest fields</li>
              </ul>
            </div>
          </div>
          
          <div>
            <h3 className="text-md font-semibold mb-2">Export Instructions</h3>
            <ol className="list-decimal ml-5 text-sm text-gray-600 dark:text-gray-500">
              <li>Open your Google Sheet</li>
              <li>Go to <strong>File</strong> &gt; <strong>Download</strong> &gt; <strong>Comma-separated values (.csv)</strong></li>
              <li>Save the file to your computer</li>
              <li>Upload the CSV file using the form above</li>
            </ol>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminImportPage; 