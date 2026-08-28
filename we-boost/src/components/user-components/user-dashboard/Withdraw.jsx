import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaWallet, FaInfoCircle, FaCheckCircle } from "react-icons/fa";
import { useTheme } from "../../../context//ThemeContext";
import API from "../../../lib/api";

export default function Withdraw() {
  const { theme } = useTheme();
  const navigate = useNavigate();

  const [walletBalance, setWalletBalance] = useState(0);
  const [banks, setBanks] = useState([]);
  const [formData, setFormData] = useState({
    amount: "",
    bankCode: "",
    bankName: "",
    accountNumber: "",
    accountName: "",
  });

  const [resolving, setResolving] = useState(false);
  const [verified, setVerified] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const fetchBalance = async () => {
    try {
      const res = await API.get("/users/stats");
      setWalletBalance(res.data.data.walletBalance || 0);
    } catch (err) {
      console.error("Error fetching wallet balance:", err);
    }
  };

  const fetchBanks = async () => {
    try {
      const res = await API.get("/withdrawals/banks");
      setBanks(res.data.data || []);
    } catch (err) {
      console.error("Error fetching bank list:", err);
    }
  };

  useEffect(() => {
    fetchBalance();
    fetchBanks();
  }, []);

  const handleBankChange = (e) => {
    const selected = banks.find((b) => b.code === e.target.value);
    setFormData({
      ...formData,
      bankCode: e.target.value,
      bankName: selected?.name || "",
    });
    setVerified(false);
  };

  const handleAccountNumberChange = (e) => {
    setFormData({ ...formData, accountNumber: e.target.value, accountName: "" });
    setVerified(false);
  };

  // Verify the account number resolves to a real account before letting
  // the form be submitted — catches typos before money would be sent to
  // the wrong person.
  const handleVerify = async () => {
    if (!formData.bankCode || formData.accountNumber.length !== 10) {
      alert("Select a bank and enter a valid 10-digit account number first.");
      return;
    }
    setResolving(true);
    try {
      const res = await API.post("/withdrawals/resolve-account", {
        accountNumber: formData.accountNumber,
        bankCode: formData.bankCode,
      });
      setFormData((prev) => ({ ...prev, accountName: res.data.data.account_name }));
      setVerified(true);
    } catch (err) {
      console.error("Error verifying account:", err);
      alert(err?.response?.data?.message || "Could not verify this account. Double-check the number and bank.");
      setVerified(false);
    } finally {
      setResolving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!verified) {
      alert("Please verify the account number first.");
      return;
    }

    setSubmitting(true);
    try {
      await API.post("/withdrawals", {
        amount: parseFloat(formData.amount),
        bankName: formData.bankName,
        bankCode: formData.bankCode,
        accountNumber: formData.accountNumber,
        accountName: formData.accountName,
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
      setFormData({ amount: "", bankCode: "", bankName: "", accountNumber: "", accountName: "" });
      setVerified(false);
      fetchBalance();
    } catch (err) {
      console.error("Error submitting withdrawal:", err);
      alert(err?.response?.data?.message || "Failed to submit withdrawal request.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = `w-full p-3 rounded-lg border outline-none ${
    theme === "dark"
      ? "bg-black border-gray-700 text-gray-200"
      : "bg-gray-50 border-gray-300 text-gray-800"
  }`;

  return (
    <div
      className={`min-h-screen p-6 transition-colors duration-300 ${
        theme === "dark" ? "bg-[#0f0f0f] text-white" : "bg-gray-50 text-gray-800"
      }`}
    >
      <h1 className="text-2xl font-bold mb-2">Withdraw Earnings</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        Withdraw your earnings directly to your bank account once you’ve met the minimum threshold.
      </p>

      {/* Wallet Summary */}
      <div
        className={`p-5 rounded-2xl flex items-center justify-between mb-8 shadow-md border ${
          theme === "dark"
            ? "bg-[#181818] border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        <div className="flex items-center gap-4">
          <FaWallet className="text-3xl text-red-600" />
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Wallet Balance</p>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              ₦{Number(walletBalance).toLocaleString()}
            </h2>
          </div>
        </div>
        <button
          onClick={() => navigate("/dashboard/add-funds")}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-lg transition"
        >
          Add Funds
        </button>
      </div>

      {/* Withdraw Form */}
      <form
        onSubmit={handleSubmit}
        className={`max-w-2xl mx-auto rounded-2xl shadow-md border p-8 space-y-6 ${
          theme === "dark"
            ? "bg-[#181818] border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        <div>
          <label className="block font-medium mb-2">Withdrawal Amount (₦)</label>
          <input
            type="number"
            placeholder="Enter amount (min ₦1000)"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            required
            min="1000"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block font-medium mb-2">Bank</label>
          <select
            value={formData.bankCode}
            onChange={handleBankChange}
            required
            className={inputClass}
          >
            <option value="">Select your bank</option>
            {banks.map((bank) => (
              <option key={bank.code} value={bank.code}>
                {bank.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-medium mb-2">Account Number</label>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter 10-digit account number"
              maxLength="10"
              value={formData.accountNumber}
              onChange={handleAccountNumberChange}
              required
              className={inputClass}
            />
            <button
              type="button"
              onClick={handleVerify}
              disabled={resolving}
              className="shrink-0 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium px-4 rounded-lg transition disabled:opacity-60"
            >
              {resolving ? "Checking..." : "Verify"}
            </button>
          </div>
        </div>

        {formData.accountName && (
          <div className={`flex items-center gap-2 text-sm ${verified ? "text-green-500" : "text-gray-500"}`}>
            {verified && <FaCheckCircle />}
            <span>Account name: <strong>{formData.accountName}</strong></span>
          </div>
        )}

        <div
          className={`flex items-start gap-3 text-sm p-3 rounded-md border-l-4 ${
            theme === "dark"
              ? "bg-[#1a1a1a] border-red-600 text-gray-300"
              : "bg-red-50 border-red-600 text-gray-700"
          }`}
        >
          <FaInfoCircle className="text-lg text-red-500 mt-1" />
          <p>
            Withdrawals are processed within <strong>24–48 hours</strong>. Minimum withdrawal is ₦1,000. You must verify your account before submitting.
          </p>
        </div>

        <button
          type="submit"
          disabled={submitting || !verified}
          className="w-full py-3 rounded-md font-semibold text-lg bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white shadow-lg hover:shadow-red-700/30 transition-all disabled:opacity-60"
        >
          {submitting ? "Submitting..." : "Withdraw Funds"}
        </button>

        {success && (
          <p className="text-green-500 font-medium text-center mt-3">
            ✅ Withdrawal request submitted successfully!
          </p>
        )}
      </form>
    </div>
  );
}