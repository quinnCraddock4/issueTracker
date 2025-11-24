import { useState, useEffect } from 'react';
import type { User } from './UserSummary';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface UserEditorProps {
  user?: User;
  onSave: (user: User) => void;
  onCancel: () => void;
}

const ROLE_OPTIONS = [
  'Developer',
  'Business Analyst',
  'Quality Analyst',
  'Product Manager',
  'Technical Manager',
];

const UserEditor = ({ user, onSave, onCancel }: UserEditorProps) => {
  const [email, setEmail] = useState('');
  const [givenName, setGivenName] = useState('');
  const [familyName, setFamilyName] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      setEmail(user.email || '');
      setGivenName(user.givenName || '');
      setFamilyName(user.familyName || '');
      setFullName(user.fullName || '');
      setSelectedRoles(user.role || []);
    } else {
      setEmail('');
      setGivenName('');
      setFamilyName('');
      setFullName('');
      setSelectedRoles([]);
    }
  }, [user]);

  const handleRoleToggle = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role)
        ? prev.filter((r) => r !== role)
        : [...prev, role]
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (email && givenName && familyName) {
      const userData: User = {
        ...user,
        email,
        givenName,
        familyName,
        fullName: fullName || undefined,
        role: selectedRoles.length > 0 ? selectedRoles : undefined,
      };
      onSave(userData);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>{user ? 'Edit User' : 'New User'}</CardTitle>
        <CardDescription>
          {user ? 'Update user information' : 'Create a new user'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="givenName">Given Name *</Label>
            <Input
              id="givenName"
              type="text"
              value={givenName}
              onChange={(e) => setGivenName(e.target.value)}
              placeholder="Enter given name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="familyName">Family Name *</Label>
            <Input
              id="familyName"
              type="text"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              placeholder="Enter family name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter full name (optional)"
            />
          </div>
          <div className="space-y-2">
            <Label>Roles</Label>
            <div className="flex flex-wrap gap-2">
              {ROLE_OPTIONS.map((role) => (
                <label
                  key={role}
                  className="flex items-center space-x-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedRoles.includes(role)}
                    onChange={() => handleRoleToggle(role)}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">{role}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit">Save</Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default UserEditor;

