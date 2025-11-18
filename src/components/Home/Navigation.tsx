import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, PlusCircle, BookOpen, Settings, LogOut } from 'lucide-react';
import GoogleAuth from '../GoogleAuth';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import { GoogleUser } from '../../types';
import { ADMIN_CONFIG } from '../../config/adminConfig';

interface NavigationProps {
  user: GoogleUser | null;
  onLogin: (user: GoogleUser) => void;
  onLogout: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ user, onLogin, onLogout }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check admin status whenever user changes
  React.useEffect(() => {
    const checkAdmin = async () => {
      if (user?.email) {
        // First check cache
        const cachedIsAdmin = ADMIN_CONFIG.isAdminEmail(user.email);
        
        if (cachedIsAdmin) {
          setIsAdmin(true);
        } else {
          // If not in cache, check with backend (for newly added admins)
          const result = await ADMIN_CONFIG.checkAdminStatus(user.email);
          setIsAdmin(result.isAdmin);
        }
      } else {
        setIsAdmin(false);
      }
    };
    
    checkAdmin();
  }, [user]);

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    ...(isAdmin ? [] : [{ path: '/post', label: 'Post Experience', icon: PlusCircle }]),
    { path: '/experiences', label: 'Experiences', icon: BookOpen },
  ];

  if (isAdmin) {
    navItems.push({ path: '/admin', label: 'Admin', icon: Settings });
  }

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg z-50 border-b-2 border-blue-600 dark:border-blue-500 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 dark:bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-blue-900 dark:text-blue-100">PlacedIn</h1>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  isActive(path)
                    ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-md'
                    : 'text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400'
                }`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            {user ? (
              <div className="flex items-center space-x-2">
                <img 
                  src={user.picture} 
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border-2 border-blue-100 dark:border-blue-400"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=3b82f6&color=ffffff&size=128`;
                  }}
                />
                <span className="text-sm text-gray-700 dark:text-gray-200 max-w-32 truncate">{user.name}</span>
                <button
                  onClick={onLogout}
                  className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  title="Sign Out"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <GoogleAuth 
                user={user}
                onLogin={onLogin}
                onLogout={onLogout}
              />
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              {/* Always show Google Auth for mobile when not logged in */}
              {!user && (
                <div className="flex-shrink-0">
                  <GoogleAuth 
                    user={user}
                    onLogin={onLogin}
                    onLogout={onLogout}
                  />
                </div>
              )}
              
              {/* Show user info when logged in */}
              {user && (
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <img 
                    src={user.picture} 
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover border-2 border-blue-100 dark:border-blue-400"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=3b82f6&color=ffffff&size=128`;
                    }}
                  />
                  <button
                    onClick={onLogout}
                    className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors p-1"
                    title="Sign Out"
                  >
                    <LogOut size={14} />
                  </button>
                </div>
              )}
              
              {/* Mobile menu toggle button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex-shrink-0 ml-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800">
            <div className="space-y-2">
              {navItems.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                    isActive(path)
                      ? 'bg-blue-600 dark:bg-blue-500 text-white'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon size={20} />
                  <span>{label}</span>
                </Link>
              ))}
              
              {/* Mobile User Section */}
              <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-600">
                {user ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={user.picture} 
                        alt={user.name}
                        className="w-8 h-8 rounded-full object-cover border-2 border-blue-100 dark:border-blue-400"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=3b82f6&color=ffffff&size=128`;
                        }}
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-200">{user.name}</span>
                    </div>
                    <button
                      onClick={() => {
                        onLogout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      <LogOut size={18} />
                    </button>
                  </div>
                ) : (
                  
                  <div className="text-center text-gray-500 dark:text-gray-400 text-sm">
                    Please sign in using the button above to access more features
                  </div>
                  
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;