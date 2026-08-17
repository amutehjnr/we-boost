import React from "react";
import { Link } from "react-router-dom";
import { FaInstagram, FaFacebookF, FaTwitter, FaYoutube, FaTiktok, FaLinkedinIn } from "react-icons/fa";
import { FaUserFriends, FaHeart, FaEye, FaComment, FaShare, FaChartLine } from "react-icons/fa";

const platforms = [
    {
        name: "Instagram",
        color: "from-pink-500 to-purple-600",
        icon: <FaInstagram className="text-4xl text-white" />,
        stats: ["Followers", "Likes", "Views", "Comments"],
    },
    {
        name: "Facebook",
        color: "from-blue-500 to-blue-700",
        icon: <FaFacebookF className="text-4xl text-white" />,
        stats: ["Page Likes", "Post Likes", "Followers", "Shares"],
    },
    {
        name: "Twitter",
        color: "from-sky-400 to-sky-600",
        icon: <FaTwitter className="text-4xl text-white" />,
        stats: ["Followers", "Likes", "Retweets", "Views"],
    },
    {
        name: "YouTube",
        color: "from-red-500 to-red-700",
        icon: <FaYoutube className="text-4xl text-white" />,
        stats: ["Subscribers", "Views", "Likes", "Comments"],
    },
    {
        name: "TikTok",
        color: "from-gray-700 to-gray-900",
        icon: <FaTiktok className="text-4xl text-white" />,
        stats: ["Followers", "Likes", "Views", "Shares"],
    },
    {
        name: "LinkedIn",
        color: "from-blue-500 to-indigo-700",
        icon: <FaLinkedinIn className="text-4xl text-white" />,
        stats: ["Connections", "Post Likes", "Company Follows", "Page Views"],
    },
];

export default function Hero2({ user }) {
    return (
        <>
            <div className="bg-black text-stone-300 mx-5 p-5 mt-5 rounded-md">
                <h2 className="text-4xl font-bold text-center tracking-wider mb-3">We are here for your social sky</h2>
                <p className="text-xl text-center tracking-wider mb-5">Boost your presence across all social media <br />
                    platforms with our premium services.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mt-12 mb-10">
                    {platforms.map((platform) => (
                        <div
                            key={platform.name}
                            className="bg-[#1e293b] rounded-2xl p-6 text-center shadow-lg hover:shadow-xl hover:scale-[1.02] transition-transform duration-300"
                        >
                            <div
                                className={`mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-br ${platform.color}`}
                            >
                                {platform.icon}
                            </div>
                            <h3 className="text-xl font-semibold mb-4">{platform.name}</h3>
                            <ul className="space-y-2 text-gray-300 text-sm">
                                {platform.stats.map((item) => (
                                    <li key={item} className="flex items-center justify-center gap-2">
                                        {item === "Followers" && <FaUserFriends />}
                                        {item === "Likes" && <FaHeart />}
                                        {item === "Views" && <FaEye />}
                                        {item === "Comments" && <FaComment />}
                                        {item === "Shares" && <FaShare />}
                                        {item === "Retweets" && <FaShare />}
                                        {item === "Page Views" && <FaChartLine />}
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>
            <Link to={user ? "/dashboard" : "/signin"} className="flex justify-center mt-10 mb-10 w-fit mx-auto">
                <button className="bg-black text-white font-bold py-2 px-4 rounded-md hover:scale-105 transition-transform duration-300">Get Started</button>
            </Link>
        </>
    );
}