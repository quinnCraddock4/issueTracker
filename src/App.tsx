import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import BugList from './components/BugList';
import BugEditor from './components/BugEditor';
import UserList from './components/UserList';
import UserEditor from './components/UserEditor';
import ThemeToggle from './components/theme-toggle';
import Starfield from './components/Starfield';
import type { Bug } from './components/BugSummary';
import type { User } from './components/UserSummary';

function App() {
  // Set dark mode as default on mount
  useEffect(() => {
    const root = document.documentElement;
    if (!localStorage.getItem('theme')) {
      root.classList.add('dark');
    }
  }, []);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<string>('');
  const [bugs, setBugs] = useState<Bug[]>([
    {
      _id: '1',
      title: 'Sample Bug 1',
      description: 'This is a sample bug description',
      stepsToReproduce: 'Step 1: Do something\nStep 2: Do something else',
      status: 'open',
      classification: 'bug',
      closed: false,
      createdOn: new Date(),
    },
    {
      _id: '2',
      title: 'Sample Bug 2',
      description: 'Another sample bug description',
      stepsToReproduce: 'Step 1: Do something\nStep 2: Do something else',
      status: 'open',
      classification: 'feature',
      closed: false,
      createdOn: new Date(),
    },
  ]);
  const [users, setUsers] = useState<User[]>([
    {
      _id: '1',
      email: 'user1@example.com',
      givenName: 'John',
      familyName: 'Doe',
      fullName: 'John Doe',
      role: ['Developer'],
      createdOn: new Date(),
    },
    {
      _id: '2',
      email: 'user2@example.com',
      givenName: 'Jane',
      familyName: 'Smith',
      fullName: 'Jane Smith',
      role: ['Business Analyst', 'Product Manager'],
      createdOn: new Date(),
    },
  ]);
  const [editingBug, setEditingBug] = useState<Bug | undefined>(undefined);
  const [editingUser, setEditingUser] = useState<User | undefined>(undefined);

  const handleLogin = (email: string, password: string) => {
    // For now, just set authenticated state
    // In the future, this will call the API
    console.log('Login attempt:', email, password);
    setIsAuthenticated(true);
    setCurrentUser(email);
  };

  const handleRegister = (email: string, password: string, givenName: string, familyName: string) => {
    // For now, just set authenticated state
    // In the future, this will call the API
    console.log('Register attempt:', email, password, givenName, familyName);
    setIsAuthenticated(true);
    setCurrentUser(email);
  };

  const handleBugSave = (bug: Bug) => {
    if (bug._id) {
      // Update existing bug
      setBugs(bugs.map(b => b._id === bug._id ? bug : b));
    } else {
      // Create new bug
      const newBug = { ...bug, _id: Date.now().toString() };
      setBugs([...bugs, newBug]);
    }
    setEditingBug(undefined);
  };

  const handleUserSave = (user: User) => {
    if (user._id) {
      // Update existing user
      setUsers(users.map(u => u._id === user._id ? user : u));
    } else {
      // Create new user
      const newUser = { ...user, _id: Date.now().toString() };
      setUsers([...users, newUser]);
    }
    setEditingUser(undefined);
  };

  const LoginPage = () => {
    const navigate = useNavigate();
    const handleLoginWithRedirect = (email: string, password: string) => {
      handleLogin(email, password);
      navigate('/bugs');
    };
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
        <div className="absolute top-4 right-4 z-20">
          <ThemeToggle />
        </div>
        <div className="relative z-10 w-full flex justify-center">
          <LoginForm
            onLogin={handleLoginWithRedirect}
            onNavigateToRegister={() => navigate('/register')}
          />
        </div>
      </div>
    );
  };

  const RegisterPage = () => {
    const navigate = useNavigate();
    const handleRegisterWithRedirect = (email: string, password: string, givenName: string, familyName: string) => {
      handleRegister(email, password, givenName, familyName);
      navigate('/bugs');
    };
    return (
      <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
        <div className="absolute top-4 right-4 z-20">
          <ThemeToggle />
        </div>
        <div className="relative z-10 w-full flex justify-center">
          <RegisterForm
            onRegister={handleRegisterWithRedirect}
            onNavigateToLogin={() => navigate('/login')}
          />
        </div>
      </div>
    );
  };

  const BugListPage = () => {
    const navigate = useNavigate();
    
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    if (editingBug !== undefined) {
      return (
        <div className="min-h-screen p-4 relative z-10">
          <div className="relative z-10">
            <BugEditor
              bug={editingBug}
              onSave={handleBugSave}
              onCancel={() => setEditingBug(undefined)}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen p-4 relative z-10">
        <div className="max-w-4xl mx-auto space-y-4 relative z-10">
          <div className="flex justify-between items-center pb-2">
            <h1 className="text-4xl font-bold">
              BugTracker
            </h1>
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <button
                onClick={() => navigate('/users')}
                className="px-5 py-2.5 border-2 border-input rounded-lg hover:bg-accent hover:text-accent-foreground hover:scale-105 transition-all font-semibold shadow-sm hover:shadow-md"
              >
                Users
              </button>
              <button
                onClick={() => {
                  setIsAuthenticated(false);
                  navigate('/login');
                }}
                className="px-5 py-2.5 border-2 border-input rounded-lg hover:bg-accent hover:text-accent-foreground hover:scale-105 transition-all font-semibold shadow-sm hover:shadow-md"
              >
                Logout
              </button>
            </div>
          </div>
          <BugList bugs={bugs} onOpenEditor={(bug) => setEditingBug(bug)} />
        </div>
      </div>
    );
  };

  const UserListPage = () => {
    const navigate = useNavigate();
    
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    if (editingUser !== undefined) {
      return (
        <div className="min-h-screen p-4 relative z-10">
          <div className="relative z-10">
            <UserEditor
              user={editingUser}
              onSave={handleUserSave}
              onCancel={() => setEditingUser(undefined)}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen p-4 relative z-10">
        <div className="max-w-4xl mx-auto space-y-4 relative z-10">
          <div className="flex justify-between items-center pb-2">
            <h1 className="text-4xl font-bold">
              User Management
            </h1>
            <div className="flex items-center space-x-3">
              <ThemeToggle />
              <button
                onClick={() => navigate('/bugs')}
                className="px-5 py-2.5 border-2 border-input rounded-lg hover:bg-accent hover:text-accent-foreground hover:scale-105 transition-all font-semibold shadow-sm hover:shadow-md"
              >
                Bugs
              </button>
              <button
                onClick={() => {
                  setIsAuthenticated(false);
                  navigate('/login');
                }}
                className="px-5 py-2.5 border-2 border-input rounded-lg hover:bg-accent hover:text-accent-foreground hover:scale-105 transition-all font-semibold shadow-sm hover:shadow-md"
              >
                Logout
              </button>
            </div>
          </div>
          <UserList users={users} onOpenEditor={(user) => setEditingUser(user)} />
        </div>
      </div>
    );
  };

  return (
    <Router>
      <Starfield />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/bugs" element={<BugListPage />} />
        <Route path="/users" element={<UserListPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
