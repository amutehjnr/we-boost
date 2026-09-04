import React, { useState, useEffect, useCallback, useRef } from "react";
import { FaPaperPlane, FaCheckCircle } from "react-icons/fa";
import AdminLayout from "./AdminLayout";
import API from "../../lib/api";

const POLL_INTERVAL = 4000;

export default function AdminChat() {
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState("Open");
  const [sending, setSending] = useState(false);

  const lastMessageTimeRef = useRef(null);
  const messagesEndRef = useRef(null);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await API.get(`/chat/conversations?status=${filter}`);
      setConversations(res.data.data || []);
    } catch (err) {
      console.error("Failed to load conversations:", err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchMessages = useCallback(async (id) => {
    try {
      const params = new URLSearchParams();
      if (lastMessageTimeRef.current) params.append("since", lastMessageTimeRef.current);
      const res = await API.get(`/chat/conversations/${id}/messages?${params}`);
      const newMessages = res.data.data || [];
      if (newMessages.length > 0) {
        setMessages((prev) => [...prev, ...newMessages]);
        lastMessageTimeRef.current = newMessages[newMessages.length - 1].createdAt;
      }
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  useEffect(() => {
    if (!activeId) return;
    setMessages([]);
    lastMessageTimeRef.current = null;
    fetchMessages(activeId);
    const interval = setInterval(() => fetchMessages(activeId), POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [activeId, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelect = (id) => {
    setActiveId(id);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !activeId) return;

    setSending(true);
    try {
      const res = await API.post(`/chat/conversations/${activeId}/messages`, { text: input.trim() });
      setMessages((prev) => [...prev, res.data.data]);
      lastMessageTimeRef.current = res.data.data.createdAt;
      setInput("");
      fetchConversations();
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  };

  const handleClose = async () => {
    if (!activeId) return;
    try {
      await API.put(`/chat/conversations/${activeId}/close`);
      setActiveId(null);
      fetchConversations();
    } catch (err) {
      console.error("Failed to close conversation:", err);
    }
  };

  const activeConversation = conversations.find((c) => c.id === activeId);

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-6">Live Chat</h1>

      <div className="flex gap-2 mb-4">
        {["Open", "Closed"].map((s) => (
          <button
            key={s}
            onClick={() => { setFilter(s); setActiveId(null); }}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium ${
              filter === s ? "bg-red-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="flex gap-4 h-[70vh] rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Conversation list */}
        <div className="w-72 shrink-0 overflow-y-auto bg-white dark:bg-[#181818] border-r border-gray-200 dark:border-gray-700">
          {conversations.length === 0 && (
            <p className="text-sm text-gray-400 p-4">No {filter.toLowerCase()} conversations.</p>
          )}
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => handleSelect(c.id)}
              className={`w-full text-left px-4 py-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 ${
                activeId === c.id ? "bg-gray-100 dark:bg-gray-800" : ""
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium text-sm">
                  {c.user?.fullName || c.guestName || "Guest"}
                </span>
                {c.unreadCount > 0 && (
                  <span className="bg-red-600 text-white text-xs rounded-full px-2 py-0.5">
                    {c.unreadCount}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 truncate">
                {c.user?.email || c.guestEmail}
              </p>
            </button>
          ))}
        </div>

        {/* Active thread */}
        <div className="flex-1 flex flex-col bg-white dark:bg-[#181818]">
          {!activeId ? (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
              Select a conversation to view messages
            </div>
          ) : (
            <>
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-sm">
                    {activeConversation?.user?.fullName || activeConversation?.guestName || "Guest"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {activeConversation?.user?.email || activeConversation?.guestEmail}
                  </p>
                </div>
                {filter === "Open" && (
                  <button
                    onClick={handleClose}
                    className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-green-600"
                  >
                    <FaCheckCircle /> Close
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm ${
                      msg.senderType === "admin"
                        ? "bg-red-600 text-white ml-auto rounded-br-sm"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 mr-auto rounded-bl-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {filter === "Open" && (
                <form onSubmit={handleSend} className="p-3 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a reply..."
                    className="flex-1 p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-black text-sm outline-none"
                  />
                  <button
                    type="submit"
                    disabled={sending || !input.trim()}
                    className="bg-red-600 hover:bg-red-700 text-white p-2.5 rounded-lg disabled:opacity-60"
                  >
                    <FaPaperPlane />
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}