import { useState, FormEvent, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

// Create custom Google icon component since it's not available in lucide-react
const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M17.13 17.21c-1.16 1.87-3.24 3.04-5.55 3.04-3.28 0-6.09-2.11-7.06-5.04L8 12l-3.48-3.21c.97-2.93 3.77-5.04 7.06-5.04 2.31 0 4.39 1.17 5.55 3.04L14 10.5h5.5v-1c0-5.05-3.91-9.5-9-9.5C5.95 0 2 5.48 2 11s3.95 11 8.5 11c3.82 0 7.24-1.87 9.08-5.57"></path>
  </svg>
);

const AppleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 7c-3 0-4 3-4 5.5 0 3 2 7.5 4 7.5 1.088-.046 1.679-.5 3-.5 1.312 0 1.5.5 3 .5s4-3 4-5c-.028-.01-2.472-.403-2.5-3 0-2.5 2.5-3.5 2.5-3.5-.5-1.5-2.783-5-5.5-4.5C11.5 4 10 7 9 7zm7-4c-.25 2.25-2.25 4-4.5 4"></path>
  </svg>
);

interface AuthFormProps {
  type: "signin" | "signup";
  onSubmit: (email: string, password: string, name?: string) => void;
  isLoading?: boolean;
}

export function AuthForm({ type, onSubmit, isLoading = false }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();
  const { useGoogleSignIn } = useAuth();
  const googleSignIn = useGoogleSignIn();
  
  // Validate form
  useEffect(() => {
    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const passwordValid = password.length >= 6;
    const nameValid = type === "signin" ? true : name.trim().length > 0;
    
    setIsFormValid(emailValid && passwordValid && nameValid);
  }, [email, password, name, type]);
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid || isLoading) return;
    
    try {
      // If the component is in controlled mode (isLoading passed in), don't handle the loading state here
      if (!isLoading) {
        // Simulate auth (in a real app this would call your auth service)
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      onSubmit(email, password, type === "signup" ? name : undefined);
      
      // Only show toast and redirect if we're handling auth internally
      if (!isLoading) {
        toast({
          title: type === "signin" ? "Welcome back!" : "Account created successfully!",
          description: "Redirecting to dashboard...",
        });
        
        // Redirect to dashboard
        navigate("/dashboard");
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Authentication failed",
        description: "Please check your credentials and try again.",
      });
    }
  };

  const handleGoogleSignIn = () => {
    googleSignIn.mutate();
  };

  const handleAppleSignIn = () => {
    toast({
      title: "Apple Sign-in",
      description: "Apple authentication is not yet configured.",
    });
  };

  return (
    <Card className="border border-gray-100 dark:border-gray-800 shadow-sm bg-white dark:bg-card rounded-xl overflow-hidden">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Social Sign-in Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-white border hover:bg-gray-50 dark:bg-background dark:hover:bg-accent/10"
              onClick={handleGoogleSignIn}
            >
              <GoogleIcon />
              <span>{type === "signin" ? "Sign in" : "Sign up"}</span>
            </Button>
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-white border hover:bg-gray-50 dark:bg-background dark:hover:bg-accent/10"
              onClick={handleAppleSignIn}
            >
              <AppleIcon />
              <span>{type === "signin" ? "Sign in" : "Sign up"}</span>
            </Button>
          </div>

          <div className="relative flex items-center py-3">
            <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
            <span className="mx-3 flex-shrink text-sm text-gray-500">OR CONTINUE WITH EMAIL</span>
            <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {type === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium pl-1">
                  Full Name
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    <User size={18} />
                  </span>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 h-12 text-base"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium pl-1">
                Email Address
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  <Mail size={18} />
                </span>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 text-base"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium pl-1">
                  Password
                </Label>
                {type === "signin" && (
                  <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  <Lock size={18} />
                </span>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12 text-base"
                  placeholder={type === "signin" ? "••••••••" : "Create password"}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-14 text-lg mt-6 bg-primary hover:bg-primary/90 text-white rounded-xl transition-all"
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? "Processing..." : (type === "signin" ? "Sign In" : "Create Account")}
            </Button>
          </form>
        </div>

        {type === "signup" && (
          <div className="mt-5 text-sm text-center text-gray-500">
            By creating an account, you agree to our 
            <Link to="/terms" className="text-primary hover:underline mx-1">Terms of Service</Link>
            and 
            <Link to="/privacy" className="text-primary hover:underline ml-1">Privacy Policy</Link>.
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center py-5 border-t border-border/50">
        <div className="text-sm">
          {type === "signin" ? (
            <div className="text-center">
              Don't have an account?{" "}
              <Link to="/signup" className="text-primary font-medium hover:underline">
                Sign up
              </Link>
            </div>
          ) : (
            <div className="text-center">
              Already have an account?{" "}
              <Link to="/signin" className="text-primary font-medium hover:underline">
                Sign in
              </Link>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
