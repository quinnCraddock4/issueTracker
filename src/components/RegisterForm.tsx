import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const registerSchema = z.object({
  email: z.string().email('Email must be a valid email address').min(1, 'Email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  passwordConfirm: z.string().min(1, 'Password confirmation is required'),
  givenName: z.string().min(1, 'Given name is required'),
  familyName: z.string().min(1, 'Family name is required'),
}).refine((data) => data.password === data.passwordConfirm, {
  message: 'Passwords must match',
  path: ['passwordConfirm'],
});

interface RegisterFormProps {
  onLogin: (auth: any) => void;
  showError: (message: string) => void;
}

const RegisterForm = ({ onLogin, showError }: RegisterFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [givenName, setGivenName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordConfirmError, setPasswordConfirmError] = useState('');
  const [givenNameError, setGivenNameError] = useState('');
  const [familyNameError, setFamilyNameError] = useState('');

  const validateForm = () => {
    setEmailError('');
    setPasswordError('');
    setPasswordConfirmError('');
    setGivenNameError('');
    setFamilyNameError('');
    setError('');

    const result = registerSchema.safeParse({
      email,
      password,
      passwordConfirm,
      givenName,
      familyName,
    });

    if (!result.success) {
      result.error.issues.forEach((err) => {
        const field = err.path[0] as string;
        if (field === 'email') {
          setEmailError(err.message);
        } else if (field === 'password') {
          setPasswordError(err.message);
        } else if (field === 'passwordConfirm') {
          setPasswordConfirmError(err.message);
        } else if (field === 'givenName') {
          setGivenNameError(err.message);
        } else if (field === 'familyName') {
          setFamilyNameError(err.message);
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
      const response = await axios.post(`${API_URL}/auth/sign-up/email`, {
        email,
        password,
        givenName,
        familyName
      }, {
        withCredentials: true
      });

      // Store auth data from response (role is now included in registration response)
      const authData = {
        email: response.data.email || email,
        userId: response.data.userId,
        role: response.data.role || [],
        authenticated: true
      };

      onLogin(authData);
    } catch (err: any) {
      let errorMessage = 'Registration failed';
      
      if (err?.response?.data?.error) {
        if (typeof err.response.data.error === 'string') {
          errorMessage = err.response.data.error;
        } else if (err.response.data.error?.details) {
          // Extract error messages from Joi validation details array
          const details = err.response.data.error.details;
          if (Array.isArray(details)) {
            errorMessage = details.map((d: any) => d.message).join('; ');
          } else {
            errorMessage = String(details);
          }
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
          Register
        </CardTitle>
        <CardDescription className="text-base">Create a new account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold">Email *</Label>
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
            <Label htmlFor="password" className="text-sm font-semibold">Password *</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password (min 8 characters)"
              className={`transition-all focus:scale-[1.02] focus:ring-2 focus:ring-primary ${passwordError ? 'border-red-500' : ''}`}
            />
            {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="passwordConfirm" className="text-sm font-semibold">Confirm Password *</Label>
            <Input
              id="passwordConfirm"
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="Confirm your password"
              className={`transition-all focus:scale-[1.02] focus:ring-2 focus:ring-primary ${passwordConfirmError ? 'border-red-500' : ''}`}
            />
            {passwordConfirmError && <p className="text-sm text-red-500">{passwordConfirmError}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="givenName" className="text-sm font-semibold">Given Name *</Label>
            <Input
              id="givenName"
              type="text"
              value={givenName}
              onChange={(e) => setGivenName(e.target.value)}
              placeholder="Enter your given name"
              className={`transition-all focus:scale-[1.02] focus:ring-2 focus:ring-primary ${givenNameError ? 'border-red-500' : ''}`}
            />
            {givenNameError && <p className="text-sm text-red-500">{givenNameError}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="familyName" className="text-sm font-semibold">Family Name *</Label>
            <Input
              id="familyName"
              type="text"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              placeholder="Enter your family name"
              className={`transition-all focus:scale-[1.02] focus:ring-2 focus:ring-primary ${familyNameError ? 'border-red-500' : ''}`}
            />
            {familyNameError && <p className="text-sm text-red-500">{familyNameError}</p>}
          </div>
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}
          <Button type="submit" className="w-full text-base font-semibold h-11 hover:scale-105 transition-transform shadow-lg hover:shadow-xl">
            Submit
          </Button>
          <div className="text-center text-sm">
            <Link
              to="/login"
              className="text-primary hover:underline hover:text-primary/80 transition-colors"
            >
              Already have an account? Login here
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default RegisterForm;
