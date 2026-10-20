// src/pages/NewOrder.jsx
import React, { useState, useEffect, useMemo } from "react";
import DashboardLayout from "./DashboardLayout";
import { FaShoppingCart, FaInfoCircle } from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";
import API from "../../lib/api";

const FALLBACK_PLATFORMS = [
  "Facebook",
  "Instagram",
  "TikTok",
  "Twitter",
  "YouTube",
  "WhatsApp",
  "Telegram",
  "Spotify",
  "Audiomack",
  "Snapchat",
  "Threads",
  "LinkedIn",
  "Google",
  "Trustpilot",
  "Website",
];

const FALLBACK_CATEGORIES = [
  "Followers",
  "Likes",
  "Views",
  "Comments",
  "Shares",
  "Streams",
  "Members",
  "Reviews",
  "Votes",
  "Other",
];

export default function NewOrder({ isClient, userModeToggle }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme } = useTheme();

  const [formData, setFormData] = useState({
    platform: "Facebook",
    category: "Followers",
    service: "",
    username: "",
    quantity: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [serviceRates, setServiceRates] = useState({});
  const [serviceDescriptions, setServiceDescriptions] = useState({});
  const [catalog, setCatalog] = useState([]);
  const [platforms, setPlatforms] = useState(FALLBACK_PLATFORMS);
  const [platformCategories, setPlatformCategories] = useState({});

  useEffect(() => {
    API.get("/orders/pricing")
      .then((res) => {
        const data = res.data?.data || {};
        const rates = data.serviceRates || {};
        const descs = data.serviceDescriptions || {};
        const items = (data.serviceCatalog || []).filter(
          (s) => s.active !== false && (s.unitPricePer1000 > 0 || rates[s.title])
        );

        setServiceRates(rates);
        setServiceDescriptions(descs);
        setCatalog(items);

        if (data.platforms?.length) setPlatforms(data.platforms);
        if (data.platformCategories)
          setPlatformCategories(data.platformCategories);

        // Pick a sensible default service for current platform/category
        setFormData((prev) => {
          const match = items.find(
            (s) =>
              s.platform === prev.platform &&
              s.category === prev.category &&
              (rates[s.title] || s.unitPricePer1000)
          );
          const anyForPlatform = items.find((s) => s.platform === prev.platform);
          const first = match || anyForPlatform || items[0];
          if (!first) return prev;
          return {
            ...prev,
            platform: first.platform || prev.platform,
            category: first.category || prev.category,
            service: first.title,
          };
        });
      })
      .catch((err) => console.error("Failed to load pricing:", err));
  }, []);

  // Categories for selected platform
  const categoryOptions = useMemo(() => {
    const fromMeta = platformCategories[formData.platform];
    if (fromMeta?.length) return fromMeta;

    const fromCatalog = [
      ...new Set(
        catalog
          .filter((s) => s.platform === formData.platform)
          .map((s) => s.category)
          .filter(Boolean)
      ),
    ];
    return fromCatalog.length ? fromCatalog : FALLBACK_CATEGORIES;
  }, [formData.platform, platformCategories, catalog]);

  // Services for selected platform + category
  const serviceOptions = useMemo(() => {
    const filtered = catalog.filter(
      (s) =>
        s.platform === formData.platform &&
        s.category === formData.category
    );
    if (filtered.length) return filtered.map((s) => s.title);

    // Fallback: any service for platform
    const byPlatform = catalog.filter((s) => s.platform === formData.platform);
    if (byPlatform.length) return byPlatform.map((s) => s.title);

    // Last resort: keys from rates that mention platform
    return Object.keys(serviceRates).filter((title) =>
      title.toLowerCase().includes(formData.platform.toLowerCase())
    );
  }, [catalog, formData.platform, formData.category, serviceRates]);

  // Keep service valid when platform/category changes
  useEffect(() => {
    if (!serviceOptions.length) {
      if (formData.service) setFormData((p) => ({ ...p, service: "" }));
      return;
    }
    if (!serviceOptions.includes(formData.service)) {
      setFormData((p) => ({ ...p, service: serviceOptions[0] }));
    }
  }, [serviceOptions, formData.service]);

  // Keep category valid when platform changes
  useEffect(() => {
    if (
      categoryOptions.length &&
      !categoryOptions.includes(formData.category)
    ) {
      setFormData((p) => ({ ...p, category: categoryOptions[0] }));
    }
  }, [categoryOptions, formData.category]);

  const selectedService = useMemo(
    () => catalog.find((s) => s.title === formData.service),
    [catalog, formData.service]
  );

  const qty = Number(formData.quantity) || 0;
  const rate =
    parseFloat(
      serviceRates[formData.service] ?? selectedService?.unitPricePer1000
    ) || 0;
  const total = qty > 0 && rate > 0 ? (qty / 1000) * rate : 0;
  const perUnit = rate > 0 ? rate / 1000 : 0;

  const noteText = useMemo(() => {
    if (!formData.service) {
      return "Select a platform, category, and service to see details.";
    }
    // Prefer a clear, dynamic sentence from the selected service name
    return `You are ordering: ${formData.service}. Rate ₦${rate.toLocaleString()}/1,000 (₦${perUnit.toLocaleString(undefined, { maximumFractionDigits: 2 })} each).`;
  }, [formData.service, rate, perUnit]);

  const handlePlatformChange = (val) => {
    setFormData((p) => ({ ...p, platform: val, service: "" }));
  };

  const handleCategoryChange = (val) => {
    setFormData((p) => ({ ...p, category: val, service: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (!formData.username || !formData.quantity || !formData.service) {
      setMessage({ type: "error", text: "Please fill all required fields." });
      setLoading(false);
      return;
    }

    if (qty < 100) {
      setMessage({ type: "error", text: "Minimum quantity is 100." });
      setLoading(false);
      return;
    }

    if (qty > 10000000) {
      setMessage({ type: "error", text: "Maximum quantity is 10,000,000." });
      setLoading(false);
      return;
    }

    if (!rate) {
      setMessage({
        type: "error",
        text: "This service has no price configured. Choose another service.",
      });
      setLoading(false);
      return;
    }

    try {
      const res = await API.post("/orders", {
        platform: formData.platform,
        category: formData.category,
        service: formData.service,
        targetUrl: formData.username,
        quantity: qty,
      });

      setMessage({ type: "success", text: res.data.message });
      setFormData((p) => ({
        ...p,
        username: "",
        quantity: "",
      }));
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to place order.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      isClient={isClient}
      userModeToggle={userModeToggle}
    >
      <div className="p-4 md:p-8 max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <FaShoppingCart
            className={`text-2xl ${
              theme === "dark" ? "text-red-500" : "text-red-600"
            }`}
          />
          <h1 className="text-2xl md:text-3xl font-bold">New Order</h1>
        </div>

        {message && (
          <div
            className={`mb-4 p-3 rounded-lg text-sm ${
              message.type === "success"
                ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300"
            }`}
          >
            {message.text}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          <div
            className={`lg:col-span-2 p-6 rounded-2xl shadow-xl border flex flex-col justify-between ${
              theme === "dark"
                ? "bg-[#141414] border-gray-800"
                : "bg-white border-gray-200"
            }`}
          >
            <div>
              <h2 className="text-xl font-semibold mb-5">Order Details</h2>

              <div className="grid md:grid-cols-2 gap-5 mb-5">
                <SelectField
                  label="Platform"
                  value={formData.platform}
                  options={platforms}
                  onChange={handlePlatformChange}
                  theme={theme}
                />

                <SelectField
                  label="Category"
                  value={formData.category}
                  options={categoryOptions}
                  onChange={handleCategoryChange}
                  theme={theme}
                />
              </div>

              <SelectField
                label="Service"
                value={formData.service}
                options={serviceOptions.length ? serviceOptions : ["No services for this filter"]}
                onChange={(val) =>
                  setFormData((p) => ({ ...p, service: val }))
                }
                theme={theme}
              />

              <p
                className={`text-sm -mt-3 mb-3 ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {serviceDescriptions[formData.service] ||
                  (rate
                    ? `₦${rate.toLocaleString()} per 1,000`
                    : "Select a service")}
              </p>

              <InfoBox theme={theme} text={noteText} />

              <InputField
                label="Link / Username"
                placeholder="Enter profile link or username"
                value={formData.username}
                onChange={(val) =>
                  setFormData((p) => ({ ...p, username: val }))
                }
                theme={theme}
              />

              <InputField
                label="Quantity"
                type="number"
                placeholder="e.g. 1000"
                value={formData.quantity}
                onChange={(val) =>
                  setFormData((p) => ({ ...p, quantity: val }))
                }
                theme={theme}
                note="Min: 100 – Max: 10,000,000"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !formData.service || !rate}
              className="w-full py-3 text-lg font-semibold rounded-md bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white shadow-lg hover:shadow-red-700/30 transition disabled:opacity-60"
            >
              {loading ? "Placing Order..." : "Place Order"}
            </button>
          </div>

          {/* Order Summary — fully dynamic */}
          <div
            className={`p-6 rounded-2xl shadow-xl border h-fit lg:sticky lg:top-6 ${
              theme === "dark"
                ? "bg-[#141414] border-gray-800"
                : "bg-white border-gray-200"
            }`}
          >
            <h2 className="text-xl font-semibold mb-5 flex items-center gap-2">
              <FaInfoCircle className="text-red-500" /> Order Summary
            </h2>

            <div className="space-y-4 text-sm">
              <SummaryRow label="Platform:" value={formData.platform || "—"} />
              <SummaryRow label="Category:" value={formData.category || "—"} />
              <SummaryRow
                label="Service:"
                value={formData.service || "—"}
              />
              <SummaryRow
                label="Quantity:"
                value={formData.quantity ? Number(formData.quantity).toLocaleString() : "—"}
              />
              <SummaryRow
                label="Rate:"
                value={
                  rate
                    ? `₦${rate.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })} / 1,000`
                    : "—"
                }
              />
              <SummaryRow
                label="Per unit:"
                value={
                  rate
                    ? `₦${perUnit.toLocaleString(undefined, {
                        maximumFractionDigits: 4,
                      })}`
                    : "—"
                }
              />
              <hr
                className={`my-3 ${
                  theme === "dark" ? "border-gray-700" : "border-gray-300"
                }`}
              />
              <SummaryRow
                label="Total:"
                value={
                  total
                    ? `₦${total.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}`
                    : "₦0.00"
                }
                highlight
              />
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

function SelectField({ label, value, options, onChange, theme }) {
  return (
    <div className="mb-5">
      <label className="block mb-2 font-medium">{label}</label>
      <select
        className={`w-full p-3 rounded-md border outline-none ${
          theme === "dark"
            ? "bg-black border-gray-700 text-gray-200"
            : "bg-gray-50 border-gray-300 text-gray-800"
        }`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  theme,
  note,
}) {
  return (
    <div className="mb-5">
      <label className="block mb-2 font-medium">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className={`w-full p-3 rounded-md border outline-none ${
          theme === "dark"
            ? "bg-black border-gray-700 text-gray-200"
            : "bg-gray-50 border-gray-300 text-gray-800"
        }`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {note && (
        <p className="text-sm mt-1 text-gray-500 dark:text-gray-500">{note}</p>
      )}
    </div>
  );
}

function InfoBox({ text, theme }) {
  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-md border-l-4 mb-5 ${
        theme === "dark"
          ? "bg-[#1a1a1a] border-red-600 text-gray-300"
          : "bg-red-50 border-red-600 text-gray-700"
      }`}
    >
      <FaInfoCircle className="text-lg text-red-500 mt-1 shrink-0" />
      <p className="text-sm">{text}</p>
    </div>
  );
}

function SummaryRow({ label, value, highlight = false }) {
  return (
    <div className="flex justify-between gap-3 text-sm md:text-base">
      <span
        className={`font-medium shrink-0 ${
          highlight ? "text-lg text-red-500 font-bold" : ""
        }`}
      >
        {label}
      </span>
      <span
        className={`font-semibold text-right break-words ${
          highlight
            ? "text-lg text-red-500"
            : "text-gray-600 dark:text-gray-300"
        }`}
      >
        {value}
      </span>
    </div>
  );
}