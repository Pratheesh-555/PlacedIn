import React, { useEffect, useState } from 'react';
import { GoogleUser } from '../types';

interface GoogleAuthProps {
  onLogin: (user: GoogleUser) => void;
  onLogout: () => void;
  user: GoogleUser | null;
}

declare global {
  interface Window {
    google: any;
  }
}

const GoogleAuth: React.FC<GoogleAuthProps> = ({ onLogin, onLogout, user }) => {
  const [isLoading, setIsLoading] = useState(false);

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

      window.google.accounts.id.renderButton(
        document.getElementById('google-signin-button'),
        { 
          theme: 'outline', 
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular'
        }
      );
    };

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleCredentialResponse = async (response: any) => {
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
  };

  const handleLogout = () => {
    localStorage.removeItem('googleUser');
    onLogout();
    if (window.google) {
      window.google.accounts.id.disableAutoSelect();
    }
  };

  if (user) {
    return (
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <img 
            src={user.picture} 
            alt={user.name}
            className="w-8 h-8 rounded-full"
          />
          <span className="text-sm font-medium text-gray-700">{user.name}</span>
        </div>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <div id="google-signin-button"></div>
      {isLoading && (
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      )}
    </div>
  );
};

export default GoogleAuth; 