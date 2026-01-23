import React from 'react';
import { motion } from 'framer-motion';
import { Bug, Droplets, ThermometerSun, Shield, AlertCircle, Heart } from 'lucide-react';

const Education: React.FC = () => {
  const facts = [
    {
      icon: <Bug className="w-6 h-6" />,
      title: "What is Dengue?",
      description: "Dengue is a viral infection spread by Aedes mosquitoes. It causes flu-like symptoms and can be severe in some cases."
    },
    {
      icon: <ThermometerSun className="w-6 h-6" />,
      title: "Common Symptoms",
      description: "High fever, severe headache, pain behind the eyes, joint and muscle pain, rash, and mild bleeding."
    },
    {
      icon: <AlertCircle className="w-6 h-6" />,
      title: "Warning Signs",
      description: "Severe abdominal pain, persistent vomiting, bleeding gums, difficulty breathing. Seek help immediately."
    },
    {
      icon: <Droplets className="w-6 h-6" />,
      title: "Prevention",
      description: "Remove standing water, use mosquito repellent, wear long sleeves, and use mosquito nets while sleeping."
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Protection Tips",
      description: "Mosquitoes bite most during early morning and before dusk. Stay protected during these times."
    },
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Treatment",
      description: "No specific medicine for dengue. Rest, drink fluids, and take paracetamol for fever. Avoid aspirin and ibuprofen."
    }
  ];

  return (
    <section id="education" className="py-20 md:py-32 relative bg-black/20">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-display font-bold mb-6 text-white"
          >
            Learn About <span className="text-dengue-glow">Dengue</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-base md:text-lg"
          >
            Knowledge is your first defense. Learn how to recognize, prevent, and respond to dengue fever.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {facts.map((fact, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass-card rounded-2xl p-6 md:p-8 hover:border-dengue-primary/30 transition-colors group"
            >
              <div className="w-12 h-12 rounded-xl bg-dengue-primary/20 border border-dengue-primary/30 flex items-center justify-center text-dengue-glow mb-4 group-hover:scale-110 transition-transform">
                {fact.icon}
              </div>
              <h3 className="text-lg md:text-xl font-bold text-white mb-3">{fact.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{fact.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 glass-card rounded-2xl p-8 md:p-12 text-center"
        >
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">Need More Information?</h3>
          <p className="text-slate-400 mb-6 max-w-2xl mx-auto">
            Visit the Department of Health website for official guidelines and updates on dengue prevention and treatment in the Philippines.
          </p>
          <a 
            href="https://doh.gov.ph" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block px-8 py-3 bg-dengue-primary hover:bg-dengue-glow text-dengue-dark font-bold rounded-xl transition-colors"
          >
            Visit DOH Website
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default Education;
