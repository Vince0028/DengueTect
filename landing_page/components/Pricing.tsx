import React from 'react';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

const Pricing: React.FC = () => {
  return (
    <section id="pricing" className="py-20 md:py-24 relative">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-display font-bold mb-4 text-white"
          >
            Accessible Protection
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-base md:text-lg"
          >
            Start protecting yourself for free. Upgrade for advanced family monitoring.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto items-stretch">
          
          {}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="glass-card rounded-3xl p-8 flex flex-col h-auto md:h-[420px]"
          >
            <h3 className="text-xl font-bold text-slate-300 mb-2">Basic</h3>
            <div className="text-4xl font-display font-bold mb-6 text-white">$0</div>
            <p className="text-slate-400 text-sm mb-8">Essential protection for individuals.</p>
            <ul className="space-y-4 mb-8 flex-1">
              {['3 Bite Scans / Month', 'Basic Symptom Checker', 'Local Hospital Map'].map((feat) => (
                <li key={feat} className="flex items-center gap-3 text-sm text-slate-300">
                  <Check className="w-4 h-4 text-slate-600" /> {feat}
                </li>
              ))}
            </ul>
            <button className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-colors">
              Get Started
            </button>
          </motion.div>

          {}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative bg-gradient-to-b from-dengue-dark to-[#062c22] border border-dengue-primary/50 rounded-3xl p-8 flex flex-col h-auto md:h-[500px] shadow-[0_0_50px_-12px_rgba(22,163,74,0.4)] z-10"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-dengue-primary text-white px-6 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg shadow-dengue-primary/30">
              Most Popular
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Protection+</h3>
            <div className="flex items-baseline gap-1 mb-6">
                <span className="text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-dengue-glow">$4.99</span>
                <span className="text-slate-500">/mo</span>
            </div>
            <p className="text-dengue-accent text-sm mb-8">Complete peace of mind for families.</p>
            <ul className="space-y-4 mb-8 flex-1">
              {['Unlimited Bite Scans', 'Advanced Clinical Model', 'Multi-User Profiles (Family)', 'Priority Doctor Connect'].map((feat) => (
                <li key={feat} className="flex items-center gap-3 text-sm text-white">
                  <Check className="w-4 h-4 text-dengue-glow" /> {feat}
                </li>
              ))}
            </ul>
            <button className="w-full py-4 rounded-xl bg-gradient-to-r from-dengue-primary to-dengue-glow text-dengue-dark font-bold shadow-lg hover:shadow-dengue-primary/40 hover:scale-[1.02] transition-all">
              Start Free Trial
            </button>
          </motion.div>

          {}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-3xl p-8 flex flex-col h-auto md:h-[420px]"
          >
            <h3 className="text-xl font-bold text-slate-300 mb-2">Community</h3>
            <div className="text-4xl font-display font-bold mb-6 text-white">Custom</div>
            <p className="text-slate-400 text-sm mb-8">For LGUs and Health Organizations.</p>
            <ul className="space-y-4 mb-8 flex-1">
              {['Population Risk Mapping', 'API Access', 'Dashboard Analytics'].map((feat) => (
                <li key={feat} className="flex items-center gap-3 text-sm text-slate-300">
                  <Check className="w-4 h-4 text-slate-600" /> {feat}
                </li>
              ))}
            </ul>
            <button className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold transition-colors">
              Contact Sales
            </button>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Pricing;