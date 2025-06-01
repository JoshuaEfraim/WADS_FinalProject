// @ts-nocheck
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import PropTypes from 'prop-types'
import { Link, useNavigate } from "react-router-dom"
import React, { useState } from 'react'
import authService from "@/services/auth"
import { useToast } from "@/components/ui/use-toast"


export function LoginForm({ className = "" }) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
    // Clear error when user starts typing
    setFormError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Check for empty fields first
    if (!formData.email || !formData.password) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all fields"
      });
      return;
    }

    setIsLoading(true);
    setFormError('');
    
    try {
      const response = await authService.login(formData.email, formData.password);
      console.log('Login response:', response);

      if (response.error) {
        setFormError(response.error.message);
        setFormData(prev => ({
          ...prev,
          password: ''
        }));
      } else {
        // Show success toast and navigate
        toast({
          title: "Success",
          description: "Sign in successful!"
        });
        navigate('/profile');
      }
    } catch (error) {
      console.error('Login error:', error);
      setFormError(error.message || "An error occurred during login");
      setFormData(prev => ({
        ...prev,
        password: ''
      }));
    }
    
    setIsLoading(false);
  };

  const handleGoogleLogin = () => {
    authService.googleLogin();
  };

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <Card className="overflow-hidden">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <img
                  src="/src/assets/logo/siloamLogo-rectangle.png"
                  alt="Siloam Building"
                  className="h-17 w-67"
                />
                <p className="text-balance text-muted-foreground">
                  Login to your Siloam account
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  className="w-full"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <Link
                    to="/forgot-password"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  className="w-full"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              {formError && (
                <p className="text-destructive text-sm text-center">
                  {formError}
                </p>
              )}
              <Button 
                type="submit" 
                className="w-full border" 
                variant="default" 
                size="default"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
              <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                <span className="relative z-10 bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <Button 
                  type="button"
                  variant="outline" 
                  size="default" 
                  className="w-full"
                  onClick={handleGoogleLogin}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  <span className="sr-only">Login with Google</span>
                </Button>
              </div>
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link to="/register" className="underline underline-offset-4 hover:text-primary">
                  Sign up
                </Link>
              </div>
            </div>
          </form>
          <div className="relative hidden bg-muted md:block">
            <img
              src="/src/assets/logo/Siloam Building.jpg"
              alt="Siloam Building"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}

LoginForm.propTypes = {
  className: PropTypes.string
}

LoginForm.defaultProps = {
  className: ""
}
