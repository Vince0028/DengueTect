import React from 'react';
import { motion } from 'framer-motion';
import { Camera, ClipboardList, MapPin, Stethoscope } from 'lucide-react';

const HowItWorks: React.FC = () => {
  const steps = [
    {
      icon: <Camera className="w-6 h-6" />,
      title: "Upload a Photo",
      description: "Take a photo of a bite mark and upload it to our system for reference."
    },
    {
      icon: <ClipboardList className="w-6 h-6" />,
      title: "Answer Questions",
      description: "Complete a simple symptom checklist to help assess your situation."
    },
    {
      icon: <MapPin className="w-6 h-6" />,
      title: "Find Help Nearby",
      description: "Locate hospitals and health centers in your area."
    },
    {
      icon: <Stethoscope className="w-6 h-6" />,
      title: "Consult a Doctor",
      description: "Visit a healthcare professional for proper diagnosis and treatment."
    }
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-32 relative">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-display font-bold mb-6 text-white"
          >
            How It <span className="text-dengue-glow">Works</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-base md:text-lg"
          >
            Four simple steps to help you understand your symptoms and find medical care.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 md:gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-dengue-primary/50 to-transparent" />
              )}
              
              <div className="glass-card rounded-2xl p-6 md:p-8 text-center h-full">
                <div className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-6 rounded-2xl bg-dengue-primary/20 border border-dengue-primary/30 flex items-center justify-center text-dengue-glow">
                  {step.icon}
                </div>
                <div className="text-xs font-mono text-dengue-primary mb-2">STEP {index + 1}</div>
                <h3 className="text-lg md:text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-slate-400 text-sm">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <div className="inline-block bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-6 py-4">
            <p className="text-yellow-400 text-sm font-medium">
              Remember: DengueTect is a screening tool only. Always consult a doctor for proper diagnosis.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HowItWorks;
