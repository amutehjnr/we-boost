import React from "react";
import { Link } from "react-router-dom";
import { FaMoneyBillWave, FaTasks, FaStar, FaUserCheck, FaArrowRight } from "react-icons/fa";
import { motion } from "framer-motion";

export default function UserHome({ user }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-red-50 dark:from-[#0f0f0f] dark:via-[#1a1a1a] dark:to-[#111111] text-gray-800 dark:text-gray-100 transition-colors duration-500">
      {/* Hero Section */}
      <section className="text-center py-24 px-6 md:px-12 lg:px-24 mt-5">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight"
        >
          Earn <span className="text-red-600">Real Money</span> by Completing
          <br className="hidden md:block" /> Simple Social Media Tasks 💰
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-10"
        >
          Get paid instantly when you follow, like, comment, or stream content from real people.
          No investment, no stress — just simple tasks and real earnings.
        </motion.p>

        <Link to={user ? "/dashboard" : "/signin"}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-10 py-4 rounded-full text-lg shadow-lg transition"
          >
            Start Earning Now <FaArrowRight className="inline ml-2" />
          </motion.button>
        </Link>
      </section>

      {/* Earning Highlights Section */}
      <section className="py-20 px-6 md:px-16 bg-white dark:bg-[#181818] border-t border-gray-200 dark:border-gray-800 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-12">
          How You Earn on <span className="text-red-600">WeBoost</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 max-w-6xl mx-auto">
          {[
            {
              icon: <FaTasks className="text-red-600 text-4xl mb-4" />,
              title: "Pick a Task",
              desc: "Choose from hundreds of social media tasks — follow, like, or stream.",
            },
            {
              icon: <FaUserCheck className="text-green-600 text-4xl mb-4" />,
              title: "Complete It",
              desc: "Perform the action as instructed and submit proof of completion.",
            },
            {
              icon: <FaStar className="text-yellow-500 text-4xl mb-4" />,
              title: "Get Verified",
              desc: "Your submission is reviewed and approved by our system or client.",
            },
            {
              icon: <FaMoneyBillWave className="text-red-600 text-4xl mb-4" />,
              title: "Withdraw Earnings",
              desc: "Instantly withdraw your money to your bank or wallet — no delay!",
            },
          ].map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              className="bg-gray-50 dark:bg-[#222] p-8 rounded-2xl shadow-lg hover:shadow-2xl transition"
            >
              <div className="flex justify-center">{step.icon}</div>
              <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Earnings Motivation Section */}
      <section className="py-24 px-6 md:px-20 bg-gradient-to-r from-red-600 to-red-700 text-white text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-bold mb-6"
        >
          Your Time Online Can Earn You Money 💸
        </motion.h2>
        <p className="text-lg max-w-3xl mx-auto mb-10 opacity-90">
          Earn up to <span className="font-bold">₦50,000+ monthly</span> just by completing tasks on
          Facebook, Instagram, TikTok, YouTube, and more — all from your phone.
        </p>

        <Link to={user ? "/user-dashboard/tasks" : "/signin"}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white text-red-600 font-bold px-10 py-4 rounded-full text-lg shadow-lg hover:bg-gray-100 transition"
          >
            Explore Tasks
          </motion.button>
        </Link>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6 md:px-20 bg-gray-50 dark:bg-[#121212] text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-12">
          What Our <span className="text-red-600">Top Earners</span> Say
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {[
            {
              name: "Ada O.",
              text: "I earned over ₦30,000 in my first two weeks! It’s super easy and fun.",
            },
            {
              name: "Kelvin U.",
              text: "I do tasks during my free time and withdraw anytime I want — very smooth experience.",
            },
            {
              name: "Mary A.",
              text: "It’s real! I’ve made consistent income just by liking and following accounts daily.",
            },
          ].map((t, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2, duration: 0.6 }}
              className="bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-md hover:shadow-xl p-8 transition"
            >
              <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm italic">
                “{t.text}”
              </p>
              <h4 className="font-bold text-red-600">{t.name}</h4>
              <p className="text-xs text-gray-500">Verified Earner</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 text-center">
        <motion.h3
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-2xl md:text-3xl font-semibold mb-8"
        >
          Ready to turn your scrolling into income?
        </motion.h3>
        <Link to={user ? "/user-dashboard/tasks" : "/signin"}>
          <button className="bg-red-600 hover:bg-red-700 text-white font-semibold px-10 py-4 rounded-full text-lg shadow-lg transition">
            Start Performing Tasks
          </button>
        </Link>
      </section>
    </div>
  );
}
