import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import Starfield from './Starfield';
import { ToastContainer } from 'react-toastify';

interface AppLayoutProps {
  auth: any;
  onLogout: () => void;
}

function AppLayout({ auth, onLogout }: AppLayoutProps) {
  return (
    <div className="App min-h-screen flex flex-col">
      <Starfield />
      <Navbar auth={auth} onLogout={onLogout} />
      <ToastContainer aria-label="toast" />
      <main className="container my-5 flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default AppLayout;

