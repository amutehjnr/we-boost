// src/pages/Pricing.jsx
import React from "react";
import Header from "../Header";
import Footer from "../Footer";
import { Link } from "react-router-dom";
import {
    FaFacebook,
    FaInstagram,
    FaTiktok,
    FaTwitter,
    FaYoutube,
    FaSpotify,
    FaMusic,
} from "react-icons/fa";

export default function Pricing({ handleLogout, user, isClient, userModeToggle }) {
    const platforms = [
        {
            name: "Facebook",
            icon: <FaFacebook className="text-blue-600 text-4xl" />,
            type: "social",
            rates: [
                { action: "Like", rate: "₦10" },
                { action: "Follow", rate: "₦20" },
                { action: "Comment", rate: "₦25" },
                { action: "Share", rate: "₦30" },
            ],
        },
        {
            name: "Instagram",
            icon: <FaInstagram className="text-pink-500 text-4xl" />,
            type: "social",
            rates: [
                { action: "Like", rate: "₦12" },
                { action: "Follow", rate: "₦25" },
                { action: "Comment", rate: "₦30" },
                { action: "Share", rate: "₦35" },
            ],
        },
        {
            name: "TikTok",
            icon: <FaTiktok className="text-black text-4xl" />,
            type: "social",
            rates: [
                { action: "Like", rate: "₦15" },
                { action: "Follow", rate: "₦30" },
                { action: "Comment", rate: "₦35" },
                { action: "Share", rate: "₦40" },
            ],
        },
        {
            name: "Twitter (X)",
            icon: <FaTwitter className="text-sky-500 text-4xl" />,
            type: "social",
            rates: [
                { action: "Like", rate: "₦10" },
                { action: "Follow", rate: "₦25" },
                { action: "Comment", rate: "₦20" },
                { action: "Retweet", rate: "₦30" },
            ],
        },
        {
            name: "YouTube",
            icon: <FaYoutube className="text-red-600 text-4xl" />,
            type: "social",
            rates: [
                { action: "Like", rate: "₦20" },
                { action: "Subscribe", rate: "₦40" },
                { action: "Comment", rate: "₦30" },
                { action: "Share", rate: "₦35" },
            ],
        },
        {
            name: "Spotify",
            icon: <FaSpotify className="text-green-500 text-4xl" />,
            type: "music",
            rates: [
                { action: "Per Track Stream", rate: "₦15" },
                { action: "Per Minute", rate: "₦3" },
            ],
        },
        {
            name: "Audiomack",
            icon: <FaMusic className="text-orange-500 text-4xl" />,
            type: "music",
            rates: [
                { action: "Per Track Stream", rate: "₦12" },
                { action: "Per Minute", rate: "₦2.5" },
            ],
        },
        {
            name: "YouTube Music",
            icon: <FaYoutube className="text-red-500 text-4xl" />,
            type: "music",
            rates: [
                { action: "Per Track Stream", rate: "₦18" },
                { action: "Per Minute", rate: "₦4" },
            ],
        },
    ];


    return (
        <>
            <Header handleLogout={handleLogout} user={user} isClient={isClient} userModeToggle={userModeToggle} />
            <div className="min-h-screen bg-gray-50 py-16 px-4 md:px-12 lg:px-20 mt-20">
                <div className="max-w-6xl mx-auto text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4">
                        💰 Earnings per Task
                    </h1>
                    <p className="text-gray-500 text-sm md:text-base max-w-2xl mx-auto">
                        See how much you can earn for every like, follow, comment, or stream you perform.
                        Complete more tasks and watch your wallet grow fast! 🚀
                    </p>
                </div>

                {/* Platform Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {platforms.map((platform, index) => (
                        <div
                            key={index}
                            className="bg-white shadow-lg hover:shadow-2xl rounded-2xl p-6 transition-transform transform hover:-translate-y-2 text-center border-t-4 border-red-600"
                        >
                            <div className="flex justify-center mb-4">{platform.icon}</div>
                            <h2 className="text-xl font-bold text-gray-800 mb-2">
                                {platform.name}
                            </h2>
                            <p className="text-gray-500 text-sm mb-4">
                                {platform.type === "social"
                                    ? "Earn for your social engagement actions"
                                    : "Earn while streaming and supporting artists"}
                            </p>

                            <div className="space-y-2">
                                {platform.rates.map((rate, i) => (
                                    <div
                                        key={i}
                                        className="flex justify-between bg-gray-100 hover:bg-red-50 text-gray-700 px-4 py-2 rounded-md text-sm md:text-base"
                                    >
                                        <span>{rate.action}</span>
                                        <span className="font-semibold text-red-600">{rate.rate}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="text-center mt-16">
                    <Link to={user ? "/dashboard" : "/signin"}>
                        <button className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-lg shadow-md transition duration-300">
                            Start Performing Tasks
                        </button>
                    </Link>
                </div>
            </div>
            <Footer />
        </>
    );
}
