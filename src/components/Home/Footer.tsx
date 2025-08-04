
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
  const [showTeam, setShowTeam] = useState(false);

  // Team members with their LinkedIn profiles
  const teamMembers = [
    {
      name: "Pratheesh Krishnan",
      role: "Developer",
      linkedin: "https://www.linkedin.com/in/pratheesh-krishnan-30b08a282?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
      avatar: "https://media.licdn.com/dms/image/v2/D5603AQGiNkdeVQY26A/profile-displayphoto-scale_400_400/B56ZhvOVd.HkAg-/0/1754212689852?e=1756944000&v=beta&t=Vdd_6EwpWdQaOS49iIag9yIALtvuP9moBJhsumrKPNM"
    },
    {
      name: "Sai Vaishnavi Poreddy",
      role: "Developer",
      linkedin: "https://www.linkedin.com/in/sai-vaishnavi-poreddy-498680284?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
      avatar: "https://media.licdn.com/dms/image/v2/D5603AQEq_iL7XtM8nw/profile-displayphoto-shrink_400_400/B56ZZwR4OTHsAg-/0/1745640458660?e=1756944000&v=beta&t=WYpk772UsxHoHf2EBvBkwGthXwbV2k1OpNnXYxP1p4Q" // Better placeholder with initials
    }
  ];

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
            © {currentYear} <button 
              className="text-blue-600 hover:text-blue-800 font-semibold transition-colors cursor-pointer underline"
              onClick={() => setShowTeam(true)}
            >
              PlacedIn
            </button>. All rights reserved.
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
              onClick={() => window.open('https://wa.me/918870582663?text=Hi!%20I%20have%20a%20question%20about%20PlacedIn.', '_blank')}
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
                    <li><strong>User Rights:</strong> You can request removal of your data by contacting us at <a href="mailto:pratheeshkrishnan595@gmail.com" className="text-blue-600 underline">our support team</a>.</li>
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

          {/* Modal for Team Members */}
          {showTeam && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 relative">
                <button className="absolute top-2 right-2 text-gray-400 hover:text-blue-600 text-xl" onClick={() => setShowTeam(false)}>&times;</button>
                <div className="text-center">
                  <h2 className="text-xl font-bold mb-4 text-blue-700">Meet Our Team</h2>
                  <p className="text-gray-600 text-sm mb-6">Connect with the developers behind PlacedIn</p>
                  
                  <div className="space-y-4">
                    {teamMembers.map((member, index) => (
                      <div key={index} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-blue-50 transition-colors">
                        <img 
                          src={member.avatar} 
                          alt={member.name}
                          className="w-12 h-12 rounded-full object-cover border-2 border-blue-200"
                        />
                        <div className="flex-1 text-left">
                          <h3 className="font-semibold text-gray-800">{member.name}</h3>
                          <p className="text-sm text-gray-500">{member.role}</p>
                        </div>
                        <button
                          onClick={() => window.open(member.linkedin, '_blank')}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                          </svg>
                          <span>Connect</span>
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-gray-600">
                      💡 Have questions or feedback? Feel free to connect with any of our team members!
                    </p>
                  </div>
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
