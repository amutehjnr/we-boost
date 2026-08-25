import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import API from "../../lib/api";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState(null);

  const fetchUsers = async (searchTerm = "") => {
    try {
      const res = await API.get(`/admin/users${searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : ""}`);
      setUsers(res.data.data || []);
    } catch (err) {
      console.error("Failed to load users:", err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(search);
  };

  const updateUser = async (id, updates) => {
    setBusyId(id);
    try {
      await API.put(`/admin/users/${id}`, updates);
      fetchUsers(search);
    } catch (err) {
      console.error("Failed to update user:", err);
      alert(err?.response?.data?.message || "Failed to update user.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Users</h1>

      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 max-w-sm p-2.5 rounded-lg border bg-gray-50 dark:bg-black border-gray-300 dark:border-gray-700"
        />
        <button type="submit" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          Search
        </button>
      </form>

      <div className="rounded-2xl shadow-md border overflow-x-auto bg-white dark:bg-[#181818] border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm text-left">
          <thead className="text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="py-3 px-5">Name</th>
              <th className="py-3 px-5">Email</th>
              <th className="py-3 px-5">Role</th>
              <th className="py-3 px-5">Status</th>
              <th className="py-3 px-5">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 px-5 text-center text-gray-500 dark:text-gray-400">
                  No users found.
                </td>
              </tr>
            )}
            {users.map((u) => (
              <tr key={u.id} className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-3 px-5">{u.fullName}</td>
                <td className="py-3 px-5">{u.email}</td>
                <td className="py-3 px-5 capitalize">{u.role}</td>
                <td className="py-3 px-5">
                  {u.isSuspended ? (
                    <span className="text-red-600 font-medium">Suspended</span>
                  ) : u.isActive ? (
                    <span className="text-green-600 font-medium">Active</span>
                  ) : (
                    <span className="text-gray-500 font-medium">Inactive</span>
                  )}
                </td>
                <td className="py-3 px-5">
                  <div className="flex flex-wrap gap-2">
                    <button
                      disabled={busyId === u.id}
                      onClick={() => updateUser(u.id, { isSuspended: !u.isSuspended })}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 disabled:opacity-60"
                    >
                      {u.isSuspended ? "Unsuspend" : "Suspend"}
                    </button>
                    {u.role !== "admin" ? (
                      <button
                        disabled={busyId === u.id}
                        onClick={() => updateUser(u.id, { role: "admin" })}
                        className="text-xs font-medium px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-600 disabled:opacity-60"
                      >
                        Make Admin
                      </button>
                    ) : (
                      <button
                        disabled={busyId === u.id}
                        onClick={() => updateUser(u.id, { role: u.isClient ? "client" : "user" })}
                        className="text-xs font-medium px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 disabled:opacity-60"
                      >
                        Remove Admin
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}