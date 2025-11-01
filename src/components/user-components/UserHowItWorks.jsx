import React, { use } from "react";
import { Link } from "react-router-dom";
import {
    FaUserPlus,
    FaTasks,
    FaWallet,
    FaSmileBeam,
    FaThumbsUp,
    FaPlayCircle,
} from "react-icons/fa";

export default function UserHowItWorks({ user }) {
    const steps = [
        {
            icon: <FaUserPlus className="text-red-600 text-4xl mb-4" />,
            title: "1. Create Your Account",
            desc: "Sign up in minutes and set your preferred social media or streaming platforms where you want to perform tasks.",
        },
        {
            icon: <FaTasks className="text-red-600 text-4xl mb-4" />,
            title: "2. Browse Available Tasks",
            desc: "Access your dashboard to find daily tasks like following, liking, commenting, or streaming songs. New tasks appear every day!",
        },
        {
            icon: <FaThumbsUp className="text-red-600 text-4xl mb-4" />,
            title: "3. Perform Simple Actions",
            desc: "Complete tasks directly on the listed platforms. Each verified action adds earnings to your wallet instantly.",
        },
        {
            icon: <FaWallet className="text-red-600 text-4xl mb-4" />,
            title: "4. Earn & Track Earnings",
            desc: "Watch your balance grow as you complete more tasks. You can see full transaction history in your user dashboard.",
        },
        {
            icon: <FaPlayCircle className="text-red-600 text-4xl mb-4" />,
            title: "5. Stream & Earn (Music Tasks)",
            desc: "Get paid for streaming tracks on Spotify, Audiomack, or YouTube Music. Earn more per minute streamed!",
        },
        {
            icon: <FaSmileBeam className="text-red-600 text-4xl mb-4" />,
            title: "6. Withdraw Your Money",
            desc: "Once you reach the minimum payout, withdraw directly to your bank account — fast, secure, and automated.",
        },
    ];

    return (
        <div className="bg-gray-50 dark:bg-[#181818] min-h-screen py-16 px-6 md:px-20 transition-colors duration-300 mt-20">
            {/* Header Section */}
            <div className="max-w-6xl mx-auto text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 dark:text-white mb-4">
                    💡 How It Works for <span className="text-red-600">Earners</span>
                </h1>
                <p className="text-gray-500 dark:text-gray-300 max-w-2xl mx-auto text-sm md:text-base">
                    Earn money effortlessly by performing simple social media and streaming tasks.
                    The more you engage, the more you earn — it’s that simple!
                </p>
            </div>

            {/* Steps Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto">
                {steps.map((step, index) => (
                    <div
                        key={index}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-2xl p-8 text-center transform hover:-translate-y-2 transition-all duration-300 border-t-4 border-red-600"
                    >
                        <div className="flex justify-center">{step.icon}</div>
                        <h2 className="text-lg md:text-xl font-bold text-gray-800 dark:text-white mt-4 mb-2">
                            {step.title}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300 text-sm">{step.desc}</p>
                    </div>
                ))}
            </div>

            {/* CTA Section */}
            <div className="text-center mt-20">
                <Link to={user ? "/dashboard" : "/signin"}>
                    <button className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-lg shadow-md transition duration-300">
                        Start Earning Now 🚀
                    </button>
                </Link>
            </div>
        </div>
    );
}
