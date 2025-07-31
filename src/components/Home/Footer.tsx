import React from 'react';
import { Heart } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200 py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Made with love section */}
          <div className="flex items-center justify-center space-x-2 mb-4">
            <span className="text-gray-600 text-sm">Made with</span>
            <Heart 
              size={16} 
              className="text-sky-400 fill-sky-400 animate-pulse" 
              aria-label="love"
            />
            <span className="text-gray-600 text-sm">by the PlacedIn Team</span>
          </div>

          {/* Copyright section */}
          <div className="text-gray-500 text-sm mb-4">
            © {currentYear} PlacedIn. All rights reserved.
          </div>

          {/* Additional info */}
          <div className="text-gray-400 text-xs max-w-md mx-auto">
            Empowering students to share their placement and internship experiences 
            to help others succeed in their career journey.
          </div>

          {/* Optional links section */}
          <div className="flex items-center justify-center space-x-6 mt-6 text-xs text-gray-500">
            <button className="hover:text-blue-600 transition-colors">
              Privacy Policy
            </button>
            <span className="text-gray-300">•</span>
            <button className="hover:text-blue-600 transition-colors">
              Terms of Service
            </button>
            <span className="text-gray-300">•</span>
            <button className="hover:text-blue-600 transition-colors">
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
