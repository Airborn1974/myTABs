
import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading, authError, signOut } = useAuth();
  const [hasAttemptedCheck, setHasAttemptedCheck] = useState(false);

  // Set a flag after first auth check to prevent flickering
  useEffect(() => {
    if (!loading) {
      setHasAttemptedCheck(true);
    }
  }, [loading]);

  // Add console logging for debugging
  console.log("Protected Route - User:", user ? "Logged in" : "Not logged in");
  console.log("Protected Route - Loading:", loading);
  console.log("Protected Route - Has attempted check:", hasAttemptedCheck);
  console.log("Protected Route - Auth Error:", authError);

  // If we're still loading and haven't checked auth yet, show loading
  if (loading && !hasAttemptedCheck) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-center text-muted-foreground">Loading authentication status...</p>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <Alert variant="destructive" className="max-w-md mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Error</AlertTitle>
          <AlertDescription>{authError}</AlertDescription>
        </Alert>
        <Button onClick={() => {
          try {
            signOut();
          } catch (error) {
            console.error("Sign out error:", error);
          }
        }} variant="outline">Sign Out and Try Again</Button>
      </div>
    );
  }

  // Only redirect if we've completed at least one auth check to avoid flickering
  if (hasAttemptedCheck && !user) {
    console.log("Protected Route - Redirecting to /auth because user is not logged in");
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
