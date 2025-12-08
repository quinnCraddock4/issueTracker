import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const loginSchema = z.object({
  email: z.string().email('Email must be a valid email address').min(1, 'Email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

interface LoginFormProps {
  onLogin: (auth: any) => void;
  showError: (message: string) => void;
}

const LoginForm = ({ onLogin, showError }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateForm = () => {
    setEmailError('');
    setPasswordError('');
    setError('');

    const result = loginSchema.safeParse({ email, password });

    if (!result.success) {
      result.error.issues.forEach((err) => {
        if (err.path[0] === 'email') {
          setEmailError(err.message);
        } else if (err.path[0] === 'password') {
          setPasswordError(err.message);
        }
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Please fix the errors above');
      showError('Please fix the errors above');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/auth/sign-in/email`, {
        email,
        password
      }, {
        withCredentials: true
      });

      // Store auth data from response (role is now included in login response)
      const authData = {
        email: response.data.email || email,
        userId: response.data.userId,
        role: response.data.role || [],
        authenticated: true
      };

      onLogin(authData);
    } catch (err: any) {
      let errorMessage = 'Login failed';
      
      if (err?.response?.data?.error) {
        if (typeof err.response.data.error === 'string') {
          errorMessage = err.response.data.error;
        } else if (err.response.data.error?.details) {
          errorMessage = err.response.data.error.details;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      showError(errorMessage);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-xl border-2 hover:shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Login
        </CardTitle>
        <CardDescription className="text-base">Enter your email and password to sign in</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className={`transition-all focus:scale-[1.02] focus:ring-2 focus:ring-primary ${emailError ? 'border-red-500' : ''}`}
            />
            {emailError && <p className="text-sm text-red-500">{emailError}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className={`transition-all focus:scale-[1.02] focus:ring-2 focus:ring-primary ${passwordError ? 'border-red-500' : ''}`}
            />
            {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
          </div>
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}
          <Button type="submit" className="w-full text-base font-semibold h-11 hover:scale-105 transition-transform shadow-lg hover:shadow-xl">
            Submit
          </Button>
          <div className="text-center text-sm pt-2">
            <Link
              to="/register"
              className="text-primary hover:underline hover:text-primary/80 transition-colors"
            >
              Don't have an account? Register here
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
