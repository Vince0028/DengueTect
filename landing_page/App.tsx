import React, { Suspense } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import InteractiveScanner from './components/InteractiveScanner';
import StatsSection from './components/StatsSection';
import Pricing from './components/Pricing';
import Education from './components/Education';
import Footer from './components/Footer';
import ThreeBackground from './components/ThreeBackground';
import { ScrollProgress, ScrollReveal, Parallax, ScaleOnScroll } from './components/ScrollAnimations';
import { motion, useScroll, useTransform } from 'framer-motion';

const App: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);

  return (
    <div className="relative min-h-screen bg-dengue-dark text-slate-200 selection:bg-dengue-primary selection:text-white overflow-hidden">
      
      {/* Scroll Progress Bar */}
      <ScrollProgress />
      
      {/* Three.js 3D Background */}
      <Suspense fallback={null}>
        <ThreeBackground />
      </Suspense>
      
      {/* Additional gradient overlay */}
      <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#064e3b] via-dengue-dark to-black opacity-40" />
        
        {/* Floating ambient elements */}
        <motion.div style={{ y: y1 }} className="absolute top-0 left-0 w-full h-full opacity-15">
          {[...Array(6)].map((_, i) => (
            <div 
              key={i}
              className="absolute rounded-full mix-blend-screen blur-3xl animate-pulse-glow"
              style={{
                background: i % 2 === 0 ? '#16a34a' : '#22c55e',
                width: `${Math.random() * 300 + 150}px`,
                height: `${Math.random() * 300 + 150}px`,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDuration: `${Math.random() * 5 + 5}s`,
                opacity: 0.1
              }}
            />
          ))}
        </motion.div>

        {/* Noise texture */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.07]" />
      </div>

      <div className="relative z-10 flex flex-col gap-0">
        <Navbar />
        
        {/* Hero with parallax */}
        <Parallax speed={0.2}>
          <Hero />
        </Parallax>
        
        {/* Stats Section with reveal */}
        <ScrollReveal direction="up" delay={0.1}>
          <StatsSection />
        </ScrollReveal>
        
        {/* Features with scale effect */}
        <ScaleOnScroll>
          <Features />
        </ScaleOnScroll>
        
        {/* How It Works with reveal from left */}
        <ScrollReveal direction="left" delay={0.1}>
          <HowItWorks />
        </ScrollReveal>
        
        {/* Interactive Scanner with reveal */}
        <ScrollReveal direction="up" delay={0.15}>
          <InteractiveScanner />
        </ScrollReveal>
        
        {/* Pricing with scale */}
        <ScaleOnScroll>
          <Pricing />
        </ScaleOnScroll>
        
        {/* Education with reveal from right */}
        <ScrollReveal direction="right" delay={0.1}>
          <Education />
        </ScrollReveal>
        
        <Footer />
      </div>
    </div>
  );
};

export default App;