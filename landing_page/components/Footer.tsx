import React from 'react';
import { Github, Twitter, Linkedin, Wifi } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#050a14] pt-12 pb-8 border-t border-white/5 relative overflow-hidden">
      
      {}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(22,163,74,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(22,163,74,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        
        {}
        <div className="mb-10 pb-6 border-b border-white/5">
            <div className="w-full bg-[#0f172a] border border-white/10 rounded-full h-10 flex items-center overflow-hidden relative">
                <div className="flex animate-ticker whitespace-nowrap items-center text-xs font-mono text-slate-400">
                    <span className="mx-4 text-dengue-primary">● MONITORING ACTIVE</span>
                    <span className="mx-4">GLOBAL DATA UPDATED</span>
                    <span className="mx-4 text-dengue-primary">● 24/7 SURVEILLANCE</span>
                    <span className="mx-4">AI MODEL: STABLE</span>
                    <span className="mx-4 text-dengue-primary">● MONITORING ACTIVE</span>
                    <span className="mx-4">GLOBAL DATA UPDATED</span>
                    <span className="mx-4 text-dengue-primary">● 24/7 SURVEILLANCE</span>
                    <span className="mx-4">AI MODEL: STABLE</span>
                    <span className="mx-4 text-dengue-primary">● MONITORING ACTIVE</span>
                    <span className="mx-4">GLOBAL DATA UPDATED</span>
                </div>
            </div>
        </div>

        {}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            
            {}
            <div className="md:col-span-1 space-y-4">
                <div className="font-display font-bold text-2xl text-white">
                    Dengue<span className="text-dengue-glow">Tect</span>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed">
                    Democratizing early detection through advanced computer vision and accessible mobile technology.
                </p>
                <div className="flex gap-4 pt-2">
                    {[Twitter, Github, Linkedin].map((Icon, i) => (
                        <a key={i} href="#" className="text-slate-500 hover:text-dengue-glow transition-colors">
                            <Icon className="w-5 h-5" />
                        </a>
                    ))}
                </div>
            </div>

            {}
            <div className="md:col-span-2 grid grid-cols-2 gap-4">
                {[
                    { label: "Features", code: "F-01" },
                    { label: "Live Map", code: "M-02" },
                    { label: "About Us", code: "A-03" },
                    { label: "Medical Board", code: "B-04" },
                    { label: "Privacy Policy", code: "P-05" },
                    { label: "API Docs", code: "D-06" }
                ].map((item) => (
                    <a key={item.code} href="#" className="group flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-dengue-primary/10 border border-white/5 hover:border-dengue-primary/30 transition-all">
                        <span className="text-slate-300 text-sm font-medium group-hover:text-white">{item.label}</span>
                        <span className="text-[10px] font-mono text-slate-600 group-hover:text-dengue-primary">{item.code}</span>
                    </a>
                ))}
            </div>

            {}
            <div className="md:col-span-1 bg-[#0b1220] p-5 rounded-xl border border-white/10">
                <div className="flex items-center gap-2 mb-4 text-xs font-mono text-slate-400">
                    <Wifi className="w-4 h-4" />
                    SERVER STATUS: US-EAST
                </div>
                <div className="space-y-2">
                    <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full w-[98%] bg-dengue-primary" />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                        <span>UPTIME</span>
                        <span>99.9%</span>
                    </div>
                </div>
                <button className="w-full mt-6 py-2 bg-white/5 border border-white/10 text-white text-xs font-mono hover:bg-white/10 transition-colors rounded">
                    VIEW SYSTEM LOGS
                </button>
            </div>
        </div>

        {}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5 text-xs text-slate-600 font-mono">
            <div>&copy; 2025 DENGUETECT INC. ALL RIGHTS RESERVED.</div>
            <div className="flex gap-6 mt-4 md:mt-0">
                <span>SECURE CONNECTION</span>
                <span>HIPAA COMPLIANT</span>
                <span>ENCRYPTED</span>
            </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;