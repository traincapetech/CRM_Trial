import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { FaLaptopCode, FaUsers, FaTasks, FaChartLine, FaCalendarAlt, FaEnvelope, FaPhone, FaMapMarkerAlt, FaGraduationCap, FaBriefcase } from 'react-icons/fa';
import { formatDescription } from '../../utils/formatDescription';

const ITOverviewPanel = ({ employees, projects, user }) => {
  const permanentCount = employees.filter(e => e.employmentType === 'PERMANENT').length;
  const internCount = employees.filter(e => e.employmentType === 'INTERN').length;
  
  // Get tech stack from both 'skills' and 'techStack' fields (handle both naming conventions)
  const techStackList = Array.from(new Set(
    employees.flatMap(e => {
      const skills = e.skills || [];
      const techStack = e.techStack || [];
      // If skills is a string, split it by comma; if it's an array, use it as is
      const skillsArray = Array.isArray(skills) ? skills : (typeof skills === 'string' ? skills.split(',').map(s => s.trim()).filter(Boolean) : []);
      const techStackArray = Array.isArray(techStack) ? techStack : (typeof techStack === 'string' ? techStack.split(',').map(s => s.trim()).filter(Boolean) : []);
      return [...skillsArray, ...techStackArray];
    })
  )).filter(Boolean); // Remove any empty/null values
  
  // Check if user can view full details (IT Manager or Admin only)
  const canViewFullDetails = user && (user.role === 'IT Manager' || user.role === 'Admin');
  
  // Filter projects: show only ACTIVE and COMPLETED
  // For non-IT Managers, projects are already filtered by assignment in ITDashboardPage
  const visibleProjects = projects.filter(p => p?.status === 'ACTIVE' || p?.status === 'COMPLETED');
  const activeProjects = visibleProjects.filter(p => p?.status === 'ACTIVE');
  const completedProjects = visibleProjects.filter(p => p?.status === 'COMPLETED');

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <FaUsers className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}</div>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline" className="bg-blue-50">
                {permanentCount} Permanent
              </Badge>
              <Badge variant="outline" className="bg-green-50">
                {internCount} Interns
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tech Stack</CardTitle>
            <FaLaptopCode className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{techStackList.length}</div>
            <div className="flex flex-wrap gap-1 mt-2">
              {techStackList.slice(0, 3).map((tech, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {tech}
                </Badge>
              ))}
              {techStackList.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{techStackList.length - 3} more
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <FaTasks className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects.length}</div>
            <p className="text-sm text-gray-500 mt-2">Ongoing development</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed Projects</CardTitle>
            <FaChartLine className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedProjects}</div>
            <p className="text-sm text-gray-500 mt-2">Successfully delivered</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {canViewFullDetails ? (
            <div className="space-y-4">
              {/* Full Employee Details for IT Manager/Admin */}
              <div>
                <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Team Members Details</h3>
                <div className="space-y-3">
                  {employees.map((emp, idx) => (
                    <div key={idx} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                            <FaUsers className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="font-semibold text-lg text-gray-900 dark:text-white">{emp.fullName}</p>
                            {(() => {
                              // Determine employment type - check employmentType first, then role name as fallback
                              const empType = (emp.employmentType || '').toUpperCase();
                              const roleName = (emp.role?.name || emp.role || '').toUpperCase();
                              const isIntern = empType === 'INTERN' || (!empType && roleName.includes('INTERN'));
                              
                              return (
                                <Badge className={`mt-1 ${
                                  isIntern
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                }`}>
                                  {isIntern ? 'Intern' : 'Permanent'}
                                </Badge>
                              );
                            })()}
                          </div>
                        </div>
                        {emp.role?.name && (
                          <Badge variant="outline">{emp.role.name}</Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <FaEnvelope className="h-3 w-3" />
                          <span>{emp.email || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <FaPhone className="h-3 w-3" />
                          <span>{emp.phoneNumber || 'N/A'}</span>
                        </div>
                        {emp.currentAddress && (
                          <div className="flex items-start gap-2 text-gray-600 dark:text-gray-400 md:col-span-2">
                            <FaMapMarkerAlt className="h-3 w-3 mt-0.5" />
                            <span>{emp.currentAddress}</span>
                          </div>
                        )}
                        {emp.collegeName && (
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <FaGraduationCap className="h-3 w-3" />
                            <span>{emp.collegeName}</span>
                          </div>
                        )}
                        {emp.joiningDate && (
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <FaCalendarAlt className="h-3 w-3" />
                            <span>Joined: {new Date(emp.joiningDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        {(() => {
                          // Determine if intern - check employmentType first, then role name
                          const empType = (emp.employmentType || '').toUpperCase();
                          const roleName = (emp.role?.name || emp.role || '').toUpperCase();
                          const isIntern = empType === 'INTERN' || (!empType && roleName.includes('INTERN'));
                          
                          if (!isIntern) return null;
                          
                          // Calculate remaining days
                          const calculateRemainingDays = (endDate) => {
                            if (!endDate) return null;
                            const today = new Date();
                            const end = new Date(endDate);
                            today.setHours(0, 0, 0, 0);
                            end.setHours(0, 0, 0, 0);
                            const diffTime = end - today;
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            return diffDays;
                          };
                          
                          const remainingDays = emp.internshipEndDate ? calculateRemainingDays(emp.internshipEndDate) : null;
                          const isExpired = remainingDays !== null && remainingDays < 0;
                          
                          return (
                            <>
                              {emp.internshipStartDate && (
                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                  <FaBriefcase className="h-3 w-3" />
                                  <span>Internship: {new Date(emp.internshipStartDate).toLocaleDateString()}</span>
                                  {emp.internshipEndDate && (
                                    <span>- {new Date(emp.internshipEndDate).toLocaleDateString()}</span>
                                  )}
                                </div>
                              )}
                              {emp.internshipEndDate && remainingDays !== null && (
                                <div className="flex items-center gap-2 text-sm">
                                  <FaCalendarAlt className="h-3 w-3" />
                                  <span className="text-gray-600 dark:text-gray-400">Remaining Days:</span>
                                  <span className={`font-semibold ${
                                    isExpired 
                                      ? 'text-red-600 dark:text-red-400' 
                                      : remainingDays <= 7 
                                      ? 'text-orange-600 dark:text-orange-400' 
                                      : 'text-green-600 dark:text-green-400'
                                  }`}>
                                    {isExpired 
                                      ? `${Math.abs(remainingDays)} days overdue` 
                                      : remainingDays === 0 
                                      ? 'Ends today' 
                                      : `${remainingDays} days remaining`
                                    }
                                  </span>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                      
                      {(() => {
                        // Get skills from both 'skills' and 'techStack' fields
                        const skills = emp.skills || [];
                        const techStack = emp.techStack || [];
                        const skillsArray = Array.isArray(skills) ? skills : (typeof skills === 'string' ? skills.split(',').map(s => s.trim()).filter(Boolean) : []);
                        const techStackArray = Array.isArray(techStack) ? techStack : (typeof techStack === 'string' ? techStack.split(',').map(s => s.trim()).filter(Boolean) : []);
                        const allSkills = [...new Set([...skillsArray, ...techStackArray])].filter(Boolean);
                        
                        return allSkills.length > 0 ? (
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Skills:</p>
                            <div className="flex flex-wrap gap-1">
                              {allSkills.map((skill, skillIdx) => (
                                <Badge key={skillIdx} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Recent Projects */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">Recent Projects</h3>
                <div className="space-y-2">
                  {projects
                    .filter(p => p.status === 'ACTIVE')
                    .slice(0, 5)
                    .map((project, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
                          <FaTasks className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">{project.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Started: {new Date(project.startDate).toLocaleDateString()}
                          </p>
                          {project.description && (
                            <div className="text-sm mt-2">
                              {formatDescription(project.description)}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  {projects.filter(p => p.status === 'ACTIVE').length === 0 && (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">No active projects</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {employees
                .filter(e => e.employmentType === 'INTERN' && e.internshipStartDate)
                .slice(0, 3)
                .map((intern, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                      <FaCalendarAlt className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{intern.fullName} started internship</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(intern.internshipStartDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}

              {projects
                .filter(p => p.status === 'ACTIVE')
                .slice(0, 3)
                .map((project, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
                      <FaTasks className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">New project started: {project.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(project.startDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              
              {employees.filter(e => e.employmentType === 'INTERN' && e.internshipStartDate).length === 0 && 
               projects.filter(p => p.status === 'ACTIVE').length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No recent activity</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tech Stack Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Tech Stack Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {canViewFullDetails ? (
            <div className="space-y-4">
              {/* Full Tech Stack Details for IT Manager/Admin */}
              <div className="space-y-4">
                {techStackList.length > 0 ? (
                  techStackList.map((tech, idx) => {
                    const employeesWithTech = employees.filter(e => {
                      // Check both 'skills' and 'techStack' fields
                      const skills = e.skills || [];
                      const techStack = e.techStack || [];
                      const skillsArray = Array.isArray(skills) ? skills : (typeof skills === 'string' ? skills.split(',').map(s => s.trim()).filter(Boolean) : []);
                      const techStackArray = Array.isArray(techStack) ? techStack : (typeof techStack === 'string' ? techStack.split(',').map(s => s.trim()).filter(Boolean) : []);
                      const allSkills = [...skillsArray, ...techStackArray];
                      return allSkills.includes(tech);
                    });
                    const count = employeesWithTech.length;
                    const percentage = employees.length ? (count / employees.length) * 100 : 0;
                    return (
                      <div key={idx} className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <FaLaptopCode className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            <span className="font-semibold text-gray-900 dark:text-white">{tech}</span>
                          </div>
                          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                            {count} {count === 1 ? 'member' : 'members'}
                          </Badge>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-3">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-indigo-600 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">
                          {percentage.toFixed(1)}% of team members
                        </div>
                        
                        {/* Show which employees have this skill */}
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Employees with this skill:</p>
                          <div className="flex flex-wrap gap-2">
                            {employeesWithTech.map((emp, empIdx) => (
                              <Badge key={empIdx} variant="outline" className="text-xs">
                                {emp.fullName}
                                {emp.employmentType === 'INTERN' && (
                                  <span className="ml-1 text-green-600">(Intern)</span>
                                )}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">No tech stack data available</p>
                )}
              </div>
              
              {/* Summary Statistics */}
              <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                <h4 className="font-semibold text-gray-800 dark:text-white mb-2">Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Total Technologies:</span>
                    <span className="ml-2 font-bold text-purple-600 dark:text-purple-400">{techStackList.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Total Team Members:</span>
                    <span className="ml-2 font-bold text-indigo-600 dark:text-indigo-400">{employees.length}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {techStackList.length > 0 ? (
                techStackList.map((tech, idx) => {
                  const count = employees.filter(e => {
                    const skills = e.skills || [];
                    const techStack = e.techStack || [];
                    const skillsArray = Array.isArray(skills) ? skills : (typeof skills === 'string' ? skills.split(',').map(s => s.trim()).filter(Boolean) : []);
                    const techStackArray = Array.isArray(techStack) ? techStack : (typeof techStack === 'string' ? techStack.split(',').map(s => s.trim()).filter(Boolean) : []);
                    const allSkills = [...skillsArray, ...techStackArray];
                    return allSkills.includes(tech);
                  }).length;
                  const percentage = employees.length ? (count / employees.length) * 100 : 0;
                  return (
                    <div key={idx}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-900 dark:text-white">{tech}</span>
                        <span className="text-gray-600 dark:text-gray-400">{count} team members</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">No tech stack data available</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ITOverviewPanel;
