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
            All core features are completely free. Premium features coming soon.
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
            <h3 className="text-xl font-bold text-slate-300 mb-2">Free</h3>
            <div className="text-4xl font-display font-bold mb-6 text-white">₱0</div>
            <p className="text-slate-400 text-sm mb-8">All features, completely free.</p>
            <ul className="space-y-4 mb-8 flex-1">
              {['Unlimited Bite Uploads', 'Symptom Checker', 'Nearby Hospital Finder', 'Dengue Information'].map((feat) => (
                <li key={feat} className="flex items-center gap-3 text-sm text-slate-300">
                  <Check className="w-4 h-4 text-dengue-glow" /> {feat}
                </li>
              ))}
            </ul>
            <a href="/register" className="block w-full py-3 rounded-xl bg-dengue-primary hover:bg-dengue-glow text-dengue-dark font-semibold transition-colors text-center">
              Get Started Free
            </a>
          </motion.div>

          {}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative bg-gradient-to-b from-dengue-dark to-[#062c22] border border-dengue-primary/50 rounded-3xl p-8 flex flex-col h-auto md:h-[500px] shadow-[0_0_50px_-12px_rgba(22,163,74,0.4)] z-10"
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-600 text-white px-6 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg">
              Coming Soon
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Family Plan</h3>
            <div className="flex items-baseline gap-1 mb-6">
                <span className="text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-dengue-glow">TBD</span>
            </div>
            <p className="text-dengue-accent text-sm mb-8">Track symptoms for your whole family.</p>
            <ul className="space-y-4 mb-8 flex-1">
              {['Multiple Profiles', 'Family Dashboard', 'Shared Reports', 'Priority Support'].map((feat) => (
                <li key={feat} className="flex items-center gap-3 text-sm text-white">
                  <Check className="w-4 h-4 text-dengue-glow" /> {feat}
                </li>
              ))}
            </ul>
            <button disabled className="w-full py-4 rounded-xl bg-slate-700 text-slate-400 font-bold cursor-not-allowed">
              Coming Soon
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
            <div className="text-4xl font-display font-bold mb-6 text-white">TBD</div>
            <p className="text-slate-400 text-sm mb-8">For barangays and health centers.</p>
            <ul className="space-y-4 mb-8 flex-1">
              {['Area Reports', 'Bulk Monitoring', 'Custom Dashboard'].map((feat) => (
                <li key={feat} className="flex items-center gap-3 text-sm text-slate-300">
                  <Check className="w-4 h-4 text-slate-600" /> {feat}
                </li>
              ))}
            </ul>
            <button disabled className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-slate-500 font-semibold cursor-not-allowed">
              Coming Soon
            </button>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default Pricing;