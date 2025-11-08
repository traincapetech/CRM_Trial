import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  FaLaptopCode, 
  FaUsers, 
  FaCalendarAlt, 
  FaCheckCircle, 
  FaClock,
  FaEdit,
  FaTrash,
  FaUserPlus,
  FaTimes,
  FaCode,
  FaChartLine,
  FaUser
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import api from '../services/api'; // use api service
import Layout from '../components/Layout/Layout';
import { useNavigate } from 'react-router-dom';

import ITDepartmentPanel from '../components/Employee/ITDepartmentPanel';
import ITOverviewPanel from '../components/Employee/ITOverviewPanel';
import ITProjectsPanel from '../components/Employee/ITProjectsPanel';
import ITInternsTable from '../components/Employee/ITInternsTable';
import { formatDescription } from '../utils/formatDescription';

// My new components
import TaskList from '../components/TaskList';
import CreateTaskForm from '../components/CreateTaskForm';
import CreateUserForm from '../components/CreateUserForm';
import UserList from '../components/UserList';

// Inline components for Projects
const ProjectCreate = ({ onCreated, itUsers = [] }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [technologies, setTechnologies] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [progress, setProgress] = useState(0);
  const [selectedTeam, setSelectedTeam] = useState([]);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showAddTeamMember, setShowAddTeamMember] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');

  const addTeamMember = () => {
    if (selectedUserId && !selectedTeam.includes(selectedUserId)) {
      setSelectedTeam([...selectedTeam, selectedUserId]);
      setSelectedUserId('');
      setShowAddTeamMember(false);
    }
  };

  const removeTeamMember = (userId) => {
    setSelectedTeam(selectedTeam.filter(id => id !== userId));
  };

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/it-projects', { 
        name, 
        description, 
        technologies,
        status,
        progress: parseInt(progress),
        team: selectedTeam,
        startDate,
        endDate: endDate || undefined
      });
      toast.success('Project created successfully!');
      setName(''); 
      setDescription(''); 
      setTechnologies('');
      setProgress(0);
      setSelectedTeam([]);
      setStartDate(new Date().toISOString().split('T')[0]);
      setEndDate('');
      onCreated?.();
    } catch (error) {
      toast.error('Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  const availableUsers = itUsers.filter(u => !selectedTeam.includes(u.userId || u._id));

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <FaLaptopCode className="text-indigo-600" />
          Create New Project
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Project Name *</label>
            <input 
              value={name} 
              onChange={e=>setName(e.target.value)} 
              placeholder="Enter project name" 
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-800" 
              required 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea 
              value={description} 
              onChange={e=>setDescription(e.target.value)} 
              placeholder="Describe the project..."
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-gray-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select 
                value={status} 
                onChange={e=>setStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800"
              >
                <option value="ACTIVE">Active</option>
                <option value="PENDING">Pending</option>
                <option value="ON_HOLD">On Hold</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Progress (%)</label>
              <input 
                type="number" 
                value={progress} 
                onChange={e=>setProgress(e.target.value)} 
                min="0" 
                max="100"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Technologies</label>
            <input 
              value={technologies} 
              onChange={e=>setTechnologies(e.target.value)} 
              placeholder="React, Node.js, MongoDB (comma-separated)" 
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input 
                type="date" 
                value={startDate} 
                onChange={e=>setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date (Optional)</label>
              <input 
                type="date" 
                value={endDate} 
                onChange={e=>setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">Team Members</label>
              {!showAddTeamMember && (
                <button
                  type="button"
                  onClick={() => setShowAddTeamMember(true)}
                  className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  <FaUserPlus /> Add Member
                </button>
              )}
            </div>
            
            {showAddTeamMember && (
              <div className="flex gap-2 mb-2">
                <select
                  value={selectedUserId}
                  onChange={e => setSelectedUserId(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800"
                >
                  <option value="">Select team member...</option>
                  {availableUsers.map(u => (
                    <option key={u.userId || u._id} value={u.userId || u._id}>
                      {u.fullName} ({u.role?.name || u.role || 'IT'})
                    </option>
                  ))}
                </select>
                <Button type="button" onClick={addTeamMember} disabled={!selectedUserId}>
                  Add
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAddTeamMember(false)}>
                  Cancel
                </Button>
              </div>
            )}

            {selectedTeam.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg border">
                {selectedTeam.map(userId => {
                  const user = itUsers.find(u => (u.userId || u._id) === userId);
                  if (!user) return null;
                  return (
                    <Badge key={userId} className="flex items-center gap-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                      {user.fullName}
                      <button
                        type="button"
                        onClick={() => removeTeamMember(userId)}
                        className="ml-1 hover:text-red-600"
                      >
                        <FaTimes className="text-xs" />
                      </button>
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>

          <Button 
            type="submit" 
            disabled={submitting} 
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            {submitting ? 'Creating...' : 'Create Project'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

const ProjectCard = ({ project, onUpdated, onDeleted, canEdit, itUsers = [], currentUser }) => {
  const [editing, setEditing] = useState(false);
  const [updatingProgress, setUpdatingProgress] = useState(false);
  const [showProgressUpdate, setShowProgressUpdate] = useState(false);
  const [progressValue, setProgressValue] = useState(project.progress || 0);
  const [progressNote, setProgressNote] = useState('');

  // Sync progress value when project changes
  useEffect(() => {
    setProgressValue(project.progress || 0);
  }, [project.progress]);
  const [form, setForm] = useState({ 
    name: project.name, 
    description: project.description || '', 
    status: project.status || 'ACTIVE', 
    progress: project.progress || 0, 
    technologies: (project.technologies||[]).join(', '),
    team: (project.team || []).map(t => typeof t === 'object' ? (t._id || t.id) : t),
    startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
    endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : ''
  });
  const [showAddTeamMember, setShowAddTeamMember] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');

  // Check if current user is a team member (but not manager/admin)
  const isTeamMember = currentUser && !canEdit && project.team && project.team.some(t => {
    const teamId = typeof t === 'object' ? (t._id || t.id || t) : t;
    const userId = (currentUser._id || currentUser.id)?.toString();
    return userId && teamId?.toString() === userId;
  });

  const addTeamMember = () => {
    if (selectedUserId && !form.team.includes(selectedUserId)) {
      setForm({...form, team: [...form.team, selectedUserId]});
      setSelectedUserId('');
      setShowAddTeamMember(false);
    }
  };

  const removeTeamMember = (userId) => {
    setForm({...form, team: form.team.filter(id => id !== userId)});
  };

  const update = async () => {
    try {
      await api.put(`/it-projects/${project._id}`, form);
      toast.success('Project updated successfully!');
      setEditing(false);
      onUpdated?.();
    } catch (error) {
      toast.error('Failed to update project');
    }
  };

  const updateProgress = async () => {
    try {
      setUpdatingProgress(true);
      const updateData = { progress: parseInt(progressValue) };
      
      // Only append to description if there's a note
      if (progressNote && progressNote.trim()) {
        const timestamp = new Date().toLocaleString();
        const updateText = `\n\n---\n[Progress Update - ${timestamp} by ${currentUser?.fullName || 'Team Member'}]:\n${progressNote.trim()}`;
        updateData.description = (project.description || '') + updateText;
      }
      
      await api.put(`/it-projects/${project._id}`, updateData);
      toast.success('Progress updated successfully!');
      setShowProgressUpdate(false);
      setProgressNote('');
      onUpdated?.();
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress');
    } finally {
      setUpdatingProgress(false);
    }
  };

  const del = async () => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await api.delete(`/it-projects/${project._id}`);
        toast.success('Project deleted successfully!');
        onDeleted?.();
      } catch (error) {
        toast.error('Failed to delete project');
      }
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'ON_HOLD': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const availableUsers = itUsers.filter(u => !form.team.includes(u.userId || u._id));

  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
      {!editing ? (
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <FaLaptopCode className="text-indigo-600" />
                {project.name}
              </h3>
              <Badge className={getStatusColor(project.status)}>
                {project.status}
              </Badge>
            </div>
            <div className="flex gap-2">
              {isTeamMember && (
                <button
                  onClick={() => setShowProgressUpdate(true)}
                  className="px-3 py-1.5 text-sm bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1"
                  title="Update Progress"
                >
                  <FaChartLine className="text-xs" />
                  Update Progress
                </button>
              )}
              {canEdit && (
                <>
                  <button 
                    onClick={() => setEditing(true)} 
                    className="p-2 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-colors"
                    title="Edit Project"
                  >
                    <FaEdit />
                  </button>
                  <button 
                    onClick={del} 
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Delete Project"
                  >
                    <FaTrash />
                  </button>
                </>
              )}
            </div>
          </div>

          {project.description && (
            <p className="text-gray-600 dark:text-gray-400 mb-4">{project.description}</p>
          )}

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
              <span className="text-sm font-bold text-indigo-600">{project.progress || 0}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${project.progress || 0}%` }}
              ></div>
            </div>
            {isTeamMember && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                You can update this project's progress using the button above
              </p>
            )}
          </div>

          {/* Progress Update Modal */}
          {showProgressUpdate && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowProgressUpdate(false)}>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <FaChartLine className="text-indigo-600" />
                  Update Project Progress
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Progress (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={progressValue}
                      onChange={(e) => setProgressValue(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700"
                    />
                    <div className="mt-2">
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={progressValue}
                        onChange={(e) => setProgressValue(e.target.value)}
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Progress Note (Optional)</label>
                    <textarea
                      value={progressNote}
                      onChange={(e) => setProgressNote(e.target.value)}
                      placeholder="Add a note about your progress update..."
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={updateProgress}
                      disabled={updatingProgress}
                      className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600"
                    >
                      {updatingProgress ? 'Updating...' : 'Update Progress'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowProgressUpdate(false);
                        setProgressNote('');
                      }}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Technologies */}
          {project.technologies && project.technologies.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <FaCode className="text-gray-500 text-sm" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Tech Stack</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech, idx) => (
                  <Badge key={idx} variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Team Members */}
          {project.team && project.team.length > 0 && (
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <FaUsers className="text-gray-500 text-sm" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Team Members</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {project.team.map((member, idx) => {
                  const memberData = typeof member === 'object' ? member : itUsers.find(u => (u.userId || u._id) === member);
                  if (!memberData) return null;
                  return (
                    <Badge key={idx} className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 flex items-center gap-1">
                      <FaUser className="text-xs" />
                      {memberData.fullName || 'Unknown'}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            {project.startDate && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <FaCalendarAlt className="text-xs" />
                <div>
                  <div className="font-medium text-gray-700 dark:text-gray-300">Start Date</div>
                  <div>{new Date(project.startDate).toLocaleDateString()}</div>
                </div>
              </div>
            )}
            {project.endDate && (
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <FaCheckCircle className="text-xs" />
                <div>
                  <div className="font-medium text-gray-700 dark:text-gray-300">End Date</div>
                  <div>{new Date(project.endDate).toLocaleDateString()}</div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      ) : (
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Project Name *</label>
              <input 
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800" 
                value={form.name} 
                onChange={e=>setForm({...form,name:e.target.value})} 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea 
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800"
                rows="3"
                value={form.description} 
                onChange={e=>setForm({...form,description:e.target.value})} 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select 
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800"
                  value={form.status} 
                  onChange={e=>setForm({...form,status:e.target.value})}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="PENDING">Pending</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="ON_HOLD">On Hold</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Progress (%)</label>
                <input 
                  type="number" 
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800"
                  value={form.progress} 
                  onChange={e=>setForm({...form,progress:parseInt(e.target.value||0)})} 
                  min={0} 
                  max={100} 
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Technologies</label>
              <input 
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800"
                value={form.technologies} 
                onChange={e=>setForm({...form,technologies:e.target.value})} 
                placeholder="React, Node.js, MongoDB (comma-separated)" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <input 
                  type="date" 
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800"
                  value={form.startDate} 
                  onChange={e=>setForm({...form,startDate:e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <input 
                  type="date" 
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800"
                  value={form.endDate} 
                  onChange={e=>setForm({...form,endDate:e.target.value})}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">Team Members</label>
                {!showAddTeamMember && (
                  <button
                    type="button"
                    onClick={() => setShowAddTeamMember(true)}
                    className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    <FaUserPlus /> Add Member
                  </button>
                )}
              </div>
              
              {showAddTeamMember && (
                <div className="flex gap-2 mb-2">
                  <select
                    value={selectedUserId}
                    onChange={e => setSelectedUserId(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800"
                  >
                    <option value="">Select team member...</option>
                    {availableUsers.map(u => (
                      <option key={u.userId || u._id} value={u.userId || u._id}>
                        {u.fullName} ({u.role?.name || u.role || 'IT'})
                      </option>
                    ))}
                  </select>
                  <Button type="button" onClick={addTeamMember} disabled={!selectedUserId}>
                    Add
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowAddTeamMember(false)}>
                    Cancel
                  </Button>
                </div>
              )}

              {form.team.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                  {form.team.map(userId => {
                    const user = itUsers.find(u => (u.userId || u._id) === userId);
                    if (!user) return null;
                    return (
                      <Badge key={userId} className="flex items-center gap-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                        {user.fullName}
                        <button
                          type="button"
                          onClick={() => removeTeamMember(userId)}
                          className="ml-1 hover:text-red-600"
                        >
                          <FaTimes className="text-xs" />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              <Button onClick={update} className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600">
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => setEditing(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};


const ITDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [itUsers, setItUsers] = useState([]); // IT users for team assignment
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]); // Add tasks state
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch IT users first (needed for both filtering employees and team assignment)
      const usersRes = await api.get('/auth/users?role=IT Manager,IT Intern,IT Permanent');
      const allITUsers = usersRes.data.data || [];
      const activeUserIds = new Set(allITUsers.map(u => (u._id || u.id).toString()));

      // Employees from Employee API (populated department/role)
      const empRes = await api.get('/employees');
      const allEmployees = empRes.data.data || [];
      
      // Filter IT employees - show all employees with IT roles
      const itEmployees = allEmployees.filter(e => {
        // Get role name - handle both object and string
        let roleName = '';
        if (e.role) {
          if (typeof e.role === 'string') {
            roleName = e.role;
          } else if (e.role.name) {
            roleName = e.role.name;
          }
        }
        
        const roleNameUpper = roleName.toUpperCase();
        
        // Check if role name starts with "IT" (IT Intern, IT Manager, IT Permanent)
        const isITByRole = roleNameUpper.startsWith('IT');
        
        // If role name starts with "IT", definitely include it
        // Don't filter by userId - show all IT employees
        return isITByRole;
      });
      
      setEmployees(itEmployees);
      // Map users to include employee data - preserve user.role as string, don't overwrite with employee.role object
      const mappedITUsers = allITUsers.map(u => {
        const emp = itEmployees.find(e => (e.userId || e._id) === u._id);
        return { 
          ...u, 
          userId: u._id, 
          // Keep user.role as is (it's a string), add employee data separately if needed
          employeeData: emp || null
        };
      });
      setItUsers(mappedITUsers);

      // IT Projects - filter by user assignment for non-IT Managers
      const projRes = await api.get('/it-projects');
      let allProjects = projRes.data.data || [];
      
      // For IT Intern/Permanent (non-IT Managers, non-Admins), only show projects assigned to them
      if (user && user.role !== 'IT Manager' && user.role !== 'Admin') {
        const userId = (user._id || user.id)?.toString();
        allProjects = allProjects.filter(p => {
          // Check if user is in the team array
          const teamIds = (p.team || []).map(t => {
            const id = typeof t === 'object' ? (t._id || t.id || t) : t;
            return id ? id.toString() : null;
          }).filter(Boolean);
          
          const isAssigned = userId && teamIds.includes(userId);
          
          // Debug log
          if (!isAssigned && p.team && p.team.length > 0) {
            console.log('Project not assigned to user:', {
              projectName: p.name,
              userId,
              teamIds,
              team: p.team
            });
          }
          
          return isAssigned;
        });
      }
      
      setProjects(allProjects);

      // Tasks - fetch only IT department tasks
      const tasksResponse = await api.get('/tasks?department=IT');
      const allTasks = tasksResponse.data.data || [];
      setTasks(allTasks);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleTaskUpdate = (updatedTask) => {
    setTasks(tasks.map(task => task._id === updatedTask._id ? updatedTask : task));
  };

  const handleTaskDeleted = (taskId) => {
    setTasks(tasks.filter(t => t._id !== taskId));
  };

  const handleTaskCreated = (newTask) => {
    fetchDashboardData(); // Refetch to get populated data
  };
  
  const handleUserCreated = (newUser) => {
    fetchDashboardData(); // Refetch to get all updated data
  };

  const handleUserUpdated = () => {
    fetchDashboardData(); // Refetch to get all updated data
  };

  const handleUserDeleted = () => {
    fetchDashboardData(); // Refetch to get all updated data
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const canManage = user && (user.role === 'Admin' || user.role === 'IT Manager');
  const isITManager = user && user.role === 'IT Manager';
  const canViewTeam = user && (user.role === 'Admin' || user.role === 'IT Manager');

  return (
    <Layout>
      <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <FaLaptopCode className="text-blue-600" />
          IT Department Dashboard
        </h1>
        <div className="flex gap-2">
          {activeTab === 'team' && canManage && (
            <Button variant="outline" onClick={() => {
              navigate('/employees?dept=IT');
            }}>
              Add Team Member
            </Button>
          )}
          <Button onClick={fetchDashboardData}>Refresh Data</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className={`grid w-full ${canViewTeam ? 'grid-cols-4' : 'grid-cols-3'}`}>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {canViewTeam && <TabsTrigger value="team">Team</TabsTrigger>}
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {employees.length === 0 && projects.length === 0 ? (
            <div className="text-center py-8">
              <h3 className="text-lg font-medium mb-2">Welcome to IT Department Dashboard!</h3>
              <p className="text-gray-600 mb-4">Get started by:</p>
              <ul className="space-y-2 text-sm">
                <li>• Adding team members (Go to Team tab)</li>
                <li>• Creating new projects (Go to Projects tab)</li>
                <li>• Tracking tech stack and progress</li>
              </ul>
            </div>
          ) : (
            <>
              <ITOverviewPanel employees={employees} projects={projects} user={user} />
              {(user?.role === 'IT Manager' || user?.role === 'Admin') && (
                <>
                  <div className="mb-4 flex justify-end">
                    <Button 
                      onClick={async () => {
                        try {
                          const response = await api.post('/employees/fix-it-interns');
                          if (response.data.success) {
                            toast.success(`Fixed ${response.data.fixed} IT Intern employee records`);
                            fetchDashboardData(); // Refresh data
                          }
                        } catch (error) {
                          console.error('Error fixing IT Interns:', error);
                          toast.error('Failed to fix IT Intern records');
                        }
                      }}
                      variant="outline"
                      className="text-sm"
                    >
                      Fix IT Interns Data
                    </Button>
                  </div>
                  <ITInternsTable employees={employees} projects={projects} />
                </>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="team">
            <div className="space-y-6">
              <UserList 
                users={itUsers} 
                employees={employees}
                onUserUpdated={handleUserUpdated}
                onUserDeleted={handleUserDeleted}
                canManage={canManage}
              />
              {employees.length > 0 && (
                <ITDepartmentPanel employees={employees} />
              )}
              {canManage && (
                <div className="mt-8">
                    <h2 className="text-xl font-semibold mb-2">Create New User</h2>
                    <CreateUserForm onUserCreated={handleUserCreated} currentUser={user} />
                </div>
              )}
            </div>
        </TabsContent>

        <TabsContent value="projects">
          <div className="space-y-6">
            {isITManager && (
              <ProjectCreate onCreated={fetchDashboardData} itUsers={itUsers} />
            )}
            {projects.length === 0 ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="py-16 text-center">
                  <FaLaptopCode className="text-6xl mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No Projects Yet</h3>
                  <p className="text-gray-500 dark:text-gray-400">Create your first project to get started</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {projects.map(p => (
                  <ProjectCard 
                    key={p._id} 
                    project={p} 
                    onUpdated={fetchDashboardData} 
                    onDeleted={fetchDashboardData} 
                    canEdit={canManage}
                    itUsers={itUsers}
                    currentUser={user}
                  />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="tasks">
            <TaskList tasks={tasks} currentUser={user} onTaskUpdate={handleTaskUpdate} onTaskDeleted={handleTaskDeleted} />
            {(canManage || user?.role === 'Admin') && (
                <div className="mt-8">
                    <h2 className="text-xl font-semibold mb-2">Create New Task</h2>
                    <CreateTaskForm users={itUsers} onTaskCreated={handleTaskCreated} />
                </div>
            )}
        </TabsContent>
      </Tabs>
      </div>
    </Layout>
  );
};

export default ITDashboardPage;
