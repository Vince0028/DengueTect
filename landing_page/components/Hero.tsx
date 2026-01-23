import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, Layers, Activity, ShieldCheck, Scan } from 'lucide-react';

const Hero: React.FC = () => {
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end start"]
  });

  const rotateX = useTransform(scrollYProgress, [0, 1], [15, 0]);
  const rotateY = useTransform(scrollYProgress, [0, 1], [-15, -5]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);

  return (
    <section ref={targetRef} className="relative min-h-[90vh] flex items-center pt-28 pb-12 md:pt-32 md:pb-20 overflow-hidden perspective-1000">
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          
          {}
          <div className="max-w-2xl relative z-20 pt-8 lg:pt-0 text-center lg:text-left">
            
            {}
            <div className="absolute -top-32 -left-32 w-64 h-64 md:w-96 md:h-96 bg-dengue-primary/10 rounded-full blur-[80px] md:blur-[120px]" />

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-4xl sm:text-5xl md:text-8xl font-display font-bold leading-[1.1] md:leading-[1] mb-6 md:mb-8 text-white"
            >
              Protect Yourself from <span className="text-transparent bg-clip-text bg-gradient-to-r from-dengue-primary via-dengue-glow to-white">Dengue</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="text-base md:text-lg text-slate-400 mb-8 md:mb-12 leading-relaxed max-w-lg mx-auto lg:mx-0 lg:border-l-2 border-dengue-primary/30 lg:pl-6"
            >
              A preliminary screening tool to help assess dengue risk. Not a medical diagnosis — always consult a healthcare professional.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
            >
              <a href="/register" className="group relative bg-white text-dengue-dark px-8 py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] transition-all duration-300">
                <span className="relative z-10 flex items-center gap-2">
                  Start Assessment
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </a>
              
              <a href="#how-it-works" className="px-8 py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2 border border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all backdrop-blur-md">
                <ShieldCheck className="w-4 h-4 text-dengue-glow" />
                How it Works
              </a>
            </motion.div>
          </div>

          {}
          <div className="relative h-[400px] md:h-[600px] w-full flex items-center justify-center perspective-2000 mt-8 lg:mt-0">
             
             {}
             <motion.div 
                style={{ rotateX, rotateY, scale }}
                className="relative w-64 md:w-72 h-[400px] md:h-[500px] preserve-3d transition-transform duration-100 ease-out scale-90 md:scale-100"
             >
                {}
                <motion.div 
                    initial={{ z: 0, opacity: 0 }}
                    animate={{ z: -80, opacity: 0.5 }}
                    transition={{ duration: 1.5, delay: 0.2 }}
                    className="absolute inset-0 bg-dengue-dark border border-white/10 rounded-[24px] md:rounded-[32px] shadow-2xl"
                >
                     <div className="w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 rounded-[24px] md:rounded-[32px]" />
                </motion.div>

                {}
                <motion.div 
                    initial={{ z: 0, opacity: 0 }}
                    animate={{ z: -40, opacity: 0.8 }}
                    transition={{ duration: 1.5, delay: 0.4 }}
                    className="absolute inset-0 bg-black/40 border border-dengue-primary/30 rounded-[24px] md:rounded-[32px] backdrop-blur-sm shadow-[0_0_50px_rgba(22,163,74,0.1)] flex items-center justify-center"
                >
                     <div className="w-[90%] h-[90%] border border-dashed border-dengue-primary/20 rounded-2xl grid grid-cols-3 gap-2 p-2">
                        {[...Array(9)].map((_,i) => (
                            <div key={i} className={`rounded bg-dengue-primary/${i % 2 ? '10' : '5'}`} />
                        ))}
                     </div>
                </motion.div>

                {}
                <motion.div 
                     initial={{ z: 0 }}
                     animate={{ z: 20 }}
                     transition={{ duration: 1.5 }}
                     className="absolute inset-0 bg-[#0f172a] border border-white/10 rounded-[24px] md:rounded-[32px] shadow-2xl overflow-hidden flex flex-col"
                >
                     {}
                     <div className="h-12 md:h-14 border-b border-white/5 flex items-center justify-between px-6 bg-white/5">
                        <div className="w-12 h-1.5 bg-white/10 rounded-full" />
                        <Activity className="w-4 h-4 text-dengue-glow" />
                     </div>

                     {}
                     <div className="flex-1 p-4 md:p-6 relative flex flex-col">
                        <div className="relative w-full h-40 md:h-48 rounded-xl md:rounded-2xl overflow-hidden mb-4 md:mb-6 bg-slate-800">
                            <div className="absolute inset-0 bg-gradient-to-br from-dengue-primary/20 to-transparent mix-blend-overlay z-10" />
                            <img 
                                src="https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?auto=format&fit=crop&q=80" 
                                className="w-full h-full object-cover opacity-80 grayscale" 
                                alt="Analysis"
                            />
                            {}
                            <motion.div 
                                animate={{ top: ['0%', '100%', '0%'] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                className="absolute left-0 right-0 h-0.5 bg-dengue-glow shadow-[0_0_15px_rgba(74,222,128,1)] z-20"
                            />
                        </div>

                        <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                                <div className="w-2 h-2 bg-dengue-glow rounded-full animate-pulse" />
                                <div className="h-1.5 w-20 bg-white/20 rounded-full" />
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                                <div className="w-2 h-2 bg-dengue-primary rounded-full" />
                                <div className="h-1.5 w-12 bg-white/20 rounded-full" />
                            </div>
                        </div>
                     </div>
                </motion.div>

                {}
                <motion.div 
                    initial={{ z: 0, opacity: 0 }}
                    animate={{ z: 80, opacity: 1 }}
                    transition={{ duration: 1.5, delay: 0.6 }}
                    className="absolute top-16 md:top-20 -right-4 md:-right-12 bg-dengue-dark/90 backdrop-blur-xl border border-dengue-glow/30 p-3 md:p-4 rounded-xl md:rounded-2xl shadow-2xl"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-dengue-glow/20 rounded-lg text-dengue-glow">
                            <Scan className="w-4 h-4 md:w-5 md:h-5" />
                        </div>
                        <div>
                            <div className="text-[8px] md:text-[10px] text-slate-400 uppercase tracking-wider">Status</div>
                            <div className="text-sm md:text-lg font-bold text-white">Analyzing</div>
                        </div>
                    </div>
                </motion.div>

             </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;