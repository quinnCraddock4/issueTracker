import { useState } from 'react';
import { NavLink } from 'react-router-dom';

interface NavbarProps {
  auth: any;
  onLogout: () => void;
}

function Navbar({ auth, onLogout }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  function onClickLogout(evt: React.MouseEvent<HTMLAnchorElement>) {
    evt.preventDefault();
    onLogout();
    setIsMobileMenuOpen(false);
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Get user roles from auth object
  const userRoles = Array.isArray(auth?.role) ? auth.role : (auth?.role ? [auth.role] : []);
  const hasAdminRole = userRoles.includes('Technical Manager') || userRoles.includes('Product Manager');
  const hasUserManagementAccess = hasAdminRole || userRoles.includes('Business Analyst');

  return (
    <nav className="bg-gray-900 text-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <NavLink className="text-xl font-bold" to="/">
            Issue Tracker
          </NavLink>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {!auth && (
              <>
                <NavLink 
                  className="px-3 py-2 rounded hover:bg-gray-800 transition-colors" 
                  to="/login"
                >
                  Login
                </NavLink>
                <NavLink 
                  className="px-3 py-2 rounded hover:bg-gray-800 transition-colors" 
                  to="/register"
                >
                  Register
                </NavLink>
              </>
            )}
            {auth && (
              <>
                <NavLink 
                  className="px-3 py-2 rounded hover:bg-gray-800 transition-colors" 
                  to="/bug/list"
                >
                  Bugs
                </NavLink>
                <NavLink 
                  className="px-3 py-2 rounded hover:bg-gray-800 transition-colors" 
                  to="/bug/report"
                >
                  Report Bug
                </NavLink>
                {hasUserManagementAccess && (
                  <NavLink 
                    className="px-3 py-2 rounded hover:bg-gray-800 transition-colors" 
                    to="/user/list"
                  >
                    Users
                  </NavLink>
                )}
                <NavLink 
                  className="px-3 py-2 rounded hover:bg-gray-800 transition-colors" 
                  to="/login" 
                  onClick={onClickLogout}
                >
                  Logout
                </NavLink>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded hover:bg-gray-800 transition-colors"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-700">
            <div className="flex flex-col space-y-2">
              {!auth && (
                <>
                  <NavLink
                    className="px-3 py-2 rounded hover:bg-gray-800 transition-colors"
                    to="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </NavLink>
                  <NavLink
                    className="px-3 py-2 rounded hover:bg-gray-800 transition-colors"
                    to="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Register
                  </NavLink>
                </>
              )}
              {auth && (
                <>
                  <NavLink
                    className="px-3 py-2 rounded hover:bg-gray-800 transition-colors"
                    to="/bug/list"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Bugs
                  </NavLink>
                  <NavLink
                    className="px-3 py-2 rounded hover:bg-gray-800 transition-colors"
                    to="/bug/report"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Report Bug
                  </NavLink>
                  {hasUserManagementAccess && (
                    <NavLink
                      className="px-3 py-2 rounded hover:bg-gray-800 transition-colors"
                      to="/user/list"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Users
                    </NavLink>
                  )}
                  <NavLink
                    className="px-3 py-2 rounded hover:bg-gray-800 transition-colors"
                    to="/login"
                    onClick={onClickLogout}
                  >
                    Logout
                  </NavLink>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
