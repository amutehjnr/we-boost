import React, { useState, useEffect } from 'react';
import './index.css';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import ProtectedRoute from './route-module/ProtectedRoute';
import { auth } from "./firebaseConfig";
import { useAuthState } from 'react-firebase-hooks/auth';
import Home from './components/Home';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import Services from './components/Services';
import Pricing from './components/user-components/Pricing';
import HowItWorks from './components/HowItWorks';
import Faq from './components/Faq';
import Support from './components/Support';
import Profile from './components/Profile';
import DashboardLayout from './components/client-dashboard/DashboardLayout';
import Dashboard from './components/Dashboard';
import NewOrder from './components/client-dashboard/NewOrder';
import MyOrders from './components/client-dashboard/MyOrders';
import AddFunds from './components/client-dashboard/Addfunds';
import FundsHistory from './components/client-dashboard/FundsHistory';
import UserDashboardHome from './components/user-components/user-dashboard/UserDahboardHome';
import UserDashboardLayout from './components/user-components/user-dashboard/UserDashboardLayout';
import AvailableTask from './components/user-components/user-dashboard/AvailableTask';
import MyTasks from './components/user-components/user-dashboard/MyTask';
import Earnings from './components/user-components/user-dashboard/Earnings';
import LinkedAccounts from './components/user-components/user-dashboard/LinkedAcc';
import Withdraw from './components/user-components/user-dashboard/Withdraw';
import Settings from './components/user-components/user-dashboard/Settings';

function App() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");   // State for email input
  const [password, setPassword] = useState("");   // State for password input
  const [error, setError] = useState("");   // State for error messages
  const [darkMode, setDarkMode] = useState(false); // State for dark mode toggle
  const [loading, setLoading] = useState(false);  // State for loading indicator
  const [isClient, setIsClient] = useState(true); // State for client mode

  const [user] = useAuthState(auth); // Get current user from Firebase Auth

 // 🧩 Validation and login handler
  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!email) return setError("Email is required.");
    if (!/\S+@\S+\.\S+/.test(email)) return setError("Please enter a valid email.");
    if (password.length < 8)
      return setError("Password must be at least 8 characters long.");

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      // ✅ Redirect to dashboard after successful login
      navigate(isClient ? "/dashboard" : "/user-dashboard");
    } catch (error) {
      // 🧾 Handle Firebase auth errors nicely
      if (error.code === "auth/invalid-credential") {
        setError("Invalid email or password. Please try again.");
      } else if (error.code === "auth/user-not-found") {
        setError("No user found with this email.");
      } else if (error.code === "auth/wrong-password") {
        setError("Incorrect password. Try again.");
      } else {
        setError("Something went wrong. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Function to handle logout
  const handleLogout = async () => {
    await signOut(auth);
  };

  // When darkMode changes, apply/remove `dark` class on <html>
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  function userModeToggle() {
    setIsClient(prev => !prev);
  }

  return (
    <>
      <Routes>
        <Route path='/' element={<Home handleLogout={handleLogout} user={user} isClient={isClient} userModeToggle={userModeToggle} />} />
        <Route path='/signup' element={<SignUp />} />
        <Route path='/signin' element={<SignIn
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          error={error}
          handleSignIn={handleSignIn}
          loading={loading}
        />} />
        <Route path='/services' element={<Services handleLogout={handleLogout} user={user} isClient={isClient} userModeToggle={userModeToggle} />} />
        <Route path='/pricing' element={<Pricing handleLogout={handleLogout} user={user} isClient={isClient} userModeToggle={userModeToggle} />} />
        <Route path='/how-it-works' element={<HowItWorks handleLogout={handleLogout} user={user} isClient={isClient} userModeToggle={userModeToggle} />} />
        <Route path='/faq' element={<Faq handleLogout={handleLogout} user={user} isClient={isClient} userModeToggle={userModeToggle} />} />
        <Route path='/support' element={<Support handleLogout={handleLogout} user={user} isClient={isClient} userModeToggle={userModeToggle} />} />
        <Route path='/profile' element={
            <ProtectedRoute>
              <Profile isClient={isClient} userModeToggle={userModeToggle} />
            </ProtectedRoute>
          }
        />

        // Client Dashboard Routes
        <Route path='/dashboard-layout' element={
          <ProtectedRoute>
            <DashboardLayout handleLogout={handleLogout} user={user} isClient={isClient} userModeToggle={userModeToggle} />
          </ProtectedRoute>
        } />
        <Route path='/dashboard' element={
          <ProtectedRoute>
            <Dashboard user={user} handleLogout={handleLogout} isClient={isClient} userModeToggle={userModeToggle} />
          </ProtectedRoute>
        } />
        <Route path='/dashboard/new-order' element={
          <ProtectedRoute>
            <NewOrder darkMode={darkMode} setDarkMode={setDarkMode} isClient={isClient} userModeToggle={userModeToggle} />
          </ProtectedRoute>
        } />
        <Route path='/dashboard/my-orders' element={
          <ProtectedRoute>
            <MyOrders isClient={isClient} userModeToggle={userModeToggle} />
          </ProtectedRoute>
        } />
        <Route path='/dashboard/add-funds' element={
          <ProtectedRoute>
            <AddFunds isClient={isClient} userModeToggle={userModeToggle} />
          </ProtectedRoute>
        } />
        <Route path='/dashboard/fund-history' element={
          <ProtectedRoute>
            <FundsHistory isClient={isClient} userModeToggle={userModeToggle} />
          </ProtectedRoute>
        } />

        // User Dashboard Routes
        <Route path='/user-dashboard' element={
          <ProtectedRoute>
            <UserDashboardLayout isClient={isClient} userModeToggle={userModeToggle} />
          </ProtectedRoute>
        }>
          <Route index element={
            <ProtectedRoute>
              <UserDashboardHome isClient={isClient} userModeToggle={userModeToggle} />
            </ProtectedRoute>
          } />
          <Route path='/user-dashboard/tasks' element={
            <ProtectedRoute>
              <AvailableTask isClient={isClient} userModeToggle={userModeToggle} />
            </ProtectedRoute>
          } />
          <Route path='/user-dashboard/my-tasks' element={
            <ProtectedRoute>
              <MyTasks isClient={isClient} userModeToggle={userModeToggle} />
            </ProtectedRoute>
          } />
          <Route path='/user-dashboard/earnings' element={
            <ProtectedRoute>
              <Earnings isClient={isClient} userModeToggle={userModeToggle} />
            </ProtectedRoute>
          } />
          <Route path='/user-dashboard/accounts' element={
            <ProtectedRoute>
              <LinkedAccounts isClient={isClient} userModeToggle={userModeToggle} />
            </ProtectedRoute>
          } />
          <Route path='/user-dashboard/withdraw' element={
            <ProtectedRoute>
              <Withdraw isClient={isClient} userModeToggle={userModeToggle} />
            </ProtectedRoute>
          } />
          <Route path='/user-dashboard/settings' element={
            <ProtectedRoute>
              <Settings isClient={isClient} userModeToggle={userModeToggle} />
            </ProtectedRoute>
          } />
        </Route>
      </Routes>
    </>
  );
}

export default App;
