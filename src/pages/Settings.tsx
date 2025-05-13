
"use client"

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/layouts/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Settings, Bell, Moon, Sun, Save, Loader2, MailWarning, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const SettingsPage = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [timezone, setTimezone] = useState("America/New_York");
  const [language, setLanguage] = useState("en-US");
  const [fontPreference, setFontPreference] = useState("medium");
  const [reducedMotion, setReducedMotion] = useState(false);

  // Simulate loading saved preferences
  useEffect(() => {
    // In a real app, this would fetch user preferences from the backend
    const savedPreferences = localStorage.getItem("userPreferences");
    
    if (savedPreferences) {
      try {
        const preferences = JSON.parse(savedPreferences);
        setEmailNotifications(preferences.emailNotifications ?? true);
        setPushNotifications(preferences.pushNotifications ?? true);
        setMarketingEmails(preferences.marketingEmails ?? false);
        setTimezone(preferences.timezone ?? "America/New_York");
        setLanguage(preferences.language ?? "en-US");
        setFontPreference(preferences.fontPreference ?? "medium");
        setReducedMotion(preferences.reducedMotion ?? false);
      } catch (e) {
        console.error("Failed to parse saved preferences", e);
      }
    }
  }, []);

  const handleSaveSettings = () => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      // Save preferences to localStorage
      const preferences = {
        emailNotifications,
        pushNotifications,
        marketingEmails,
        timezone,
        language,
        fontPreference,
        reducedMotion
      };
      
      localStorage.setItem("userPreferences", JSON.stringify(preferences));
      
      setIsSaving(false);
      toast.success("Settings saved successfully");
    }, 1000);
  };
  
  const handleResetPreferences = () => {
    setEmailNotifications(true);
    setPushNotifications(true);
    setMarketingEmails(false);
    setTimezone("America/New_York");
    setLanguage("en-US");
    setFontPreference("medium");
    setReducedMotion(false);
    
    localStorage.removeItem("userPreferences");
    setShowResetDialog(false);
    toast.success("Preferences have been reset to default");
  };

  return (
    <DashboardLayout>
      <div className="container max-w-4xl mx-auto py-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Settings className="h-7 w-7 text-primary" /> <span className="text-gradient">Settings</span>
            </h1>
            <p className="text-muted-foreground">
              Manage your account preferences and configuration
            </p>
          </div>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="w-full md:w-auto mb-6 grid grid-cols-3 md:grid-cols-3 gap-2 md:gap-0 md:inline-flex bg-muted/60 p-1 rounded-lg border border-primary/20">
            <TabsTrigger value="general" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">General</TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Notifications</TabsTrigger>
            <TabsTrigger value="appearance" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Appearance</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-6">
            <Card className="border-primary/20 shadow-md">
              <CardHeader className="bg-gradient-to-r from-transparent to-primary/5">
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Configure general account settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="sync" className="text-foreground">Sync across devices</Label>
                      <p className="text-sm text-muted-foreground">
                        Keep your settings and data synchronized across devices
                      </p>
                    </div>
                    <Switch 
                      id="sync" 
                      defaultChecked 
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>
                  
                  <Separator className="bg-primary/10" />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="analytics" className="text-foreground">Usage analytics</Label>
                      <p className="text-sm text-muted-foreground">
                        Help us improve by sending anonymous usage data
                      </p>
                    </div>
                    <Switch 
                      id="analytics" 
                      defaultChecked 
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>
                  
                  <Separator className="bg-primary/10" />
                  
                  <div className="space-y-2">
                    <Label htmlFor="timezone" className="text-foreground">Time Zone</Label>
                    <Select value={timezone} onValueChange={setTimezone}>
                      <SelectTrigger className="w-full border-input/60">
                        <SelectValue placeholder="Select a timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/New_York">Eastern Time (US & Canada)</SelectItem>
                        <SelectItem value="America/Chicago">Central Time (US & Canada)</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time (US & Canada)</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time (US & Canada)</SelectItem>
                        <SelectItem value="Europe/London">London</SelectItem>
                        <SelectItem value="Europe/Paris">Paris</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Separator className="bg-primary/10" />
                  
                  <div className="space-y-2">
                    <Label htmlFor="language" className="text-foreground">Language</Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="w-full border-input/60">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en-US">English (US)</SelectItem>
                        <SelectItem value="en-GB">English (UK)</SelectItem>
                        <SelectItem value="es-ES">Spanish</SelectItem>
                        <SelectItem value="fr-FR">French</SelectItem>
                        <SelectItem value="de-DE">German</SelectItem>
                        <SelectItem value="ja-JP">Japanese</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-primary/20 shadow-md">
              <CardHeader className="bg-gradient-to-r from-transparent to-primary/5">
                <CardTitle>Data & Privacy</CardTitle>
                <CardDescription>
                  Manage how your data is used and stored
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="cookies" className="text-foreground">Accept all cookies</Label>
                    <p className="text-sm text-muted-foreground">
                      Allow the app to store cookies on your device
                    </p>
                  </div>
                  <Switch 
                    id="cookies" 
                    defaultChecked 
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
                
                <div className="pt-4 flex flex-col sm:flex-row gap-4">
                  <Button 
                    variant="outline" 
                    className="border-primary/30 hover:border-primary/60"
                  >
                    Export Personal Data
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="border-destructive/30 hover:border-destructive text-destructive"
                    onClick={() => setShowResetDialog(true)}
                  >
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Reset Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-6">
            <Card className="border-primary/20 shadow-md">
              <CardHeader className="bg-gradient-to-r from-transparent to-primary/5">
                <CardTitle>Notification Settings</CardTitle>
                <CardDescription>
                  Control when and how you want to be notified
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-primary" />
                    <div>
                      <Label htmlFor="emailNotifications" className="text-foreground">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email
                      </p>
                    </div>
                  </div>
                  <Switch 
                    id="emailNotifications" 
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
                
                <Separator className="bg-primary/10" />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-primary" />
                    <div>
                      <Label htmlFor="pushNotifications" className="text-foreground">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications in your browser
                      </p>
                    </div>
                  </div>
                  <Switch 
                    id="pushNotifications" 
                    checked={pushNotifications}
                    onCheckedChange={setPushNotifications}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
                
                <Separator className="bg-primary/10" />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MailWarning className="h-5 w-5 text-primary" />
                    <div>
                      <Label htmlFor="marketingEmails" className="text-foreground">Marketing Emails</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive emails about new features and offers
                      </p>
                    </div>
                  </div>
                  <Switch 
                    id="marketingEmails" 
                    checked={marketingEmails}
                    onCheckedChange={setMarketingEmails}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="appearance" className="space-y-6">
            <Card className="border-primary/20 shadow-md">
              <CardHeader className="bg-gradient-to-r from-transparent to-primary/5">
                <CardTitle>Display Settings</CardTitle>
                <CardDescription>
                  Customize how the application looks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-base text-foreground">Theme</Label>
                    <p className="text-sm text-muted-foreground mb-4">
                      Select a theme for the interface
                    </p>
                    <div className="grid grid-cols-3 gap-4">
                      <Button 
                        variant={theme === "light" ? "default" : "outline"}
                        className={`flex flex-col items-center gap-2 h-auto py-4 
                          ${theme === "light" ? "bg-primary text-primary-foreground" : "border-primary/30 hover:border-primary/60"}`}
                        onClick={() => setTheme("light")}
                      >
                        <Sun className="h-6 w-6" />
                        <span>Light</span>
                      </Button>
                      <Button 
                        variant={theme === "dark" ? "default" : "outline"}
                        className={`flex flex-col items-center gap-2 h-auto py-4 
                          ${theme === "dark" ? "bg-primary text-primary-foreground" : "border-primary/30 hover:border-primary/60"}`}
                        onClick={() => setTheme("dark")}
                      >
                        <Moon className="h-6 w-6" />
                        <span>Dark</span>
                      </Button>
                      <Button 
                        variant={theme === "system" ? "default" : "outline"}
                        className={`flex flex-col items-center gap-2 h-auto py-4 
                          ${theme === "system" ? "bg-primary text-primary-foreground" : "border-primary/30 hover:border-primary/60"}`}
                        onClick={() => setTheme("system")}
                      >
                        <div className="flex">
                          <Sun className="h-6 w-6" />
                          <Moon className="h-6 w-6" />
                        </div>
                        <span>System</span>
                      </Button>
                    </div>
                  </div>
                  
                  <Separator className="bg-primary/10 my-6" />
                  
                  <div className="space-y-2">
                    <Label htmlFor="fontSize" className="text-foreground">Font Size</Label>
                    <Select value={fontPreference} onValueChange={setFontPreference}>
                      <SelectTrigger className="w-full border-input/60">
                        <SelectValue placeholder="Select font size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Separator className="bg-primary/10" />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="reducedMotion" className="text-foreground">Reduced Motion</Label>
                      <p className="text-sm text-muted-foreground">
                        Decrease the amount of animations
                      </p>
                    </div>
                    <Switch 
                      id="reducedMotion" 
                      checked={reducedMotion}
                      onCheckedChange={setReducedMotion}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end gap-4 mt-8">
          <Button 
            variant="outline"
            className="border-primary/30 hover:border-primary/60"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSaveSettings} 
            disabled={isSaving}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> 
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" /> 
                Save Settings
              </>
            )}
          </Button>
        </div>

        {/* Reset Preferences Dialog */}
        <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
          <DialogContent className="bg-background">
            <DialogHeader>
              <DialogTitle>Reset all preferences?</DialogTitle>
              <DialogDescription>
                This will reset all your preferences to their default values. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowResetDialog(false)}
                className="border-primary/30 hover:border-primary/60"
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleResetPreferences}
                className="button-pop"
              >
                Reset Preferences
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
