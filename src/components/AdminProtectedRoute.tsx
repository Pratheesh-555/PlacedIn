import React from 'react';
import { GoogleUser } from '../types';
import GoogleAuth from './GoogleAuth';
import { AlertCircle, Shield } from 'lucide-react';
import { isUserAdmin } from '../utils/adminUtils';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
  user: GoogleUser | null;
  onLogin: (user: GoogleUser) => void;
  onLogout: () => void;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ 
  children, 
  user, 
  onLogin, 
  onLogout 
}) => {
  // Check if user is logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield size={32} className="text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-red-900 mb-4">
              Admin Access Required
            </h2>
            <p className="text-gray-600">
              Please sign in with an authorized admin account to access the admin panel
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
              Only authorized administrators can access this area
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Check if the logged-in user is an admin
  const isAdmin = isUserAdmin(user);
  
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={32} className="text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-red-900 mb-4">
              Access Denied
            </h2>
            <p className="text-gray-600 mb-4">
              You don't have permission to access the admin panel.
            </p>
            <div className="bg-gray-100 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600">
                Signed in as: <span className="font-medium">{user.email}</span>
              </p>
            </div>
            <p className="text-sm text-gray-500">
              Contact the system administrator if you believe this is an error.
            </p>
          </div>
          
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  // User is logged in and is an admin
  return <>{children}</>;
};

export default AdminProtectedRoute;
