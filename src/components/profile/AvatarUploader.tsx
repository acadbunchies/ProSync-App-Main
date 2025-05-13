
import React, { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';

interface AvatarUploaderProps {
  userId: string;
  fullName: string;
  initialAvatarUrl?: string | null;
}

const AvatarUploader: React.FC<AvatarUploaderProps> = ({ userId, fullName, initialAvatarUrl }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get avatar URL from metadata or state
  const currentAvatarUrl = avatarUrl || initialAvatarUrl;
  
  // Extract first name for avatar
  const firstInitial = fullName?.charAt(0) || "U";

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    
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
      const fileName = `${userId}-${uuidv4()}.${fileExt}`;
      
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

  return (
    <div className="relative">
      <Avatar 
        className="h-24 w-24 cursor-pointer border-2 border-primary/30 hover:border-primary/70 transition-colors" 
        onClick={handleAvatarClick}
      >
        <AvatarImage src={currentAvatarUrl} alt={fullName} />
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
  );
};

export default AvatarUploader;
