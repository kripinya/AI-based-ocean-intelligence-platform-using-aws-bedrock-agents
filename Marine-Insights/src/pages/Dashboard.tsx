import React from 'react';
import { Link } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { Waves, Fish, Sprout, ArrowRight } from 'lucide-react';

const Dashboard: React.FC = () => {
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariant: Variants = {
    hidden: { opacity: 0, y: 15, scale: 0.95 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 70,
        damping: 15
      }
    }
  };

  const sections = [
    {
      title: 'Ocean Analytics',
      desc: 'Real-time SST & predictive models',
      path: '/ocean',
      icon: Waves,
      color: 'text-cyan-400',
      border: 'border-cyan-500/20',
      hover: 'group-hover:border-cyan-500/60 group-hover:shadow-[0_0_30px_-5px_rgba(6,182,212,0.3)]'
    },
    {
      title: 'Fisheries Management',
      desc: 'Stock health & sustainability tracking',
      path: '/fisheries',
      icon: Fish,
      color: 'text-amber-400',
      border: 'border-amber-500/20',
      hover: 'group-hover:border-amber-500/60 group-hover:shadow-[0_0_30px_-5px_rgba(245,158,11,0.3)]'
    },
    {
      title: 'Biodiversity',
      desc: 'Genomic sequencing & conservation',
      path: '/biodiversity',
      icon: Sprout,
      color: 'text-emerald-400',
      border: 'border-emerald-500/20',
      hover: 'group-hover:border-emerald-500/60 group-hover:shadow-[0_0_30px_-5px_rgba(16,185,129,0.3)]'
    }
  ];

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col justify-center items-center max-w-6xl mx-auto space-y-12">

      {/* Hero Text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center space-y-4"
      >

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-2">
          MARINE <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">INSIGHTS</span>
        </h1>
        <p className="text-lg text-white/50 max-w-lg mx-auto font-light leading-relaxed">
          Select a module to begin analysis.
        </p>
      </motion.div>

      {/* Central Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full"
      >
        {sections.map((section, idx) => (
          <motion.div key={idx} variants={itemVariant} className="h-full">
            <Link to={section.path} className="group block h-full">
              <div className={`
                neo-card h-full p-8 flex flex-col justify-between aspect-[4/3]
                ${section.border} ${section.hover}
              `}>
                <div className="space-y-6">
                  <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center
                    bg-white/5 border border-white/5 group-hover:scale-110 transition-transform duration-300
                  `}>
                    <section.icon className={`w-6 h-6 ${section.color}`} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold text-white mb-2 tracking-tight group-hover:text-cyan-50 transition-colors">
                      {section.title}
                    </h3>
                    <p className="text-white/40 text-sm leading-relaxed">
                      {section.desc}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
                  <span className="text-xs uppercase tracking-widest text-white/30">Module {idx + 1}</span>
                  <div className={`p-2 rounded-full bg-white/5 group-hover:bg-${section.color.split('-')[1]}-500/20 transition-colors`}>
                    <ArrowRight className={`w-4 h-4 ${section.color}`} />
                  </div>
                </div>

                {/* Decorative background glow */}
                <div className={`
                  absolute -bottom-10 -right-10 w-40 h-40 
                  bg-${section.color.split('-')[1]}-500/10 blur-[60px] rounded-full
                  group-hover:bg-${section.color.split('-')[1]}-500/20 transition-all duration-500
                `} />
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>



    </div>
  );
};

export default Dashboard;