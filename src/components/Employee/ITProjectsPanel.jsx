import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { FaLaptopCode, FaTasks, FaCalendarAlt, FaUsers } from 'react-icons/fa';
import { formatDescription } from '../../utils/formatDescription';

const ITProjectsPanel = ({ projects, employees }) => {
  const [selectedTab, setSelectedTab] = useState('active');

  const activeProjects = projects.filter(p => p.status === 'ACTIVE');
  const completedProjects = projects.filter(p => p.status === 'COMPLETED');
  const upcomingProjects = projects.filter(p => p.status === 'PENDING');

  const ProjectCard = ({ project }) => {
    const teamMembers = employees.filter(e => 
      project.team?.some(member => member.id === e._id)
    );

    return (
      <Card className="mb-4">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <FaLaptopCode className="text-blue-600" />
                {project.name}
              </CardTitle>
              {project.description && (
                <div className="text-sm mt-1">
                  {formatDescription(project.description)}
                </div>
              )}
            </div>
            <Badge variant={
              project.status === 'ACTIVE' ? 'success' :
              project.status === 'COMPLETED' ? 'default' :
              'warning'
            }>
              {project.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Timeline */}
            <div className="flex items-center gap-2 text-sm">
              <FaCalendarAlt className="text-gray-500" />
              <span className="text-gray-600">Timeline:</span>
              <span>
                {new Date(project.startDate).toLocaleDateString()} - 
                {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Ongoing'}
              </span>
            </div>

            {/* Tech Stack */}
            {project.technologies && (
              <div>
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                  <FaLaptopCode className="text-gray-500" />
                  Technologies
                </h4>
                <div className="flex flex-wrap gap-1">
                  {project.technologies.map((tech, idx) => (
                    <Badge key={idx} variant="outline">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Team Members */}
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <FaUsers className="text-gray-500" />
                Team Members ({teamMembers.length})
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {teamMembers.map((member, idx) => (
                  <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      {member.fullName.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{member.fullName}</div>
                      <div className="text-xs text-gray-500">{member.employmentType}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress and Actions */}
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-sm font-medium">Progress</div>
                  <div className="mt-1 w-32 h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 bg-blue-600 rounded-full" 
                      style={{ width: `${project.progress || 0}%` }}
                    />
                  </div>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {project.progress || 0}%
                </div>
              </div>
              <div className="space-x-2">
                <Button variant="outline" size="sm">Details</Button>
                <Button size="sm">Update</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <FaTasks className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeProjects.length}</div>
            <p className="text-sm text-gray-500">In development</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <FaTasks className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedProjects.length}</div>
            <p className="text-sm text-gray-500">Successfully delivered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <FaTasks className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingProjects.length}</div>
            <p className="text-sm text-gray-500">In planning phase</p>
          </CardContent>
        </Card>
      </div>

      {/* Projects List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl">Projects</CardTitle>
            <Button>
              <FaTasks className="mr-2" />
              New Project
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="active">
                Active ({activeProjects.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({completedProjects.length})
              </TabsTrigger>
              <TabsTrigger value="upcoming">
                Upcoming ({upcomingProjects.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="mt-4">
              {activeProjects.map((project, idx) => (
                <ProjectCard key={idx} project={project} />
              ))}
            </TabsContent>

            <TabsContent value="completed" className="mt-4">
              {completedProjects.map((project, idx) => (
                <ProjectCard key={idx} project={project} />
              ))}
            </TabsContent>

            <TabsContent value="upcoming" className="mt-4">
              {upcomingProjects.map((project, idx) => (
                <ProjectCard key={idx} project={project} />
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ITProjectsPanel;
