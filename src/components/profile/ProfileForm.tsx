
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ProfileFormProps {
  user: {
    id: string;
    email?: string;
    fullName?: string;
  };
}

const ProfileForm: React.FC<ProfileFormProps> = ({ user }) => {
  const [isLoading, setIsLoading] = useState(false);
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

  return (
    <>
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
      <div className="flex justify-between border-t pt-6 mt-6">
        <Button variant="outline" className="border-primary/30 hover:border-primary/60">
          Cancel
        </Button>
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
      </div>
    </>
  );
};

export default ProfileForm;
