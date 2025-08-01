
import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

// AnimatedHeart component
const AnimatedHeart = () => {
  const [color, setColor] = useState('sky');
  const [scale, setScale] = useState(false);
  // Animate color every 1s
  useEffect(() => {
    const interval = setInterval(() => {
      setColor((c) => (c === 'sky' ? 'red' : 'sky'));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle scale on click
  const handleClick = () => {
    setScale(true);
    setTimeout(() => setScale(false), 300);
  };

  return (
    <span className="relative inline-block cursor-pointer" onClick={handleClick}>
      <Heart
        size={20}
        className={`transition-colors duration-700 ${color === 'sky' ? 'text-sky-400 fill-sky-400' : 'text-red-400 fill-red-400'} transition-transform ${scale ? 'scale-150' : 'scale-100'}`}
        aria-label="love"
      />
    </span>
  );
};

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  return (
    <footer className="bg-blue-100 border-t border-blue-200 py-4 mt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          {/* Made with love section */}

          <div className="flex items-center justify-center space-x-2 mb-2 relative select-none">
            <span className="text-gray-600 text-sm">Made with</span>
            <AnimatedHeart />
            <span className="text-gray-600 text-sm">by the PlacedIn Team</span>
          </div>

          {/* Copyright section */}
          <div className="text-gray-500 text-sm mb-3">
            © {currentYear} PlacedIn. All rights reserved.
          </div>

          {/* Additional info */}
          <div className="text-gray-400 text-xs max-w-md mx-auto">
            Empowering students to share their placement and internship experiences 
            to help others succeed in their career journey.
          </div>

          {/* Optional links section */}
          <div className="flex items-center justify-center space-x-6 mt-3 text-xs text-blue-700">
            <button className="hover:text-blue-900 font-semibold transition-colors" onClick={() => setShowPrivacy(true)}>
              Privacy Policy
            </button>
            <span className="text-blue-300">•</span>
            <button className="hover:text-blue-900 font-semibold transition-colors" onClick={() => setShowTerms(true)}>
              Terms of Service
            </button>
            <span className="text-blue-300">•</span>
            <button
              className="hover:text-blue-900 font-semibold transition-colors"
              onClick={() => window.open('https://wa.me/8870582663?text=Hi!%20I%20have%20a%20question%20about%20PlacedIn.', '_blank')}
            >
              Contact Us
            </button>
          </div>
          {/* Modal for Privacy Policy */}
          {showPrivacy && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
                <button className="absolute top-2 right-2 text-gray-400 hover:text-blue-600 text-xl" onClick={() => setShowPrivacy(false)}>&times;</button>
                <div className="overflow-y-auto max-h-[70vh] text-left">
                  <h2 className="text-xl font-bold mb-2 text-blue-700">Privacy Policy</h2>
                  <p className="mb-2">PlacedIn is committed to protecting your privacy. This policy outlines how we collect, use, and safeguard your information.</p>
                  <ul className="list-disc pl-5 mb-4 text-sm">
                    <li><strong>Data Collected:</strong> We collect your name, email, and uploaded experience files (PDF format).</li>
                    <li><strong>Usage:</strong> Your data is only used for reviewing and displaying authentic placement experiences.</li>
                    <li><strong>Storage:</strong> All information is securely stored in our cloud database and is not shared with third parties.</li>
                    <li><strong>Security:</strong> Passwords are encrypted, and sensitive files are handled securely.</li>
                    <li><strong>Third-party Services:</strong> We use services like Render, Netlify, and MongoDB for hosting and storage.</li>
                    <li><strong>User Rights:</strong> You can request removal of your data by contacting us at <a href="mailto:admin@placedin.in" className="text-blue-600 underline">admin@placedin.in</a>.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Modal for Terms of Service */}
          {showTerms && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative">
                <button className="absolute top-2 right-2 text-gray-400 hover:text-blue-600 text-xl" onClick={() => setShowTerms(false)}>&times;</button>
                <div className="overflow-y-auto max-h-[70vh] text-left">
                  <h2 className="text-xl font-bold mb-2 text-blue-700">Terms of Service</h2>
                  <p className="mb-2">By accessing or using PlacedIn, you agree to the following terms:</p>
                  <ul className="list-disc pl-5 mb-4 text-sm">
                    <li><strong>Usage:</strong> Users must submit only genuine, personally experienced placement stories.</li>
                    <li><strong>Accuracy:</strong> You are responsible for the truthfulness of any information you submit.</li>
                    <li><strong>Moderation:</strong> Admins reserve the right to approve, reject, or remove any submission.</li>
                    <li><strong>Content Policy:</strong> Any offensive, plagiarized, or inappropriate content will result in removal.</li>
                    <li><strong>Policy Updates:</strong> Terms may change in the future; continued use implies acceptance of any changes.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
