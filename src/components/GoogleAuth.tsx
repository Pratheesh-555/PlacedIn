import React, { useEffect, useState, useCallback } from 'react';
import { GoogleUser } from '../types';

interface GoogleAuthProps {
  onLogin: (user: GoogleUser) => void;
  onLogout: () => void;
  user: GoogleUser | null;
}

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: unknown) => void;
          renderButton: (element: HTMLElement | null, options: unknown) => void;
          disableAutoSelect: () => void;
          revoke: (email: string, callback: () => void) => void;
        };
      };
    };
  }
}

const GoogleAuth: React.FC<GoogleAuthProps> = ({ onLogin, onLogout, user }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleCredentialResponse = useCallback(async (response: { credential: string }) => {
    setIsLoading(true);
    try {
      // Decode the JWT token to get user info
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      
      const user: GoogleUser = {
        googleId: payload.sub,
        name: payload.name,
        email: payload.email,
        picture: payload.picture
      };

      // Store user in localStorage
      localStorage.setItem('googleUser', JSON.stringify(user));
      onLogin(user);
    } catch (error) {
      console.error('Error handling Google sign-in:', error);
    } finally {
      setIsLoading(false);
    }
  }, [onLogin]);

  useEffect(() => {
    // Load Google OAuth script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      window.google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Disable auto-select to prevent automatic login
      window.google.accounts.id.disableAutoSelect();

      window.google.accounts.id.renderButton(
        document.getElementById('google-signin-button'),
        { 
          theme: 'outline', 
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular',
          width: 250,
          locale: 'en'
        }
      );
    };

    return () => {
      document.head.removeChild(script);
    };
  }, [handleCredentialResponse]);

  const handleLogout = () => {
    // Clear localStorage
    localStorage.removeItem('googleUser');
    
    // Disable auto-select and revoke Google session
    if (window.google) {
      window.google.accounts.id.disableAutoSelect();
      window.google.accounts.id.revoke(user?.email || '', () => {
        // Google session revoked
      });
    }
    
    onLogout();
  };

  if (user) {
    return (
      <div className="flex items-center space-x-4">
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
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{user.name}</span>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center w-full">
      <div 
        id="google-signin-button" 
        className="w-full max-w-xs"
        style={{ minHeight: '40px' }}
      ></div>
      {isLoading && (
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 dark:border-blue-400 ml-2"></div>
      )}
    </div>
  );
};

export default GoogleAuth; 