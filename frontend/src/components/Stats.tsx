import React from 'react';
import { motion } from 'framer-motion';

const stats = [
  { number: '10,000+', label: 'Acres Under Management', icon: '🌾' },
  { number: '$50M+', label: 'Total Investment Volume', icon: '💰' },
  { number: '2,500+', label: 'Active Investors', icon: '👥' },
  { number: '98%', label: 'Success Rate', icon: '📈' }
];

const Stats: React.FC = () => {
  return (
    <section className="py-20 bg-gradient-to-r from-emerald-600 to-green-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Growing Together
          </h2>
          <p className="text-xl text-white/90 max-w-3xl mx-auto">
            Join thousands of investors who are already benefiting from agricultural investments
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                className="text-4xl mb-4"
              >
                {stat.icon}
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl font-bold text-white mb-2"
              >
                {stat.number}
              </motion.div>
              <div className="text-white/90 font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;