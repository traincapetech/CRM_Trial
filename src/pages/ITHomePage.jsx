import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  FaUser, 
  FaTasks, 
  FaFileAlt, 
  FaUsers, 
  FaChevronRight, 
  FaCheckCircle, 
  FaClock,
  FaChartLine,
  FaLaptopCode,
  FaUserFriends,
  FaBriefcase
} from 'react-icons/fa';

const ITHomePage = () => {
    const { user } = useAuth();
    const [team, setTeam] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [stats, setStats] = useState({
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        teamMembers: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchITTeamAndTasks = async () => {
            setLoading(true);
            try {
                const teamRes = await api.get('/auth/users?role=IT Manager,IT Intern,IT Permanent');
                const allTeam = teamRes.data.data || [];
                setTeam(allTeam.filter(u => u._id !== user.id));
                
                const tasksRes = await api.get('/tasks');
                const allTasks = tasksRes.data.data || [];
                
                let filteredTasks = [];
                if (user.role === 'IT Manager') {
                    filteredTasks = allTasks.filter(t => t.department === 'IT');
                } else {
                    filteredTasks = allTasks.filter(t => (t.assignedTo?._id || t.assignedTo) === user.id);
                }
                
                setTasks(filteredTasks);
                
                // Calculate stats
                const completed = filteredTasks.filter(t => t.status === 'Manager Confirmed' || t.status === 'Employee Completed').length;
                const pending = filteredTasks.filter(t => t.status === 'Pending' || t.status === 'In Progress').length;
                
                setStats({
                    totalTasks: filteredTasks.length,
                    completedTasks: completed,
                    pendingTasks: pending,
                    teamMembers: allTeam.length
                });
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchITTeamAndTasks();
    }, [user.id, user.role]);

    const getStatusBadgeVariant = (status) => {
        if (status === 'Manager Confirmed' || status === 'Employee Completed') {
            return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
        }
        if (status === 'In Progress' || status === 'Partially Completed') {
            return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
        }
        if (status === 'Not Completed') {
            return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
        }
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    };

    const quickActions = [
        { 
            icon: FaUser, 
            label: 'Profile', 
            link: '/profile', 
            color: 'from-blue-500 to-indigo-600',
            bg: 'bg-blue-50 dark:bg-blue-900/20'
        },
        { 
            icon: FaTasks, 
            label: 'Task Board', 
            link: '/it?tab=tasks', 
            color: 'from-purple-500 to-pink-600',
            bg: 'bg-purple-50 dark:bg-purple-900/20'
        },
        { 
            icon: FaFileAlt, 
            label: 'Documents', 
            link: '/documents', 
            color: 'from-green-500 to-emerald-600',
            bg: 'bg-green-50 dark:bg-green-900/20'
        },
        ...(user.role === 'IT Manager' ? [{
            icon: FaUsers, 
            label: 'Manage Team', 
            link: '/it?tab=team', 
            color: 'from-orange-500 to-red-600',
            bg: 'bg-orange-50 dark:bg-orange-900/20'
        }] : [])
    ];

    const resourceLinks = [
        { icon: FaUserFriends, label: 'View Full Team', link: '/it?tab=team' },
        { icon: FaTasks, label: 'Go to Task Board', link: '/it?tab=tasks' },
        { icon: FaUser, label: 'Update Profile', link: '/profile' },
        { icon: FaFileAlt, label: 'Upload/View Documents', link: '/documents' }
    ];

    if (loading) {
        return (
            <Layout>
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
                <div className="container mx-auto px-4 py-8">
                    {/* Hero Section */}
                    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-2xl mb-8">
                        <div className="absolute inset-0 bg-black/10"></div>
                        <div className="relative px-8 py-12">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                                <div>
                                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                                        Welcome back, {user.fullName || user.email}
                                    </h1>
                                    <div className="flex items-center gap-2">
                                        <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                                            {user.role}
                                        </Badge>
                                        <span className="text-white/80 text-sm">IT Department</span>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-3">
                                    {quickActions.map((action, idx) => {
                                        const Icon = action.icon;
                                        return (
                                            <Link
                                                key={idx}
                                                to={action.link}
                                                className={`group relative overflow-hidden rounded-xl ${action.bg} p-4 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}
                                            >
                                                <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                                                <div className="relative flex flex-col items-center gap-2">
                                                    <Icon className="text-2xl text-gray-700 dark:text-gray-300 group-hover:text-white transition-colors" />
                                                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 group-hover:text-white transition-colors">
                                                        {action.label}
                                                    </span>
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Total Tasks</p>
                                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalTasks}</p>
                                    </div>
                                    <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center">
                                        <FaTasks className="text-white text-xl" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Completed</p>
                                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.completedTasks}</p>
                                    </div>
                                    <div className="h-12 w-12 rounded-full bg-green-500 flex items-center justify-center">
                                        <FaCheckCircle className="text-white text-xl" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Pending</p>
                                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.pendingTasks}</p>
                                    </div>
                                    <div className="h-12 w-12 rounded-full bg-yellow-500 flex items-center justify-center">
                                        <FaClock className="text-white text-xl" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Team Members</p>
                                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.teamMembers}</p>
                                    </div>
                                    <div className="h-12 w-12 rounded-full bg-purple-500 flex items-center justify-center">
                                        <FaUsers className="text-white text-xl" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Team Members Section */}
                        <Card className="lg:col-span-1 border-0 shadow-xl">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                            <FaUserFriends className="text-white" />
                                        </div>
                                        Team Members
                                    </CardTitle>
                                    <Link 
                                        to="/it?tab=team" 
                                        className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                                    >
                                        View All
                                        <FaChevronRight className="text-xs" />
                                    </Link>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {team.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <FaUsers className="text-4xl mx-auto mb-3 opacity-50" />
                                        <p>No other team members found</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {team.slice(0, 5).map((member) => (
                                            <div 
                                                key={member._id} 
                                                className="group flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                                            >
                                                <div className="relative">
                                                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                                                        {member.fullName ? member.fullName[0].toUpperCase() : '?'}
                                                    </div>
                                                    <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-white dark:border-gray-800"></div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-gray-900 dark:text-white truncate">
                                                        {member.fullName}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge variant="outline" className="text-xs">
                                                            {member.role}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                                                        {member.email}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        {team.length > 5 && (
                                            <Link 
                                                to="/it?tab=team"
                                                className="block text-center py-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                                            >
                                                View {team.length - 5} more members
                                            </Link>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Tasks Section */}
                        <Card className="lg:col-span-2 border-0 shadow-xl">
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                                            <FaTasks className="text-white" />
                                        </div>
                                        {user.role === 'IT Manager' ? 'All IT Department Tasks' : 'Your Assigned Tasks'}
                                    </CardTitle>
                                    {user.role === 'IT Manager' && (
                                        <Link
                                            to="/it?tab=tasks"
                                            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg text-sm font-semibold flex items-center gap-2"
                                        >
                                            <FaTasks className="text-xs" />
                                            Create Task
                                        </Link>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent>
                                {tasks.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500">
                                        <FaTasks className="text-5xl mx-auto mb-4 opacity-50" />
                                        <p className="text-lg font-medium">No tasks found{user.role !== 'IT Manager' && ' for you'}</p>
                                        <p className="text-sm mt-2">Get started by creating a new task</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {tasks.slice(0, 5).map((task) => (
                                            <div 
                                                key={task._id} 
                                                className="group p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md transition-all bg-white dark:bg-gray-800/50"
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                                                                {task.title}
                                                            </h3>
                                                            <Badge className={getStatusBadgeVariant(task.status)}>
                                                                {task.status}
                                                            </Badge>
                                                        </div>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                                                            {task.description}
                                                        </p>
                                                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                                            {task.assignedTo && (
                                                                <div className="flex items-center gap-1">
                                                                    <FaUser className="text-xs" />
                                                                    <span>
                                                                        {typeof task.assignedTo === 'object' 
                                                                            ? task.assignedTo.fullName 
                                                                            : task.assignedTo}
                                                                    </span>
                                                                </div>
                                                            )}
                                                            {task.createdAt && (
                                                                <div className="flex items-center gap-1">
                                                                    <FaClock className="text-xs" />
                                                                    <span>
                                                                        {new Date(task.createdAt).toLocaleDateString()}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {tasks.length > 5 && (
                                            <Link 
                                                to="/it?tab=tasks"
                                                className="block text-center py-3 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-indigo-500 dark:hover:border-indigo-500 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all font-medium"
                                            >
                                                View all {tasks.length} tasks
                                            </Link>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Quick Resources Section */}
                    <Card className="mt-8 border-0 shadow-xl bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20">
                        <CardHeader>
                            <CardTitle className="text-xl font-bold flex items-center gap-2">
                                <FaLaptopCode className="text-indigo-600 dark:text-indigo-400" />
                                IT Resources & Quick Links
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                {resourceLinks.map((link, idx) => {
                                    const Icon = link.icon;
                                    return (
                                        <Link
                                            key={idx}
                                            to={link.link}
                                            className="group flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-lg transition-all"
                                        >
                                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                                                <Icon className="text-lg" />
                                            </div>
                                            <span className="font-semibold text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                {link.label}
                                            </span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    );
};

export default ITHomePage;
