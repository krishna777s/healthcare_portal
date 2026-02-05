import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

// Helper function to get display name for role
const getRoleName = (role: string): string => {
  switch (role) {
    case "hospital_admin":
      return "Hospital Admin";
    case "doctor":
      return "Doctor";
    case "patient":
      return "Patient";
    default:
      return "";
  }
};

interface SignupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToLogin: () => void;
  role?: string;
}

export const SignupModal = ({ open, onOpenChange, onSwitchToLogin, role: roleProp }: SignupModalProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState(roleProp || "");
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const { toast } = useToast();

  // Update role when roleProp changes
  useEffect(() => {
    if (roleProp) {
      setRole(roleProp);
    }
  }, [roleProp]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!role) {
      toast({
        title: "Role required",
        description: "Please select a role to continue.",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await signup(email, password, name, role);
      toast({
        title: "Verification email sent",
        description: "Please check your email and verify your account. Once verified, you can sign in.",
      });
      onOpenChange(false);
      setName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setRole("");
    } catch (error) {
      toast({
        title: "Signup failed",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-card border-border rounded-lg p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {roleProp ? `${getRoleName(roleProp)} Sign Up` : "Create Account"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {roleProp
              ? `Create your ${getRoleName(roleProp).toLowerCase()} account to get started`
              : "Sign up to start managing your hospital operations"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-background/50 border-input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-email">Email</Label>
            <Input
              id="signup-email"
              type="email"
              placeholder="name@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-background/50 border-input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-role">Role</Label>
            {roleProp ? (
              <Input
                value={getRoleName(roleProp)}
                disabled
                className="bg-background/30 border-input cursor-not-allowed"
              />
            ) : (
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="bg-background/50 border-input">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hospital_admin">Hospital Admin</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="patient">Patient</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="signup-password">Password</Label>
            <Input
              id="signup-password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-background/50 border-input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="bg-background/50 border-input"
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="terms"
              required
              className="rounded border-input text-primary focus:ring-primary"
            />
            <Label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer">
              I agree to the{" "}
              <button
                type="button"
                className="text-primary hover:underline"
                onClick={() => {
                  toast({
                    title: "Terms & Conditions",
                    description: "Terms and conditions will be available soon.",
                  });
                }}
              >
                Terms & Conditions
              </button>
            </Label>
          </div>
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => {
                onOpenChange(false);
                onSwitchToLogin();
              }}
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};


