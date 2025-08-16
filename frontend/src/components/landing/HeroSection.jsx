import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Brain, ArrowRight, LogIn, UserPlus, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const HeroSection = () => {
  const { isAuthenticated } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/10 to-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-br from-purple-500/10 to-pink-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      <div className={`max-w-7xl mx-auto text-center relative z-10 transition-all duration-1000 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        <div className="w-24 h-24 bg-gradient-to-br from-blue-500/80 to-purple-600/80 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl border border-white/10 hover:scale-110 transition-transform duration-300 group">
          <Brain className="w-12 h-12 text-white group-hover:animate-pulse" />
          <Sparkles className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1 animate-bounce" />
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold text-gray-100 mb-6 tracking-tight">
          Your AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 animate-gradient-x">Brother</span> for DSA
        </h1>
        
        <p className="text-xl text-gray-400 mb-8 max-w-3xl mx-auto leading-relaxed">
          Meet your friendly elder brother who will guide you through Data Structures & Algorithms 
          step by step. Get personalized explanations, practice problems, and coding tips! 🚀
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {isAuthenticated ? (
            <Link
              to="/chat"
              className="group flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Brain className="w-5 h-5 group-hover:animate-spin" />
              Continue Learning
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="group flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
              >
                <UserPlus className="w-5 h-5" />
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
              <Link
                to="/login"
                className="flex items-center gap-3 bg-gray-800/50 hover:bg-gray-700/50 text-gray-100 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 border border-gray-700/30 hover:border-gray-600/50 hover:scale-105"
              >
                <LogIn className="w-5 h-5" />
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;