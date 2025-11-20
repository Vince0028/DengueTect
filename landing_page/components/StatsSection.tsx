import React from 'react';
import { motion } from 'framer-motion';

const StatsSection: React.FC = () => {
  const stats = [
    { value: '390M', label: 'Infections Yearly' },
    { value: '95%', label: 'Detection Accuracy' },
    { value: '24/7', label: 'Real-time Monitoring' },
    { value: '120+', label: 'Countries Supported' },
  ];

  return (
    <section className="py-10 relative z-10">
      <div className="container mx-auto px-6">
        <div className="glass-card rounded-3xl p-10 md:p-12 border-t border-dengue-primary/20 shadow-[0_0_50px_-10px_rgba(22,163,74,0.1)]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-y md:divide-y-0 md:divide-x divide-white/5">
            {stats.map((stat, index) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                key={index} 
                className="text-center group pt-8 md:pt-0 first:pt-0"
              >
                <h3 className="text-3xl md:text-5xl font-display font-bold text-white mb-2 group-hover:text-dengue-glow transition-colors drop-shadow-lg">
                  {stat.value}
                </h3>
                <p className="text-sm text-slate-400 font-medium tracking-wider uppercase">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsSection;