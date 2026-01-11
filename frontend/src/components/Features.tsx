import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sprout, 
  Users, 
  TrendingUp, 
  Shield, 
  MapPin, 
  DollarSign 
} from 'lucide-react';

const features = [
  {
    icon: Sprout,
    title: 'Land Lease Marketplace',
    description: 'Browse and lease agricultural land with transparent terms and verified ownership.',
    color: 'text-emerald-600'
  },
  {
    icon: Users,
    title: 'Crowdfunding Platform',
    description: 'Pool resources with other investors to fund large-scale agricultural projects.',
    color: 'text-green-600'
  },
  {
    icon: TrendingUp,
    title: 'Investment Tracking',
    description: 'Monitor your agricultural investments with real-time performance analytics.',
    color: 'text-blue-600'
  },
  {
    icon: Shield,
    title: 'Secure Transactions',
    description: 'All transactions are protected with blockchain technology and smart contracts.',
    color: 'text-purple-600'
  },
  {
    icon: MapPin,
    title: 'Location Intelligence',
    description: 'Access detailed soil data, weather patterns, and market insights for each location.',
    color: 'text-red-600'
  },
  {
    icon: DollarSign,
    title: 'Flexible Returns',
    description: 'Choose from various return models including profit sharing and fixed returns.',
    color: 'text-emerald-600'
  }
];

const Features: React.FC = () => {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Revolutionizing Agricultural Investment
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our platform combines cutting-edge technology with agricultural expertise to create 
            new opportunities for farmers and investors alike.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              className="card group hover:shadow-2xl transition-all duration-300"
            >
              <div className={`inline-flex p-3 rounded-lg ${feature.color} bg-opacity-10 mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className={`h-6 w-6 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;