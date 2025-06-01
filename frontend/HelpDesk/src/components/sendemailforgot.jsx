// @ts-nocheck
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import authService from '@/services/auth';

export function SendEmailForgot({ className = "" }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formMessage, setFormMessage] = useState({ text: '', isError: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter your email address",
      });
      return;
    }

    setIsLoading(true); 
    setFormMessage({ text: '', isError: false });

    try {
      await authService.sendPasswordResetEmail(email);
      setFormMessage({
        text: 'Password reset link has been sent to your email',
        isError: false
      });
      // Navigate to login after a delay
      setTimeout(() => navigate('/login'), 3000);
    } catch (error) {
      console.error('Send email error:', error);
      setFormMessage({
        text: error.message || "Failed to send reset email",
        isError: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)}>
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
                <h2 className="text-2xl font-semibold mb-2">Forgot Password</h2>
                <p className="text-balance text-muted-foreground">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setFormMessage({ text: '', isError: false });
                  }}
                  required
                  className="w-full"
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
                {isLoading ? "Sending..." : "Send Reset Link"}
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
  );
}
