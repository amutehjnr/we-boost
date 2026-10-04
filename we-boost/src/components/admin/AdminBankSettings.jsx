import React, { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import API from "../../lib/api";

export default function AdminBankSettings() {
  const [form, setForm] = useState({
    bankName: "",
    accountName: "",
    accountNumber: "",
    note: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    API.get("/admin/settings/bank")
      .then((res) => {
        const d = res.data.data || {};
        setForm({
          bankName: d.bankName || "",
          accountName: d.accountName || "",
          accountNumber: d.accountNumber || "",
          note:
            d.note ||
            "Use the reference as your transfer narration so we can match your payment.",
        });
      })
      .catch((err) => {
        console.error(err);
        alert(err?.response?.data?.message || "Failed to load bank details");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.bankName.trim() || !form.accountName.trim() || !form.accountNumber.trim()) {
      alert("Bank name, account name and account number are required.");
      return;
    }
    setSaving(true);
    try {
      await API.put("/admin/settings/bank", form);
      alert("Bank details saved. Users will see the new details on the next deposit.");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Failed to save bank details");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-2">Bank Details</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        These details are shown to users when they choose{" "}
        <strong>Bank Transfer (Manual)</strong> on Add Funds. You can update them anytime.
      </p>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="max-w-lg space-y-4 rounded-2xl border p-6 bg-white dark:bg-[#181818] border-gray-200 dark:border-gray-700"
        >
          <div>
            <label className="block text-sm font-medium mb-1">Bank Name</label>
            <input
              name="bankName"
              value={form.bankName}
              onChange={handleChange}
              placeholder="e.g. GTBank"
              className="w-full p-3 rounded-md border outline-none bg-gray-50 dark:bg-black border-gray-300 dark:border-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Account Name</label>
            <input
              name="accountName"
              value={form.accountName}
              onChange={handleChange}
              placeholder="e.g. WeBoost Limited"
              className="w-full p-3 rounded-md border outline-none bg-gray-50 dark:bg-black border-gray-300 dark:border-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Account Number</label>
            <input
              name="accountNumber"
              value={form.accountNumber}
              onChange={handleChange}
              placeholder="e.g. 0123456789"
              className="w-full p-3 rounded-md border outline-none bg-gray-50 dark:bg-black border-gray-300 dark:border-gray-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Note (shown to users)</label>
            <textarea
              name="note"
              value={form.note}
              onChange={handleChange}
              rows={3}
              className="w-full p-3 rounded-md border outline-none bg-gray-50 dark:bg-black border-gray-300 dark:border-gray-700"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-md font-semibold bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Bank Details"}
          </button>
        </form>
      )}
    </AdminLayout>
  );
}