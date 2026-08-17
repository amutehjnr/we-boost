import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import { FaFacebook, FaInstagram, FaTiktok, FaTwitter, FaYoutube, FaSpotify } from "react-icons/fa";
import { SiAudiomack, SiYoutubemusic } from "react-icons/si";
import { Link } from "react-router-dom";

export default function Services({ handleLogout, user, isClient, userModeToggle }) {
  const platforms = [
    {
      name: "Facebook",
      icon: <FaFacebook className="text-blue-600 text-5xl mb-4" />,
      desc: "Boost your page followers and post engagement quickly.",
      prices: ["₦5,000", "₦15,000", "₦25,000", "₦50,000"],
    },
    {
      name: "Instagram",
      icon: <FaInstagram className="text-pink-500 text-5xl mb-4" />,
      desc: "Get authentic followers, likes, and views for your profile.",
      prices: ["₦5,000", "₦15,000", "₦25,000", "₦50,000"],
    },
    {
      name: "TikTok",
      icon: <FaTiktok className="text-gray-900 dark:text-white text-5xl mb-4" />,
      desc: "Boost your TikTok visibility and increase followers fast.",
      prices: ["₦5,000", "₦15,000", "₦25,000", "₦50,000"],
    },
    {
      name: "Twitter (X)",
      icon: <FaTwitter className="text-sky-500 text-5xl mb-4" />,
      desc: "Get followers, retweets, and likes to grow your influence.",
      prices: ["₦5,000", "₦15,000", "₦25,000", "₦50,000"],
    },
    {
      name: "YouTube",
      icon: <FaYoutube className="text-red-600 text-5xl mb-4" />,
      desc: "Increase your subscribers, views, and watch hours instantly.",
      prices: ["₦5,000", "₦15,000", "₦25,000", "₦50,000"],
    },
    {
      name: "Spotify",
      icon: <FaSpotify className="text-green-500 text-5xl mb-4" />,
      desc: "Grow your Spotify audience and boost music streams easily.",
      prices: ["₦5,000", "₦15,000", "₦25,000", "₦50,000"],
    },
    {
      name: "Audiomack",
      icon: <SiAudiomack className="text-yellow-500 text-5xl mb-4" />,
      desc: "Boost your Audiomack plays, followers, and engagement.",
      prices: ["₦5,000", "₦15,000", "₦25,000", "₦50,000"],
    },
    {
      name: "YouTube Music",
      icon: <SiYoutubemusic className="text-red-500 text-5xl mb-4" />,
      desc: "Increase your YouTube Music streams and audience reach.",
      prices: ["₦5,000", "₦15,000", "₦25,000", "₦50,000"],
    },
  ];

  return (
    <>
      <Header handleLogout={handleLogout} user={user} isClient={isClient} userModeToggle={userModeToggle} />

      <div className="bg-gray-50 dark:bg-[#0f0f0f] min-h-screen py-16 px-6 md:px-20 mt-20 transition-colors duration-300">
        <div className="max-w-7xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 dark:text-white mb-4">
            Platform <span className="text-red-600">Boosting Services</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Select your preferred platform and choose a package that best suits your
            growth goals. Whether you’re a creator, influencer, or artist — we’ve got you covered.
          </p>
        </div>

        {/* Platform Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {platforms.map((platform, index) => (
            <div
              key={index}
              className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 p-6 flex flex-col items-center text-center"
            >
              {platform.icon}
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                {platform.name}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                {platform.desc}
              </p>
              <div className="w-full border-t border-gray-300 dark:border-gray-700 my-3"></div>
              <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm font-semibold">
                {platform.prices.map((price, i) => (
                  <li key={i} className="bg-gray-100 dark:bg-[#2a2a2a] rounded-lg py-2">
                    {price}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <Link to={user ? "/dashboard" : "/signin"}>
            <button className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-lg transition duration-300 shadow-md">
              Get Started with WeBoost
            </button>
          </Link>
        </div>
      </div>

      <Footer isClient={isClient} />
    </>
  );
}
