
import React from "react";
import { UserCircle } from "lucide-react";

const ProfileHeader = () => {
  return (
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
  );
};

export default ProfileHeader;
