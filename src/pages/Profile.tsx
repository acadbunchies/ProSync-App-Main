
import React from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Mail, UserCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const Profile = () => {
  const { user } = useAuth();
  
  if (!user) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Card>
            <CardHeader>
              <CardTitle>Not Authenticated</CardTitle>
              <CardDescription>You need to be logged in to view your profile.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </DashboardLayout>
    );
  }
  
  // Extract first name for avatar
  const firstInitial = user.fullName?.charAt(0) || "U";

  return (
    <DashboardLayout>
      <div className="container max-w-4xl mx-auto py-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <UserCircle className="h-7 w-7" /> Profile
            </h1>
            <p className="text-muted-foreground">
              Manage your account information
            </p>
          </div>
        </div>
        
        <Card>
          <CardHeader className="relative">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage alt={user.fullName} />
                  <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                    {firstInitial}
                  </AvatarFallback>
                </Avatar>
                <Button 
                  size="icon" 
                  variant="secondary"
                  className="absolute bottom-0 right-0 rounded-full h-8 w-8"
                >
                  <Camera className="h-4 w-4" />
                  <span className="sr-only">Change avatar</span>
                </Button>
              </div>
              <div className="text-center md:text-left">
                <CardTitle className="text-2xl">{user.fullName}</CardTitle>
                <CardDescription className="flex items-center gap-1 mt-1">
                  <Mail className="h-4 w-4" /> {user.email}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Separator />
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Personal Information</h3>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input 
                    id="firstName" 
                    defaultValue={user.fullName?.split(" ")[0]} 
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input 
                    id="lastName" 
                    defaultValue={user.fullName?.split(" ").slice(1).join(" ")} 
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    defaultValue={user.email}
                    disabled
                  />
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between border-t pt-6">
            <Button variant="outline">Cancel</Button>
            <Button disabled>Save Changes</Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
