

import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { prospectsAPI, authAPI } from "../services/api";
import { toast } from "react-hot-toast";
import {
  professionalClasses,
  transitions,
  shadows,
} from "../utils/professionalDarkMode";
import { 
  FiPlus, 
  FiSearch, 
  FiEdit, 
  FiTrash2, 
  FiArrowRight,
  FiPhone,
  FiMail,
  FiUser,
  FiEye,
  FiX,
} from "react-icons/fi";
import Layout from "../components/Layout/Layout";
import Navbar from "../components/Navbar";

// Status badge component
// Status Badge
const StatusBadge = ({ status }) => {
  const statusColors = {
    New: "bg-blue-100",
    Contacted: "bg-yellow-100",
    Interested: "bg-green-100",
    "Not Interested": "bg-red-100",
    "Follow Up": "bg-purple-100",
    Qualified: "bg-indigo-100",
    "Converted to Lead": "bg-emerald-100",
    Lost: "bg-gray-100 dark:bg-slate-700",
  };

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium text-black ${
        statusColors[status] || "bg-gray-100 dark:bg-slate-700"
      }`}
    >
      {status}
    </span>
  );
};

// Priority Badge
const PriorityBadge = ({ priority }) => {
  const priorityColors = {
    High: "bg-red-100",
    Medium: "bg-yellow-100",
    Low: "bg-green-100",
  };

  return (
   <span
      className={`px-2 py-1 rounded-full text-xs font-medium text-black dark:text-black ${
        priorityColors[priority] || "bg-gray-100 dark:bg-slate-700"
      }`}
>
  {priority}
</span>
  );
};

const ProspectsPage = () => {
  const { user, token } = useAuth();
  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState(null);
  const [stats, setStats] = useState({});
  
  // Filters and search
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    source: "",
    priority: "",
    page: 1,
    limit: 100000,
  });

  const [pagination, setPagination] = useState({
    pages: 0,
    total: 0,
    currentPage: 1,
  });

  // Sound notification state
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastNotificationCheck, setLastNotificationCheck] = useState(new Date());

  // Remark editing state
  const [editingRemark, setEditingRemark] = useState(null);
  const [remarkText, setRemarkText] = useState('');

  // Play notification sound
  const playNotificationSound = () => {
    if (soundEnabled) {
      try {
        // Create a simple beep sound using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
      } catch (error) {
        console.log('Could not play notification sound:', error);
      }
    }
  };

  // Check for follow-up notifications
  const checkFollowUpNotifications = () => {
    if (user?.role === 'Sales Person' && prospects.length > 0) {
      const today = new Date();
      const urgentFollowUps = prospects.filter(prospect => {
        if (!prospect.nextFollowUpDate) return false;
        const followUpDate = new Date(prospect.nextFollowUpDate);
        const diffTime = followUpDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 1 && diffDays >= 0; // Due today or tomorrow
      });

      if (urgentFollowUps.length > 0) {
        playNotificationSound();
        toast.success(`You have ${urgentFollowUps.length} prospect(s) due for follow-up!`, {
          duration: 5000,
        });
      }
    }
  };

  // Handle remark update
  const handleRemarkUpdate = async (prospectId, remark) => {
    try {
      const response = await prospectsAPI.update(prospectId, { remark });
      if (response.data.success) {
        // Update the prospect in the local state
        setProspects(prev => prev.map(p => 
          p._id === prospectId ? { ...p, remark } : p
        ));
        toast.success('Remark updated successfully');
        setEditingRemark(null);
        setRemarkText('');
      }
    } catch (error) {
      console.error('Error updating remark:', error);
      toast.error('Failed to update remark');
    }
  };

  // Start editing remark
  const startEditingRemark = (prospectId, currentRemark = '') => {
    setEditingRemark(prospectId);
    setRemarkText(currentRemark);
  };

  // Cancel editing remark
  const cancelEditingRemark = () => {
    setEditingRemark(null);
    setRemarkText('');
  };

  // Save remark
  const saveRemark = (prospectId) => {
    handleRemarkUpdate(prospectId, remarkText);
  };

  // Fetch prospects
  const fetchProspects = async () => {
    try {
      setLoading(true);
      const response = await prospectsAPI.getAll(filters);

      if (response.data.success) {
        setProspects(response.data.data);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error("Error fetching prospects:", error);
      toast.error("Failed to fetch prospects");
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await prospectsAPI.getStats();

      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  useEffect(() => {
    fetchProspects();
    fetchStats();
  }, [filters]);

  // Check for notifications when prospects are loaded
  useEffect(() => {
    if (prospects.length > 0) {
      const now = new Date();
      const timeSinceLastCheck = now - lastNotificationCheck;
      
      // Only check notifications if it's been more than 5 minutes since last check
      if (timeSinceLastCheck > 5 * 60 * 1000) {
        checkFollowUpNotifications();
        setLastNotificationCheck(now);
      }
    }
  }, [prospects]);

  // Set up periodic notification checks (every 10 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
      if (prospects.length > 0) {
        checkFollowUpNotifications();
        setLastNotificationCheck(new Date());
      }
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(interval);
  }, [prospects]);

  // Handle search
  const handleSearch = (e) => {
    setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }));
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this prospect?"))
      return;

    try {
      const response = await prospectsAPI.delete(id);

      if (response.data.success) {
        toast.success("Prospect deleted successfully");
        fetchProspects();
        fetchStats();
      }
    } catch (error) {
      console.error("Error deleting prospect:", error);
      toast.error(error.response?.data?.message || "Failed to delete prospect");
    }
  };

  // Handle convert to lead
  const handleConvertToLead = async (id) => {
    if (!window.confirm("Convert this prospect to a lead?")) return;

    try {
      const response = await prospectsAPI.convertToLead(id);

      if (response.data.success) {
        toast.success("Prospect converted to lead successfully");
        fetchProspects();
        fetchStats();
      }
    } catch (error) {
      console.error("Error converting prospect:", error);
      toast.error(
        error.response?.data?.message || "Failed to convert prospect"
      );
    }
  };

  return (
      <Layout>
    <div className="p-6 w-full min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                Prospects
              </h1>
              <p className="text-gray-600 dark:text-gray-500">
                Manage your potential customers
              </p>
          </div>
          <div className="flex items-center gap-3">
            {user?.role === 'Sales Person' && (
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`px-3 py-2 rounded-lg flex items-center gap-2 text-sm transition-all duration-200 ${
                  soundEnabled 
                    ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 dark:hover:bg-green-800' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                🔊 {soundEnabled ? 'Sound On' : 'Sound Off'}
              </button>
            )}
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-sm dark:shadow-xl hover:shadow-md transition-all duration-200 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <FiPlus /> Add Prospect
          </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 transition-all duration-200 ease-out p-4 rounded-lg shadow shadow-sm dark:shadow-black/25">
              <div className="text-2xl font-bold text-blue-600">
                {stats.overview?.total || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-500">
                Total
              </div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 transition-all duration-200 ease-out p-4 rounded-lg shadow shadow-sm dark:shadow-black/25">
              <div className="text-2xl font-bold text-blue-500">
                {stats.overview?.new || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-500">
                New
              </div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 transition-all duration-200 ease-out p-4 rounded-lg shadow shadow-sm dark:shadow-black/25">
              <div className="text-2xl font-bold text-yellow-500">
                {stats.overview?.contacted || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-500">
                Contacted
              </div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 transition-all duration-200 ease-out p-4 rounded-lg shadow shadow-sm dark:shadow-black/25">
              <div className="text-2xl font-bold text-green-500">
                {stats.overview?.interested || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-500">
                Interested
              </div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 transition-all duration-200 ease-out p-4 rounded-lg shadow shadow-sm dark:shadow-black/25">
              <div className="text-2xl font-bold text-indigo-500">
                {stats.overview?.qualified || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-500">
                Qualified
              </div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 transition-all duration-200 ease-out p-4 rounded-lg shadow shadow-sm dark:shadow-black/25">
              <div className="text-2xl font-bold text-emerald-500">
                {stats.overview?.converted || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-500">
                Converted
              </div>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 transition-all duration-200 ease-out p-4 rounded-lg shadow shadow-sm dark:shadow-black/25">
              <div className="text-2xl font-bold text-red-500">
                {stats.overview?.lost || 0}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-500">
                Lost
              </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 transition-all duration-200 ease-out p-4 rounded-lg shadow mb-6 shadow-sm dark:shadow-black/25">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-3 text-gray-400 dark:text-gray-400" />
              <input
                type="text"
                placeholder="Search prospects..."
                value={filters.search}
                onChange={handleSearch}
                className="pl-10 pr-4 py-2 border rounded-lg w-full focus:ring-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 focus:ring-offset-2 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 focus:ring-offset-2 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Interested">Interested</option>
              <option value="Not Interested">Not Interested</option>
              <option value="Follow Up">Follow Up</option>
              <option value="Qualified">Qualified</option>
              <option value="Converted to Lead">Converted to Lead</option>
              <option value="Lost">Lost</option>
            </select>

            {/* Source Filter */}
            <select
              value={filters.source}
                onChange={(e) => handleFilterChange("source", e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 focus:ring-offset-2 focus:border-transparent"
            >
              <option value="">All Sources</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="Website">Website</option>
              <option value="Referral">Referral</option>
              <option value="Cold Call">Cold Call</option>
              <option value="Email Campaign">Email Campaign</option>
              <option value="Social Media">Social Media</option>
              <option value="Event">Event</option>
              <option value="Other">Other</option>
            </select>

            {/* Priority Filter */}
            <select
              value={filters.priority}
                onChange={(e) => handleFilterChange("priority", e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 focus:ring-offset-2 focus:border-transparent"
            >
              <option value="">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Prospects Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 transition-all duration-200 ease-out rounded-lg shadow overflow-hidden shadow-sm dark:shadow-black/25">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600 dark:text-gray-500">
                Loading prospects...
              </p>
          </div>
        ) : prospects.length === 0 ? (
          <div className="p-8 text-center">
            <FiUser className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">
                No prospects
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">
                Get started by creating a new prospect.
              </p>
            <div className="mt-6">
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-sm dark:shadow-xl hover:shadow-md transition-all duration-200 text-white px-4 py-2 rounded-lg flex items-center gap-2 mx-auto"
              >
                <FiPlus /> Add Prospect
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-gray-50 dark:bg-slate-800 transition-all duration-200 ease-out">
                  <tr>
                      <th
                        scope="col"
                        className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider"
                      >
                      #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                      Contact Info
                    </th>
                      {user?.role === 'Sales Person' ? (
                        <>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                            Last Contact Date
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                            Next Follow-up Date
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                            Lead By
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                            Remark
                          </th>
                        </>
                      ) : (
                        <>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                      Source
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                      Assigned To
                    </th>
                        </>
                      )}
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-900 transition-all duration-200 ease-out divide-y divide-slate-200 dark:divide-slate-700">
                  {prospects.map((prospect, index) => (
                      <tr
                        key={prospect._id}
                        className={
                          index % 2 === 0
                            ? "bg-white dark:bg-slate-800"
                            : "bg-slate-50 dark:bg-slate-800"
                        }
                      >
                        <td className="px-4 py-3 text-center">{index + 1}</td>
                      <td className="px-4 py-3 text-left">
  <div className="max-w-xs">
    <div className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                              {prospect.name || "No Name"}
    </div>
    <div className="mt-1 text-xs text-slate-600 dark:text-gray-400 space-y-0.5">
      {prospect.phone && (
        <div className="truncate">{prospect.phone}</div>
      )}
      {prospect.email && (
        <div className="truncate">{prospect.email}</div>
      )}
    </div>
  </div>
</td>
                        {user?.role === 'Sales Person' ? (
                          <>
                            <td className="px-4 py-3 text-left">
                              <div className="text-sm text-slate-900 dark:text-slate-100">
                                {prospect.lastContactDate 
                                  ? new Date(prospect.lastContactDate).toLocaleDateString() 
                                  : "No contact yet"}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-left">
                              <div className={`text-sm ${
                                prospect.nextFollowUpDate ? 
                                  (() => {
                                    const followUpDate = new Date(prospect.nextFollowUpDate);
                                    const today = new Date();
                                    const diffTime = followUpDate - today;
                                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                    
                                    if (diffDays < 0) {
                                      return 'text-red-600 dark:text-red-400 font-semibold'; // Overdue
                                    } else if (diffDays === 0) {
                                      return 'text-orange-600 dark:text-orange-400 font-semibold'; // Due today
                                    } else if (diffDays <= 2) {
                                      return 'text-yellow-600 dark:text-yellow-400 font-semibold'; // Due soon
                                    } else {
                                      return 'text-slate-900 dark:text-slate-100'; // Normal
                                    }
                                  })() : 'text-slate-900 dark:text-slate-100'
                              }`}>
                                {prospect.nextFollowUpDate 
                                  ? new Date(prospect.nextFollowUpDate).toLocaleDateString() 
                                  : "Not scheduled"}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-left">
                              <div className="text-sm text-slate-900 dark:text-slate-100">
                                {prospect.leadBy || "Not specified"}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-left">
                              {editingRemark === prospect._id ? (
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={remarkText}
                                    onChange={(e) => setRemarkText(e.target.value)}
                                    className="w-full px-2 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-blue-500"
                                    placeholder="Add remark..."
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => saveRemark(prospect._id)}
                                    className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={cancelEditingRemark}
                                    className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <div className="text-sm text-slate-900 dark:text-slate-100 max-w-xs truncate">
                                    {prospect.remark || "No remark"}
                                  </div>
                                  <button
                                    onClick={() => startEditingRemark(prospect._id, prospect.remark)}
                                    className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
                                  >
                                    {prospect.remark ? "Edit" : "Add"}
                                  </button>
                                </div>
                              )}
                            </td>
                          </>
                        ) : (
                          <>
                      <td className="px-4 py-3 text-left">
                        <div className="max-w-xs">
                                <div className="text-sm text-slate-900 dark:text-slate-100 truncate">
                                  {prospect.company || "-"}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-gray-400 truncate">
                                  {prospect.designation || "-"}
                                </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-left">
                              <div className="text-sm text-slate-900 dark:text-slate-100">
                                {prospect.source}
                              </div>
                      </td>
                      <td className="px-4 py-3 text-left">
                        <StatusBadge status={prospect.status} />
                      </td>
                      <td className="px-4 py-3 text-left">
                        <PriorityBadge priority={prospect.priority} />
                      </td>
                      <td className="px-4 py-3 text-left">
                        <div className="text-sm text-slate-900 dark:text-slate-100 max-w-xs truncate">
                                {prospect.assignedTo?.fullName || "Unassigned"}
                        </div>
                      </td>
                          </>
                        )}
                      <td className="px-4 py-3 text-left">
                        {new Date(prospect.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-left">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedProspect(prospect);
                              setShowViewModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            title="View Details"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => {
                              setSelectedProspect(prospect);
                              setShowEditModal(true);
                            }}
                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                            title="Edit"
                          >
                            <FiEdit className="w-4 h-4" />
                          </button>
                          
                            {prospect.status !== "Converted to Lead" && (
                            <button
                                onClick={() =>
                                  handleConvertToLead(prospect._id)
                                }
                              className="text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-50"
                              title="Convert to Lead"
                            >
                              <FiArrowRight className="w-4 h-4" />
                            </button>
                          )}
                          
                            {["Admin", "Manager"].includes(user?.role) && (
                            <button
                              onClick={() => handleDelete(prospect._id)}
                              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                              title="Delete"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden">
              {prospects.map((prospect) => (
                  <div
                    key={prospect._id}
                    className="border-b border-slate-200 dark:border-slate-700 p-4"
                  >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                          {prospect.name || "No Name"}
                      </h3>
                        <p className="text-xs text-slate-500 dark:text-gray-400">
                          {prospect.company || "No Company"}
                        </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => {
                          setSelectedProspect(prospect);
                          setShowViewModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 p-2 rounded hover:bg-blue-50"
                        title="View Details"
                      >
                        <FiEye className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => {
                          setSelectedProspect(prospect);
                          setShowEditModal(true);
                        }}
                        className="text-green-600 hover:text-green-900 p-2 rounded hover:bg-green-50"
                        title="Edit"
                      >
                        <FiEdit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                        <span className="text-slate-500 dark:text-gray-400">
                          Status:
                        </span>
                      <div className="mt-1">
                        <StatusBadge status={prospect.status} />
                      </div>
                    </div>
                    <div>
                        <span className="text-slate-500 dark:text-gray-400">
                          Priority:
                        </span>
                      <div className="mt-1">
                        <PriorityBadge priority={prospect.priority} />
                      </div>
                    </div>
                    <div>
                        <span className="text-slate-500 dark:text-gray-400">
                          Source:
                        </span>
                        <div className="mt-1 text-slate-900 dark:text-slate-100">
                          {prospect.source}
                        </div>
                    </div>
                    <div>
                        <span className="text-slate-500 dark:text-gray-400">
                          Assigned:
                        </span>
                      <div className="mt-1 text-slate-900 dark:text-slate-100 truncate">
                          {prospect.assignedTo?.fullName || "Unassigned"}
                      </div>
                    </div>
                  </div>
                  
                  {(prospect.email || prospect.phone) && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      {prospect.email && (
                          <div className="text-xs text-gray-600 dark:text-gray-500 mb-1 truncate">
                            {prospect.email}
                          </div>
      )}
                      {prospect.phone && (
                          <div className="text-xs text-gray-600 dark:text-gray-500 truncate">
                            {prospect.phone}
                          </div>
      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
              {pagination && pagination.pages > 1 && (
              <div className="bg-white dark:bg-slate-900 transition-all duration-200 ease-out px-4 py-3 flex items-center justify-between border-t border-slate-200 dark:border-slate-700 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                      onClick={() =>
                        handleFilterChange(
                          "page",
                          Math.max(1, filters.page - 1)
                        )
                      }
                    disabled={filters.page === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-md text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 transition-all duration-200 ease-out hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                      onClick={() =>
                        handleFilterChange(
                          "page",
                          Math.min(pagination?.pages || 1, filters.page + 1)
                        )
                      }
                      disabled={filters.page === (pagination?.pages || 1)}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-slate-300 dark:border-slate-600 text-sm font-medium rounded-md text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 transition-all duration-200 ease-out hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                        Showing{" "}
                      <span className="font-medium">
                          {(filters.page - 1) * filters.limit + 1}
                        </span>{" "}
                        to{" "}
                        <span className="font-medium">
                          {Math.min(
                            filters.page * filters.limit,
                            pagination?.total || 0
                          )}
                        </span>{" "}
                        of{" "}
                        <span className="font-medium">
                          {pagination?.total || 0}
                        </span>{" "}
                        results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm dark:shadow-black/25 -space-x-px">
                      {/* Previous Page Button */}
                      <button
                          onClick={() =>
                            handleFilterChange(
                              "page",
                              Math.max(1, filters.page - 1)
                            )
                          }
                        disabled={filters.page === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
                      >
                        <span className="sr-only">Previous</span>
                          <svg
                            className="h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                        </svg>
                      </button>

                      {/* Page Numbers */}
                        {Array.from(
                          { length: pagination?.pages || 0 },
                          (_, i) => i + 1
                        ).map((page) => (
                        <button
                          key={page}
                            onClick={() => handleFilterChange("page", page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === filters.page
                                ? "z-10 bg-blue-50 dark:bg-blue-900/20 border-blue-500 text-blue-600 dark:text-blue-400"
                                : "bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-600 text-gray-500 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                          }`}
                        >
                          {page}
                        </button>
                      ))}

                      {/* Next Page Button */}
                      <button
                          onClick={() =>
                            handleFilterChange(
                              "page",
                              Math.min(pagination?.pages || 1, filters.page + 1)
                            )
                          }
                          disabled={filters.page === (pagination?.pages || 1)}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50"
                      >
                        <span className="sr-only">Next</span>
                          <svg
                            className="h-5 w-5"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                              clipRule="evenodd"
                            />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <ProspectModal
          isOpen={showCreateModal || showEditModal}
          onClose={() => {
            setShowCreateModal(false);
            setShowEditModal(false);
            setSelectedProspect(null);
          }}
          prospect={selectedProspect}
          onSuccess={() => {
            fetchProspects();
            fetchStats();
            setShowCreateModal(false);
            setShowEditModal(false);
            setSelectedProspect(null);
          }}
        />
      )}

      {/* View Details Modal */}
      {showViewModal && selectedProspect && (
        <ViewProspectModal
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setSelectedProspect(null);
          }}
          prospect={selectedProspect}
          onEdit={() => {
            setShowViewModal(false);
            setShowEditModal(true);
          }}
          onConvert={() => {
            setShowViewModal(false);
            handleConvertToLead(selectedProspect._id);
          }}
          onDelete={() => {
            setShowViewModal(false);
            handleDelete(selectedProspect._id);
          }}
          userRole={user?.role}
        />
      )}
    </div>
    </Layout>
  );
};

// Prospect Modal Component
const ProspectModal = ({ isOpen, onClose, prospect, onSuccess }) => {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    designation: "",
    source: "Other",
    sourceDetails: "",
    industry: "",
    companySize: "Unknown",
    budget: "",
    budgetCurrency: "USD",
    serviceInterest: "",
    requirements: "",
    timeline: "Not specified",
    status: "New",
    priority: "Medium",
    assignedTo: "",
    leadBy: "",
    lastContactDate: "",
    nextFollowUpDate: "",
    contactMethod: "",
    notes: "",
    tags: "",
    linkedinProfile: "",
    websiteUrl: "",
  });

  useEffect(() => {
    if (prospect) {
      setFormData({
        name: prospect.name || "",
        email: prospect.email || "",
        phone: prospect.phone || "",
        company: prospect.company || "",
        designation: prospect.designation || "",
        source: prospect.source || "Other",
        sourceDetails: prospect.sourceDetails || "",
        industry: prospect.industry || "",
        companySize: prospect.companySize || "Unknown",
        budget: prospect.budget || "",
        budgetCurrency: prospect.budgetCurrency || "USD",
        serviceInterest: prospect.serviceInterest || "",
        requirements: prospect.requirements || "",
        timeline: prospect.timeline || "Not specified",
        status: prospect.status || "New",
        priority: prospect.priority || "Medium",
        assignedTo: prospect.assignedTo?._id || "",
        leadBy: prospect.leadBy || "",
        lastContactDate: prospect.lastContactDate
          ? prospect.lastContactDate.split("T")[0]
          : "",
        nextFollowUpDate: prospect.nextFollowUpDate
          ? prospect.nextFollowUpDate.split("T")[0]
          : "",
        contactMethod: prospect.contactMethod || "",
        notes: prospect.notes || "",
        tags: prospect.tags?.join(", ") || "",
        linkedinProfile: prospect.linkedinProfile || "",
        websiteUrl: prospect.websiteUrl || "",
      });
    }
  }, [prospect]);

  // Fetch users for assignment
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Fetch all users (no role filter) to get all available users for assignment
        const response = await authAPI.getUsers();
        if (response.data.success) {
          setUsers(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        tags: formData.tags
          ? formData.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
          : [],
        lastContactDate: formData.lastContactDate || undefined,
        nextFollowUpDate: formData.nextFollowUpDate || undefined,
      };

      // Remove empty strings
      Object.keys(submitData).forEach((key) => {
        if (submitData[key] === "") {
          delete submitData[key];
        }
      });

      const response = prospect 
        ? await prospectsAPI.update(prospect._id, submitData)
        : await prospectsAPI.create(submitData);

      if (response.data.success) {
        toast.success(
          prospect
            ? "Prospect updated successfully"
            : "Prospect created successfully"
        );
        onSuccess();
      }
    } catch (error) {
      console.error("Error saving prospect:", error);
      toast.error(error.response?.data?.message || "Failed to save prospect");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = {
      ...prev,
        [name]: value,
      };
      
      // If assignedTo is selected, populate leadBy with the selected user's name
      if (name === 'assignedTo' && value) {
        const selectedUser = users.find(user => user._id === value);
        if (selectedUser) {
          updated.leadBy = selectedUser.fullName;
        }
      } else if (name === 'assignedTo' && !value) {
        // If no assignedTo is selected, clear leadBy
        updated.leadBy = '';
      }
      
      return updated;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 transition-all duration-200 ease-out rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-sm dark:shadow-black/25">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {prospect ? "Edit Prospect" : "Add New Prospect"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 dark:text-gray-300 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-4">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 focus:ring-offset-2 focus:border-transparent"
                    placeholder="Contact person name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 focus:ring-offset-2 focus:border-transparent"
                    placeholder="email@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 focus:ring-offset-2 focus:border-transparent"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Company
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 focus:ring-offset-2 focus:border-transparent"
                    placeholder="Company name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Designation
                  </label>
                  <input
                    type="text"
                    name="designation"
                    value={formData.designation}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 focus:ring-offset-2 focus:border-transparent"
                    placeholder="Job title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Industry
                  </label>
                  <input
                    type="text"
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 focus:ring-offset-2 focus:border-transparent"
                    placeholder="Technology, Healthcare, etc."
                  />
                </div>
              </div>
            </div>

            {/* Source & Business Info */}
            <div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-4">
                Source & Business Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Source
                  </label>
                  <select
                    name="source"
                    value={formData.source}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 focus:ring-offset-2 focus:border-transparent"
                  >
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Website">Website</option>
                    <option value="Referral">Referral</option>
                    <option value="Cold Call">Cold Call</option>
                    <option value="Email Campaign">Email Campaign</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Event">Event</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Source Details
                  </label>
                  <input
                    type="text"
                    name="sourceDetails"
                    value={formData.sourceDetails}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 focus:ring-offset-2 focus:border-transparent"
                    placeholder="Additional source information"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Company Size
                  </label>
                  <select
                    name="companySize"
                    value={formData.companySize}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 focus:ring-offset-2 focus:border-transparent"
                  >
                    <option value="1-10">1-10</option>
                    <option value="11-50">11-50</option>
                    <option value="51-200">51-200</option>
                    <option value="201-500">201-500</option>
                    <option value="501-1000">501-1000</option>
                    <option value="1000+">1000+</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Budget
                  </label>
                  <div className="flex">
                    <select
                      name="budgetCurrency"
                      value={formData.budgetCurrency}
                      onChange={handleChange}
                      className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-l-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 focus:ring-offset-2 focus:border-transparent"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="INR">INR</option>
                    </select>
                    <input
                      type="number"
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      className="flex-1 px-3 py-2 border border-l-0 border-slate-300 dark:border-slate-600 rounded-r-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 focus:ring-offset-2 focus:border-transparent"
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Interest & Requirements */}
            <div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-4">
                Interest & Requirements
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Service Interest
                  </label>
                  <input
                    type="text"
                    name="serviceInterest"
                    value={formData.serviceInterest}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 focus:ring-offset-2 focus:border-transparent"
                    placeholder="What services are they interested in?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Timeline
                  </label>
                  <select
                    name="timeline"
                    value={formData.timeline}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 focus:ring-offset-2 focus:border-transparent"
                  >
                    <option value="Immediate">Immediate</option>
                    <option value="Within 1 month">Within 1 month</option>
                    <option value="1-3 months">1-3 months</option>
                    <option value="3-6 months">3-6 months</option>
                    <option value="6+ months">6+ months</option>
                    <option value="Not specified">Not specified</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Requirements
                  </label>
                  <textarea
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 focus:ring-offset-2 focus:border-transparent"
                    placeholder="Detailed requirements and needs"
                  />
                </div>
              </div>
            </div>

            {/* Status & Assignment */}
            <div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-4">
                Status & Assignment
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 focus:ring-offset-2 focus:border-transparent"
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Interested">Interested</option>
                    <option value="Not Interested">Not Interested</option>
                    <option value="Follow Up">Follow Up</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Lost">Lost</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 focus:ring-offset-2 focus:border-transparent"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Lead Person <span className="text-gray-500 text-sm">(Optional)</span>
                  </label>
                  <select
                    name="assignedTo"
                    value={formData.assignedTo}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 focus:ring-offset-2 focus:border-transparent"
                  >
                    <option value="">Select Lead Person (Optional)</option>
                    {users.filter(user => user.role === 'Lead Person').map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.fullName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Follow-up Information */}
            <div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-4">
                Follow-up Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Last Contact Date
                  </label>
                  <input
                    type="date"
                    name="lastContactDate"
                    value={formData.lastContactDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 focus:ring-offset-2 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Next Follow-up Date
                  </label>
                  <input
                    type="date"
                    name="nextFollowUpDate"
                    value={formData.nextFollowUpDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 focus:ring-offset-2 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Contact Method
                  </label>
                  <select
                    name="contactMethod"
                    value={formData.contactMethod}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 focus:ring-offset-2 focus:border-transparent"
                  >
                    <option value="">Select method</option>
                    <option value="Email">Email</option>
                    <option value="Phone">Phone</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-4">
                Additional Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    LinkedIn Profile
                  </label>
                  <input
                    type="url"
                    name="linkedinProfile"
                    value={formData.linkedinProfile}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 focus:ring-offset-2 focus:border-transparent"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Website URL
                  </label>
                  <input
                    type="url"
                    name="websiteUrl"
                    value={formData.websiteUrl}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 focus:ring-offset-2 focus:border-transparent"
                    placeholder="https://company.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Tags
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 focus:ring-offset-2 focus:border-transparent"
                    placeholder="tag1, tag2, tag3"
                  />
                  <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
                    Separate tags with commas
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-offset-slate-900 focus:ring-offset-2 focus:border-transparent"
                    placeholder="Additional notes and observations"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-600 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-sm dark:shadow-xl hover:shadow-md transition-all duration-200 text-white rounded-lg disabled:opacity-50 flex items-center gap-2"
              >
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {prospect ? "Update Prospect" : "Create Prospect"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// View Prospect Modal Component
const ViewProspectModal = ({
  isOpen,
  onClose,
  prospect,
  onEdit,
  onConvert,
  onDelete,
  userRole,
}) => {
  // Local badge components for this modal
const StatusBadge = ({ status }) => {
  const statusColors = {
      New: "bg-blue-100",
      Contacted: "bg-yellow-100",
      Interested: "bg-green-100",
      "Not Interested": "bg-red-100",
      "Follow Up": "bg-purple-100",
      Qualified: "bg-indigo-100",
      "Converted to Lead": "bg-emerald-100",
      Lost: "bg-gray-100 dark:bg-slate-700",
  };
    return (
     <span
        className={`px-2 py-1 rounded-full text-xs font-medium text-black ${
          statusColors[status] || "bg-gray-100 dark:bg-slate-700"
        }`}
    >
      {status}
    </span>
    );
  };

 const PriorityBadge = ({ priority }) => {
  const priorityColors = {
      High: "bg-red-100",
      Medium: "bg-yellow-100",
      Low: "bg-green-100",
  };

  return (
    <span
        className={`px-2 py-1 rounded-full text-xs font-medium text-black ${
          priorityColors[priority] || "bg-gray-100 dark:bg-slate-700"
        }`}
    >
      {priority}
    </span>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 transition-all duration-200 ease-out rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-sm dark:shadow-black/25">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              View Prospect Details
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 dark:text-gray-300 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="space-y-6">
            {/* Prospect Details */}
            <div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-4">
                Prospect Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Name
                  </label>
                  <div className="text-sm text-slate-900 dark:text-slate-100">
                    {prospect.name || "No Name"}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Email
                  </label>
                  <div className="text-sm text-slate-900 dark:text-slate-100">
                    {prospect.email || "No Email"}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Phone
                  </label>
                  <div className="text-sm text-slate-900 dark:text-slate-100">
                    {prospect.phone || "No Phone"}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Company
                  </label>
                  <div className="text-sm text-slate-900 dark:text-slate-100">
                    {prospect.company || "No Company"}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Designation
                  </label>
                  <div className="text-sm text-slate-900 dark:text-slate-100">
                    {prospect.designation || "No Designation"}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Industry
                  </label>
                  <div className="text-sm text-slate-900 dark:text-slate-100">
                    {prospect.industry || "No Industry"}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Source
                  </label>
                  <div className="text-sm text-slate-900 dark:text-slate-100">
                    {prospect.source || "No Source"}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Status
                  </label>
                  <div className="text-sm text-slate-900 dark:text-slate-100">
                    <StatusBadge status={prospect.status} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Priority
                  </label>
                  <div className="text-sm text-slate-900 dark:text-slate-100">
                    <PriorityBadge priority={prospect.priority} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Assigned To
                  </label>
                  <div className="text-sm text-slate-900 dark:text-slate-100">
                    {prospect.assignedTo?.fullName || "Unassigned"}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Created
                  </label>
                  <div className="text-sm text-slate-900 dark:text-slate-100">
                    {new Date(prospect.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-4">
                Additional Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Source Details
                  </label>
                  <div className="text-sm text-slate-900 dark:text-slate-100">
                    {prospect.sourceDetails || "No source details"}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Company Size
                  </label>
                  <div className="text-sm text-slate-900 dark:text-slate-100">
                    {prospect.companySize || "Unknown"}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Budget
                  </label>
                  <div className="text-sm text-slate-900 dark:text-slate-100">
                    {prospect.budget
                      ? `${prospect.budget} ${prospect.budgetCurrency}`
                      : "No budget"}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Service Interest
                  </label>
                  <div className="text-sm text-slate-900 dark:text-slate-100">
                    {prospect.serviceInterest || "No service interest"}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Timeline
                  </label>
                  <div className="text-sm text-slate-900 dark:text-slate-100">
                    {prospect.timeline || "Not specified"}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Requirements
                  </label>
                  <div className="text-sm text-slate-900 dark:text-slate-100">
                    {prospect.requirements || "No requirements"}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Last Contact Date
                  </label>
                  <div className="text-sm text-slate-900 dark:text-slate-100">
                    {prospect.lastContactDate
                      ? new Date(prospect.lastContactDate).toLocaleDateString()
                      : "No last contact date"}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Next Follow-up Date
                  </label>
                  <div className="text-sm text-slate-900 dark:text-slate-100">
                    {prospect.nextFollowUpDate
                      ? new Date(prospect.nextFollowUpDate).toLocaleDateString()
                      : "No next follow-up date"}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Contact Method
                  </label>
                  <div className="text-sm text-slate-900 dark:text-slate-100">
                    {prospect.contactMethod || "No contact method"}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    LinkedIn Profile
                  </label>
                  <div className="text-sm text-slate-900 dark:text-slate-100">
                    {prospect.linkedinProfile || "No LinkedIn profile"}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Website URL
                  </label>
                  <div className="text-sm text-slate-900 dark:text-slate-100">
                    {prospect.websiteUrl || "No website URL"}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Tags
                  </label>
                  <div className="text-sm text-slate-900 dark:text-slate-100">
                    {prospect.tags?.join(", ") || "No tags"}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Notes
                  </label>
                  <div className="text-sm text-slate-900 dark:text-slate-100">
                    {prospect.notes || "No notes"}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4 pt-6 border-t">
              <button
                onClick={onClose}
                className="px-4 py-2 text-slate-700 dark:text-slate-300 bg-gray-100 dark:bg-slate-600 rounded-lg hover:bg-gray-200"
              >
                Close
              </button>
              
              <button
                onClick={onEdit}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-sm dark:shadow-xl hover:shadow-md transition-all duration-200 text-white rounded-lg"
              >
                Edit
              </button>
              
              {prospect.status !== "Converted to Lead" && (
                <button
                  onClick={onConvert}
                  className="px-4 py-2 bg-purple-600 text-white dark rounded-lg hover:bg-purple-700"
                >
                  Convert to Lead
                </button>
              )}
              
              {["Admin", "Manager"].includes(userRole) && (
                <button
                  onClick={onDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProspectsPage; 
