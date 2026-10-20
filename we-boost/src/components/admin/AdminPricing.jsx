import React, { useEffect, useState } from "react";
import {
  FaPlus,
  FaTrash,
  FaUsers,
  FaHandHoldingUsd,
  FaCalculator,
  FaSave,
} from "react-icons/fa";
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
  const [tab, setTab] = useState("clients");
  const [activePlatform, setActivePlatform] = useState("");

  const [showAddPackage, setShowAddPackage] = useState(false);
  const [newPkgName, setNewPkgName] = useState("");
  const [newPkgRate, setNewPkgRate] = useState("");
  const [newPkgDesc, setNewPkgDesc] = useState("");

  const [previewQty, setPreviewQty] = useState(1000);
  const [previewService, setPreviewService] = useState("");
  const [previewPlatform, setPreviewPlatform] = useState("");
  const [previewAction, setPreviewAction] = useState("");

  const packageNames = Object.keys(serviceRates);
  const platforms = Object.keys(taskRates);

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
      if (pkgs.length) {
        setPreviewService((prev) =>
          prev && rates[prev] !== undefined ? prev : pkgs[0]
        );
      }

      const plats = Object.keys(data.taskRates || {});
      if (plats.length) {
        setActivePlatform((prev) => prev || plats[0]);
        setPreviewPlatform((prev) => prev || plats[0]);
        const acts = Object.keys(data.taskRates[plats[0]] || {});
        if (acts.length) setPreviewAction((prev) => prev || acts[0]);
      }
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Could not load pricing.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
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
      setMessage("Saved. New orders will use these prices.");
      await load();
    } catch (err) {
      setError(err?.response?.data?.message || "Could not save pricing.");
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
      setError("Enter a package name (e.g. Basic, Premium).");
      return;
    }
    if (serviceRates[name] !== undefined) {
      setError(`"${name}" already exists.`);
      return;
    }
    const rate = parseFloat(newPkgRate);
    if (isNaN(rate) || rate < 0) {
      setError("Enter a valid price (₦ per 1,000).");
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
    setMessage(`"${name}" added. Click Save to apply.`);
  };

  const removePackage = (name) => {
    if (!window.confirm(`Delete package "${name}"?`)) return;
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
    setMessage(`"${name}" removed. Click Save to apply.`);
  };

  const effectivePreviewService =
    previewService && serviceRates[previewService] !== undefined
      ? previewService
      : packageNames[0] || "";

  const actionsForPreview =
    (previewPlatform && Object.keys(taskRates[previewPlatform] || {})) || [];

  const qty = Math.max(0, Number(previewQty) || 0);
  const clientPays =
    (qty / 1000) * (parseFloat(serviceRates[effectivePreviewService]) || 0);
  const perTask =
    parseFloat(taskRates[previewPlatform]?.[previewAction]) || 0;
  const distributed = qty * perTask;
  const reserved = clientPays - distributed;
  const marginPct = clientPays > 0 ? (reserved / clientPays) * 100 : 0;

  const inputClass =
    "w-full p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-black/40 outline-none focus:ring-2 focus:ring-red-500/40 text-sm";
  const cardClass =
    "rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#181818] p-5 shadow-sm";

  if (loading) {
    return (
      <AdminLayout>
        <p className="text-gray-500">Loading pricing…</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto pb-24">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-2">Pricing</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Control how money moves on every order in three simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/40 p-4">
            <div className="text-xs font-semibold text-blue-600 mb-1">
              STEP 1 · CLIENTS
            </div>
            <p className="text-sm font-medium">
              What the customer pays per 1,000
            </p>
          </div>
          <div className="rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/40 p-4">
            <div className="text-xs font-semibold text-green-600 mb-1">
              STEP 2 · WORKERS
            </div>
            <p className="text-sm font-medium">
              What each task doer earns per action
            </p>
          </div>
          <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40 p-4">
            <div className="text-xs font-semibold text-red-600 mb-1">
              STEP 3 · YOU KEEP
            </div>
            <p className="text-sm font-medium">
              Client payment minus worker payouts
            </p>
          </div>
        </div>

        {message && (
          <div className="mb-4 p-3 rounded-xl bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm border border-green-200 dark:border-green-800">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-6 p-1 rounded-xl bg-gray-100 dark:bg-gray-900/60">
          {[
            { id: "clients", label: "Client prices", icon: <FaUsers /> },
            { id: "workers", label: "Worker pay", icon: <FaHandHoldingUsd /> },
            { id: "calculator", label: "Profit check", icon: <FaCalculator /> },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold transition ${
                tab === t.id
                  ? "bg-red-600 text-white shadow"
                  : "text-gray-600 dark:text-gray-300 hover:bg-white/60 dark:hover:bg-black/30"
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {tab === "clients" && (
          <section className={cardClass}>
            <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
              <div>
                <h2 className="text-lg font-bold">Packages customers choose</h2>
                <p className="text-xs text-gray-500 mt-1 max-w-md">
                  Price is always <strong>₦ per 1,000</strong> units. Example:
                  ₦10,000 per 1,000 → 2,000 units costs ₦20,000.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAddPackage((v) => !v);
                  setError("");
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-red-600 hover:bg-red-700 text-white"
              >
                <FaPlus /> New package
              </button>
            </div>

            {showAddPackage && (
              <div className="my-4 p-4 rounded-xl border-2 border-dashed border-red-300 dark:border-red-800 bg-red-50/50 dark:bg-red-900/10 space-y-3">
                <p className="text-sm font-semibold">Create a new package</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={newPkgName}
                      onChange={(e) => setNewPkgName(e.target.value)}
                      placeholder="e.g. Premium"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Price (₦ per 1,000)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={newPkgRate}
                      onChange={(e) => setNewPkgRate(e.target.value)}
                      placeholder="e.g. 35000"
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">
                    Short description (optional)
                  </label>
                  <input
                    type="text"
                    value={newPkgDesc}
                    onChange={(e) => setNewPkgDesc(e.target.value)}
                    placeholder="Shown on the order form"
                    className={inputClass}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={addPackage}
                    className="px-4 py-2 rounded-xl text-sm font-semibold bg-red-600 text-white"
                  >
                    Add package
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddPackage(false)}
                    className="px-4 py-2 rounded-xl text-sm border border-gray-300 dark:border-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {packageNames.length === 0 ? (
              <p className="text-sm text-gray-500 py-6 text-center">
                No packages yet. Click <strong>New package</strong> to start.
              </p>
            ) : (
              <div className="space-y-3 mt-4">
                {packageNames.map((key) => (
                  <div
                    key={key}
                    className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-black/20 p-4"
                  >
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="font-bold text-base">{key}</span>
                      <button
                        type="button"
                        onClick={() => removePackage(key)}
                        className="text-xs text-red-600 hover:underline flex items-center gap-1"
                      >
                        <FaTrash /> Delete
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Price (₦ / 1,000)
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={serviceRates[key] ?? ""}
                          onChange={(e) => setService(key, e.target.value)}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          value={serviceDescriptions[key] ?? ""}
                          onChange={(e) => setDesc(key, e.target.value)}
                          placeholder="Optional"
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {tab === "workers" && (
          <section className={cardClass}>
            <h2 className="text-lg font-bold mb-1">What task doers earn</h2>
            <p className="text-xs text-gray-500 mb-4">
              This amount is added to a worker&apos;s wallet when their task is
              approved. Pick a platform, then set the pay for each action.
            </p>

            <div className="flex flex-wrap gap-2 mb-5">
              {platforms.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setActivePlatform(p)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
                    activePlatform === p
                      ? "bg-red-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {activePlatform ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.keys(taskRates[activePlatform] || {}).map((action) => (
                  <div
                    key={action}
                    className="rounded-xl border border-gray-100 dark:border-gray-800 p-3 bg-gray-50/80 dark:bg-black/20"
                  >
                    <label className="block text-sm font-semibold mb-1">
                      {action}
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                      ₦ paid when someone completes a {action.toLowerCase()} on{" "}
                      {activePlatform}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">₦</span>
                      <input
                        type="number"
                        min="0"
                        value={taskRates[activePlatform][action] ?? ""}
                        onChange={(e) =>
                          setTask(activePlatform, action, e.target.value)
                        }
                        className={inputClass}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No platforms configured.</p>
            )}

            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
              <label className="block text-sm font-semibold mb-1">
                Target profit % (optional note)
              </label>
              <p className="text-xs text-gray-500 mb-2">
                For your own reference only. Real profit is on the Profit check
                tab.
              </p>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={platformReservePercent}
                onChange={(e) => setPlatformReservePercent(e.target.value)}
                className={`${inputClass} max-w-xs`}
              />
            </div>
          </section>
        )}

        {tab === "calculator" && (
          <section className={cardClass}>
            <h2 className="text-lg font-bold mb-1">Profit check</h2>
            <p className="text-xs text-gray-500 mb-4">
              Simulate one order. See what the client pays, workers get, and you
              keep.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              <div>
                <label className="block text-xs font-medium mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={previewQty}
                  onChange={(e) => setPreviewQty(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">
                  Client package
                </label>
                <select
                  value={effectivePreviewService}
                  onChange={(e) => setPreviewService(e.target.value)}
                  className={inputClass}
                >
                  {packageNames.map((k) => (
                    <option key={k} value={k}>
                      {k} — ₦{Number(serviceRates[k] || 0).toLocaleString()}/1k
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">
                  Platform
                </label>
                <select
                  value={previewPlatform}
                  onChange={(e) => {
                    setPreviewPlatform(e.target.value);
                    const acts = Object.keys(taskRates[e.target.value] || {});
                    setPreviewAction(acts[0] || "");
                  }}
                  className={inputClass}
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
                  className={inputClass}
                >
                  {actionsForPreview.map((a) => (
                    <option key={a} value={a}>
                      {a} — ₦{taskRates[previewPlatform]?.[a] ?? 0}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/40 p-4">
                <div className="text-xs font-semibold text-blue-600 mb-1">
                  CLIENT PAYS
                </div>
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  ₦
                  {clientPays.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {qty.toLocaleString()} ÷ 1,000 × package rate
                </p>
              </div>
              <div className="rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/40 p-4">
                <div className="text-xs font-semibold text-green-600 mb-1">
                  WORKERS GET
                </div>
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                  ₦
                  {distributed.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {qty.toLocaleString()} people × ₦{perTask} each
                </p>
              </div>
              <div
                className={`rounded-2xl border p-4 ${
                  reserved >= 0
                    ? "bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/40"
                    : "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-900/40"
                }`}
              >
                <div
                  className={`text-xs font-semibold mb-1 ${
                    reserved >= 0 ? "text-red-600" : "text-orange-600"
                  }`}
                >
                  YOU KEEP
                </div>
                <div
                  className={`text-2xl font-bold ${
                    reserved >= 0
                      ? "text-red-700 dark:text-red-300"
                      : "text-orange-700 dark:text-orange-300"
                  }`}
                >
                  ₦
                  {reserved.toLocaleString(undefined, {
                    maximumFractionDigits: 0,
                  })}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {marginPct.toFixed(1)}% of client payment
                  {reserved < 0
                    ? " · Loss — raise client price or lower worker pay"
                    : ""}
                </p>
              </div>
            </div>
          </section>
        )}

        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-[#121212]/95 backdrop-blur p-4">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-xs text-gray-500">
              Changes only apply after you save. Existing orders keep old
              prices.
            </p>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold bg-red-600 hover:bg-red-700 text-white disabled:opacity-60"
            >
              <FaSave />
              {saving ? "Saving…" : "Save pricing"}
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}