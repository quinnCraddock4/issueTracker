import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

interface LoginFormProps {
  onLogin: (email: string, password: string) => void;
  onNavigateToRegister: () => void;
}

const LoginForm = ({ onLogin, onNavigateToRegister }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (email && password) {
      onLogin(email, password);
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
              required
              className="transition-all focus:scale-[1.02] focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-semibold">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="transition-all focus:scale-[1.02] focus:ring-2 focus:ring-primary"
            />
          </div>
          <Button type="submit" className="w-full text-base font-semibold h-11 hover:scale-105 transition-transform shadow-lg hover:shadow-xl">
            Submit
          </Button>
          <div className="text-center text-sm pt-2">
            <Button
              type="button"
              variant="link"
              onClick={onNavigateToRegister}
              className="p-0 hover:underline hover:text-primary transition-colors"
            >
              Don't have an account? Register here
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default LoginForm;

