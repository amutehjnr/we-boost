import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import { FaUserCircle } from "react-icons/fa";
import { MdSpaceDashboard } from "react-icons/md";
import {CgProfile} from "react-icons/cg";
import logo from "../../src/images/we-boost.png";
import ProfileAvatar from "./ProfileAvatar";
import ModeToggle from "./ModeToggle";

export default function Header({ handleLogout, user, isClient, setIsClient, userModeToggle }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const toggleMenu = () => setMobileMenuOpen(!mobileMenuOpen);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <header className="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
            <nav className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
                {/* Logo */}
                <Link to="/">
                    <img src={logo} alt="WeBoost Logo" className="w-32 md:w-40" />
                </Link>

                {/* Desktop Menu */}
                <div className="hidden lg:flex gap-8 items-center">
                    <Link to="/" className="text-gray-700 hover:text-red-600 text-lg font-medium">
                        Home
                    </Link>

                    <Link to={isClient ? "/services" : "/pricing"} className="text-gray-700 hover:text-red-600 text-lg font-medium">
                        {isClient ? "Services" : "Pricing"}
                    </Link>

                    <Link to="/support" className="text-gray-700 hover:text-red-600 text-lg font-medium">
                        Support
                    </Link>
                    <Link to="/faq" className="text-gray-700 hover:text-red-600 text-lg font-medium">
                        FAQ
                    </Link>
                    <Link to="/how-it-works" className="text-gray-700 hover:text-red-600 text-lg font-medium">
                        How it Works
                    </Link>
                </div>

                <ModeToggle isClient={isClient} setIsClient={setIsClient} userModeToggle={userModeToggle} />

                {/* Auth Buttons (Desktop) */}
                {!user ? (
                    <div className="hidden lg:flex items-center gap-6">
                        <Link to="/signin">
                            <button className="text-red-600 font-semibold text-lg hover:text-red-700 hover:font-bold">
                                Login
                            </button>
                        </Link>
                        <Link to="/signup">
                            <button className="bg-black text-white font-semibold text-lg py-2 px-5 rounded-md hover:bg-gray-700 transition">
                                Sign Up
                            </button>
                        </Link>
                    </div>
                ) : (
                    <div className="hidden lg:block">
                        <ProfileAvatar
                            user={user}
                            handleLogout={handleLogout}
                            setDropdownOpen={setDropdownOpen}
                            dropdownOpen={dropdownOpen}
                        />
                    </div>
                )}

                {/* Mobile Menu Button */}
                <button
                    onClick={toggleMenu}
                    className="lg:hidden text-3xl text-gray-700 focus:outline-none"
                >
                    {mobileMenuOpen ? <FiX /> : <FiMenu />}
                </button>
            </nav>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="lg:hidden bg-white border-t border-gray-200 shadow-md">
                    <div className="grid">
                        <Link to="/" className="text-gray-700 hover:text-red-600 text-lg font-medium text-center my-2" onClick={toggleMenu}>
                            Home
                        </Link>
                        <Link to={isClient ? "/services" : "/pricing"} className="text-gray-700 hover:text-red-600 text-lg font-medium text-center my-2" onClick={toggleMenu}>
                            {isClient ? "Services" : "Pricing"}
                        </Link>
                        <Link to="/support" className="text-gray-700 hover:text-red-600 text-lg font-medium text-center my-2" onClick={toggleMenu}>
                            Support
                        </Link>
                        <Link to="/faq" className="text-gray-700 hover:text-red-600 text-lg font-medium text-center my-2" onClick={toggleMenu}>
                            FAQ
                        </Link>
                        <Link to="/how-it-works" className="text-gray-700 hover:text-red-600 text-lg font-medium text-center my-2" onClick={toggleMenu}>
                            How it Works
                        </Link>

                        {!user ? (
                            <div className="grid mx-auto my-4">
                                <Link to="/signin" className="flex justify-center">
                                    <button className=" text-red-600 py-2  font-semibold hover:bg-red-50 text-center">
                                        Login
                                    </button>
                                </Link>
                                <Link to="/signup" className="">
                                    <button className=" bg-black text-white py-2 mt-2 rounded-md px-8 font-semibold hover:bg-gray-800 transition">
                                        Sign Up
                                    </button>
                                </Link>
                            </div>
                        ) : (
                            <div className="flex justify-center gap-8 m-10 flex-wrap">
                                <Link className="flex items-center font-semibold" to="/profile">
                                    <CgProfile className="inline-block mr-1 text-red-600" />
                                    Profile
                                </Link>
                                <Link className="flex items-center font-semibold" to="/dashboard">
                                    <MdSpaceDashboard className="inline-block mr-1 text-red-600" />
                                    Dashboard
                                </Link>
                                <button className="font-semibold text-red-600 hover:bg-red-400" onClick={handleLogout}>Logout</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
