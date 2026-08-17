import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function Hero({ user }) {
  return (
    <section className="relative overflow-hidden  dark:from-[#121212] dark:to-[#181818] py-20 md:py-28">
      {/* Background accent shapes */}

      {/* Content */}
      <div className="relative flex flex-col items-center justify-center text-center px-6 md:px-12 z-10">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="font-extrabold leading-tight 
            text-4xl sm:text-5xl md:text-6xl lg:text-7xl 
            text-gray-900 dark:text-white max-w-4xl lg:max-w-full"
        >
          <span className="text-red-600">Boost</span> Your Social Media Followers{" "}
          <br className="hidden sm:block" />
          <span className="text-gray-700 dark:text-gray-200">
            Cheaply and Instantly 🚀
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="mt-6 text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl"
        >
          Get real engagement for your brand across Instagram, TikTok, YouTube, and more.
          100% safe, fast, and affordable.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-10 flex flex-wrap justify-center gap-4"
        >
          <Link
            to="/services"
            className="px-8 py-4 rounded-full bg-red-600 text-white font-semibold text-lg shadow-lg hover:bg-red-700 transition-transform transform hover:scale-105"
          >
            View Services
          </Link>
          <Link
            to={user ? "/dashboard" : "/signin"}
            className="px-8 py-4 rounded-full border-2 border-red-600 text-red-600 font-semibold text-lg hover:bg-red-600 hover:text-white transition-transform transform hover:scale-105"
          >
            Get Started
          </Link>
        </motion.div>
      </div>

    </section>
  );
}
