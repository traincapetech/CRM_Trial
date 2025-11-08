import React, { useState } from 'react';
import api from '../services/api';

const formatDate = (d) => {
    if (!d) return '-';
    try { return new Date(d).toLocaleString(); } catch { return '-'; }
};

const TaskList = ({ tasks, currentUser, onTaskUpdate, onTaskDeleted }) => {
    
    // Helper function to get assigned user name
    const getAssignedUserName = (assignedTo) => {
        if (!assignedTo) return '-';
        // If it's a populated object with fullName
        if (typeof assignedTo === 'object' && assignedTo.fullName) {
            return assignedTo.fullName;
        }
        // If it's a string (ID), return it as fallback
        if (typeof assignedTo === 'string') {
            return assignedTo.substring(0, 8) + '...';
        }
        return '-';
    };
    
    const update = async (taskId, status) => {
        const response = await api.put(`/tasks/${taskId}`, { status });
        onTaskUpdate(response.data.data);
    };
    
    const handleDelete = async (taskId) => {
        if (!window.confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
            return;
        }
        
        try {
            await api.delete(`/tasks/${taskId}`);
            if (onTaskDeleted) {
                onTaskDeleted(taskId);
            }
        } catch (error) {
            console.error('Error deleting task:', error);
            alert(error.response?.data?.message || 'Failed to delete task');
        }
    };

    return (
        <div className="overflow-x-auto rounded-lg border">
            <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-3 font-semibold text-gray-700">Title</th>
                        <th className="px-4 py-3 font-semibold text-gray-700">Description</th>
                        <th className="px-4 py-3 font-semibold text-gray-700">Assigned To</th>
                        <th className="px-4 py-3 font-semibold text-gray-700">Status</th>
                        <th className="px-4 py-3 font-semibold text-gray-700">Assigned At</th>
                        <th className="px-4 py-3 font-semibold text-gray-700">Completed At</th>
                        <th className="px-4 py-3 font-semibold text-gray-700">Confirmed At</th>
                        <th className="px-4 py-3 font-semibold text-gray-700">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {tasks.length === 0 && (
                        <tr>
                            <td colSpan={8} className="px-4 py-6 text-center text-gray-500">No tasks found.</td>
                        </tr>
                    )}
                    {tasks.map((task) => (
                        <TaskRow key={task._id} task={task} currentUser={currentUser} update={update} handleDelete={handleDelete} getAssignedUserName={getAssignedUserName} />
                    ))}
                </tbody>
            </table>
        </div>
    );
};

// Separate component for task row with expandable description
const TaskRow = ({ task, currentUser, update, handleDelete, getAssignedUserName }) => {
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    
    // Check if description is long enough to need truncation
    const description = task.description || '';
    const shouldTruncate = description.length > 100;
    const displayDescription = shouldTruncate && !isDescriptionExpanded 
        ? description.substring(0, 100) + '...' 
        : description;
    
    // Format description to preserve line breaks and numbering
    const formatDescription = (desc) => {
        if (!desc) return '-';
        // Split by newlines and preserve numbered lists
        return desc.split('\n').map((line, idx) => (
            <React.Fragment key={idx}>
                {line}
                {idx < desc.split('\n').length - 1 && <br />}
            </React.Fragment>
        ));
    };

    return (
        <tr className="border-t">
            <td className="px-4 py-3 font-medium text-gray-900">{task.title}</td>
            <td className="px-4 py-3 text-gray-700 max-w-[360px]">
                <div className="whitespace-pre-wrap">
                    {formatDescription(displayDescription)}
                </div>
                {shouldTruncate && (
                    <button
                        onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                        className="text-blue-600 hover:text-blue-800 text-xs mt-1 underline"
                    >
                        {isDescriptionExpanded ? 'Show less' : 'Show more'}
                    </button>
                )}
            </td>
            <td className="px-4 py-3 text-gray-700">{getAssignedUserName(task.assignedTo)}</td>
            <td className="px-4 py-3">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    task.status === 'Manager Confirmed' ? 'bg-green-100 text-green-800' :
                    task.status === 'Employee Completed' ? 'bg-yellow-100 text-yellow-800' :
                    task.status === 'Partially Completed' ? 'bg-indigo-100 text-indigo-800' :
                    task.status === 'Not Completed' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                }`}>
                    {task.status}
                </span>
            </td>
            <td className="px-4 py-3 text-gray-700">{formatDate(task.createdAt)}</td>
            <td className="px-4 py-3 text-gray-700">{formatDate(task.completedAt)}</td>
            <td className="px-4 py-3 text-gray-700">{formatDate(task.confirmedAt)}</td>
            <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                    {/* Assignee actions */}
                    {currentUser._id === (task.assignedTo?._id || task.assignedTo) && (
                        <>
                            {(task.status === 'Pending' || task.status === 'Not Completed') && (
                              <button onClick={() => update(task._id, 'In Progress')} className="px-3 py-1 text-xs font-semibold text-white bg-slate-600 rounded hover:bg-slate-700">Start</button>
                            )}
                            {(task.status === 'In Progress' || task.status === 'Partially Completed') && (
                              <button onClick={() => update(task._id, 'Partially Completed')} className="px-3 py-1 text-xs font-semibold text-white bg-indigo-500 rounded hover:bg-indigo-600">Mark Partial</button>
                            )}
                            {(task.status !== 'Employee Completed') && (
                              <button onClick={() => update(task._id, 'Employee Completed')} className="px-3 py-1 text-xs font-semibold text-white bg-blue-500 rounded hover:bg-blue-600">Mark Complete</button>
                            )}
                            {task.status !== 'Not Completed' && (
                              <button onClick={() => update(task._id, 'Not Completed')} className="px-3 py-1 text-xs font-semibold text-white bg-red-500 rounded hover:bg-red-600">Not Completed</button>
                            )}
                        </>
                    )}

                    {/* Manager/Admin actions */}
                    {(currentUser.role === 'Admin' || currentUser.role === 'IT Manager') && (
                        <>
                            {task.status === 'Employee Completed' && (
                                <button 
                                    onClick={() => update(task._id, 'Manager Confirmed')}
                                    className="px-3 py-1 text-xs font-semibold text-white bg-green-500 rounded hover:bg-green-600"
                                >
                                    Confirm
                                </button>
                            )}
                            <button 
                                onClick={() => handleDelete(task._id)}
                                className="px-3 py-1 text-xs font-semibold text-white bg-red-600 rounded hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </>
                    )}
                </div>
            </td>
        </tr>
    );
};

export default TaskList;
