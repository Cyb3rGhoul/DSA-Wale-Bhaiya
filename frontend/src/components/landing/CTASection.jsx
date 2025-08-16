import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, UserPlus, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const CTASection = () => {
  const { isAuthenticated } = useAuth();

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10"></div>
      <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full blur-3xl transform -translate-y-1/2"></div>
      <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-full blur-3xl transform -translate-y-1/2"></div>
      
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Sparkles className="w-6 h-6 text-yellow-400" />
          <span className="text-yellow-400 font-semibold text-lg">Ready to Level Up?</span>
          <Sparkles className="w-6 h-6 text-yellow-400" />
        </div>
        
        <h2 className="text-4xl md:text-5xl font-bold text-gray-100 mb-6">
          Ready to Master DSA?
        </h2>
        
        <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto leading-relaxed">
          Join thousands of developers who are already learning with their AI brother! 
          Start your journey today and transform your coding skills.
        </p>
        
        {!isAuthenticated && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/register"
              className="group flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <UserPlus className="w-5 h-5" />
              Start Learning Now
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
            
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <span>✓ No credit card required</span>
              <span>•</span>
              <span>✓ Free forever</span>
            </div>
          </div>
        )}
        
        {/* Stats or testimonial */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/30">
            <div className="text-3xl font-bold text-blue-400 mb-2">1000+</div>
            <div className="text-gray-400">Practice Problems</div>
          </div>
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/30">
            <div className="text-3xl font-bold text-purple-400 mb-2">50+</div>
            <div className="text-gray-400">Algorithm Topics</div>
          </div>
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/30">
            <div className="text-3xl font-bold text-green-400 mb-2">24/7</div>
            <div className="text-gray-400">AI Support</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;