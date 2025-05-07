
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface Project {
  id: string;
  name: string;
  description: string;
  progress: number;
  status: "active" | "completed" | "on-hold" | "planning";
  dueDate: string;
}

interface ProjectSummaryProps {
  projects: Project[];
}

const ProjectSummary: React.FC<ProjectSummaryProps> = ({ projects }) => {
  const getStatusBadgeColor = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case 'completed':
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case 'on-hold':
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
      case 'planning':
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
    }
  };
  
  return (
    <Card className="border border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Project Status</CardTitle>
      </CardHeader>
      <CardContent className="px-6">
        <div className="space-y-6">
          {projects.map((project) => (
            <div key={project.id} className="space-y-2">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">{project.name}</h4>
                <Badge className={`text-xs ${getStatusBadgeColor(project.status)}`}>
                  {project.status.replace('-', ' ')}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{project.description}</p>
              <div className="space-y-1">
                <div className="flex justify-between items-center text-sm">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-1.5" />
              </div>
              <div className="text-xs text-muted-foreground">
                Due: {project.dueDate}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectSummary;
