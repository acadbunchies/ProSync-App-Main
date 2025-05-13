
"use client"

import React, { useState, useRef } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Mail, UserCircle, Check, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';

const Profile = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    firstName: user?.fullName?.split(" ")[0] || "",
    lastName: user?.fullName?.split(" ").slice(1).join(" ") || ""
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSave = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      
      const { error } = await supabase.auth.updateUser({
        data: { 
          full_name: fullName 
        }
      });
      
      if (error) throw error;
      
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error(`Error updating profile: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      toast.error("Please upload an image file");
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error("Image size should be less than 5MB");
      return;
    }
    
    setIsUploading(true);
    try {
      // Create a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${uuidv4()}.${fileExt}`;
      
      // Upload file to Supabase Storage
      const { error } = await supabase.storage
        .from('avatars')
        .upload(fileName, file);
        
      if (error) throw error;
      
      // Get the public URL
      const { data: publicUrl } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
        
      setAvatarUrl(publicUrl.publicUrl);
      
      // Update user metadata with new avatar URL
      const { error: updateError } = await supabase.auth.updateUser({
        data: { 
          avatar_url: publicUrl.publicUrl 
        }
      });
      
      if (updateError) throw updateError;
      
      toast.success("Avatar updated successfully");
    } catch (error) {
      toast.error(`Error uploading avatar: ${(error as Error).message}`);
    } finally {
      setIsUploading(false);
    }
  };
  
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
  
  // Extract first name for avatar
  const firstInitial = user.fullName?.charAt(0) || "U";
  
  // Get avatar URL from metadata or state
  const currentAvatarUrl = avatarUrl || 
    // Use optional chaining with the any type assertion to access user_metadata safely
    (supabase.auth.getUser && (user as any)?.user_metadata?.avatar_url);

  return (
    <DashboardLayout>
      <div className="container max-w-4xl mx-auto py-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2 text-gradient">
              <UserCircle className="h-7 w-7" /> Profile
            </h1>
            <p className="text-muted-foreground">
              Manage your account information
            </p>
          </div>
        </div>
        
        <Card className="border-primary/20 shadow-md">
          <CardHeader className="relative">
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="relative">
                <Avatar className="h-24 w-24 cursor-pointer border-2 border-primary/30 hover:border-primary/70 transition-colors" onClick={handleAvatarClick}>
                  <AvatarImage 
                    src={currentAvatarUrl} 
                    alt={user.fullName} 
                  />
                  <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                    {isUploading ? <Loader2 className="h-6 w-6 animate-spin" /> : firstInitial}
                  </AvatarFallback>
                </Avatar>
                <Button 
                  size="icon" 
                  variant="secondary"
                  className="absolute bottom-0 right-0 rounded-full h-8 w-8 shadow-md bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={handleAvatarClick}
                  disabled={isUploading}
                >
                  {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                  <span className="sr-only">Change avatar</span>
                </Button>
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
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
            <Separator className="bg-primary/20" />
            
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Personal Information</h3>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input 
                    id="firstName" 
                    name="firstName"
                    value={formData.firstName} 
                    onChange={handleChange}
                    className="border-input/60 focus:border-primary/40"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input 
                    id="lastName" 
                    name="lastName"
                    value={formData.lastName} 
                    onChange={handleChange}
                    className="border-input/60 focus:border-primary/40"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    defaultValue={user.email}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between border-t pt-6">
            <Button variant="outline" className="border-primary/30 hover:border-primary/60">Cancel</Button>
            <Button 
              disabled={isLoading}
              onClick={handleSave}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> 
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" /> 
                  Save Changes
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
