import React, { useState } from 'react';
import api from '../services/api';

const CreateTaskForm = ({ users, onTaskCreated }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [assignedTo, setAssignedTo] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/tasks', {
                title,
                description,
                assignedTo,
                department: 'IT' // Hardcoded for now, could be dynamic in a larger app
            });
            onTaskCreated(response.data.data);
            // Reset form
            setTitle('');
            setDescription('');
            setAssignedTo('');
        } catch (error) {
            console.error("Error creating task:", error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 border rounded-lg shadow-sm">
            <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                />
            </div>
            <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="3"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                ></textarea>
            </div>
            <div className="mb-4">
                <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700">Assign To</label>
                <select
                    id="assignedTo"
                    value={assignedTo}
                    onChange={(e) => setAssignedTo(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                >
                    <option value="">Select a user</option>
                    {users.map(user => {
                        // Handle both user objects (with _id) and employee objects (with userId)
                        const userId = user._id || user.userId || user.id;
                        const userName = user.fullName || user.name || 'Unknown';
                        // Safely extract role name - handle both string and object
                        const roleName = typeof user.role === 'string' ? user.role : (user.role?.name || '');
                        return (
                            <option key={userId} value={userId}>
                                {userName} {roleName ? `(${roleName})` : ''}
                            </option>
                        );
                    })}
                </select>
            </div>
            <button
                type="submit"
                className="w-full px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
                Create Task
            </button>
        </form>
    );
};

export default CreateTaskForm;
