// src/pages/Support.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import Header from "./Header";
import Footer from "./Footer";
import {
    FaEnvelope,
    FaPhoneAlt,
    FaMapMarkerAlt,
    FaComments,
    FaPaperPlane,
    FaHeadset,
} from "react-icons/fa";

export default function Support({ handleLogout, user, isClient, userModeToggle }) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });

    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Placeholder for form submission logic
        console.log(formData);
        setIsSubmitted(true);
        setTimeout(() => setIsSubmitted(false), 3000);
    };

    return (
        <>
            <Header handleLogout={handleLogout} user={user} isClient={isClient} userModeToggle={userModeToggle} />
            <div className="bg-gray-50 min-h-screen py-16 px-6 md:px-20 overflow-hidden mt-20">
                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <FaHeadset className="text-red-600 text-6xl mx-auto mb-4" />
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4">
                        Need <span className="text-red-600">Help?</span> We're Here for You 💬
                    </h1>
                    <p className="text-gray-500 max-w-2xl mx-auto">
                        Whether you're experiencing an issue, have a question, or need
                        personalized guidance — our support team is ready to assist you.
                    </p>
                </motion.div>

                {/* Contact Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20 max-w-6xl mx-auto">
                    {[
                        {
                            icon: <FaEnvelope className="text-red-600 text-3xl mb-3" />,
                            title: "Email Support",
                            info: "support@weboost.com",
                        },
                        {
                            icon: <FaPhoneAlt className="text-red-600 text-3xl mb-3" />,
                            title: "Call Us",
                            info: "+234 123 456 7890",
                        },
                        {
                            icon: <FaComments className="text-red-600 text-3xl mb-3" />,
                            title: "Live Chat",
                            info: "Chat with our agents in real-time",
                        },
                        {
                            icon: <FaMapMarkerAlt className="text-red-600 text-3xl mb-3" />,
                            title: "Our Office",
                            info: "Abuja, Nigeria",
                        },
                    ].map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.2 }}
                            className="bg-white rounded-2xl shadow-md hover:shadow-2xl p-8 text-center transition-all duration-300"
                        >
                            {item.icon}
                            <h3 className="text-lg font-bold text-gray-800 mb-2">
                                {item.title}
                            </h3>
                            <p className="text-gray-600 text-sm">{item.info}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Contact Form Section */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-4xl mx-auto bg-white p-10 rounded-3xl shadow-xl"
                >
                    <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                        Send Us a Message ✉️
                    </h2>
                    <form
                        onSubmit={handleSubmit}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        <div>
                            <label className="block text-gray-600 font-medium mb-2">
                                Full Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="Enter your name"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-600 font-medium mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="Enter your email"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-gray-600 font-medium mb-2">
                                Subject
                            </label>
                            <input
                                type="text"
                                name="subject"
                                required
                                value={formData.subject}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="Enter the subject"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-gray-600 font-medium mb-2">
                                Message
                            </label>
                            <textarea
                                name="message"
                                rows="5"
                                required
                                value={formData.message}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="Type your message here..."
                            ></textarea>
                        </div>

                        <div className="md:col-span-2 text-center mt-4">
                            <button
                                type="submit"
                                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-lg transition duration-300 shadow-md inline-flex items-center gap-2"
                            >
                                <FaPaperPlane />
                                Send Message
                            </button>
                        </div>

                        {isSubmitted && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-green-600 font-semibold text-center col-span-2 mt-4"
                            >
                                ✅ Your message has been sent! We’ll get back to you shortly.
                            </motion.p>
                        )}
                    </form>
                </motion.div>

                {/* CTA Section */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mt-16"
                >
                    <h2 className="text-3xl font-bold text-gray-800 mb-4">
                        Prefer Instant Help?
                    </h2>
                    <p className="text-gray-500 mb-6">
                        Chat live with a WeBoost support agent for faster assistance.
                    </p>
                    <button className="bg-black hover:bg-gray-800 text-white font-semibold px-8 py-3 rounded-lg transition duration-300 shadow-md">
                        Start Live Chat
                    </button>
                </motion.div>
            </div>
            <Footer isClient={isClient} />
        </>
    );
}
