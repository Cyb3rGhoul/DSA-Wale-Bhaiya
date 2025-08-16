import React from 'react';
import { Brain, Heart, Rocket, Star } from 'lucide-react';

const AboutSection = () => {
  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left side - Content */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500/80 to-purple-600/80 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-gray-100">About DSA Brother Bot</h2>
            </div>
            
            <p className="text-xl text-gray-400 mb-8 leading-relaxed">
              Born from the idea that learning Data Structures and Algorithms shouldn't be intimidating, 
              DSA Brother Bot is your friendly AI companion designed to make complex concepts accessible 
              and enjoyable.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500/80 to-teal-600/80 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-100 mb-2">AI-Powered Learning</h3>
                  <p className="text-gray-400">
                    Leveraging advanced AI to provide personalized explanations, adapt to your learning pace, 
                    and offer insights tailored to your understanding level.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500/80 to-pink-600/80 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Rocket className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-100 mb-2">Career-Focused</h3>
                  <p className="text-gray-400">
                    Built specifically to help you succeed in technical interviews and advance your 
                    programming career with confidence and solid fundamentals.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-500/80 to-orange-600/80 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                  <Star className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-100 mb-2">Community Driven</h3>
                  <p className="text-gray-400">
                    Created by developers, for developers. We understand the challenges you face 
                    and are committed to making your learning journey smoother and more effective.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right side - Visual */}
          <div className="relative">
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm rounded-3xl p-8 border border-gray-700/30">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500/80 to-purple-600/80 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Brain className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-100 mb-4">Our Mission</h3>
                <p className="text-gray-400 leading-relaxed">
                  To democratize quality DSA education and make it accessible to every aspiring developer, 
                  regardless of their background or experience level.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-6 text-center">
                <div className="bg-gray-800/30 rounded-xl p-4">
                  <div className="text-3xl font-bold text-blue-400 mb-2">24/7</div>
                  <div className="text-sm text-gray-400">Always Available</div>
                </div>
                <div className="bg-gray-800/30 rounded-xl p-4">
                  <div className="text-3xl font-bold text-purple-400 mb-2">∞</div>
                  <div className="text-sm text-gray-400">Unlimited Practice</div>
                </div>
                <div className="bg-gray-800/30 rounded-xl p-4">
                  <div className="text-3xl font-bold text-green-400 mb-2">100%</div>
                  <div className="text-sm text-gray-400">Personalized</div>
                </div>
                <div className="bg-gray-800/30 rounded-xl p-4">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">0$</div>
                  <div className="text-sm text-gray-400">Free to Start</div>
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-600/20 rounded-full blur-xl"></div>
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-full blur-xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;