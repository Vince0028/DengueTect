import React, { useState } from 'react';
import { Github, Twitter, Linkedin, Wifi, X, MapPin, Users, Shield, FileText, Code, Sparkles } from 'lucide-react';

interface ModalContent {
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

const Footer: React.FC = () => {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const modalContents: Record<string, ModalContent> = {
    "Features": {
      title: "Features",
      icon: <Sparkles className="w-6 h-6 text-dengue-glow" />,
      content: (
        <div className="space-y-4">
          <p className="text-slate-300">DengueTect offers simple tools to help you stay informed:</p>
          <ul className="space-y-3 text-slate-400">
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 bg-dengue-primary rounded-full mt-2" />
              <span><strong className="text-white">Bite Photo Upload</strong> – Upload photos of bites for visual reference</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 bg-dengue-primary rounded-full mt-2" />
              <span><strong className="text-white">Symptom Checker</strong> – Answer questions to understand when to seek help</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 bg-dengue-primary rounded-full mt-2" />
              <span><strong className="text-white">Hospital Finder</strong> – Find nearby medical facilities</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 bg-dengue-primary rounded-full mt-2" />
              <span><strong className="text-white">Dengue Education</strong> – Learn about prevention and symptoms</span>
            </li>
          </ul>
        </div>
      )
    },
    "Live Map": {
      title: "Live Map",
      icon: <MapPin className="w-6 h-6 text-dengue-glow" />,
      content: (
        <div className="space-y-4">
          <p className="text-slate-300">Find hospitals and health centers near you.</p>
          <div className="bg-slate-800/50 rounded-xl p-6 text-center">
            <MapPin className="w-12 h-12 text-dengue-primary mx-auto mb-3 opacity-50" />
            <p className="text-slate-400 text-sm">Hospital finder feature is available after you sign up.</p>
            <a href="/register" className="inline-block mt-4 px-6 py-2 bg-dengue-primary text-dengue-dark rounded-lg font-semibold text-sm hover:bg-dengue-glow transition-colors">
              Sign Up to Access
            </a>
          </div>
        </div>
      )
    },
    "About Us": {
      title: "About DengueTect",
      icon: <Users className="w-6 h-6 text-dengue-glow" />,
      content: (
        <div className="space-y-4">
          <p className="text-slate-300">
            DengueTect is a student project created to raise awareness about dengue fever in the Philippines.
          </p>
          <div className="bg-slate-800/50 rounded-xl p-4">
            <h4 className="text-white font-semibold mb-2">Our Mission</h4>
            <p className="text-slate-400 text-sm">
              To provide accessible information and tools that help people recognize dengue symptoms early and seek proper medical care.
            </p>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4">
            <h4 className="text-white font-semibold mb-2">Important Note</h4>
            <p className="text-slate-400 text-sm">
              This is an educational tool, not a medical diagnosis system. Always consult a healthcare professional for proper diagnosis and treatment.
            </p>
          </div>
        </div>
      )
    },
    "Medical Board": {
      title: "Medical Disclaimer",
      icon: <Shield className="w-6 h-6 text-dengue-glow" />,
      content: (
        <div className="space-y-4">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
            <h4 className="text-red-400 font-semibold mb-2">Not Medical Advice</h4>
            <p className="text-slate-400 text-sm">
              DengueTect is NOT a substitute for professional medical advice, diagnosis, or treatment.
            </p>
          </div>
          <p className="text-slate-300">
            This tool is designed for educational purposes only. The symptom checker and bite analysis features provide general information and should not be used as the basis for medical decisions.
          </p>
          <p className="text-slate-400 text-sm">
            If you suspect you have dengue fever, please visit a hospital or clinic immediately. Dengue can be life-threatening if not treated properly.
          </p>
        </div>
      )
    },
    "Privacy Policy": {
      title: "Privacy Policy",
      icon: <FileText className="w-6 h-6 text-dengue-glow" />,
      content: (
        <div className="space-y-4">
          <p className="text-slate-300">Your privacy matters to us. Here is how we handle your data:</p>
          <ul className="space-y-3 text-slate-400 text-sm">
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 bg-green-500 rounded-full mt-2" />
              <span>Photos you upload are only used for your personal reference</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 bg-green-500 rounded-full mt-2" />
              <span>We do not sell or share your personal information</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 bg-green-500 rounded-full mt-2" />
              <span>Symptom data is stored securely and only accessible by you</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="w-2 h-2 bg-green-500 rounded-full mt-2" />
              <span>You can delete your account and data at any time</span>
            </li>
          </ul>
          <p className="text-slate-500 text-xs mt-4">
            This is a student project. Data handling practices may be updated as the project develops.
          </p>
        </div>
      )
    },
    "API Docs": {
      title: "API Documentation",
      icon: <Code className="w-6 h-6 text-dengue-glow" />,
      content: (
        <div className="space-y-4">
          <p className="text-slate-300">DengueTect API is currently in development.</p>
          <div className="bg-slate-800/50 rounded-xl p-4 font-mono text-sm">
            <div className="text-slate-500 mb-2">// Coming soon</div>
            <div className="text-dengue-glow">GET /api/v1/symptoms</div>
            <div className="text-dengue-glow">POST /api/v1/assessment</div>
            <div className="text-dengue-glow">GET /api/v1/hospitals</div>
          </div>
          <p className="text-slate-400 text-sm">
            API access will be available for health organizations and researchers in future updates.
          </p>
        </div>
      )
    }
  };

  const footerLinks = [
    { label: "Features", code: "F-01" },
    { label: "Live Map", code: "M-02" },
    { label: "About Us", code: "A-03" },
    { label: "Medical Board", code: "B-04" },
    { label: "Privacy Policy", code: "P-05" },
    { label: "API Docs", code: "D-06" }
  ];

  return (
    <React.Fragment>
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setActiveModal(null)}
          />
          <div className="relative bg-[#0f172a] border border-white/10 rounded-2xl max-w-md w-full max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-[#0f172a] border-b border-white/10 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {modalContents[activeModal]?.icon}
                <h3 className="text-lg font-bold text-white">{modalContents[activeModal]?.title}</h3>
              </div>
              <button 
                onClick={() => setActiveModal(null)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-6">
              {modalContents[activeModal]?.content}
            </div>
          </div>
        </div>
      )}

      <footer className="bg-[#050a14] pt-12 pb-8 border-t border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(22,163,74,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(22,163,74,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="mb-10 pb-6 border-b border-white/5">
            <div className="w-full bg-[#0f172a] border border-white/10 rounded-full h-10 flex items-center overflow-hidden relative">
              <div className="flex animate-ticker whitespace-nowrap items-center text-xs font-mono text-slate-400">
                <span className="mx-4 text-dengue-primary">DENGUETECT</span>
                <span className="mx-4">DENGUE AWARENESS TOOL</span>
                <span className="mx-4 text-dengue-primary">FREE TO USE</span>
                <span className="mx-4">CONSULT A DOCTOR FOR DIAGNOSIS</span>
                <span className="mx-4 text-dengue-primary">DENGUETECT</span>
                <span className="mx-4">DENGUE AWARENESS TOOL</span>
                <span className="mx-4 text-dengue-primary">FREE TO USE</span>
                <span className="mx-4">CONSULT A DOCTOR FOR DIAGNOSIS</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-1 space-y-4">
              <div className="font-display font-bold text-2xl text-white">
                Dengue<span className="text-dengue-glow">Tect</span>
              </div>
              <p className="text-slate-500 text-sm leading-relaxed">
                A free educational tool to help raise awareness about dengue fever symptoms and prevention.
              </p>
              <div className="flex gap-4 pt-2">
                {[Twitter, Github, Linkedin].map((Icon, i) => (
                  <a key={i} href="#" className="text-slate-500 hover:text-dengue-glow transition-colors">
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            <div className="md:col-span-2 grid grid-cols-2 gap-4">
              {footerLinks.map((item) => (
                <button 
                  key={item.code} 
                  onClick={() => setActiveModal(item.label)}
                  className="group flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-dengue-primary/10 border border-white/5 hover:border-dengue-primary/30 transition-all text-left"
                >
                  <span className="text-slate-300 text-sm font-medium group-hover:text-white">{item.label}</span>
                  <span className="text-[10px] font-mono text-slate-600 group-hover:text-dengue-primary">{item.code}</span>
                </button>
              ))}
            </div>

            <div className="md:col-span-1 bg-[#0b1220] p-5 rounded-xl border border-white/10">
              <div className="flex items-center gap-2 mb-4 text-xs font-mono text-slate-400">
                <Wifi className="w-4 h-4" />
                PROJECT STATUS
              </div>
              <div className="space-y-2">
                <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full w-full bg-dengue-primary" />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>STATUS</span>
                  <span>ACTIVE</span>
                </div>
              </div>
              <a href="#features" className="block w-full mt-6 py-2 bg-white/5 border border-white/10 text-white text-xs font-mono hover:bg-white/10 transition-colors rounded text-center">
                LEARN MORE
              </a>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/5 text-xs text-slate-600 font-mono">
            <div>2026 DENGUETECT. EDUCATIONAL PROJECT.</div>
            <div className="flex gap-6 mt-4 md:mt-0">
              <span>NOT MEDICAL ADVICE</span>
              <span>SCREENING TOOL ONLY</span>
            </div>
          </div>
        </div>
      </footer>
    </React.Fragment>
  );
};

export default Footer;
