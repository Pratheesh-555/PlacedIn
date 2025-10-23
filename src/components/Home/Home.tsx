import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, BookOpen, TrendingUp, Users, Building2 } from 'lucide-react';
import Footer from './Footer';
import RecentUpdates from './RecentUpdates';

// Constants moved outside component to avoid recreation on each render
const STATS = [
  { icon: Users, label: 'Students', value: 2500, suffix: '+' },
  { icon: Building2, label: 'Companies', value: 150, suffix: '+' },
  { icon: BookOpen, label: 'Experiences', value: 800, suffix: '+' },
  { icon: TrendingUp, label: 'Success Rate', value: 95, suffix: '%' },
];

const Home: React.FC = () => {
  // Animated values state
  const [animatedStats, setAnimatedStats] = useState(STATS.map(() => 0));
  const [cardsVisible, setCardsVisible] = useState(false);
  
  useEffect(() => {
    let raf: number;
    const duration = 1200;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const newValues = STATS.map((stat) => {
        const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease-out cubic
        return Math.floor(stat.value * easeProgress);
      });

      setAnimatedStats(newValues);

      if (progress < 1) {
        raf = requestAnimationFrame(animate);
      }
    };

    const timer = setTimeout(() => {
      animate();
    }, 500);

    return () => {
      clearTimeout(timer);
      if (raf) {
        cancelAnimationFrame(raf);
      }
    };
  }, []);

  // Intersection Observer for card animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.target.id === 'features-section') {
            setCardsVisible(true);
          }
        });
      },
      { threshold: 0.3 } // Trigger when 30% of the section is visible
    );

    const featuresSection = document.getElementById('features-section');
    if (featuresSection) {
      observer.observe(featuresSection);
    }

    return () => {
      if (featuresSection) {
        observer.unobserve(featuresSection);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-blue-900 dark:text-blue-100 mb-6 leading-tight">
              Share Your <span className="text-blue-600 dark:text-blue-400">Success Story</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Connect with fellow SASTRA students by sharing your placement and internship experiences. 
              Help others learn from your journey and build a stronger community.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link
              to="/post"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl font-semibold text-lg transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
            >
              <PlusCircle size={24} />
              <span>Share Experience</span>
            </Link>
            <Link
              to="/experiences"
              className="bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 px-8 py-4 rounded-xl font-semibold text-lg border-2 border-blue-600 dark:border-blue-400 hover:bg-blue-50 dark:hover:bg-gray-700 transform hover:scale-105 transition-all duration-200 shadow-lg flex items-center space-x-2"
            >
              <BookOpen size={24} />
              <span>Browse Stories</span>
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {STATS.map(({ icon: Icon, label, suffix }, i) => (
              <div key={label} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Icon size={24} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-1">
                  <span>{animatedStats[i].toLocaleString()}{suffix}</span>
                </div>
                <div className="text-gray-600 dark:text-gray-300 font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features-section" className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-blue-900 dark:text-blue-100 mb-12">
            Why Share Your Experience?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className={`text-center transform transition-all duration-700 ease-out ${
              cardsVisible 
                ? 'translate-x-0 opacity-100' 
                : '-translate-x-full opacity-0'
            }`} style={{ transitionDelay: '0ms' }}>
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users size={32} className="text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-4">Help Fellow Students</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Guide juniors through the placement process with your real experiences and insights.
              </p>
            </div>
            
            <div className={`text-center transform transition-all duration-700 ease-out ${
              cardsVisible 
                ? 'translate-y-0 opacity-100' 
                : 'translate-y-full opacity-0'
            }`} style={{ transitionDelay: '200ms' }}>
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building2 size={32} className="text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-4">Company Insights</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Share detailed information about company culture, interview processes, and expectations.
              </p>
            </div>
            
            <div className={`text-center transform transition-all duration-700 ease-out ${
              cardsVisible 
                ? 'translate-x-0 opacity-100' 
                : 'translate-x-full opacity-0'
            }`} style={{ transitionDelay: '400ms' }}>
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp size={32} className="text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-4">Build Your Network</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Connect with students and alumni, creating lasting professional relationships.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      
      {/* Recent Updates - Floating Button (All Devices) */}
      <RecentUpdates />
    </div>
  );
};

export default Home;