
"use client"

import React from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileCard from "@/components/profile/ProfileCard";

const Profile = () => {
  const { user } = useAuth();
  
  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Card className="shadow-lg border-primary/20">
            <CardHeader>
              <CardTitle>Not Authenticated</CardTitle>
              <CardDescription>You need to be logged in to view your profile.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container max-w-4xl mx-auto py-8 space-y-8">
        <ProfileHeader />
        <ProfileCard user={user} />
      </div>
    </DashboardLayout>
  );
};

export default Profile;
