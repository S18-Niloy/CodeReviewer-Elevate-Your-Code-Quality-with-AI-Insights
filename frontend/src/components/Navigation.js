import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Code2, FileSearch, History } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', label: 'Home', icon: Code2 },
    { path: '/analyze', label: 'Analyze', icon: FileSearch },
    { path: '/history', label: 'History', icon: History }
  ];
  
  return (
    <nav className="glass-effect sticky top-0 z-50" data-testid="main-navigation">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2" data-testid="nav-logo">
            <Code2 className="h-8 w-8 text-primary" strokeWidth={2} />
            <span className="text-2xl font-black tracking-tight">CodeReviewer</span>
          </Link>
          
          <div className="flex gap-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all active:scale-95 ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-[0_0_15px_rgba(59,130,246,0.5)]'
                      : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" strokeWidth={2} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;