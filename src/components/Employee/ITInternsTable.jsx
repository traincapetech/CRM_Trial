import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { FaUserGraduate, FaCalendarAlt, FaCode, FaBriefcase, FaRupeeSign } from 'react-icons/fa';
import { formatCurrency } from '../../utils/helpers';

const ITInternsTable = ({ employees, projects }) => {
  // Filter only interns - check multiple conditions
  const interns = employees.filter(emp => {
    const empType = (emp.employmentType || '').toUpperCase();
    const roleName = (emp.role?.name || emp.role || '').toUpperCase();
    const roleNameStr = typeof emp.role === 'string' ? emp.role.toUpperCase() : (emp.role?.name || '').toUpperCase();
    
    // Check if it's an intern by:
    // 1. employmentType === 'INTERN'
    // 2. role name contains 'INTERN' (handles "IT Intern")
    // 3. Check both role object and string role
    const isIntern = empType === 'INTERN' || 
                     roleName.includes('INTERN') || 
                     roleNameStr.includes('INTERN');
    
    return isIntern;
  });

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

  // Get projects assigned to an intern (by userId)
  const getInternProjects = (userId) => {
    if (!userId || !projects || projects.length === 0) return [];
    
    const userIdStr = userId.toString();
    return projects.filter(project => {
      const teamIds = (project.team || []).map(t => {
        const id = typeof t === 'object' ? (t._id || t.id || t) : t;
        return id ? id.toString() : null;
      }).filter(Boolean);
      return teamIds.includes(userIdStr);
    });
  };

  // Get tech stack/skills
  const getTechStack = (emp) => {
    const skills = emp.skills || [];
    const techStack = emp.techStack || [];
    const skillsArray = Array.isArray(skills) ? skills : (typeof skills === 'string' ? skills.split(',').map(s => s.trim()).filter(Boolean) : []);
    const techStackArray = Array.isArray(techStack) ? techStack : (typeof techStack === 'string' ? techStack.split(',').map(s => s.trim()).filter(Boolean) : []);
    return [...new Set([...skillsArray, ...techStackArray])].filter(Boolean);
  };

  if (interns.length === 0) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <FaUserGraduate className="text-green-600" />
            IT Interns Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center py-8 text-gray-500 dark:text-gray-400">No IT interns found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6 border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <FaUserGraduate className="text-green-600" />
          IT Interns Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b">
              <tr>
                <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Name</th>
                <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Phone Number</th>
                <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Joining Date</th>
                <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">End Date</th>
                <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Remaining Days</th>
                <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Tech Stack</th>
                <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Projects</th>
                <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Stipend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {interns.map((intern, idx) => {
                const remainingDays = intern.internshipEndDate ? calculateRemainingDays(intern.internshipEndDate) : null;
                const isExpired = remainingDays !== null && remainingDays < 0;
                const internProjects = getInternProjects(intern.userId || intern._id);
                const techStack = getTechStack(intern);

                return (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                      {intern.fullName}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {intern.phoneNumber || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {intern.joiningDate ? new Date(intern.joiningDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                      {intern.internshipEndDate ? new Date(intern.internshipEndDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      {remainingDays !== null ? (
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
                            : `${remainingDays} days`
                          }
                        </span>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {techStack.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {techStack.slice(0, 3).map((tech, techIdx) => (
                            <Badge key={techIdx} variant="outline" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                          {techStack.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{techStack.length - 3} more
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {internProjects.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {internProjects.slice(0, 2).map((project, projIdx) => (
                            <Badge key={projIdx} variant="secondary" className="text-xs" title={project.description || project.name}>
                              {project.name}
                            </Badge>
                          ))}
                          {internProjects.length > 2 && (
                            <Badge variant="secondary" className="text-xs">
                              +{internProjects.length - 2} more
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500 dark:text-gray-400">No projects</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700 dark:text-gray-300 font-medium">
                      <div className="flex items-center gap-1">
                        <FaRupeeSign className="text-xs" />
                        {intern.salary ? formatCurrency(intern.salary, 'INR').replace('₹', '') : 'N/A'}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ITInternsTable;

