import { useState, useEffect } from 'react';
import axios from 'axios';
import { Navigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import UserSummary from './UserSummary';
import type { User } from './UserSummary';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const ROLE_OPTIONS = [
  'Developer',
  'Business Analyst',
  'Quality Analyst',
  'Product Manager',
  'Technical Manager',
];

interface UserListProps {
  auth: any;
  showError: (message: string) => void;
  showSuccess: (message: string) => void;
}

const UserList = ({ auth, showError }: UserListProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search state
  const [keywords, setKeywords] = useState('');
  const [role, setRole] = useState<string>('');
  const [maxAge, setMaxAge] = useState<string>('');
  const [minAge, setMinAge] = useState<string>('');
  const [sortBy, setSortBy] = useState('givenName');

  const fetchUsers = async () => {
    if (!auth) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams();
      if (keywords) params.append('keywords', keywords);
      if (role) params.append('role', role);
      if (maxAge) params.append('maxAge', maxAge);
      if (minAge) params.append('minAge', minAge);
      if (sortBy) params.append('sortBy', sortBy);
      
      const response = await axios.get(`${API_URL}/users?${params.toString()}`, {
        withCredentials: true
      });
      setUsers(response.data || []);
    } catch (err: any) {
      let errorMessage = 'Failed to load users';
      
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

  useEffect(() => {
    fetchUsers();
  }, [auth, showError]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  if (!auth) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="space-y-4">
      <Card className="w-full shadow-lg border-2 bg-card relative z-10">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl font-bold">User List</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Keywords Search */}
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input
                type="text"
                placeholder="Search keywords..."
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                className="flex-1"
              />
              <Button type="submit">
                <Search className="mr-2 h-4 w-4" /> Search
              </Button>
            </div>

            {/* Search Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Role */}
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={role || 'all'} onValueChange={(value) => setRole(value === 'all' ? '' : value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {ROLE_OPTIONS.map((roleOption) => (
                      <SelectItem key={roleOption} value={roleOption}>
                        {roleOption}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Max Age */}
              <div className="space-y-2">
                <Label>Max Age (days)</Label>
                <Input
                  type="number"
                  placeholder="Max age"
                  value={maxAge}
                  onChange={(e) => setMaxAge(e.target.value)}
                />
              </div>

              {/* Min Age */}
              <div className="space-y-2">
                <Label>Min Age (days)</Label>
                <Input
                  type="number"
                  placeholder="Min age"
                  value={minAge}
                  onChange={(e) => setMinAge(e.target.value)}
                />
              </div>

              {/* Sort By */}
              <div className="space-y-2">
                <Label>Sort By</Label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="givenName">Given Name</SelectItem>
                    <SelectItem value="familyName">Family Name</SelectItem>
                    <SelectItem value="role">Role</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="oldest">Oldest</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* User Results */}
      <Card className="w-full shadow-lg border-2 bg-card relative z-10">
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-500 text-lg mb-2">{error}</p>
              <p className="text-muted-foreground text-sm">Please try refreshing the page.</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg mb-2">
                No users found.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {users.map((user, index) => (
                <div
                  key={user._id}
                  style={{ animationDelay: `${index * 50}ms` }}
                  className="animate-in fade-in slide-in-from-left-4"
                >
                  <UserSummary user={user} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserList;
