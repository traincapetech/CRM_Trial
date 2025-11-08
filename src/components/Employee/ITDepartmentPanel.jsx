import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { formatCurrency } from '../../utils/helpers';
import { FaUserTie, FaUserGraduate, FaLaptopCode, FaCalendarAlt } from 'react-icons/fa';

const ITDepartmentPanel = ({ employees }) => {
  const [permanentMembers, setPermanentMembers] = useState([]);
  const [interns, setInterns] = useState([]);
  const [selectedTab, setSelectedTab] = useState("all");

  useEffect(() => {
    if (employees && employees.length > 0) {
      // Employees passed to this component are already filtered to IT department
      // Filter by employment type - check both uppercase and handle null/undefined
      const permanent = employees.filter(emp => {
        const empType = emp.employmentType?.toUpperCase();
        // If employmentType is missing, infer from role name
        if (!empType) {
          const roleName = (emp.role?.name || emp.role || '').toUpperCase();
          return roleName.includes('PERMANENT') && !roleName.includes('INTERN');
        }
        return empType === "PERMANENT";
      });
      const internships = employees.filter(emp => {
        const empType = emp.employmentType?.toUpperCase();
        // If employmentType is missing, infer from role name
        if (!empType) {
          const roleName = (emp.role?.name || emp.role || '').toUpperCase();
          return roleName.includes('INTERN');
        }
        return empType === "INTERN";
      });
      
      setPermanentMembers(permanent);
      setInterns(internships);
    } else {
      setPermanentMembers([]);
      setInterns([]);
    }
  }, [employees]);

  // Calculate remaining days for interns
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

  const EmployeeCard = ({ employee }) => {
    // Determine if intern - check employmentType first, then role name as fallback
    const empType = employee.employmentType?.toUpperCase();
    const roleName = (employee.role?.name || employee.role || '').toUpperCase();
    const isIntern = empType === "INTERN" || (!empType && roleName.includes('INTERN'));
    const remainingDays = isIntern && employee.internshipEndDate 
      ? calculateRemainingDays(employee.internshipEndDate) 
      : null;
    const isExpired = remainingDays !== null && remainingDays < 0;
    
    return (
      <Card className="mb-4">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {isIntern ? (
                <FaUserGraduate className="text-green-600" />
              ) : (
                <FaUserTie className="text-blue-600" />
              )}
              <CardTitle className="text-lg">{employee.fullName}</CardTitle>
            </div>
            <Badge variant={isIntern ? "secondary" : "default"}>
              {employee.employmentType || (isIntern ? 'INTERN' : 'PERMANENT')}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Salary:</span>
              <span className="font-medium">{formatCurrency(employee.salary, 'INR')}</span>
            </div>
            
            {employee.techStack && employee.techStack.length > 0 && (
              <div>
                <span className="text-gray-600">Tech Stack:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {employee.techStack.map((tech, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {isIntern && (
              <>
                {employee.internshipDuration && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span>{employee.internshipDuration} months</span>
                  </div>
                )}
                {employee.internshipStartDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Period:</span>
                    <span>
                      {new Date(employee.internshipStartDate).toLocaleDateString()} - 
                      {employee.internshipEndDate ? new Date(employee.internshipEndDate).toLocaleDateString() : 'Ongoing'}
                    </span>
                  </div>
                )}
                {employee.internshipEndDate && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-2">
                      <FaCalendarAlt className="text-gray-500" />
                      <span className="text-gray-700 dark:text-gray-300 text-sm">
                        End Date: {new Date(employee.internshipEndDate).toLocaleDateString()}
                      </span>
                    </div>
                    {remainingDays !== null && (
                      <span className={`font-semibold text-sm ${
                        isExpired 
                          ? 'text-red-600 dark:text-red-400' 
                          : remainingDays <= 7 
                          ? 'text-orange-600 dark:text-orange-400' 
                          : 'text-green-600 dark:text-green-400'
                      }`}>
                        {isExpired 
                          ? `(${Math.abs(remainingDays)} days overdue)` 
                          : remainingDays === 0 
                          ? '(Ends today)' 
                          : `(${remainingDays} days remaining)`
                        }
                      </span>
                    )}
                  </div>
                )}
              </>
            )}

          {employee.projectAssignments && employee.projectAssignments.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <FaLaptopCode />
                Project Assignments
              </h4>
              <div className="space-y-2">
                {employee.projectAssignments.map((project, idx) => (
                  <div key={idx} className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                    <div className="flex justify-between">
                      <span className="font-medium">{project.projectName}</span>
                      <Badge variant={
                        project.status === 'ACTIVE' ? 'success' :
                        project.status === 'COMPLETED' ? 'default' : 'warning'
                      }>
                        {project.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      {project.role} • {new Date(project.startDate).toLocaleDateString()}
                      {project.endDate && ` - ${new Date(project.endDate).toLocaleDateString()}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl flex items-center gap-2">
            <FaLaptopCode className="text-blue-600" />
            IT Department Overview
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-sm">
              {permanentMembers.length} Permanent
            </Badge>
            <Badge variant="outline" className="text-sm">
              {interns.length} Interns
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full" onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Members</TabsTrigger>
            <TabsTrigger value="permanent">Permanent</TabsTrigger>
            <TabsTrigger value="interns">Interns</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-4">
            {[...permanentMembers, ...interns].map(employee => (
              <EmployeeCard key={employee._id} employee={employee} />
            ))}
          </TabsContent>
          
          <TabsContent value="permanent" className="mt-4">
            {permanentMembers.map(employee => (
              <EmployeeCard key={employee._id} employee={employee} />
            ))}
          </TabsContent>
          
          <TabsContent value="interns" className="mt-4">
            {interns.map(employee => (
              <EmployeeCard key={employee._id} employee={employee} />
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ITDepartmentPanel;
