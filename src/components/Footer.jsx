import React from "react";
import { Link } from "react-router-dom";
import logo from '../../src/images/we-boost.png';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaYoutube } from "react-icons/fa";

const Footer = ({ isClient }) => {
    return (
        <footer className="bg-[#0f172a] text-gray-300 pt-16 pb-8 border-t border-gray-800">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                {/* Brand Section */}
                <div>
                    <Link to="/">
                        <h2 className="bg-white w-fit rounded-xl mb-3">
                            <img src={logo} alt="WeBoost Logo" className="w-32 m-2 inline-block" />
                        </h2>
                    </Link>
                    <p className="text-gray-400 text-sm leading-relaxed">
                        Boost your presence across all major social media platforms with our premium
                        growth services and smart automation tools.
                    </p>
                </div>

                {/* Quick Links */}
                <div>
                    <h3 className="text-white font-semibold mb-3">Quick Links</h3>
                    <ul className="space-y-2 text-sm">
                        <li><Link to="/" className="hover:text-red-500 transition">Home</Link></li>
                        <li><Link to={isClient ? "/services" : "/pricing"} className="hover:text-red-500 transition">{isClient ? "Services" : "Pricing"}</Link></li>
                        <li><Link to="/about" className="hover:text-red-500 transition">About Us</Link></li>
                    </ul>
                </div>

                {/* Resources */}
                <div>
                    <h3 className="text-white font-semibold mb-3">Resources</h3>
                    <ul className="space-y-2 text-sm">
                        <li><Link to="/support" className="hover:text-red-500 transition">Support</Link></li>
                        <li><Link to="/faq" className="hover:text-red-500 transition">FAQs</Link></li>
                    </ul>
                </div>

                {/* Social Links */}
                <div>
                    <h3 className="text-white font-semibold mb-3">Follow Us</h3>
                    <div className="flex space-x-4">
                        <a href="#" className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-800 hover:bg-red-500 transition">
                            <FaFacebookF />
                        </a>
                        <a href="#" className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-800 hover:bg-red-500 transition">
                            <FaTwitter />
                        </a>
                        <a href="#" className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-800 hover:bg-red-500 transition">
                            <FaInstagram />
                        </a>
                        <a href="#" className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-800 hover:bg-red-500 transition">
                            <FaLinkedinIn />
                        </a>
                        <a href="#" className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-800 hover:bg-red-500 transition">
                            <FaYoutube />
                        </a>
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="mt-12 border-t border-gray-800 pt-6 text-center text-sm text-gray-500">
                <p>
                    © {new Date().getFullYear()} <span className="text-white font-semibold"><span className="text-red-600">We</span>Boost</span>. All rights reserved.
                </p>
                <div className="mt-2">
                    <a href="#" className="hover:text-red-500 transition px-2">Privacy Policy</a> |
                    <a href="#" className="hover:text-red-500 transition px-2">Terms of Service</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
