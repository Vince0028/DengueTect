import React, { useState, useEffect } from 'react';
import { Menu, X, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 flex justify-center transition-all duration-300 ${scrolled ? 'pt-4' : 'pt-6'}`}
      >
        <div className={`relative flex items-center justify-between px-6 transition-all duration-300 ${scrolled ? 'w-[90%] max-w-6xl bg-dengue-dark/80 backdrop-blur-xl border border-dengue-primary/20 rounded-full py-3 shadow-[0_8px_32px_rgba(22,163,74,0.15)]' : 'w-full container mx-auto py-2 bg-transparent border-transparent'}`}>
          <a href="#" className="flex items-center gap-2 group">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-dengue-primary to-dengue-dark border border-dengue-glow/30 overflow-hidden">
              <div className="absolute inset-0 bg-dengue-glow/20 blur opacity-0 group-hover:opacity-100 transition-opacity" />
              <Activity className="h-6 w-6 text-white relative z-10" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight text-white">Dengue<span className="text-dengue-glow">Tect</span></span>
          </a>
          <div className="hidden md:flex items-center gap-1 bg-dengue-light/30 rounded-full px-2 py-1 border border-white/5">
            {['Features', 'How it Works', 'Pricing', 'Education'].map(item => (
              <a key={item} href={`#${item.toLowerCase().replace(/\s+/g, '-')}`} className="px-4 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-full transition-all">{item}</a>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-4">
            <a href="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">Login</a>
            <a href="/register" className="group relative px-6 py-2.5 rounded-full bg-gradient-to-r from-dengue-primary to-dengue-glow text-dengue-dark font-bold text-sm overflow-hidden hover:shadow-[0_0_20px_rgba(74,222,128,0.4)] transition-all">
              <span className="relative z-10 group-hover:text-white transition-colors">Sign Up Now</span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            </a>
          </div>
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden text-white p-2">{isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}</button>
        </div>
      </motion.nav>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed inset-0 top-20 z-40 bg-dengue-dark p-6 md:hidden">
            <div className="flex flex-col gap-6 text-center">
              {['Features', 'How it Works', 'Pricing', 'Education'].map(item => (
                <a key={item} href="#" className="text-2xl font-display font-bold text-slate-300 hover:text-dengue-glow" onClick={() => setIsOpen(false)}>{item}</a>
              ))}
              <hr className="border-white/10 my-4" />
              <a href="/login" className="text-xl font-semibold text-white">Login</a>
              <a href="/register" className="bg-dengue-primary text-white py-4 rounded-xl font-bold text-xl shadow-lg shadow-dengue-primary/20">Sign Up Now</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
