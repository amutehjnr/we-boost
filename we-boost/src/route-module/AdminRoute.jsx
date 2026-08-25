import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API from "../lib/api";

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  const [checked, setChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) return;
    API.get("/users/profile")
      .then((res) => setIsAdmin(res.data.data.role === "admin"))
      .catch(() => setIsAdmin(false))
      .finally(() => setChecked(true));
  }, [user]);

  if (loading || (user && !checked)) return null;

  if (!user) return <Navigate to="/" />;
  if (!isAdmin) return <Navigate to="/dashboard" />;

  return children;
}