import React, { useState } from "react";
import { FaUserEdit, FaEnvelope, FaCalendarAlt, FaChartLine } from "react-icons/fa";
import { MdCampaign } from "react-icons/md";
import { FiUsers } from "react-icons/fi";
import Header from "./Header";

export default function Profile({ handleLogout, user: initialUser, isClient, userModeToggle }) {
    const [user, setUser] = useState({
        fullName: "John Doe",
        email: "john.doe@gmail.com",
        joinedDate: "March 12, 2024",
        bio: "Digital marketer passionate about boosting brands and growing social media presence.",
        stats: {
            campaigns: 12,
            followers: 3450,
            engagement: "78%"
        }
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState(user);

    const handleChange = (e) => {
        setEditForm({ ...editForm, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        setUser(editForm);
        setIsEditing(false);
    };

    return (
        <>
            <Header handleLogout={handleLogout} user={user} isClient={isClient} userModeToggle={userModeToggle} />
            <div className="min-h-screen bg-gray-50 flex flex-col items-center py-10 px-4 md:px-8 mt-20">
                {/* Header */}
                <h1 className="text-3xl font-extrabold text-black mb-8 text-center">
                    My <span className="text-red-600">Profile</span>
                </h1>

                {/* Profile Card */}
                <div className="bg-white shadow-lg rounded-2xl p-8 max-w-3xl w-full relative">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                            <img
                                src="https://cdn-icons-png.flaticon.com/512/847/847969.png"
                                alt="profile avatar"
                                className="w-28 h-28 rounded-full border-4 border-red-600 object-cover"
                            />
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-2xl font-bold text-gray-900">{user.fullName}</h2>
                            <div className="flex flex-col md:flex-row md:items-center text-gray-600 mt-2 gap-2">
                                <span className="flex items-center gap-2">
                                    <FaEnvelope className="text-red-500" /> {user.email}
                                </span>
                                <span className="flex items-center gap-2 md:ml-6">
                                    <FaCalendarAlt className="text-red-500" /> Joined {user.joinedDate}
                                </span>
                            </div>
                            <p className="mt-4 text-gray-700">{user.bio}</p>

                            {/* Edit Button */}
                            <button
                                onClick={() => setIsEditing(true)}
                                className="mt-4 flex items-center gap-2 bg-black text-white px-5 py-2 rounded-md font-semibold hover:bg-red-700 transition"
                            >
                                <FaUserEdit /> Edit Profile
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                        <div className="bg-gray-100 p-5 rounded-lg shadow-sm hover:shadow-md transition">
                            <MdCampaign className="mx-auto text-red-600 text-3xl mb-2" />
                            <h3 className="font-bold text-gray-800 text-lg">{user.stats.campaigns}</h3>
                            <p className="text-gray-600">Campaigns Created</p>
                        </div>

                        <div className="bg-gray-100 p-5 rounded-lg shadow-sm hover:shadow-md transition">
                            <FiUsers className="mx-auto text-red-600 text-3xl mb-2" />
                            <h3 className="font-bold text-gray-800 text-lg">{user.stats.followers}</h3>
                            <p className="text-gray-600">Followers Gained</p>
                        </div>

                        <div className="bg-gray-100 p-5 rounded-lg shadow-sm hover:shadow-md transition">
                            <FaChartLine className="mx-auto text-red-600 text-3xl mb-2" />
                            <h3 className="font-bold text-gray-800 text-lg">{user.stats.engagement}</h3>
                            <p className="text-gray-600">Engagement Rate</p>
                        </div>
                    </div>
                </div>

                {/* Edit Modal */}
                {isEditing && (
                    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
                        <div className="bg-white p-6 rounded-xl w-11/12 md:w-1/2 shadow-2xl relative">
                            <h2 className="text-2xl font-bold text-black mb-4">Edit Profile</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-gray-600 font-semibold mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={editForm.fullName}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-red-500 outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-600 font-semibold mb-1">Bio</label>
                                    <textarea
                                        name="bio"
                                        rows="3"
                                        value={editForm.bio}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-red-500 outline-none"
                                    ></textarea>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex justify-end gap-4 mt-6">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-5 py-2 bg-gray-200 text-gray-700 font-semibold rounded-md hover:bg-gray-300 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-5 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

