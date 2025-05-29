
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  authError: string | null;
  signInWithOtp: (email: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Clean up auth state function
const cleanupAuthState = () => {
  // Remove standard auth tokens
  localStorage.removeItem('supabase.auth.token');
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  // Remove from sessionStorage if in use
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    console.log("Auth Provider - Initializing");
    
    let isMounted = true;
    
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log("Auth state changed:", event);
      
      if (!isMounted) return;
      
      // Update state synchronously to avoid React 18 batching issues
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (event === 'SIGNED_OUT') {
        console.log("User signed out");
        // Don't show toast or navigate during initialization
        if (loading === false) {
          toast({
            title: "Signed out",
            description: "You have been signed out successfully"
          });
        }
      } else if (event === 'SIGNED_IN') {
        console.log("User signed in");
        // Don't show toast during initialization
        if (loading === false) {
          toast({
            title: "Signed in",
            description: "You have been signed in successfully"
          });
        }
      }
    });

    // Then check for existing session
    const initAuth = async () => {
      try {
        console.log("Checking for existing session...");
        const { data, error } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (error) {
          console.error("Session error:", error);
          setAuthError(`Session error: ${error.message}`);
        } else {
          console.log("Session data:", data.session ? "Session exists" : "No session");
          setSession(data.session);
          setUser(data.session?.user ?? null);
          setAuthError(null);
        }
      } catch (err: any) {
        if (!isMounted) return;
        console.error("Unexpected auth error:", err);
        setAuthError(`Unexpected auth error: ${err.message}`);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    initAuth();
    
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [toast]);

  const signInWithOtp = async (email: string) => {
    try {
      setLoading(true);
      setAuthError(null);
      cleanupAuthState(); // Clean up previous session attempts

      console.log("Attempting OTP sign in for:", email);

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin, // Or your specific redirect URL
        },
      });

      if (error) {
        console.error("OTP Sign in error:", error);
        setAuthError(error.message);
        toast({
          title: "Magic Link Error",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }

      console.log("Magic link sent for:", email);
      setAuthError(null);
      toast({
        title: "Magic Link Sent",
        description: "Check your email for the magic link to sign in.",
      });
      return { error: null };
    } catch (error: any) {
      console.error("Unexpected OTP sign in error:", error);
      setAuthError(`Unexpected OTP sign in error: ${error.message}`);
      toast({
        title: "Error Sending Magic Link",
        description: error.message,
        variant: "destructive",
      });
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setAuthError(null);
      
      console.log("Signing out...");
      cleanupAuthState();
      
      // Use a try-catch within the method to handle signOut errors
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        console.error("Error during signOut API call:", err);
        // Even if the API call fails, we'll continue with local cleanup
      }
      
      // Force reset user state regardless of API success
      setSession(null);
      setUser(null);
      
    } catch (error: any) {
      console.error("Error signing out:", error);
      setAuthError(`Error signing out: ${error.message}`);
      toast({
        title: "Sign out error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const value = {
    session,
    user,
    loading,
    authError,
    signInWithOtp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;
