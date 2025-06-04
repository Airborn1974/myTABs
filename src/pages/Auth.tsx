import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithOtp, user, authError, loading } = useAuth();
  const { toast } = useToast();

  console.log("Auth page - Loading:", loading, "User:", user ? "Logged in" : "Not logged in");

  if (!loading && user) {
    console.log("Auth page - Redirecting to home because user is logged in");
    return <Navigate to="/" replace />;
  }

  const handleSignInWithOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await signInWithOtp(email);
      
      if (!error) {
        console.log("Magic link request successful for:", email);
      } else {
        console.error("Magic link request failed for:", email, error);
      }
    } catch (submissionError: any) {
      console.error("Unexpected error during magic link submission:", submissionError);
      toast({
        title: "Submission Error",
        description: submissionError.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } 
    finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="mx-auto max-w-md w-full">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">myTABs</CardTitle>
          <CardDescription className="text-center">
            Enter your email below to receive a magic link to sign in.
          </CardDescription>
        </CardHeader>
        
        {authError && (
          <div className="px-6 pb-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Authentication Error</AlertTitle>
              <AlertDescription>{authError}</AlertDescription>
            </Alert>
          </div>
        )}
        
        <form onSubmit={handleSignInWithOtp}>
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading || loading}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading || loading}>
              {isLoading ? "Sending..." : "Send Magic Link"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default Auth;
