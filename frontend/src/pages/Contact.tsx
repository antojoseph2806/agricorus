import React from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin } from "lucide-react";
import Navbar from "../components/Navbar";

const Contact: React.FC = () => {
  return (
    <>
      <Navbar /> {/* Navbar added here */}
      {/* Added pt-28 to create space below the navbar */}
      <section className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 px-4 pt-28 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-6xl mx-auto bg-white shadow-2xl rounded-2xl p-8 md:p-14"
        >
          <h2 className="text-4xl font-bold text-green-700 text-center mb-4">
            Get in Touch
          </h2>
          <p className="text-gray-600 text-center mb-10 max-w-2xl mx-auto">
            We’d love to hear from you! Whether you have a question about our
            services, pricing, or anything else, our team is ready to answer all
            your questions.
          </p>

          <div className="grid lg:grid-cols-2 gap-10">
            {/* Contact Form */}
            <form className="space-y-6">
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-gray-700">
                  Message
                </label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows={5}
                  placeholder="Write your message here..."
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-green-700 transition duration-300"
              >
                Send Message
              </button>
            </form>

            {/* Contact Info + Map */}
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <Mail className="text-green-600 mt-1" />
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">
                      Email
                    </h4>
                    <p className="text-gray-600">contact@agricorus.com</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <Phone className="text-green-600 mt-1" />
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">
                      Phone
                    </h4>
                    <p className="text-gray-600">+91 6282289862</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <MapPin className="text-green-600 mt-1" />
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">
                      Address
                    </h4>
                    <p className="text-gray-600">
                      AgriCorus, AJCE, Kanjirappally, India
                    </p>
                  </div>
                </div>
              </div>

              {/* Google Map */}
              <div className="w-full h-64 rounded-xl overflow-hidden shadow-md border">
                <iframe
                  title="AgriCorus Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3930.0386191016064!2d76.29988477476841!3d9.931232190177034!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b08731190d12e33%3A0xa4e9a7a1f12345c7!2sKochi%2C%20Kerala!5e0!3m2!1sen!2sin!4v1624611355523!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                ></iframe>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </>
  );
};

export default Contact;
