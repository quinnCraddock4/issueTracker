import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface RegisterFormProps {
  onRegister: (email: string, password: string, givenName: string, familyName: string) => void;
  onNavigateToLogin: () => void;
}

const RegisterForm = ({ onRegister, onNavigateToLogin }: RegisterFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [givenName, setGivenName] = useState('');
  const [familyName, setFamilyName] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (email && password && givenName && familyName) {
      onRegister(email, password, givenName, familyName);
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
              required
              className="transition-all focus:scale-[1.02] focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-semibold">Password *</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password (min 6 characters)"
              required
              minLength={6}
              className="transition-all focus:scale-[1.02] focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="givenName" className="text-sm font-semibold">Given Name *</Label>
            <Input
              id="givenName"
              type="text"
              value={givenName}
              onChange={(e) => setGivenName(e.target.value)}
              placeholder="Enter your given name"
              required
              className="transition-all focus:scale-[1.02] focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="familyName" className="text-sm font-semibold">Family Name *</Label>
            <Input
              id="familyName"
              type="text"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              placeholder="Enter your family name"
              required
              className="transition-all focus:scale-[1.02] focus:ring-2 focus:ring-primary"
            />
          </div>
          <Button type="submit" className="w-full text-base font-semibold h-11 hover:scale-105 transition-transform shadow-lg hover:shadow-xl">
            Submit
          </Button>
          <div className="text-center text-sm">
            <Button
              type="button"
              variant="link"
              onClick={onNavigateToLogin}
              className="p-0"
            >
              Already have an account? Login here
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default RegisterForm;

