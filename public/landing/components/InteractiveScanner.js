import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Scan, Activity } from 'lucide-react';

export default function InteractiveScanner() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: false, amount: 0.4 });
  const [scanComplete, setScanComplete] = useState(false);
  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => setScanComplete(true), 3000);
      return () => clearTimeout(timer);
    } else {
      setScanComplete(false);
    }
  }, [isInView]);
  return (
    <section ref={ref} className="py-20 md:py-32 relative overflow-hidden bg-black/20 perspective-2000">
      <div className="container mx-auto px-6 relative z-10 flex flex-col items-center">
        <div className="text-center mb-12 md:mb-20">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl md:text-5xl font-display font-bold text-white mb-4">See it in <span className="text-dengue-glow">Action</span></motion.h2>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-slate-400 max-w-xl mx-auto text-sm md:text-base">The interface designed for rapid assessment in emergency situations.</motion.p>
        </div>
        <motion.div className="relative w-[280px] h-[560px] md:w-[320px] md:h-[640px] preserve-3d" initial={{ rotateY: 0 }} whileInView={{ rotateY: [0, -10, 10, 0] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}>
          <div className="absolute inset-0 bg-[#1e293b] rounded-[2.5rem] md:rounded-[3rem] border-[6px] md:border-[8px] border-[#334155] shadow-[0_0_60px_-15px_rgba(22,163,74,0.5)] overflow-hidden backface-hidden">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 h-6 w-24 md:h-7 md:w-28 bg-black rounded-b-2xl z-30" />
            <div className="relative h-full w-full bg-dengue-dark flex flex-col font-sans">
              <div className="relative flex-1 bg-[url('https://images.unsplash.com/photo-1550666610-27c225d613b2?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-90">
                <div className="absolute inset-0 bg-dengue-primary/10 mix-blend-overlay" />
                {!scanComplete && (<>
                  <motion.div animate={{ top: ['0%', '100%', '0%'] }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="absolute left-0 right-0 h-1 bg-dengue-glow shadow-[0_0_20px_rgba(74,222,128,1)] z-20" />
                  <div className="absolute inset-0 border-2 border-dengue-glow/30 m-6 rounded-2xl" />
                  <div className="absolute top-1/4 left-8 bg-black/60 backdrop-blur text-white text-[10px] px-2 py-1 rounded border border-white/10 animate-pulse">Analyzing Tissue...</div>
                </>)}
              </div>
              <div className="h-20 md:h-24 bg-dengue-base border-t border-white/5 p-4 md:p-6 flex justify-center items-center">
                {!scanComplete && (<div className="text-slate-500 text-xs font-mono animate-pulse">Scanning...</div>)}
              </div>
            </div>
          </div>
          <motion.div initial={{ z: 0, y: 100, opacity: 0, scale: 0.8 }} animate={scanComplete ? { z: 60, y: -140, opacity: 1, scale: 1 } : { z: 0, y: 100, opacity: 0, scale: 0.8 }} transition={{ type: 'spring', damping: 20, stiffness: 100 }} className="absolute bottom-8 left-4 right-4 bg-dengue-dark/95 backdrop-blur-xl rounded-2xl md:rounded-3xl border border-dengue-glow/30 p-5 md:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-red-500/20 flex items-center justify-center"><Activity className="w-4 h-4 md:w-5 md:h-5 text-red-500" /></div>
                <div><h3 className="text-white font-bold leading-tight text-sm md:text-base">High Probability</h3><p className="text-slate-400 text-[10px] md:text-xs">Confidence: 94%</p></div>
              </div>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </div>
            <div className="space-y-3 md:space-y-4 flex-1">
              <div className="space-y-1"><div className="flex justify-between text-[10px] md:text-xs text-slate-400"><span>Erythema Pattern</span><span className="text-red-400">Detected</span></div><div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden"><div className="w-[94%] h-full bg-gradient-to-r from-orange-500 to-red-500" /></div></div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5 text-[10px] text-slate-300 leading-relaxed hidden md:block">Pattern consistent with Aedes vector. Immediate medical consultation advised.</div>
            </div>
            <button className="w-full mt-4 py-2.5 md:py-3 bg-dengue-primary hover:bg-dengue-glow text-dengue-dark font-bold rounded-xl transition-colors text-xs md:text-sm">Full Report</button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
