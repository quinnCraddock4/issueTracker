import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import ThemeComponent from './ThemeComponent';

interface LoginProps {
  username: string;
  setUsername: Function;
}

const LoginPage = (props: LoginProps) => {
  const navigate = useNavigate();
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    try {
      const response = await fetch('http://localhost:3000/api/auth/sign-in/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies in the request
        body: JSON.stringify({
          email: username,
          password,
        }),
      });
      
      const data = await response.json();
      
      if (response.status === 200) {
        props.setUsername(username);
        navigate('/home');
      } else {
        setAlertMessage(data.message || 'Bad Request');
        setAlertVisible(true);
        setTimeout(() => {
          setAlertVisible(false);
        }, 3000);
      }
    } catch (error) {
      setAlertMessage('Network error. Please try again.');
      setAlertVisible(true);
      setTimeout(() => {
        setAlertVisible(false);
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-default">
      {alertVisible && (
        <div className="alert alert-error z-40">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{alertMessage}</span>
        </div>
      )}
      <div className="relative flex flex-col items-center justify-center h-screen overflow-hidden">
        <Card className="w-full p-6 bg-accent rounded-md shadow-lg border-top lg:max-w-lg z-50">
          <CardHeader className="space-y-1">
            <div className="flex justify-between items-center">
              <CardTitle className="text-3xl font-semibold text-center">Login</CardTitle>
              <ThemeComponent />
            </div>
            <CardDescription>
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Enter your username"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  required
                />
              </div>
              <div className="text-right">
                <Button variant="link" type="button" className="text-xs p-0 h-auto">
                  Forgot Password?
                </Button>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => navigate('/signup')}
              >
                Don't have an account? Sign up
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      {/* Glowing background effects */}
      <div className="glowing">
        <span style={{ '--i': '1' } as React.CSSProperties}></span>
        <span style={{ '--i': '2' } as React.CSSProperties}></span>
        <span style={{ '--i': '3' } as React.CSSProperties}></span>
      </div>
      <div className="glowing">
        <span style={{ '--i': '1' } as React.CSSProperties}></span>
        <span style={{ '--i': '2' } as React.CSSProperties}></span>
        <span style={{ '--i': '3' } as React.CSSProperties}></span>
      </div>
      <div className="glowing">
        <span style={{ '--i': '1' } as React.CSSProperties}></span>
        <span style={{ '--i': '2' } as React.CSSProperties}></span>
        <span style={{ '--i': '3' } as React.CSSProperties}></span>
      </div>
      <div className="glowing">
        <span style={{ '--i': '1' } as React.CSSProperties}></span>
        <span style={{ '--i': '2' } as React.CSSProperties}></span>
        <span style={{ '--i': '3' } as React.CSSProperties}></span>
      </div>
      <div className="glowing">
        <span style={{ '--i': '1' } as React.CSSProperties}></span>
        <span style={{ '--i': '2' } as React.CSSProperties}></span>
        <span style={{ '--i': '3' } as React.CSSProperties}></span>
      </div>
      <div className="glowing">
        <span style={{ '--i': '1' } as React.CSSProperties}></span>
        <span style={{ '--i': '2' } as React.CSSProperties}></span>
        <span style={{ '--i': '3' } as React.CSSProperties}></span>
      </div>
    </div>
  );
};

export default LoginPage;
