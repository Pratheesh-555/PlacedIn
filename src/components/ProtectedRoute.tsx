import React from 'react';
import { GoogleUser } from '../types';
import GoogleAuth from './GoogleAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  user: GoogleUser | null;
  onLogin: (user: GoogleUser) => void;
  onLogout: () => void;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  user, 
  onLogin, 
  onLogout 
}) => {
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 transition-colors duration-300">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-4">
              Sign in to Continue
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Please sign in with your Google account to share your experience
            </p>
          </div>
          
          <div className="flex justify-center">
            <GoogleAuth 
              user={user}
              onLogin={onLogin}
              onLogout={onLogout}
            />
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              We use Google Sign-In to verify your identity and ensure authentic experiences
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute; 