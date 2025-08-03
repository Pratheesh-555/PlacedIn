import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, BookOpen, TrendingUp, Users, Building2 } from 'lucide-react';
import Footer from './Footer';
import { GoogleUser } from '../../types';

interface HomeProps {
  user: GoogleUser | null;
}

const Home: React.FC<HomeProps> = ({ user }) => {
  const stats = [
    { icon: Users, label: 'Students', value: 2500, suffix: '+' },
    { icon: Building2, label: 'Companies', value: 150, suffix: '+' },
    { icon: BookOpen, label: 'Experiences', value: 800, suffix: '+' },
    { icon: TrendingUp, label: 'Success Rate', value: 95, suffix: '%' },
  ];

  // Animated values state
  const [animatedStats, setAnimatedStats] = useState(stats.map(() => 0));
  useEffect(() => {
    let raf: number;
    const duration = 1200;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      setAnimatedStats(stats.map((s) => {
        const progress = Math.min(elapsed / duration, 1);
        return Math.floor(progress * s.value);
      }));
      if (elapsed < duration) {
        raf = requestAnimationFrame(animate);
      } else {
        setAnimatedStats(stats.map(s => s.value));
      }
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

          {/* Mobile Sign-in Section (only show on mobile when not signed in) */}
          {!user && (
            <div className="md:hidden mb-8 p-6 bg-white rounded-xl shadow-lg mx-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">
                  Join the Community
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Sign in to share your experiences and connect with fellow students
                </p>
                <div className="flex justify-center">
                  <iframe 
                    src="https://accounts.google.com/gsi/button?theme=outline&size=large&text=signin_with&shape=rectangular&width=250&is_fedcm_supported=true&client_id=751291179547-75l0g05ed5r4h6508mq9p02jiijjglo6.apps.googleusercontent.com&hl=en"
                    className="border-0"
                    allow="identity-credentials-get"
                    title="Sign in with Google Button"
                    style={{
                      display: 'block',
                      position: 'relative',
                      width: '250px',
                      height: '48px',
                      border: '0px'
                    }}
                  />
                </div>
              </div>
            </div>
          )}

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
            {stats.map(({ icon: Icon, label, suffix }, i) => (
              <div key={label} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Icon size={24} className="text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-900 mb-1">
                  <span>{animatedStats[i].toLocaleString()}{suffix}</span>
                </div>
                <div className="text-gray-600 font-medium">{label}</div>
              </div>
            ))}
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

      <Footer />
    </div>
  );
};

export default Home;