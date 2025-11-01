// src/pages/FAQ.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaQuestionCircle, FaChevronDown, FaChevronUp } from "react-icons/fa";
import Header from "./Header";
import Footer from "./Footer";

export default function FAQ({ handleLogout, user, isClient, userModeToggle }) {
    const faqs = [
        {
            question: "What is WeBoost and how does it work?",
            answer:
                "WeBoost is a social media marketing platform designed to help creators, influencers, and brands grow their online presence. You can connect your social accounts, choose a growth or ad plan, and monitor performance through real-time analytics — all from one simple dashboard.",
        },
        {
            question: "Is WeBoost safe to use with my social accounts?",
            answer:
                "Yes. WeBoost uses secure, encrypted API integrations and never asks for your password directly. Your data and account access are 100% protected under strict privacy protocols.",
        },
        {
            question: "Which social media platforms does WeBoost support?",
            answer:
                "We currently support Instagram, TikTok, YouTube, Facebook, and X (formerly Twitter). We're continuously expanding to include more platforms based on user demand.",
        },
        {
            question: "Can I cancel or change my plan anytime?",
            answer:
                "Absolutely! You can upgrade, downgrade, or cancel your subscription at any time directly from your dashboard — no hidden fees or complicated processes.",
        },
        {
            question: "Do you offer a free trial?",
            answer:
                "Yes! We offer a 7-day free trial on all plans so you can experience the platform before committing. You can cancel anytime during the trial period.",
        },
        {
            question: "What payment methods are accepted?",
            answer:
                "WeBoost accepts major payment methods including debit/credit cards, Paystack, and Flutterwave for easy, secure transactions in Naira (₦).",
        },
    ];

    const [openIndex, setOpenIndex] = useState(null);

    const toggleFAQ = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <>
            <Header handleLogout={handleLogout} user={user} isClient={isClient} userModeToggle={userModeToggle} />
            <div className="bg-gray-50 min-h-screen py-16 px-6 md:px-20 mt-20">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <FaQuestionCircle className="text-red-600 text-6xl mx-auto mb-4" />
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4">
                        Frequently Asked <span className="text-red-600">Questions</span>
                    </h1>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        Find answers to the most common questions about WeBoost — how it
                        works, how to get started, and how to grow your social media presence
                        with ease.
                    </p>
                </motion.div>

                {/* FAQ Accordion */}
                <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg divide-y divide-gray-200">
                    {faqs.map((faq, index) => (
                        <div key={index} className="p-6">
                            <button
                                onClick={() => toggleFAQ(index)}
                                className="flex justify-between items-center w-full text-left focus:outline-none"
                            >
                                <h3 className="text-lg md:text-xl font-semibold text-gray-800 hover:text-red-600 transition">
                                    {faq.question}
                                </h3>
                                {openIndex === index ? (
                                    <FaChevronUp className="text-red-600" />
                                ) : (
                                    <FaChevronDown className="text-gray-500" />
                                )}
                            </button>

                            <AnimatePresence initial={false}>
                                {openIndex === index && (
                                    <motion.div
                                        key="content"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="overflow-hidden"
                                    >
                                        <p className="text-gray-600 mt-4 text-sm md:text-base leading-relaxed">
                                            {faq.answer}
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>

                {/* CTA Section */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mt-16"
                >
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">
                        Still Have Questions?
                    </h2>
                    <p className="text-gray-500 mb-6">
                        Our support team is always ready to help. Contact us and get answers
                        tailored to your goals.
                    </p>
                    
                    <Link to="/support">
                        <button className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-lg transition duration-300 shadow-md">
                            Contact Support
                        </button>
                    </Link>
                </motion.div>
            </div>
            <Footer isClient={isClient} />
        </>
    );
}
