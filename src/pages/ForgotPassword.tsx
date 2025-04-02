
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }
    
    try {
      setIsSubmitting(true);
      await resetPassword(email);
      setIsSubmitted(true);
    } catch (error) {
      // Error is handled in auth context
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border py-4 px-4">
        <div className="container flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="rounded-md bg-primary p-1">
              <div className="h-5 w-5 text-primary-foreground font-bold flex items-center justify-center">P</div>
            </div>
            <span className="font-bold text-xl">ProSync</span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <div className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-fade-in">
          <Card className="glass-card">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl text-center">Reset Password</CardTitle>
              <CardDescription className="text-center">
                {!isSubmitted 
                  ? "Enter your email address to receive a password reset link" 
                  : "Check your inbox for the reset link"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                        Sending reset link
                      </>
                    ) : (
                      "Send reset link"
                    )}
                  </Button>
                </form>
              ) : (
                <div className="space-y-4 py-6">
                  <div className="text-center p-4 bg-primary/10 rounded-md">
                    <p className="text-primary">
                      We've sent a password reset link to <strong>{email}</strong>
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Please check your email inbox and follow the link to reset your password. 
                    If you don't see it, check your spam folder.
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <div className="w-full">
                <Link 
                  to="/login" 
                  className="text-primary hover:underline flex items-center justify-center gap-2 text-sm"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to login
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
