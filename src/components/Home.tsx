import React from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, BookOpen, TrendingUp, Users, Building2 } from 'lucide-react';
import { companies } from '../data/companies';

const Home: React.FC = () => {
  const stats = [
    { icon: Users, label: 'Students', value: '2,500+' },
    { icon: Building2, label: 'Companies', value: '150+' },
    { icon: BookOpen, label: 'Experiences', value: '800+' },
    { icon: TrendingUp, label: 'Success Rate', value: '95%' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-blue-900 mb-6 leading-tight">
              Share Your <span className="text-blue-600">Success Story</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Connect with fellow SASTRA students by sharing your placement and internship experiences. 
              Help others learn from your journey and build a stronger community.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link
              to="/post"
              className="bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center space-x-2"
            >
              <PlusCircle size={24} />
              <span>Share Experience</span>
            </Link>
            <Link
              to="/experiences"
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg border-2 border-blue-600 hover:bg-blue-50 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center space-x-2"
            >
              <BookOpen size={24} />
              <span>Browse Stories</span>
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {stats.map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Icon size={24} className="text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-900 mb-1">{value}</div>
                <div className="text-gray-600 font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Companies Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-blue-900 mb-4">
            Some Proud Employers of SASTRA Graduates
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Our alumni have successfully secured positions at leading companies worldwide
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {companies.slice(0, 24).map((company) => (
              <div 
                key={company.id} 
                className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center mb-2 mx-auto shadow-sm">
                    <img 
                      src={company.logo} 
                      alt={company.name}
                      className="w-12 h-12 object-contain"
                      onError={(e) => {
                        // Fallback to company name if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling!.textContent = company.name.substring(0, 2).toUpperCase();
                      }}
                    />
                    <span className="text-xs font-semibold text-gray-600 hidden"></span>
                  </div>
                  <p className="text-xs text-gray-700 font-medium truncate">{company.name}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <p className="text-gray-500 text-sm">
              And many more companies...
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-blue-900 mb-12">
            Why Share Your Experience?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users size={32} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-blue-900 mb-4">Help Fellow Students</h3>
              <p className="text-gray-600">
                Guide juniors through the placement process with your real experiences and insights.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building2 size={32} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-blue-900 mb-4">Company Insights</h3>
              <p className="text-gray-600">
                Share detailed information about company culture, interview processes, and expectations.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp size={32} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-blue-900 mb-4">Build Your Network</h3>
              <p className="text-gray-600">
                Connect with students and alumni, creating lasting professional relationships.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          {/* Made with love section */}
          <div className="flex items-center justify-center space-x-2 mb-6">
            <span className="text-blue-100 text-lg">Made with</span>
            <div className="w-6 h-6 text-sky-300 animate-pulse">
              ❤️
            </div>
            <span className="text-blue-100 text-lg">by the PlacedIn Team</span>
          </div>

          {/* Copyright section */}
          <div className="text-blue-200 text-base mb-4">
            © 2025 PlacedIn. All rights reserved.
          </div>

          {/* Additional info */}
          <div className="text-blue-300 text-sm max-w-md mx-auto mb-6">
            Empowering students to share their placement and internship experiences 
            to help others succeed in their career journey.
          </div>

          {/* Optional links section */}
          <div className="flex items-center justify-center space-x-6 text-sm text-blue-200">
            <button className="hover:text-white transition-colors">
              Privacy Policy
            </button>
            <span className="text-blue-400">•</span>
            <button className="hover:text-white transition-colors">
              Terms of Service
            </button>
            <span className="text-blue-400">•</span>
            <button className="hover:text-white transition-colors">
              Contact Us
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;