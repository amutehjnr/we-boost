import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { FaWallet, FaCopy, FaUniversity } from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import DashboardLayout from "./DashboardLayout";
import API from "../../lib/api";

export default function AddFunds({ isClient, userModeToggle }) {
  const { theme } = useTheme();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("Paystack");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [pendingDeposit, setPendingDeposit] = useState(null);
  const [previewBank, setPreviewBank] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isDark = theme === "dark";

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
        alert(error?.response?.data?.message || "Payment verification failed.");
      })
      .finally(() => {
        setVerifying(false);
        navigate("/dashboard/add-funds", { replace: true });
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (method !== "Manual") {
      setPreviewBank(null);
      return;
    }
    API.get("/payments/bank-details")
      .then((res) => setPreviewBank(res.data.data || null))
      .catch((err) => {
        console.error("Failed to load bank details:", err);
        setPreviewBank(null);
      });
  }, [method]);

  const copyText = async (text) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(String(text));
      alert("Copied!");
    } catch {
      alert(String(text));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const numAmount = Number(amount);
    if (!numAmount || isNaN(numAmount) || numAmount < 100) {
      alert("Amount must be a valid number and at least ₦100");
      return;
    }

    setLoading(true);

    try {
      const res = await API.post("/payments/initialize", {
        amount: numAmount,
        paymentGateway: method,
      });

      const data = res?.data?.data;

      if (method === "Manual") {
        const bd = data?.bankDetails;
        if (!bd) {
          alert(
            "Bank details were not returned. Ask an admin to set them under Admin → Bank Details."
          );
          return;
        }
        setPendingDeposit({
          reference: data.reference,
          paymentId: data.paymentId,
          amount: numAmount,
          bankDetails: bd,
        });
        return;
      }

      const url =
        method === "Paystack" ? data?.authorizationUrl : data?.paymentLink;

      if (!url) {
        alert("Payment link was not returned. Please try again.");
        return;
      }
      window.location.href = url;
    } catch (error) {
      console.error("Initialize payment error:", error);
      alert(
        error?.response?.data?.message ||
          "Failed to initialize payment. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass = `w-full p-3 rounded-md border outline-none ${
    isDark
      ? "bg-black border-gray-700 text-gray-200"
      : "bg-gray-50 border-gray-300 text-gray-800"
  }`;

  const DetailRow = ({ label, value }) => (
    <div className="flex items-start justify-between gap-3 py-2 border-b border-gray-200 dark:border-gray-700 last:border-0">
      <div className="min-w-0">
        <div className={`text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
          {label}
        </div>
        <div className="font-semibold break-all">{value || "—"}</div>
      </div>
      {value && value !== "—" && (
        <button
          type="button"
          onClick={() => copyText(value)}
          className={`shrink-0 p-2 rounded-md ${
            isDark
              ? "hover:bg-gray-800 text-gray-300"
              : "hover:bg-gray-200 text-gray-600"
          }`}
          title="Copy"
        >
          <FaCopy />
        </button>
      )}
    </div>
  );

  return (
    <DashboardLayout
      setSidebarOpen={setSidebarOpen}
      sidebarOpen={sidebarOpen}
      isClient={isClient}
      userModeToggle={userModeToggle}
    >
      <div
        className={`min-h-full w-full ${
          isDark ? "bg-[#0f0f0f] text-white" : "bg-gray-50 text-gray-800"
        }`}
      >
        <div className="flex items-center gap-3 p-4 md:p-8">
          <FaWallet
            className={`text-2xl ${isDark ? "text-red-500" : "text-red-600"}`}
          />
          <h1 className="text-2xl md:text-3xl font-bold">Add Funds</h1>
        </div>
        <div
          className={`text-sm p-3 rounded-md max-w-xl ${
            isDark
            ? "bg-yellow-900/25 text-yellow-200 border border-yellow-800/40"
            : "bg-yellow-50 text-yellow-900 border border-yellow-200"
          }`}
        >
          <strong>Note:</strong> Paystack card payments are temporarily
          unavailable. Please use <strong>Bank Transfer (Manual)</strong> to
          fund your wallet.
        </div>

        <div className="px-4 md:px-8 pb-10">
          <div
            className={`p-6 rounded-2xl shadow-xl border max-w-xl ${
              isDark
                ? "bg-[#141414] border-gray-800"
                : "bg-white border-gray-200"
            }`}
          >
            {verifying && (
              <div
                className={`mb-4 p-3 rounded-md text-sm font-medium ${
                  isDark
                    ? "bg-yellow-900/30 text-yellow-300"
                    : "bg-yellow-50 text-yellow-700"
                }`}
              >
                Confirming your payment, please wait...
              </div>
            )}

            {pendingDeposit ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-500 font-semibold text-lg">
                  <FaUniversity /> Transfer to this account
                </div>
                <p
                  className={`text-sm ${
                    isDark ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Send exactly{" "}
                  <strong>
                    ₦{Number(pendingDeposit.amount).toLocaleString()}
                  </strong>{" "}
                  and put the <strong>reference</strong> in the transfer
                  narration/description.
                </p>

                <div
                  className={`rounded-xl border p-4 ${
                    isDark
                      ? "border-gray-700 bg-black/40"
                      : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <DetailRow
                    label="Bank"
                    value={pendingDeposit.bankDetails.bankName}
                  />
                  <DetailRow
                    label="Account Name"
                    value={pendingDeposit.bankDetails.accountName}
                  />
                  <DetailRow
                    label="Account Number"
                    value={pendingDeposit.bankDetails.accountNumber}
                  />
                  <DetailRow
                    label="Amount"
                    value={`₦${Number(pendingDeposit.amount).toLocaleString()}`}
                  />
                  <DetailRow
                    label="Reference / Narration"
                    value={pendingDeposit.reference}
                  />
                </div>

                <div
                  className={`text-xs p-3 rounded-md ${
                    isDark
                      ? "bg-yellow-900/20 text-yellow-300"
                      : "bg-yellow-50 text-yellow-800"
                  }`}
                >
                  After you transfer, an admin will confirm and credit your
                  wallet. Your deposit stays <strong>Pending</strong> until
                  then.
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setPendingDeposit(null);
                    setAmount("");
                  }}
                  className={`w-full py-3 rounded-md font-semibold border transition ${
                    isDark
                      ? "border-gray-600 hover:bg-gray-800/40"
                      : "border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  Start another deposit
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block mb-2 font-medium">
                    Payment Method
                  </label>
                  <select
                    value={method}
                    disabled={loading}
                    onChange={(e) => setMethod(e.target.value)}
                    className={inputClass}
                  >
                    <option value="Paystack">Paystack (Card / Transfer)</option>
                    <option value="Manual">Bank Transfer (Manual)</option>
                  </select>
                </div>

                {method === "Manual" && (
                  <div
                    className={`rounded-xl border p-4 text-sm ${
                      isDark
                        ? "border-gray-700 bg-black/30"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className="font-semibold mb-2 flex items-center gap-2">
                      <FaUniversity /> Our bank account
                    </div>
                    {previewBank?.configured ? (
                      <>
                        <DetailRow label="Bank" value={previewBank.bankName} />
                        <DetailRow
                          label="Account Name"
                          value={previewBank.accountName}
                        />
                        <DetailRow
                          label="Account Number"
                          value={previewBank.accountNumber}
                        />
                        <p
                          className={`text-xs mt-2 ${
                            isDark ? "text-gray-500" : "text-gray-500"
                          }`}
                        >
                          After you click the button below, you will get a
                          unique reference to use as narration.
                        </p>
                      </>
                    ) : previewBank === null ? (
                      <p className="text-gray-500">Loading bank details...</p>
                    ) : (
                      <p className="text-red-500">
                        Bank details are not set yet. Please contact support or
                        ask an admin to configure them under{" "}
                        <strong>Admin → Bank Details</strong>.
                      </p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block mb-2 font-medium">Amount (₦)</label>
                  <input
                    type="number"
                    min="100"
                    step="1"
                    value={amount}
                    disabled={loading}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Minimum ₦100"
                    className={inputClass}
                  />
                </div>

                <button
                  type="submit"
                  disabled={
                    loading ||
                    (method === "Manual" &&
                      previewBank &&
                      !previewBank.configured)
                  }
                  className="w-full py-3 rounded-md font-semibold text-lg bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white shadow-lg transition-all disabled:opacity-50"
                >
                  {loading
                    ? "Processing..."
                    : method === "Manual"
                    ? "Generate payment reference"
                    : "Proceed to Payment"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}