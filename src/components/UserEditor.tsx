import { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate as NavigateComponent } from 'react-router-dom';
import axios from 'axios';
import { z } from 'zod';
import type { User } from './UserSummary';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const ROLE_OPTIONS = [
  'Developer',
  'Business Analyst',
  'Quality Analyst',
  'Product Manager',
  'Technical Manager',
];

const userSchema = z.object({
  email: z.string().email('Email must be a valid email address').min(1, 'Email is required'),
  password: z.string().optional().refine((val) => !val || val.length >= 8, {
    message: 'Password must be at least 8 characters long if provided',
  }),
  givenName: z.string().min(1, 'Given name is required'),
  familyName: z.string().min(1, 'Family name is required'),
  fullName: z.string().min(1, 'Full name is required'),
  role: z.array(z.string()).optional(),
});

interface UserEditorProps {
  auth: any;
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
}

const UserEditor = ({ auth, showError, showSuccess }: UserEditorProps) => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [givenName, setGivenName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<string[]>([]);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [givenNameError, setGivenNameError] = useState('');
  const [familyNameError, setFamilyNameError] = useState('');
  const [fullNameError, setFullNameError] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId || !auth) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');
        const response = await axios.get(`${API_URL}/users/${userId}`, {
          withCredentials: true
        });
        const userData = response.data;
        setUser(userData);
        setEmail(userData.email || '');
        setGivenName(userData.givenName || '');
        setFamilyName(userData.familyName || '');
        setFullName(userData.fullName || '');
        setRole(userData.role || []);
        setPassword(''); // Password not returned by API
      } catch (err: any) {
        let errorMessage = 'Failed to load user';
        
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
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId, auth, showError]);

  const handleRoleToggle = (roleName: string) => {
    setRole((prev) =>
      prev.includes(roleName)
        ? prev.filter((r) => r !== roleName)
        : [...prev, roleName]
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    setEmailError('');
    setPasswordError('');
    setGivenNameError('');
    setFamilyNameError('');
    setFullNameError('');
    setError('');

    const result = userSchema.safeParse({
      email,
      password: password || undefined,
      givenName,
      familyName,
      fullName,
      role,
    });

    if (!result.success) {
      result.error.issues.forEach((err) => {
        const field = err.path[0] as string;
        if (field === 'email') {
          setEmailError(err.message);
        } else if (field === 'password') {
          setPasswordError(err.message);
        } else if (field === 'givenName') {
          setGivenNameError(err.message);
        } else if (field === 'familyName') {
          setFamilyNameError(err.message);
        } else if (field === 'fullName') {
          setFullNameError(err.message);
        }
      });
      return;
    }

    if (!userId) {
      setError('User ID is missing');
      return;
    }

    try {
      const updateData: any = {
        email,
        givenName,
        familyName,
        fullName,
        role: role.length > 0 ? role : []
      };

      if (password) {
        updateData.password = password;
      }

      await axios.patch(`${API_URL}/users/${userId}`, updateData, {
        withCredentials: true
      });

      showSuccess('User updated successfully!');
      setError('');
      navigate('/user/list');
    } catch (err: any) {
      let errorMessage = 'Failed to update user';
      
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

  if (!auth) {
    return <NavigateComponent to="/login" replace />;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 text-lg mb-2">{error}</p>
        <Button onClick={() => navigate('/user/list')} variant="outline">
          Back to User List
        </Button>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Edit User</CardTitle>
        <CardDescription>Update user information</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              className={emailError ? 'border-red-500' : ''}
            />
            {emailError && <p className="text-sm text-red-500">{emailError}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password (leave blank to keep current)"
              className={passwordError ? 'border-red-500' : ''}
            />
            {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="givenName">Given Name *</Label>
            <Input
              id="givenName"
              type="text"
              value={givenName}
              onChange={(e) => setGivenName(e.target.value)}
              placeholder="Enter given name"
              className={givenNameError ? 'border-red-500' : ''}
            />
            {givenNameError && <p className="text-sm text-red-500">{givenNameError}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="familyName">Family Name *</Label>
            <Input
              id="familyName"
              type="text"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              placeholder="Enter family name"
              className={familyNameError ? 'border-red-500' : ''}
            />
            {familyNameError && <p className="text-sm text-red-500">{familyNameError}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter full name"
              className={fullNameError ? 'border-red-500' : ''}
            />
            {fullNameError && <p className="text-sm text-red-500">{fullNameError}</p>}
          </div>
          <div className="space-y-2">
            <Label>Roles</Label>
            <div className="flex flex-wrap gap-2">
              {ROLE_OPTIONS.map((roleName) => (
                <label
                  key={roleName}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={role.includes(roleName)}
                    onChange={() => handleRoleToggle(roleName)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{roleName}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit">Save</Button>
            <Button type="button" variant="outline" onClick={() => navigate('/user/list')}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default UserEditor;
