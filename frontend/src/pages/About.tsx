import React from "react";
import { motion } from "framer-motion";
import { Users, Leaf, Globe } from "lucide-react";
import Navbar from "../components/Navbar";

const About: React.FC = () => {
  return (
    <>
      <Navbar />
      {/* Added pt-28 to create gap below navbar */}
      <section className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 px-4 pt-28 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto bg-white shadow-2xl rounded-2xl p-8 md:p-14"
        >
          <h2 className="text-4xl font-bold text-green-700 text-center mb-4">
            About AgriCorus
          </h2>
          <p className="text-gray-600 text-center mb-10 max-w-2xl mx-auto">
            AgriCorus is dedicated to connecting farmers, investors, and
            agricultural enthusiasts to create a sustainable and productive
            ecosystem. Our goal is to empower farmers, promote innovative
            farming solutions, and ensure a better future for agriculture.
          </p>

          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-green-50 p-6 rounded-2xl text-center shadow-md"
            >
              <Users className="mx-auto text-green-600 mb-4" size={36} />
              <h3 className="text-xl font-semibold mb-2 text-gray-800">
                Our Community
              </h3>
              <p className="text-gray-600">
                Building a strong network of farmers, investors, and partners to
                share knowledge and resources.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-green-50 p-6 rounded-2xl text-center shadow-md"
            >
              <Leaf className="mx-auto text-green-600 mb-4" size={36} />
              <h3 className="text-xl font-semibold mb-2 text-gray-800">
                Sustainable Farming
              </h3>
              <p className="text-gray-600">
                Promoting eco-friendly and innovative farming techniques to
                protect the environment.
              </p>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-green-50 p-6 rounded-2xl text-center shadow-md"
            >
              <Globe className="mx-auto text-green-600 mb-4" size={36} />
              <h3 className="text-xl font-semibold mb-2 text-gray-800">
                Global Impact
              </h3>
              <p className="text-gray-600">
                Connecting agriculture projects worldwide to create positive
                economic and social impact.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>
    </>
  );
};

export default About;
