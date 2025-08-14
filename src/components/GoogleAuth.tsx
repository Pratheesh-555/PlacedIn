import React, { useEffect, useState, useCallback } from 'react';
import { GoogleUser } from '../types';
import { useTheme } from '../hooks/useTheme';

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
  const { theme } = useTheme();

  const handleCredentialResponse = useCallback(async (response: { credential: string }) => {
    setIsLoading(true);
    
    try {
      // Decode the JWT token to get user info
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      
      // Validate SASTRA email domain
      if (!payload.email?.toLowerCase().endsWith('@sastra.ac.in')) {
        setIsLoading(false);
        return;
      }
      
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
      console.error('Error processing authentication:', error);
    } finally {
      setIsLoading(false);
    }
  }, [onLogin]);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    
    if (!clientId) {
      console.error('Google Client ID not configured');
      return;
    }

    const renderGoogleButton = () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
          });

          window.google.accounts.id.disableAutoSelect();

          // Clear the button container first
          const buttonContainer = document.getElementById('google-signin-button');
          if (buttonContainer) {
            buttonContainer.innerHTML = '';
            
            window.google.accounts.id.renderButton(
              buttonContainer,
              { 
                theme: theme === 'dark' ? 'filled_black' : 'outline', 
                size: 'large',
                text: 'signin_with',
                shape: 'rectangular',
                width: 250,
                locale: 'en'
              }
            );
          }
        } catch (error) {
          console.error('Google OAuth rendering failed:', error);
        }
      }
    };

    // Check if Google script is already loaded
    if (window.google?.accounts?.id) {
      renderGoogleButton();
    } else {
      // Load Google OAuth script if not already loaded
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (!existingScript) {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);

        script.onload = renderGoogleButton;
        script.onerror = () => {
          console.error('Failed to load Google OAuth script');
        };
      } else {
        // Script exists but might not be loaded yet
        const checkGoogle = setInterval(() => {
          if (window.google?.accounts?.id) {
            clearInterval(checkGoogle);
            renderGoogleButton();
          }
        }, 100);

        // Clear interval after 10 seconds to avoid infinite checking
        setTimeout(() => clearInterval(checkGoogle), 10000);
      }
    }

    return () => {
      // Clean up the button when component unmounts or theme changes
      const buttonContainer = document.getElementById('google-signin-button');
      if (buttonContainer) {
        buttonContainer.innerHTML = '';
      }
    };
  }, [handleCredentialResponse, theme]);

  const handleLogout = () => {
    localStorage.removeItem('googleUser');
    
    if (window.google && user?.email) {
      window.google.accounts.id.disableAutoSelect();
      window.google.accounts.id.revoke(user.email, () => {
        // Google session revoked successfully
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
    <div className="flex flex-col items-center justify-center w-full">
      <div 
        id="google-signin-button" 
        className="flex justify-center"
      ></div>
      
      {isLoading && (
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 dark:border-blue-400 mt-4"></div>
      )}
    </div>
  );
};

export default GoogleAuth;