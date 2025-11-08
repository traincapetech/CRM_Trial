// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { leadsAPI } from "../../services/api";
// import { useAuth } from "../../context/AuthContext";
// import { authAPI } from "../../services/api";
// import LoggingService from "../../services/loggingService";

// const LeadForm = ({ lead = null, onSuccess }) => {
//   const navigate = useNavigate();
//   const { user } = useAuth();
//   const [salesPersons, setSalesPersons] = useState([]);
//   const [leadPersons, setLeadPersons] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     course: "",
//     countryCode: "1",
//     phone: "",
//     country: "",
//     pseudoId: "",
//     company: "",
//     client: "",
//     status: "Introduction",
//     source: "",
//     sourceLink: "",
//     assignedTo: "",
//     leadPerson: "",
//     remarks: "",
//     feedback: "",
//     customCreatedAt: new Date().toISOString().split("T")[0],
//   });

//   useEffect(() => {
//     const fetchUsers = async () => {
//       try {
//         const salesRes = await authAPI.getUsers("Sales Person");
//         setSalesPersons(salesRes.data.data || []);
//         const leadRes = await authAPI.getUsers("Lead Person");
//         setLeadPersons(leadRes.data.data || []);
//       } catch (err) {
//         console.error("Failed to fetch users", err);
//       }
//     };
//     fetchUsers();
//   }, []);

//   useEffect(() => {
//     if (lead) {
//       const createdDate = lead.createdAt
//         ? new Date(lead.createdAt).toISOString().split("T")[0]
//         : new Date().toISOString().split("T")[0];

//       let countryCode = lead.countryCode || lead.CODE || "";
//       countryCode = countryCode.replace(/^\+/, "");

//       const formValues = {
//         name: lead.name || lead.NAME || "",
//         email: lead.email || lead["E-MAIL"] || "",
//         course: lead.course || lead.COURSE || "",
//         countryCode,
//         phone: lead.phone || lead.NUMBER || "",
//         country: lead.country || lead.COUNTRY || "",
//         pseudoId: lead.pseudoId || lead["PSUDO ID"] || "",
//         company: lead.company || lead.COMPANY || "",
//         client: lead.client || lead["CLIENT REMARK"] || "",
//         status: lead.status || "Introduction",
//         source: lead.source || lead.SOURSE || "",
//         sourceLink: lead.sourceLink || lead["SOURCE LINK"] || "",
//         assignedTo:
//           lead.assignedTo?._id ||
//           lead["SALE PERSON"]?._id ||
//           lead["SALE PERSON"] ||
//           "",
//         leadPerson:
//           lead.leadPerson?._id ||
//           lead["LEAD PERSON"]?._id ||
//           lead["LEAD PERSON"] ||
//           "",
//         remarks: lead.remarks || "",
//         feedback: lead.feedback || lead.FEEDBACK || "",
//         customCreatedAt: createdDate,
//       };

//       setFormData(formValues);
//     } else {
//       const userId = (user?._id || user?.id || "").toString();
//       const today = new Date().toISOString().split("T")[0];
//       setFormData((prev) => ({
//         ...prev,
//         assignedTo: userId,
//         leadPerson: user?.role === "Lead Person" ? userId : "",
//         customCreatedAt: today,
//       }));
//     }
//   }, [lead, user]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError(null);

//     try {
//       const dataToSubmit = {
//         NAME: formData.name,
//         "E-MAIL": formData.email || "",
//         COURSE: formData.course,
//         CODE: formData.countryCode,
//         NUMBER: formData.phone,
//         COUNTRY: formData.country,
//         "PSUDO ID": formData.pseudoId || "",
//         "CLIENT REMARK": formData.client || "",
//         status: formData.status || "Introduction",
//         SOURSE: formData.source || "",
//         "SOURCE LINK": formData.sourceLink || "",
//         "SALE PERSON": formData.assignedTo,
//         leadPerson: formData.leadPerson || "",
//         "LEAD PERSON": formData.leadPerson || "",
//         feedback: formData.feedback || "",
//         FEEDBACK: formData.feedback || "",
//         ...(lead
//           ? {}
//           : {
//               DATE: formData.customCreatedAt
//                 ? new Date(formData.customCreatedAt).toISOString()
//                 : new Date().toISOString(),
//               createdAt: formData.customCreatedAt
//                 ? new Date(formData.customCreatedAt).toISOString()
//                 : new Date().toISOString(),
//             }),
//       };

//       const requiredFields = [
//         "name",
//         "course",
//         "phone",
//         "country",
//         "assignedTo",
//       ];
//       const missingFields = requiredFields.filter(
//         (field) => !formData[field]?.trim()
//       );
//       if (missingFields.length > 0) {
//         setError(`Missing required fields: ${missingFields.join(", ")}`);
//         setLoading(false);
//         return;
//       }

//       if (formData.email && !formData.email.includes("@")) {
//         setError("Please enter a valid email address or leave it blank");
//         setLoading(false);
//         return;
//       }

//       let response;
//       if (lead) {
//         response = await leadsAPI.update(lead._id, dataToSubmit);
//         await LoggingService.logLeadUpdate(lead._id, dataToSubmit);
//       } else {
//         response = await leadsAPI.create(dataToSubmit);
//         await LoggingService.logLeadCreate(response.data.data);
//       }

//       if (response.data?.success) {
//         onSuccess(response.data.data);
//       } else {
//         setError("Failed to save lead. Please check your input and try again.");
//       }
//     } catch (err) {
//       setError(
//         err.response?.data?.message ||
//           "Failed to save lead. Please try again later."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <form
//       onSubmit={handleSubmit}
//       className="max-w-4xl mx-auto bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg
//                hover:shadow-2xl transition-shadow duration-300 ease-in-out space-y-12"
//     >
//       {error && (
//         <div className="bg-red-50 border border-red-400 text-red-700 px-6 py-3 rounded-md font-semibold text-center">
//           {error}
//         </div>
//       )}

//       {/* Contact Section */}
//       <section>
//         <h3 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
//           Contact Information
//         </h3>
//         <div className="grid md:grid-cols-2 gap-8">
//           <InputField
//             label="Full Name"
//             name="name"
//             value={formData.name}
//             onChange={handleChange}
//             required
//           />
//           <InputField
//             label="Email"
//             name="email"
//             value={formData.email}
//             onChange={handleChange}
//             type="email"
//           />
//           <PhoneField
//             code={formData.countryCode}
//             number={formData.phone}
//             onChange={handleChange}
//           />
//           <InputField
//             label="Country"
//             name="country"
//             value={formData.country}
//             onChange={handleChange}
//             required
//           />
//         </div>
//       </section>

//       {/* Course Section */}
//       <section>
//         <h3 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
//           Course Information
//         </h3>
//         <div className="grid md:grid-cols-2 gap-8">
//           <InputField
//             label="Course"
//             name="course"
//             value={formData.course}
//             onChange={handleChange}
//             required
//           />
//           <InputField
//             label="Source"
//             name="source"
//             value={formData.source}
//             onChange={handleChange}
//           />
//           <InputField
//             label="Source Link"
//             name="sourceLink"
//             value={formData.sourceLink}
//             onChange={handleChange}
//           />
//           <InputField
//             label="Pseudo ID"
//             name="pseudoId"
//             value={formData.pseudoId}
//             onChange={handleChange}
//           />
//         </div>
//       </section>

//       {/* Assignment Section */}
//       <section>
//         <h3 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
//           Assignment & Status
//         </h3>
//         <div className="grid md:grid-cols-2 gap-8">
//           <SelectField
//             label="Assigned Sales Person"
//             name="assignedTo"
//             value={formData.assignedTo}
//             onChange={handleChange}
//             required
//             options={salesPersons}
//           />
//           <SelectField
//             label="Lead Person"
//             name="leadPerson"
//             value={formData.leadPerson}
//             onChange={handleChange}
//             options={leadPersons}
//           />
//           <SelectField
//             label="Status"
//             name="status"
//             value={formData.status}
//             onChange={handleChange}
//             options={[
//               "Introduction",
//               "Acknowledgement",
//               "Question",
//               "Future Promise",
//               "Payment",
//               "Analysis",
//             ]}
//           />
//           <SelectField
//             label="Feedback"
//             name="feedback"
//             value={formData.feedback}
//             onChange={handleChange}
//             options={["Pending", "Converted", "Not Interested", "Follow Up"]}
//           />
//         </div>
//       </section>

//       {/* Additional Section */}
//       <section>
//         <h3 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
//           Additional Information
//         </h3>
//         <div className="grid md:grid-cols-2 gap-8">
//           <TextAreaField
//             label="Client Remarks"
//             name="client"
//             value={formData.client}
//             onChange={handleChange}
//           />
//           <InputField
//             label="Date Added"
//             name="customCreatedAt"
//             type="date"
//             value={formData.customCreatedAt}
//             onChange={handleChange}
//           />
//         </div>
//       </section>

//       <div className="flex justify-end">
//         <button
//           type="submit"
//           disabled={loading}
//           className="inline-flex items-center bg-gradient-to-r from-blue-600 to-blue-700
//                    text-white font-semibold px-8 py-3 rounded-lg shadow-lg
//                    hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-4
//                    focus:ring-blue-500 focus:ring-opacity-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
//         >
//           {loading ? (
//             <>
//               <svg
//                 className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
//                 xmlns="http://www.w3.org/2000/svg"
//                 fill="none"
//                 viewBox="0 0 24 24"
//               >
//                 <circle
//                   className="opacity-25"
//                   cx="12"
//                   cy="12"
//                   r="10"
//                   stroke="currentColor"
//                   strokeWidth="4"
//                 ></circle>
//                 <path
//                   className="opacity-75"
//                   fill="currentColor"
//                   d="M4 12a8 8 0 018-8v8H4z"
//                 ></path>
//               </svg>
//               Saving...
//             </>
//           ) : lead ? (
//             "Update Lead"
//           ) : (
//             "Add Lead"
//           )}
//         </button>
//       </div>
//     </form>
//   );
// };

// // Reusable input components
// const InputField = ({
//   label,
//   name,
//   value,
//   onChange,
//   type = "text",
//   required,
// }) => (
//   <div>
//     <label
//       htmlFor={name}
//       className="block text-sm font-medium text-gray-700 dark:text-gray-300"
//     >
//       {label} {required && <span className="text-red-500">*</span>}
//     </label>
//     <input
//       type={type}
//       name={name}
//       id={name}
//       value={value}
//       onChange={onChange}
//       required={required}
//       className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:text-white"
//     />
//   </div>
// );

// const TextAreaField = ({ label, name, value, onChange }) => (
//   <div className="md:col-span-2">
//     <label
//       htmlFor={name}
//       className="block text-sm font-medium text-gray-700 dark:text-gray-300"
//     >
//       {label}
//     </label>
//     <textarea
//       name={name}
//       id={name}
//       rows="3"
//       value={value}
//       onChange={onChange}
//       className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:text-white"
//     />
//   </div>
// );

// const PhoneField = ({ code, number, onChange }) => (
//   <div>
//     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
//       Phone <span className="text-red-500">*</span>
//     </label>
//     <div className="mt-1 flex rounded-md shadow-sm">
//       <input
//         type="text"
//         name="countryCode"
//         value={code}
//         onChange={onChange}
//         placeholder="Code"
//         className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-l-md dark:bg-slate-800 dark:text-white"
//       />
//       <input
//         type="text"
//         name="phone"
//         value={number}
//         onChange={onChange}
//         required
//         className="flex-1 px-4 py-2 border-t border-b border-r border-gray-300 dark:border-gray-700 rounded-r-md dark:bg-slate-800 dark:text-white"
//       />
//     </div>
//   </div>
// );

// const SelectField = ({
//   label,
//   name,
//   value,
//   onChange,
//   options = [],
//   required,
// }) => (
//   <div>
//     <label
//       htmlFor={name}
//       className="block text-sm font-medium text-gray-700 dark:text-gray-300"
//     >
//       {label} {required && <span className="text-red-500">*</span>}
//     </label>
//     <select
//       id={name}
//       name={name}
//       value={value}
//       onChange={onChange}
//       required={required}
//       className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:text-white"
//     >
//       <option value="">Select {label}</option>
//       {Array.isArray(options)
//         ? options.map((opt, idx) =>
//             typeof opt === "string" ? (
//               <option key={idx} value={opt}>
//                 {opt}
//               </option>
//             ) : (
//               <option key={opt._id} value={opt._id}>
//                 {opt.fullName || opt.email}
//               </option>
//             )
//           )
//         : null}
//     </select>
//   </div>
// );

// export default LeadForm;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { leadsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';
import LoggingService from '../../services/loggingService';

const LeadForm = ({ lead = null, onSuccess }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [salesPersons, setSalesPersons] = useState([]);
  const [leadPersons, setLeadPersons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    course: '',
    countryCode: '1',
    phone: '',
    country: '',
    pseudoId: '',
    company: '',
    client: '',
    status: 'Introduction',
    source: '',
    sourceLink: '',
    assignedTo: '',
    leadPerson: '',
    remarks: '',
    feedback: '',
    customCreatedAt: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const salesRes = await authAPI.getUsers('Sales Person');
        setSalesPersons(salesRes.data.data || []);
        const leadRes = await authAPI.getUsers('Lead Person');
        setLeadPersons(leadRes.data.data || []);
      } catch (err) {
        console.error('Failed to fetch users', err);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (lead) {
      const createdDate = lead.createdAt
        ? new Date(lead.createdAt).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];

      let countryCode = lead.countryCode || lead.CODE || '';
      countryCode = countryCode.replace(/^\+/, '');

      const formValues = {
        name: lead.name || lead.NAME || '',
        email: lead.email || lead['E-MAIL'] || '',
        course: lead.course || lead.COURSE || '',
        countryCode,
        phone: lead.phone || lead.NUMBER || '',
        country: lead.country || lead.COUNTRY || '',
        pseudoId: lead.pseudoId || lead['PSUDO ID'] || '',
        company: lead.company || lead.COMPANY || '',
        client: lead.client || lead['CLIENT REMARK'] || '',
        status: lead.status || 'Introduction',
        source: lead.source || lead.SOURSE || '',
        sourceLink: lead.sourceLink || lead['SOURCE LINK'] || '',
        assignedTo: lead.assignedTo?._id || lead['SALE PERSON']?._id || lead['SALE PERSON'] || '',
        leadPerson: lead.leadPerson?._id || lead['LEAD PERSON']?._id || lead['LEAD PERSON'] || '',
        remarks: lead.remarks || '',
        feedback: lead.feedback || lead.FEEDBACK || '',
        customCreatedAt: createdDate
      };

      setFormData(formValues);
    } else {
      const userId = (user?._id || user?.id || '').toString();
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({
        ...prev,
        assignedTo: userId,
        leadPerson: user?.role === 'Lead Person' ? userId : '',
        customCreatedAt: today
      }));
    }
  }, [lead, user]);

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
      const dataToSubmit = {
        NAME: formData.name,
        'E-MAIL': formData.email || '',
        COURSE: formData.course,
        CODE: formData.countryCode,
        NUMBER: formData.phone,
        COUNTRY: formData.country,
        'PSUDO ID': formData.pseudoId || '',
        'CLIENT REMARK': formData.client || '',
        status: formData.status || 'Introduction',
        SOURSE: formData.source || '',
        'SOURCE LINK': formData.sourceLink || '',
        'SALE PERSON': formData.assignedTo,
        leadPerson: formData.leadPerson || '',
        'LEAD PERSON': formData.leadPerson || '',
        feedback: formData.feedback || '',
        FEEDBACK: formData.feedback || '',
        ...(lead
          ? {}
          : {
              DATE: formData.customCreatedAt
                ? new Date(formData.customCreatedAt).toISOString()
                : new Date().toISOString(),
              createdAt: formData.customCreatedAt
                ? new Date(formData.customCreatedAt).toISOString()
                : new Date().toISOString()
            })
      };

      const requiredFields = ['name', 'course', 'phone', 'country', 'assignedTo'];
      const missingFields = requiredFields.filter(field => !formData[field]?.trim());
      if (missingFields.length > 0) {
        setError(`Missing required fields: ${missingFields.join(', ')}`);
        setLoading(false);
        return;
      }

      if (formData.email && !formData.email.includes('@')) {
        setError('Please enter a valid email address or leave it blank');
        setLoading(false);
        return;
      }

      let response;
      if (lead) {
        response = await leadsAPI.update(lead._id, dataToSubmit);
        await LoggingService.logLeadUpdate(lead._id, dataToSubmit);
      } else {
        response = await leadsAPI.create(dataToSubmit);
        await LoggingService.logLeadCreate(response.data.data);
      }

      if (response.data?.success) {
        onSuccess(response.data.data);
      } else {
        setError('Failed to save lead. Please check your input and try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save lead. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

 return (
  <form
    onSubmit={handleSubmit}
    className="max-w-4xl mx-auto bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg
               hover:shadow-2xl transition-shadow duration-300 ease-in-out space-y-12"
  >
    {error && (
      <div className="bg-red-50 border border-red-400 text-red-700 px-6 py-3 rounded-md font-semibold text-center">
        {error}
      </div>
    )}

    {/* Contact Section */}
    <section>
      <h3 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
        Contact Information
      </h3>
      <div className="grid md:grid-cols-2 gap-8">
        <InputField label="Full Name" name="name" value={formData.name} onChange={handleChange} required />
        <InputField label="Email" name="email" value={formData.email} onChange={handleChange} type="email" />
        <PhoneField code={formData.countryCode} number={formData.phone} onChange={handleChange} />
        <InputField label="Country" name="country" value={formData.country} onChange={handleChange} required />
      </div>
    </section>

    {/* Course Section */}
    <section>
      <h3 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
        Course Information
      </h3>
      <div className="grid md:grid-cols-2 gap-8">
        <InputField label="Course" name="course" value={formData.course} onChange={handleChange} required />
        <InputField label="Source" name="source" value={formData.source} onChange={handleChange} />
        <InputField label="Source Link" name="sourceLink" value={formData.sourceLink} onChange={handleChange} />
        <InputField label="Pseudo ID" name="pseudoId" value={formData.pseudoId} onChange={handleChange} />
      </div>
    </section>

    {/* Assignment Section */}
    <section>
      <h3 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
        Assignment & Status
      </h3>
      <div className="grid md:grid-cols-2 gap-8">
        <SelectField label="Assigned Sales Person" name="assignedTo" value={formData.assignedTo} onChange={handleChange} required options={salesPersons} />
        <SelectField label="Lead Person" name="leadPerson" value={formData.leadPerson} onChange={handleChange} options={leadPersons} />
        <SelectField label="Status" name="status" value={formData.status} onChange={handleChange} options={["Introduction", "Acknowledgement", "Question", "Future Promise", "Payment", "Analysis"]} />
        <TextAreaField label="Feedback" name="feedback" value={formData.feedback} onChange={handleChange} />
      </div>
    </section>

    {/* Additional Section */}
    <section>
      <h3 className="text-2xl font-semibold mb-6 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2">
        Additional Information
      </h3>
      <div className="grid md:grid-cols-2 gap-8">
        <TextAreaField label="Client Remarks" name="client" value={formData.client} onChange={handleChange} />
        <InputField label="Date Added" name="customCreatedAt" type="date" value={formData.customCreatedAt} onChange={handleChange} />
      </div>
    </section>

    <div className="flex justify-end">
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center bg-gradient-to-r from-blue-600 to-blue-700
                   text-white font-semibold px-8 py-3 rounded-lg shadow-lg
                   hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-4
                   focus:ring-blue-500 focus:ring-opacity-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              ></path>
            </svg>
            Saving...
          </>
        ) : (
          lead ? 'Update Lead' : 'Add Lead'
        )}
      </button>
    </div>
  </form>
);

};

// Reusable input components
const InputField = ({ label, name, value, onChange, type = 'text', required }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      id={name}
      value={value}
      onChange={onChange}
      required={required}
      className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:text-white"
    />
  </div>
);

const TextAreaField = ({ label, name, value, onChange }) => (
  <div className="md:col-span-2">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
    </label>
    <textarea
      name={name}
      id={name}
      rows="3"
      value={value}
      onChange={onChange}
      className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:text-white"
    />
  </div>
);

const PhoneField = ({ code, number, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone <span className="text-red-500">*</span></label>
    <div className="mt-1 flex rounded-md shadow-sm">
      <input
        type="text"
        name="countryCode"
        value={code}
        onChange={onChange}
        placeholder="Code"
        className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-l-md dark:bg-slate-800 dark:text-white"
      />
      <input
        type="text"
        name="phone"
        value={number}
        onChange={onChange}
        required
        className="flex-1 px-4 py-2 border-t border-b border-r border-gray-300 dark:border-gray-700 rounded-r-md dark:bg-slate-800 dark:text-white"
      />
    </div>
  </div>
);

const SelectField = ({ label, name, value, onChange, options = [], required }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-800 dark:text-white"
    >
      <option value="">Select {label}</option>
      {Array.isArray(options)
        ? options.map((opt, idx) =>
            typeof opt === 'string' ? (
              <option key={idx} value={opt}>{opt}</option>
            ) : (
              <option key={opt._id} value={opt._id}>
                {opt.fullName || opt.email}
              </option>
            )
          )
        : null}
    </select>
  </div>
);

export default LeadForm;