import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AppLayout from './components/AppLayout';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import BugList from './components/BugList';
import BugEditor from './components/BugEditor';
import ReportBug from './components/ReportBug';
import UserList from './components/UserList';
import UserEditor from './components/UserEditor';
import NotFound from './components/NotFound';

// Use relative path in development (via Vite proxy) or env variable in production
const API_URL = import.meta.env.VITE_API_URL || '/api';

// Configure axios to send cookies with all requests
axios.defaults.withCredentials = true;

function showError(message: string) {
  toast(message, { type: 'error', position: 'bottom-right' });
}

function showSuccess(message: string) {
  toast(message, { type: 'success', position: 'bottom-right' });
}

function App() {
  // Set dark mode as default on mount
  useEffect(() => {
    const root = document.documentElement;
    if (!localStorage.getItem('theme')) {
      root.classList.add('dark');
    }
  }, []);

  const [auth, setAuth] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Check for existing session on app load
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await axios.get(`${API_URL}/users/me`, {
          withCredentials: true
        });
        
        // Session exists, restore auth state
        setAuth({
          email: response.data.email,
          userId: response.data._id,
          role: response.data.role || [],
          authenticated: true
        });
      } catch (err) {
        // No valid session, user needs to login
        setAuth(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const onLogin = (authData: any) => {
    setAuth(authData);
    navigate('/bug/list');
  };

  const onLogout = async () => {
    try {
      await axios.post(`${API_URL}/auth/sign-out`, {}, {
        withCredentials: true
      });
    } catch (err) {
      // Ignore errors on logout
    }
    setAuth(null);
    navigate('/login');
  };

  // Show loading state while checking session
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route element={<AppLayout auth={auth} onLogout={onLogout} />}>
        <Route 
          path="/login" 
          element={
            <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-4 relative z-10">
              <LoginForm onLogin={onLogin} showError={showError} />
            </div>
          } 
        />
        <Route 
          path="/register" 
          element={
            <div className="min-h-[calc(100vh-200px)] flex items-center justify-center p-4 relative z-10">
              <RegisterForm onLogin={onLogin} showError={showError} />
            </div>
          } 
        />
        <Route 
          path="/bug/report" 
          element={
            <div className="max-w-4xl mx-auto">
              <ReportBug auth={auth} showError={showError} showSuccess={showSuccess} />
            </div>
          } 
        />
        <Route 
          path="/bug/list" 
          element={
            <div className="max-w-4xl mx-auto">
              <BugList auth={auth} showError={showError} showSuccess={showSuccess} />
            </div>
          } 
        />
        <Route 
          path="/bug/:bugId" 
          element={
            <div className="max-w-4xl mx-auto">
              <BugEditor auth={auth} showError={showError} showSuccess={showSuccess} />
            </div>
          } 
        />
        <Route 
          path="/user/list" 
          element={
            <div className="max-w-4xl mx-auto">
              <UserList auth={auth} showError={showError} showSuccess={showSuccess} />
            </div>
          } 
        />
        <Route 
          path="/user/:userId" 
          element={
            <div className="max-w-4xl mx-auto">
              <UserEditor auth={auth} showError={showError} showSuccess={showSuccess} />
            </div>
          } 
        />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
