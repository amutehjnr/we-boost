import React, { useEffect, useState } from "react";
import { FaPlus, FaTrash } from "react-icons/fa";
import AdminLayout from "./AdminLayout";
import API from "../../lib/api";

export default function AdminPricing() {
  const [serviceRates, setServiceRates] = useState({});
  const [serviceDescriptions, setServiceDescriptions] = useState({});
  const [taskRates, setTaskRates] = useState({});
  const [platformReservePercent, setPlatformReservePercent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [activePlatform, setActivePlatform] = useState("");

  // Add package form
  const [showAddPackage, setShowAddPackage] = useState(false);
  const [newPkgName, setNewPkgName] = useState("");
  const [newPkgRate, setNewPkgRate] = useState("");
  const [newPkgDesc, setNewPkgDesc] = useState("");

  // Preview calculator
  const [previewQty, setPreviewQty] = useState(1000);
  const [previewService, setPreviewService] = useState("");
  const [previewPlatform, setPreviewPlatform] = useState("");
  const [previewAction, setPreviewAction] = useState("");

  const packageNames = Object.keys(serviceRates);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await API.get("/admin/settings/pricing");
      const data = res.data.data || {};
      const rates = data.serviceRates || {};
      setServiceRates(rates);
      setServiceDescriptions(data.serviceDescriptions || {});
      setTaskRates(data.taskRates || {});
      setPlatformReservePercent(data.platformReservePercent || 0);

      const pkgs = Object.keys(rates);
      if (pkgs.length && !previewService) setPreviewService(pkgs[0]);
      else if (pkgs.length && !pkgs.includes(previewService))
        setPreviewService(pkgs[0]);

      const platforms = Object.keys(data.taskRates || {});
      if (platforms.length) {
        setActivePlatform((prev) => prev || platforms[0]);
        setPreviewPlatform((prev) => prev || platforms[0]);
        const actions = Object.keys(
          data.taskRates[platforms[0]] || {}
        );
        if (actions.length) setPreviewAction((prev) => prev || actions[0]);
      }
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to load pricing");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async (e) => {
    e?.preventDefault?.();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      await API.put("/admin/settings/pricing", {
        serviceRates,
        serviceDescriptions,
        taskRates,
        platformReservePercent: Number(platformReservePercent) || 0,
      });
      setMessage("Pricing saved. New orders will use these rates.");
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save pricing");
    } finally {
      setSaving(false);
    }
  };

  const setService = (key, value) => {
    setServiceRates((prev) => ({ ...prev, [key]: value }));
  };

  const setDesc = (key, value) => {
    setServiceDescriptions((prev) => ({ ...prev, [key]: value }));
  };

  const setTask = (platform, action, value) => {
    setTaskRates((prev) => ({
      ...prev,
      [platform]: {
        ...(prev[platform] || {}),
        [action]: value,
      },
    }));
  };

  const addPackage = () => {
    const name = newPkgName.trim();
    if (!name) {
      setError("Enter a package name.");
      return;
    }
    if (serviceRates[name] !== undefined) {
      setError(`Package "${name}" already exists.`);
      return;
    }
    const rate = parseFloat(newPkgRate);
    if (isNaN(rate) || rate < 0) {
      setError("Enter a valid rate (₦ per 1,000).");
      return;
    }

    setServiceRates((prev) => ({ ...prev, [name]: rate }));
    setServiceDescriptions((prev) => ({
      ...prev,
      [name]: newPkgDesc.trim(),
    }));
    setPreviewService(name);
    setNewPkgName("");
    setNewPkgRate("");
    setNewPkgDesc("");
    setShowAddPackage(false);
    setError("");
    setMessage(`Package "${name}" added. Click Save pricing to apply.`);
  };

  const removePackage = (name) => {
    if (!window.confirm(`Remove package "${name}"?`)) return;
    setServiceRates((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
    setServiceDescriptions((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
    setPreviewService((prev) => (prev === name ? "" : prev));
    setMessage(`Package "${name}" removed. Click Save pricing to apply.`);
  };

  const platforms = Object.keys(taskRates);
  const actionsForPreview =
    (previewPlatform && Object.keys(taskRates[previewPlatform] || {})) || [];

  const effectivePreviewService =
    previewService && serviceRates[previewService]
      ? previewService
      : packageNames[0] || "";

  const qty = Math.max(0, Number(previewQty) || 0);
  const clientPays =
    (qty / 1000) *
    (parseFloat(serviceRates[effectivePreviewService]) || 0);
  const perTask =
    parseFloat(taskRates[previewPlatform]?.[previewAction]) || 0;
  const distributed = qty * perTask;
  const reserved = clientPays - distributed;
  const marginPct = clientPays > 0 ? (reserved / clientPays) * 100 : 0;

  if (loading) {
    return (
      <AdminLayout>
        <p className="text-gray-500">Loading pricing...</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-2">Pricing Settings</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-2xl">
        Set what <strong>clients pay</strong> per 1,000 units, what{" "}
        <strong>task doers earn</strong> per action, and review the{" "}
        <strong>platform reserve</strong>.
      </p>

      {message && (
        <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm">
          {message}
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Client package rates */}
        <section className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#181818] p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-semibold">
                Client packages (₦ per 1,000)
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Amount charged to the client when they place an order.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowAddPackage((v) => !v);
                setError("");
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-red-600 hover:bg-red-700 text-white transition"
            >
              <FaPlus /> Add package
            </button>
          </div>

          {showAddPackage && (
            <div className="mb-5 p-4 rounded-xl border border-dashed border-red-300 dark:border-red-800 bg-red-50/40 dark:bg-red-900/10 space-y-3">
              <p className="text-sm font-medium">New package</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">
                    Package name
                  </label>
                  <input
                    type="text"
                    value={newPkgName}
                    onChange={(e) => setNewPkgName(e.target.value)}
                    placeholder="e.g. Premium, VIP, Starter"
                    className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">
                    Rate (₦ per 1,000)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={newPkgRate}
                    onChange={(e) => setNewPkgRate(e.target.value)}
                    placeholder="e.g. 35000"
                    className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black outline-none text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">
                  Description (shown on order form)
                </label>
                <textarea
                  rows={2}
                  value={newPkgDesc}
                  onChange={(e) => setNewPkgDesc(e.target.value)}
                  placeholder="Short description of this package quality / speed"
                  className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black outline-none text-sm"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={addPackage}
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-red-600 hover:bg-red-700 text-white"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddPackage(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 dark:border-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {packageNames.length === 0 && (
            <p className="text-sm text-gray-500 mb-2">
              No packages yet. Click <strong>Add package</strong> to create one.
            </p>
          )}

          <div className="space-y-4">
            {packageNames.map((key) => (
              <div
                key={key}
                className="rounded-xl border border-gray-200 dark:border-gray-700 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <h3 className="font-semibold text-base">{key}</h3>
                  <button
                    type="button"
                    onClick={() => removePackage(key)}
                    className="text-xs text-red-600 hover:text-red-700 flex items-center gap-1"
                  >
                    <FaTrash /> Remove
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Rate (₦ per 1,000)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={serviceRates[key] ?? ""}
                      onChange={(e) => setService(key, e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-black outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={serviceDescriptions[key] ?? ""}
                      onChange={(e) => setDesc(key, e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-black outline-none text-sm"
                      placeholder="Optional description"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Task doer rates */}
        <section className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#181818] p-5 shadow-sm">
          <h2 className="text-lg font-semibold mb-1">
            Task doer rates (₦ per action)
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            Amount credited when a task is approved.
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            {platforms.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setActivePlatform(p)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                  activePlatform === p
                    ? "bg-red-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {activePlatform && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.keys(taskRates[activePlatform] || {}).map((action) => (
                <div key={action}>
                  <label className="block text-sm font-medium mb-1">
                    {activePlatform} — {action}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={taskRates[activePlatform][action] ?? ""}
                    onChange={(e) =>
                      setTask(activePlatform, action, e.target.value)
                    }
                    className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-black outline-none"
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Reserve % */}
        <section className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#181818] p-5 shadow-sm">
          <h2 className="text-lg font-semibold mb-1">
            Target platform reserve %
          </h2>
          <p className="text-xs text-gray-500 mb-3">
            Optional target. Actual reserve = client pays − (qty × task rate).
          </p>
          <input
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={platformReservePercent}
            onChange={(e) => setPlatformReservePercent(e.target.value)}
            className="w-full max-w-xs p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-black outline-none"
          />
        </section>

        {/* Preview */}
        <section className="rounded-2xl border border-yellow-200 dark:border-yellow-900/40 bg-yellow-50/50 dark:bg-yellow-900/10 p-5">
          <h2 className="text-lg font-semibold mb-3">Order split preview</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            <div>
              <label className="block text-xs font-medium mb-1">Quantity</label>
              <input
                type="number"
                min="1"
                value={previewQty}
                onChange={(e) => setPreviewQty(e.target.value)}
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Package</label>
              <select
                value={effectivePreviewService}
                onChange={(e) => setPreviewService(e.target.value)}
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black outline-none text-sm"
              >
                {packageNames.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Platform</label>
              <select
                value={previewPlatform}
                onChange={(e) => {
                  setPreviewPlatform(e.target.value);
                  const acts = Object.keys(taskRates[e.target.value] || {});
                  setPreviewAction(acts[0] || "");
                }}
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black outline-none text-sm"
              >
                {platforms.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Action</label>
              <select
                value={previewAction}
                onChange={(e) => setPreviewAction(e.target.value)}
                className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-black outline-none text-sm"
              >
                {actionsForPreview.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
            <div className="rounded-xl bg-white dark:bg-black/40 border border-gray-200 dark:border-gray-700 p-4">
              <div className="text-xs text-gray-500 mb-1">Client pays</div>
              <div className="text-xl font-bold text-blue-600">
                ₦
                {clientPays.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
              </div>
            </div>
            <div className="rounded-xl bg-white dark:bg-black/40 border border-gray-200 dark:border-gray-700 p-4">
              <div className="text-xs text-gray-500 mb-1">
                Distributed to task doers
              </div>
              <div className="text-xl font-bold text-green-600">
                ₦
                {distributed.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {qty.toLocaleString()} × ₦{perTask}
              </div>
            </div>
            <div className="rounded-xl bg-white dark:bg-black/40 border border-gray-200 dark:border-gray-700 p-4">
              <div className="text-xs text-gray-500 mb-1">Platform reserve</div>
              <div
                className={`text-xl font-bold ${
                  reserved >= 0 ? "text-red-600" : "text-orange-500"
                }`}
              >
                ₦
                {reserved.toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {marginPct.toFixed(1)}% of client payment
                {reserved < 0
                  ? " (loss — raise client rate or lower doer rate)"
                  : ""}
              </div>
            </div>
          </div>
        </section>

        <button
          type="submit"
          disabled={saving}
          className="w-full sm:w-auto px-8 py-3 rounded-lg font-semibold bg-red-600 hover:bg-red-700 text-white transition disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save pricing"}
        </button>
      </form>
    </AdminLayout>
  );
}