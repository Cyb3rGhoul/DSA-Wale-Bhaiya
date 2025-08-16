import React from 'react';
import { Brain } from 'lucide-react';
import { 
  Navigation, 
  HeroSection, 
  FeaturesSection, 
  AboutSection, 
  CTASection 
} from '../components/landing';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <AboutSection />
      <CTASection />
      
      {/* Footer */}
      <footer className="bg-gray-900/70 backdrop-blur-xl border-t border-gray-700/30 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500/80 to-purple-600/80 rounded-lg flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-100">DSA Brother Bot</span>
            </div>
            <p className="text-gray-400 text-sm">
              © 2024 DSA Brother Bot. Your friendly AI coding mentor.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;