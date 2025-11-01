// src/pages/HowItWorks.jsx
import React from "react";
import { Link } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import {
    FaUserPlus,
    FaRocket,
    FaChartLine,
    FaCrown,
    FaQuoteLeft,
} from "react-icons/fa";
import { motion } from "framer-motion";
import UserHowItWorks from "./user-components/UserHowItWorks";

export default function HowItWorks({ handleLogout, user, isClient, userModeToggle }) {
    const steps = [
        {
            id: 1,
            icon: <FaUserPlus className="text-red-600 text-5xl mb-4" />,
            title: "1. Create & Connect",
            desc: "Sign up for your WeBoost account and securely connect your social media platforms — Instagram, TikTok, YouTube, Facebook, and more — all in one dashboard.",
        },
        {
            id: 2,
            icon: <FaRocket className="text-red-600 text-5xl mb-4" />,
            title: "2. Choose a Boost Plan",
            desc: "Select a plan that fits your goals. Whether you want to increase followers, engagement, or ad performance — WeBoost has a plan for you.",
        },
        {
            id: 3,
            icon: <FaChartLine className="text-red-600 text-5xl mb-4" />,
            title: "3. Track Your Performance",
            desc: "Use real-time analytics to monitor your growth. Track engagement rates, impressions, and follower activity — all from your intuitive dashboard.",
        },
        {
            id: 4,
            icon: <FaCrown className="text-red-600 text-5xl mb-4" />,
            title: "4. Scale & Grow",
            desc: "Watch your online presence grow. Automate content posting, analyze insights, and enjoy consistent performance boosts that help you stand out.",
        },
    ];

    const testimonials = [
        {
            id: 1,
            name: "Aisha Bello",
            role: "Instagram Influencer",
            feedback:
                "WeBoost helped me grow my Instagram audience by over 300% in just two months! The automation tools are a total game changer.",
        },
        {
            id: 2,
            name: "Kingsley Tech",
            role: "Digital Marketer",
            feedback:
                "The analytics dashboard is incredibly insightful. It’s like having a full social media team working for me 24/7.",
        },
        {
            id: 3,
            name: "Lola Brands",
            role: "E-commerce Store Owner",
            feedback:
                "My engagement rates doubled after I started using WeBoost. The platform is smooth, intuitive, and powerful!",
        },
    ];

    return (
        <>
            <Header handleLogout={handleLogout} user={user} isClient={isClient} userModeToggle={userModeToggle} />
            {isClient ? (
            <div className="bg-gray-50 min-h-screen py-16 px-6 md:px-20 overflow-hidden mt-20">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4">
                        How <span className="text-red-600">WeBoost</span> Works 🚀
                    </h1>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        Getting started with WeBoost is quick and effortless. Here’s how our
                        platform helps you take control of your social media growth and
                        maximize engagement across all channels.
                    </p>
                </motion.div>

                {/* Steps Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 max-w-7xl mx-auto mb-20">
                    {steps.map((step, index) => (
                        <motion.div
                            key={step.id}
                            initial={{ opacity: 0, y: 60 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.2, duration: 0.6 }}
                            className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 p-8 flex flex-col items-center text-center"
                        >
                            {step.icon}
                            <h2 className="text-xl font-bold text-gray-800 mb-3">
                                {step.title}
                            </h2>
                            <p className="text-gray-500 text-sm">{step.desc}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Testimonials Section */}
                <div className="bg-gradient-to-br  from-red-600 to-black text-white py-16 rounded-3xl shadow-2xl max-w-7xl mx-auto mb-20">
                    <motion.h2
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="text-center text-3xl font-bold mb-10"
                    >
                        What Our Users Say ❤️
                    </motion.h2>

                    <div className="flex flex-col md:flex-row justify-center gap-8 px-6 md:px-12">
                        {testimonials.map((t, index) => (
                            <motion.div
                                key={t.id}
                                initial={{ opacity: 0, x: index === 0 ? -50 : index === 2 ? 50 : 0 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.2, duration: 0.6 }}
                                className="bg-white text-black rounded-2xl shadow-xl p-6 flex-1 max-w-md hover:scale-105 transition-transform duration-300"
                            >
                                <FaQuoteLeft className="text-red-600 text-2xl mb-4" />
                                <p className="text-gray-700 italic mb-4">“{t.feedback}”</p>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{t.name}</h3>
                                    <p className="text-gray-500 text-sm">{t.role}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* CTA Section */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mt-10"
                >
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">
                        Ready to Boost Your Social Media Presence?
                    </h2>
                    <p className="text-gray-500 mb-6">
                        Join thousands of creators and businesses using WeBoost to grow faster,
                        smarter, and stronger.
                    </p>
                    <Link to={user ? "/dashboard" : "/signin"}>
                        <button className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-lg transition duration-300 shadow-md">
                            Get Started Today
                        </button>
                    </Link>
                </motion.div>
            </div>
            ) : (
                <UserHowItWorks user={user} />
            )}
            <Footer isClient={isClient} />
        </>
    );
}
