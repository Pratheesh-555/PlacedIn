import React from 'react';
import { Navigate } from 'react-router-dom';
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-blue-900 mb-4">
              Sign in to Continue
            </h2>
            <p className="text-gray-600">
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
            <p className="text-sm text-gray-500">
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