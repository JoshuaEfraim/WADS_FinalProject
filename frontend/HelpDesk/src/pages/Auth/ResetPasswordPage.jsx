// @ts-nocheck
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import authService from '@/services/auth';

// Password validation function to match backend requirements
const validatePassword = (password) => {
  const hasNumber = /\d/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const isLengthValid = password.length >= 6 && password.length <= 20;
  
  return hasNumber && hasLowerCase && hasUpperCase && isLengthValid;
};

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { token } = useParams();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [formMessage, setFormMessage] = useState({ text: '', isError: false });

  useEffect(() => {
    if (!token) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Invalid reset link",
      });
      navigate('/login');
    }
  }, [token, navigate, toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.newPassword || !formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please provide all required fields",
      });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setFormMessage({
        text: "Passwords do not match",
        isError: true
      });
      return;
    }

    // Validate password according to requirements
    if (!validatePassword(formData.newPassword)) {
      setFormMessage({
        text: "Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letters",
        isError: true
      });
      return;
    }

    setIsLoading(true);
    setFormMessage({ text: '', isError: false });

    try {
      await authService.resetPassword(token, formData.newPassword);
      setFormMessage({
        text: "Password has been reset successfully. Redirecting to login...",
        isError: false
      });
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      console.error('Reset password error:', error);
      
      // Handle specific error cases from backend
      const errorMessage = error.message || "Error resetting password";
      if (errorMessage.includes("invalid") || errorMessage.includes("expired")) {
        setFormMessage({
          text: "Password reset link is invalid or has expired. Please request a new one.",
          isError: true
        });
        setTimeout(() => navigate('/forgot-password'), 3000);
      } else {
        setFormMessage({
          text: errorMessage,
          isError: true
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
    // Clear message when user starts typing
    setFormMessage({ text: '', isError: false });
  };

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card className="overflow-hidden">
          <CardContent className="p-6 md:p-8">
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center text-center">
                  <img
                    src="/src/assets/logo/siloamLogo-rectangle.png"
                    alt="Siloam Logo"
                    className="h-17 w-65 mb-2"
                  />
                  <h2 className="text-2xl font-semibold mb-2">Reset Password</h2>
                  <p className="text-balance text-muted-foreground">
                    Please enter your new password.
                  </p>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={handleChange}
                    required
                    className="w-full"
                    placeholder="Enter new password"
                  />
                  <p className="text-xs text-muted-foreground">
                    Password must be 6-20 characters long with at least one number, one lowercase and one uppercase letter.
                  </p>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full"
                    placeholder="Confirm new password"
                  />
                </div>

                {formMessage.text && (
                  <p className={cn(
                    "text-sm text-center",
                    formMessage.isError ? "text-destructive" : "text-green-600"
                  )}>
                    {formMessage.text}
                  </p>
                )}

                <Button 
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Resetting..." : "Reset Password"}
                </Button>

                <div className="text-center text-sm">
                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="text-primary hover:underline"
                  >
                    Back to Login
                  </button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 