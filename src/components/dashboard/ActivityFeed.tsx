
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ActivityItem } from "./types";
import { FileText, Plus, Settings, X } from "lucide-react";

interface ActivityFeedProps {
  activities: ActivityItem[];
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ activities }) => {
  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'create':
        return <Plus className="h-4 w-4 text-green-500" />;
      case 'update':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'delete':
        return <X className="h-4 w-4 text-red-500" />;
      case 'info':
      default:
        return <Settings className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Card className="border border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="px-6">
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <React.Fragment key={activity.id}>
              <div className="flex items-start gap-3">
                <div className="mt-1 p-1.5 bg-secondary rounded-md">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                  {activity.user && (
                    <div className="text-xs text-muted-foreground">
                      By {activity.user.name}
                    </div>
                  )}
                </div>
              </div>
              {index < activities.length - 1 && <Separator />}
            </React.Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;
