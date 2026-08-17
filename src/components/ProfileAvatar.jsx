import { Link } from "react-router-dom"
import { FaUserCircle } from "react-icons/fa"

export default function ProfileAvatar({ user, handleLogout, setDropdownOpen, dropdownOpen }) {
    return (
        <div className="relative">
            <button
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="focus:outline-none"
            >
                {user.photoURL ? (
                    <img
                        src={user.photoURL}
                        alt="avatar"
                        className="w-10 h-10 rounded-full border-2 border-red-500 object-cover"
                    />
                ) : (
                    <FaUserCircle className="text-4xl text-gray-700" />
                )}
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-white shadow-lg rounded-lg border border-gray-200 z-50">
                    <div className="p-3 border-b text-gray-700 font-semibold">
                        Hi, {user.displayName || user.email}
                    </div>
                    <Link
                        to="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 hover:bg-gray-100 text-gray-700"
                    >
                        Dashboard
                    </Link>
                    <Link
                        to="/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 hover:bg-gray-100 text-gray-700"
                    >
                        Profile
                    </Link>
                    <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600 font-semibold"
                    >
                        Logout
                    </button>
                </div>
            )}
        </div>
    )
}