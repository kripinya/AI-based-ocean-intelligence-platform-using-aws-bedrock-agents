import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Waves, Fish, Sprout, Compass } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  // Navigation Items
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Ocean Data', path: '/ocean', icon: Waves },
    { name: 'Fisheries', path: '/fisheries', icon: Fish },
    { name: 'Biodiversity', path: '/biodiversity', icon: Sprout },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_center,_var(--color-ocean-depth)_0%,_var(--color-ocean-dark)_100%)] text-white overflow-hidden relative selection:bg-cyan-500/30">

      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-900/20 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-cyan-900/10 rounded-full blur-[120px] mix-blend-screen" />
      </div>

      {/* Glass Navbar */}
      <nav className="fixed top-0 w-full z-50 transition-all duration-300 neo-glass border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

          {/* Logo */}
          <Link to="/dashboard" className="flex items-center space-x-3 group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 shadow-[0_0_15px_-3px_rgba(6,182,212,0.3)] group-hover:shadow-[0_0_25px_-5px_rgba(6,182,212,0.5)] transition-all duration-300">
              <Compass className="w-6 h-6 text-cyan-400 group-hover:rotate-45 transition-transform duration-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-semibold tracking-tight text-white group-hover:text-cyan-100 transition-colors">
                Marine Insights
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center bg-black/20 p-1.5 rounded-full border border-white/5 backdrop-blur-md">
            {navItems.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`relative px-5 py-2.5 rounded-full flex items-center space-x-2 transition-all duration-300 group ${active ? 'text-white' : 'text-white/50 hover:text-white/80'
                    }`}
                >
                  {active && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-white/10 rounded-full border border-white/10 shadow-sm"
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center space-x-2">
                    <item.icon className="w-4 h-4" />
                    <span className="text-sm font-medium tracking-wide">{item.name}</span>
                  </span>
                </Link>
              );
            })}
          </div>


        </div>
      </nav>

      {/* Main Content Area with Smooth Transitions */}
      <main className="relative pt-32 pb-12 px-6 max-w-[1600px] mx-auto min-h-screen z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 15, scale: 0.98, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -15, scale: 0.98, filter: "blur(10px)" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }} // "Apple-like" ease
            className="h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Layout;