import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { FaWallet } from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import DashboardLayout from "./DashboardLayout";
import API from "../../lib/api";

export default function AddFunds({ isClient, userModeToggle }) {
  const { theme } = useTheme();
  const [amount, setAmount] = useState(0);
  const [method, setMethod] = useState("Paystack");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // After returning from Paystack/Flutterwave, confirm the payment with our
  // backend so the wallet balance actually updates.
  useEffect(() => {
    const reference = searchParams.get("reference");
    if (!reference) return;

    setVerifying(true);
    API.get(`/payments/verify/${reference}`)
      .then((res) => {
        alert(res.data.message || "Payment verified successfully!");
      })
      .catch((error) => {
        console.error(error);
        const msg = error?.response?.data?.message || "Payment verification failed.";
        alert(msg);
      })
      .finally(() => {
        setVerifying(false);
        // Clear the query params so a page refresh doesn't re-verify
        navigate("/dashboard/add-funds", { replace: true });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(amount) || amount < 100) {
      alert("Amount must be a valid number and at least ₦100");
      return;
    }

    setLoading(true);

    try {
      const res = await API.post(
        "/payments/initialize",
        { amount, paymentGateway: method }
      );

      const url = method === "Paystack" ? res.data.data.authorizationUrl : res.data.data.paymentLink;
      window.location.href = url;

    } catch (error) {
      console.error(error);
      const msg = error?.response?.data?.message || "Failed to initialize payment. Try again.";
      alert(msg);
    }

    setLoading(false);
  };

  return (
    <DashboardLayout setSidebarOpen={setSidebarOpen} sidebarOpen={sidebarOpen} isClient={isClient} userModeToggle={userModeToggle}>
      <div className={`flex flex-col h-screen w-full overflow-hidden ${theme === "dark" ? "bg-[#0f0f0f] text-white" : "bg-gray-50 text-gray-800"}`}>
        <div className="flex items-center gap-3 mb-8 px-4 md:px-8 py-10">
          <FaWallet className={`text-3xl ${theme === "dark" ? "text-red-500" : "text-red-600"}`} />
          <h1 className="text-2xl md:text-3xl font-bold">Add Funds</h1>
        </div>

        <div className="px-4 md:px-8">
          <div className={`p-6 rounded-2xl shadow-xl border max-w-xl ${theme === "dark" ? "bg-[#141414] border-gray-800" : "bg-white border-gray-200"}`}>
            {verifying && (
              <div className={`mb-4 p-3 rounded-md text-sm font-medium ${theme === "dark" ? "bg-yellow-900/30 text-yellow-300" : "bg-yellow-50 text-yellow-700"}`}>
                Confirming your payment, please wait...
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block mb-2 font-medium">Payment Gateway</label>
                <select
                  value={method}
                  disabled={loading}
                  onChange={(e) => setMethod(e.target.value)}
                  className={`w-full p-3 rounded-md border outline-none ${theme === "dark" ? "bg-black border-gray-700 text-gray-200" : "bg-gray-50 border-gray-300 text-gray-800"}`}
                >
                  <option>Paystack</option>
                </select>
                <p className={`text-xs mt-1 ${theme === "dark" ? "text-gray-500" : "text-gray-400"}`}>
                  Flutterwave is temporarily unavailable.
                </p>
              </div>

              <div>
                <label className="block mb-2 font-medium">Amount (₦)</label>
                <input
                  type="number"
                  value={amount}
                  disabled={loading}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  placeholder="Enter amount"
                  className={`w-full p-3 rounded-md border outline-none ${theme === "dark" ? "bg-black border-gray-700 text-gray-200" : "bg-gray-50 border-gray-300 text-gray-800"}`}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-md font-semibold text-lg bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white shadow-lg hover:shadow-red-700/30 transition-all disabled:opacity-50"
              >
                {loading ? "Processing..." : "Proceed to Payment"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}