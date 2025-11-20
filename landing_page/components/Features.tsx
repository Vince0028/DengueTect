import React, { useRef } from 'react';
import { Scan, AlertTriangle, Brain, ChevronRight } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';

const Features: React.FC = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  // Less aggressive tilt on mobile
  const tilt = useTransform(scrollYProgress, [0, 0.5, 1], [2, 0, -2]);

  return (
    <section id="features" className="py-20 md:py-32 relative overflow-hidden" ref={ref}>
      <div className="container mx-auto px-6 relative z-10">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-20 gap-6">
            <div className="max-w-2xl">
                <motion.h2 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="text-3xl md:text-6xl font-display font-bold mb-4 md:mb-6 text-white"
                >
                    Diagnostic <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-dengue-primary to-dengue-glow">Ecosystem</span>
                </motion.h2>
                <motion.p 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="text-slate-400 text-base md:text-lg max-w-md"
                >
                    Hardware-level precision meets clinical logic. Assessing risk has never been this accessible.
                </motion.p>
            </div>
            <div className="flex gap-2">
                <div className="h-1 w-12 bg-dengue-primary rounded-full" />
                <div className="h-1 w-4 bg-slate-700 rounded-full" />
                <div className="h-1 w-4 bg-slate-700 rounded-full" />
            </div>
        </div>

        <div className="grid md:grid-cols-12 gap-6 perspective-1000">
          
          {/* Feature 1: Main Large Card - Bite Analysis */}
          <motion.div 
            style={{ rotateX: tilt }}
            className="md:col-span-8 glass-card-strong rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-14 overflow-hidden relative group min-h-[400px] md:min-h-[500px] flex flex-col justify-between preserve-3d transition-all duration-300"
          >
            <div className="absolute top-0 right-0 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-dengue-primary/5 rounded-full blur-[80px] md:blur-[120px] group-hover:bg-dengue-primary/10 transition-colors duration-700" />
            
            <div className="relative z-10 max-w-xl" style={{ transform: "translateZ(30px)" }}>
              <div className="w-12 h-12 md:w-16 md:h-16 bg-white/5 rounded-2xl flex items-center justify-center text-white mb-6 md:mb-8 border border-white/10 shadow-xl backdrop-blur-md group-hover:scale-110 transition-transform">
                <Scan className="w-6 h-6 md:w-8 md:h-8 text-dengue-glow" />
              </div>
              <h3 className="text-2xl md:text-4xl font-display font-bold mb-4 md:mb-6 text-white">Bite Analysis Engine</h3>
              <p className="text-slate-300 text-base md:text-lg leading-relaxed mb-8">
                Computer vision algorithms analyze erythema patterns to distinguish potential vectors.
              </p>
              
              <div className="flex flex-wrap gap-3">
                {['Instant Recognition', 'Spectrum Analysis', 'Pattern Matching'].map((item, i) => (
                  <span key={i} className="px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white/5 border border-white/5 text-xs md:text-sm text-slate-300">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* 3D Visual Element - Scaled down for mobile */}
            <div className="absolute right-0 bottom-0 translate-x-1/3 translate-y-1/3 md:translate-x-1/4 md:translate-y-1/4 w-[250px] h-[250px] md:w-[400px] md:h-[400px] preserve-3d group-hover:translate-x-1/4 group-hover:translate-y-1/4 transition-transform duration-700" style={{ transform: "translateZ(20px)" }}>
                 <div className="absolute inset-0 border border-dengue-primary/20 rounded-full animate-[spin_20s_linear_infinite]" />
                 <div className="absolute inset-4 border border-dashed border-dengue-primary/20 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
                 <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-32 h-32 md:w-48 md:h-48 bg-gradient-to-br from-dengue-primary/20 to-transparent rounded-full blur-2xl" />
                 </div>
            </div>
          </motion.div>

          {/* Side Column */}
          <div className="md:col-span-4 flex flex-col gap-6 perspective-1000">
              
              {/* Feature 2: Symptom Checker */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02, rotateX: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="flex-1 glass-card rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden group preserve-3d min-h-[240px]"
              >
                <div className="absolute top-0 right-0 p-6 opacity-20 group-hover:opacity-50 transition-opacity" style={{ transform: "translateZ(-20px)" }}>
                    <Brain className="w-20 h-20 md:w-24 md:h-24 text-white" />
                </div>
                <div className="relative z-10 h-full flex flex-col justify-end" style={{ transform: "translateZ(20px)" }}>
                    <h3 className="text-xl md:text-2xl font-bold mb-3 text-white">Clinical Logic</h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-6">
                        Weighted algorithms based on the Fernandez et al. (2016) model.
                    </p>
                    <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-dengue-dark transition-all cursor-pointer">
                        <ChevronRight className="w-5 h-5" />
                    </div>
                </div>
              </motion.div>

              {/* Feature 3: Risk Dashboard */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.02, rotateX: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="flex-1 glass-card rounded-[2rem] md:rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden group preserve-3d min-h-[240px]"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-red-900/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative z-10" style={{ transform: "translateZ(20px)" }}>
                    <div className="flex items-center justify-between mb-8">
                        <div className="p-2 bg-red-500/20 rounded-lg">
                            <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-red-400" />
                        </div>
                        <span className="text-[10px] md:text-xs font-mono text-slate-500">LIVE MONITOR</span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold mb-3 text-white">Risk Dashboard</h3>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden mt-4">
                        <div className="w-2/3 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 h-full animate-pulse" />
                    </div>
                </div>
              </motion.div>

          </div>

        </div>
      </div>
    </section>
  );
};

export default Features;