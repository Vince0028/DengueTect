import React from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import InteractiveScanner from './components/InteractiveScanner';
import StatsSection from './components/StatsSection';
import Pricing from './components/Pricing';
import Education from './components/Education';
import Footer from './components/Footer';
import { motion, useScroll, useTransform } from 'framer-motion';

const App: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -400]);

  return (
    <div className="relative min-h-screen bg-dengue-dark text-slate-200 selection:bg-dengue-primary selection:text-white overflow-hidden">
      
      {}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#064e3b] via-dengue-dark to-black opacity-40" />
        
        {}
        <motion.div style={{ y: y1 }} className="absolute top-0 left-0 w-full h-full opacity-20">
            {[...Array(8)].map((_, i) => (
                <div 
                    key={i}
                    className="absolute rounded-full mix-blend-screen blur-3xl animate-pulse-glow"
                    style={{
                        background: i % 2 === 0 ? '#16a34a' : '#22c55e',
                        width: `${Math.random() * 400 + 200}px`,
                        height: `${Math.random() * 400 + 200}px`,
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        animationDuration: `${Math.random() * 5 + 5}s`,
                        opacity: 0.15
                    }}
                />
            ))}
        </motion.div>

        {}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10" />
      </div>

      <div className="relative z-10 flex flex-col gap-0">
        <Navbar />
        <Hero />
        <StatsSection />
        <Features />
        <HowItWorks />
        <InteractiveScanner />
        <Pricing />
        <Education />
        <Footer />
      </div>
    </div>
  );
};

export default App;