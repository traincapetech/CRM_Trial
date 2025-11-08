import React, { useState } from 'react';
import api from '../services/api';

const CreateUserForm = ({ onUserCreated, currentUser }) => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        role: '',
        skills: '',
        internshipStartDate: '',
        internshipEndDate: '',
    });

    const [documents, setDocuments] = useState({
        photograph: null,
        aadharCard: null,
        panCard: null,
        tenthMarksheet: null,
        twelfthMarksheet: null,
        bachelorDegree: null, // Optional if not applicable
        pcc: null,
        offerLetter: null,
        resume: null,
    });

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setDocuments({ ...documents, [e.target.name]: e.target.files[0] });
    };

    const validate = () => {
        // Documents are now optional - only validate required form fields
        if (!formData.fullName || !formData.email || !formData.password || !formData.role) {
            setError('Please fill all required fields');
            return false;
        }
        setError('');
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setSubmitting(true);
        try {
            const data = new FormData();
            // basic user fields
            data.append('fullName', formData.fullName);
            data.append('email', formData.email);
            data.append('password', formData.password);
            data.append('role', formData.role);
            // optional skills to Employee record
            if (formData.skills) data.append('skills', formData.skills);
            // internship dates for IT Intern
            if (formData.role === 'IT Intern') {
                if (formData.internshipStartDate) data.append('internshipStartDate', formData.internshipStartDate);
                if (formData.internshipEndDate) data.append('internshipEndDate', formData.internshipEndDate);
            }
            // documents
            Object.keys(documents).forEach((key) => {
                if (documents[key]) {
                    data.append(key, documents[key]);
                }
            });

            const response = await api.post('/auth/users/with-documents', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            onUserCreated?.(response.data.data);
            // reset
            setFormData({ fullName: '', email: '', password: '', role: '', skills: '', internshipStartDate: '', internshipEndDate: '' });
            setDocuments({ photograph: null, aadharCard: null, panCard: null, tenthMarksheet: null, twelfthMarksheet: null, bachelorDegree: null, pcc: null, offerLetter: null, resume: null });
            setSubmitting(false);
        } catch (err) {
            setSubmitting(false);
            const msg = err?.response?.data?.message || 'Error creating user';
            setError(msg);
            // eslint-disable-next-line no-console
            console.error('Error creating user:', err?.response?.data || err);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 border rounded-lg shadow-sm space-y-5">
            <h3 className="text-lg font-semibold">Create New User</h3>

            {error && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">{error}</div>
            )}

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                    <input name="fullName" value={formData.fullName} onChange={handleChange} placeholder="Full Name" required className="mt-1 input w-full"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email *</label>
                    <input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="Email" required className="mt-1 input w-full"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Password *</label>
                    <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Password" required minLength={6} className="mt-1 input w-full"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">System Role *</label>
                    <select name="role" value={formData.role} onChange={handleChange} required className="mt-1 input w-full">
                        <option value="">Select Role</option>
                        {currentUser && currentUser.role === 'Admin' && (
                            <option value="IT Manager">IT Manager</option>
                        )}
                        <option value="IT Intern">IT Intern</option>
                        <option value="IT Permanent">IT Permanent</option>
                    </select>
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Skills (comma-separated)</label>
                    <input name="skills" value={formData.skills} onChange={handleChange} placeholder="MERN, Java, HTML" className="mt-1 input w-full"/>
                </div>
                {formData.role === 'IT Intern' && (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Internship Start Date *</label>
                            <input 
                                name="internshipStartDate" 
                                type="date" 
                                value={formData.internshipStartDate} 
                                onChange={handleChange} 
                                required 
                                className="mt-1 input w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Internship End Date *</label>
                            <input 
                                name="internshipEndDate" 
                                type="date" 
                                value={formData.internshipEndDate} 
                                onChange={handleChange} 
                                required 
                                className="mt-1 input w-full"
                            />
                        </div>
                    </>
                )}
            </div>

            {/* Documents Section */}
            <div className="border-t pt-4">
                <h4 className="text-md font-semibold mb-2">Documents (Optional)</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">You can upload documents now or add them later. All documents are optional.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">Photograph</label>
                        <input name="photograph" type="file" accept="image/*" onChange={handleFileChange} className="input-file"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Aadhar Card</label>
                        <input name="aadharCard" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} className="input-file"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">PAN Card</label>
                        <input name="panCard" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} className="input-file"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">10th Marksheet</label>
                        <input name="tenthMarksheet" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} className="input-file"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">12th Marksheet</label>
                        <input name="twelfthMarksheet" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} className="input-file"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Bachelor's Degree (if applicable)</label>
                        <input name="bachelorDegree" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} className="input-file"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Police Clearance Certificate (PCC)</label>
                        <input name="pcc" type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} className="input-file"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Offer Letter</label>
                        <input name="offerLetter" type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} className="input-file"/>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium">Resume</label>
                        <input name="resume" type="file" accept=".pdf,.doc,.docx" onChange={handleFileChange} className="input-file"/>
                    </div>
                </div>
            </div>

            <button type="submit" disabled={submitting} className="w-full px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                {submitting ? 'Creating...' : 'Create User'}
            </button>
        </form>
    );
};

export default CreateUserForm;
