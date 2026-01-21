import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Shield, Zap, Target, TrendingUp, Code2, FileSearch } from 'lucide-react';
import { motion } from 'framer-motion';

const LandingPage = () => {
  const navigate = useNavigate();
  
  const features = [
    {
      icon: Shield,
      title: 'Security Analysis',
      description: 'Identify vulnerabilities and security issues in your code'
    },
    {
      icon: Zap,
      title: 'Performance Insights',
      description: 'Optimize code performance with AI-powered suggestions'
    },
    {
      icon: Target,
      title: 'Best Practices',
      description: 'Ensure your code follows industry standards'
    },
    {
      icon: TrendingUp,
      title: 'Code Quality',
      description: 'Get detailed metrics and improvement recommendations'
    }
  ];
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-border opacity-50" />
        <div className="relative max-w-7xl mx-auto px-6 py-24 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-full text-sm font-medium text-primary" data-testid="hero-badge">
              <Code2 className="h-4 w-4" />
              AI-Powered Code Analysis
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight" data-testid="hero-title">
              Elevate Your Code Quality
              <br />
              <span className="text-primary">with AI Insights</span>
            </h1>
            
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="hero-description">
              Get instant, comprehensive code reviews powered by advanced AI. Identify issues, improve performance, and follow best practices.
            </p>
            
            <div className="flex gap-4 justify-center">
              <Button
                size="lg"
                onClick={() => navigate('/analyze')}
                data-testid="cta-analyze-button"
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(59,130,246,0.5)] px-8 font-medium rounded-md transition-all active:scale-95"
              >
                <FileSearch className="mr-2 h-5 w-5" />
                Start Analyzing
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate('/history')}
                data-testid="view-history-button"
                className="bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border px-8 font-medium rounded-md transition-all active:scale-95"
              >
                View History
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-24 bg-card/30" data-testid="features-section">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-muted-foreground text-lg">Everything you need for comprehensive code review</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  data-testid={`feature-card-${index}`}
                >
                  <Card className="p-6 h-full bg-card border border-border hover:border-primary/50 transition-all duration-300">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-primary" strokeWidth={2} />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-24" data-testid="cta-section">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 rounded-2xl p-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to improve your code?</h2>
            <p className="text-muted-foreground text-lg mb-8">
              Start analyzing your code in seconds. No setup required.
            </p>
            <Button
              size="lg"
              onClick={() => navigate('/analyze')}
              data-testid="cta-bottom-button"
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_rgba(59,130,246,0.5)] px-8 font-medium rounded-md transition-all active:scale-95"
            >
              Get Started Now
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;