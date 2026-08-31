import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import { FaFacebook, FaInstagram, FaTiktok, FaTwitter, FaYoutube, FaSpotify, FaLinkedin, FaTwitch, FaTelegram } from "react-icons/fa";
import { SiAudiomack, SiYoutubemusic } from "react-icons/si";
import { Link } from "react-router-dom";

// Matches the actual pricing used at checkout (NewOrder.jsx serviceRates)
// — keep these in sync if that ever changes.
const PRICE_TIERS = [
  { label: "Basic", rate: 10000 },
  { label: "Moderate", rate: 25000 },
  { label: "High", rate: 50000 },
];

export default function Services({ handleLogout, user, isClient, userModeToggle }) {
  const platforms = [
    {
      name: "Facebook",
      icon: <FaFacebook className="text-blue-600 text-5xl mb-4" />,
      desc: "Boost your page followers and post engagement quickly.",
      includes: "Followers, Likes, Comments, Shares",
    },
    {
      name: "Instagram",
      icon: <FaInstagram className="text-pink-500 text-5xl mb-4" />,
      desc: "Get authentic followers, likes, and views for your profile.",
      includes: "Followers, Likes, Comments, Shares",
    },
    {
      name: "TikTok",
      icon: <FaTiktok className="text-gray-900 dark:text-white text-5xl mb-4" />,
      desc: "Boost your TikTok visibility and increase followers fast.",
      includes: "Followers, Likes, Comments, Shares",
    },
    {
      name: "Twitter (X)",
      icon: <FaTwitter className="text-sky-500 text-5xl mb-4" />,
      desc: "Get followers, retweets, and likes to grow your influence.",
      includes: "Followers, Likes, Comments, Retweets",
    },
    {
      name: "YouTube",
      icon: <FaYoutube className="text-red-600 text-5xl mb-4" />,
      desc: "Increase your subscribers, views, and watch hours instantly.",
      includes: "Subscribers, Likes, Comments, Views",
    },
    {
      name: "LinkedIn",
      icon: <FaLinkedin className="text-blue-700 text-5xl mb-4" />,
      desc: "Grow your professional network and post engagement.",
      includes: "Followers, Likes, Comments, Shares",
    },
    {
      name: "Twitch",
      icon: <FaTwitch className="text-purple-600 text-5xl mb-4" />,
      desc: "Boost your channel followers and stream views.",
      includes: "Followers, Views",
    },
    {
      name: "Telegram",
      icon: <FaTelegram className="text-sky-400 text-5xl mb-4" />,
      desc: "Grow your channel or group's member count and reach.",
      includes: "Members, Views",
    },
    {
      name: "Spotify",
      icon: <FaSpotify className="text-green-500 text-5xl mb-4" />,
      desc: "Grow your Spotify audience and boost music streams easily.",
      includes: "Streams",
    },
    {
      name: "Audiomack",
      icon: <SiAudiomack className="text-yellow-500 text-5xl mb-4" />,
      desc: "Boost your Audiomack plays, followers, and engagement.",
      includes: "Streams",
    },
    {
      name: "YouTube Music",
      icon: <SiYoutubemusic className="text-red-500 text-5xl mb-4" />,
      desc: "Increase your YouTube Music streams and audience reach.",
      includes: "Streams",
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
            Select your preferred platform and choose a quality tier that best suits your
            growth goals. Pricing is per 1,000 — the same rate applies whether you're ordering
            followers, likes, comments, or shares on that platform.
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
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-2">
                {platform.desc}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
                Includes: {platform.includes}
              </p>
              <div className="w-full border-t border-gray-300 dark:border-gray-700 my-3"></div>
              <ul className="w-full space-y-2 text-gray-700 dark:text-gray-300 text-sm font-semibold">
                {PRICE_TIERS.map((tier) => (
                  <li
                    key={tier.label}
                    className="flex justify-between items-center bg-gray-100 dark:bg-[#2a2a2a] rounded-lg py-2 px-4"
                  >
                    <span className="font-normal text-gray-500 dark:text-gray-400">{tier.label}</span>
                    <span>₦{tier.rate.toLocaleString()} <span className="text-xs font-normal text-gray-400">/ 1K</span></span>
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