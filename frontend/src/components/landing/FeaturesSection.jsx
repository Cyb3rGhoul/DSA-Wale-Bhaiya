import React from 'react';
import { Code2, BookOpen, Users, Zap, Target, Lightbulb } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: Code2,
      title: "Step-by-Step Guidance",
      description: "Get detailed explanations for complex algorithms and data structures, broken down into easy-to-understand steps.",
      gradient: "from-blue-500/80 to-purple-600/80"
    },
    {
      icon: BookOpen,
      title: "Practice Problems",
      description: "Access a curated collection of coding problems with hints, solutions, and multiple approaches to solve them.",
      gradient: "from-green-500/80 to-teal-600/80"
    },
    {
      icon: Users,
      title: "Personalized Learning",
      description: "Your AI brother adapts to your learning style and pace, providing personalized feedback and recommendations.",
      gradient: "from-purple-500/80 to-pink-600/80"
    },
    {
      icon: Zap,
      title: "Instant Feedback",
      description: "Get immediate responses to your questions and code reviews to accelerate your learning process.",
      gradient: "from-yellow-500/80 to-orange-600/80"
    },
    {
      icon: Target,
      title: "Interview Preparation",
      description: "Practice with real interview questions and get tips on how to approach technical interviews confidently.",
      gradient: "from-red-500/80 to-pink-600/80"
    },
    {
      icon: Lightbulb,
      title: "Concept Clarity",
      description: "Understand the 'why' behind algorithms with intuitive explanations and real-world applications.",
      gradient: "from-indigo-500/80 to-blue-600/80"
    }
  ];

  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-800/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-100 mb-4">Why Choose DSA Brother Bot?</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Your personal AI mentor designed specifically for mastering Data Structures and Algorithms
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div 
                key={index}
                className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/30 hover:border-gray-600/50 transition-all duration-200 hover:transform hover:scale-105"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-6`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-100 mb-4">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;