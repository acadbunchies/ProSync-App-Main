
import React from "react";
import { Mail } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import AvatarUploader from "./AvatarUploader";
import ProfileForm from "./ProfileForm";

interface ProfileCardProps {
  user: {
    id: string;
    email?: string;
    fullName?: string;
    user_metadata?: {
      avatar_url?: string;
    };
  };
}

const ProfileCard: React.FC<ProfileCardProps> = ({ user }) => {
  // Get avatar URL from metadata
  const initialAvatarUrl = user?.user_metadata?.avatar_url;

  return (
    <Card className="border-primary/20 shadow-md">
      <CardHeader className="relative">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <AvatarUploader 
            userId={user.id} 
            fullName={user.fullName || ''} 
            initialAvatarUrl={initialAvatarUrl} 
          />
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
          <ProfileForm user={user} />
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
