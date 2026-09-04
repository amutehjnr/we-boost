import React, { useState, useEffect, useRef, useCallback } from "react";
import { FaComments, FaTimes, FaPaperPlane } from "react-icons/fa";
import API from "../lib/api";

const POLL_INTERVAL = 4000;

export default function ChatWidget({ user }) {
  const [open, setOpen] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [guestForm, setGuestForm] = useState({ name: "", email: "" });
  const [needsGuestInfo, setNeedsGuestInfo] = useState(false);
  const [sending, setSending] = useState(false);

  const lastMessageTimeRef = useRef(null);
  const pollRef = useRef(null);
  const messagesEndRef = useRef(null);

  const guestToken = localStorage.getItem("chat_guest_token");
  const savedConversationId = localStorage.getItem("chat_conversation_id");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const startConversation = useCallback(async (guestInfo = null) => {
    try {
      const body = {};
      if (!user && guestToken) body.guestToken = guestToken;
      if (guestInfo) {
        body.guestName = guestInfo.name;
        body.guestEmail = guestInfo.email;
      }

      const res = await API.post("/chat/start", body);
      const conv = res.data.data;
      setConversation(conv);
      setNeedsGuestInfo(false);

      if (!user && conv.guestToken) {
        localStorage.setItem("chat_guest_token", conv.guestToken);
      }
      localStorage.setItem("chat_conversation_id", conv.id);
    } catch (err) {
      console.error("Failed to start chat:", err);
    }
  }, [user, guestToken]);

  const fetchMessages = useCallback(async (conversationId) => {
    try {
      const params = new URLSearchParams();
      if (lastMessageTimeRef.current) params.append("since", lastMessageTimeRef.current);
      if (!user && guestToken) params.append("guestToken", guestToken);

      const res = await API.get(`/chat/conversations/${conversationId}/messages?${params}`);
      const newMessages = res.data.data || [];

      if (newMessages.length > 0) {
        setMessages((prev) => [...prev, ...newMessages]);
        lastMessageTimeRef.current = newMessages[newMessages.length - 1].createdAt;
      }
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  }, [user, guestToken]);

  // Open the widget: resume an existing conversation, or ask a guest for
  // their name/email first.
  const handleOpen = () => {
    setOpen(true);
    if (conversation) return;

    if (!user && !guestToken && !savedConversationId) {
      setNeedsGuestInfo(true);
      return;
    }
    startConversation();
  };

  const handleGuestFormSubmit = (e) => {
    e.preventDefault();
    if (!guestForm.name.trim() || !guestForm.email.trim()) return;
    startConversation(guestForm);
  };

  // Poll for new messages while the conversation is active
  useEffect(() => {
    if (!conversation) return;

    fetchMessages(conversation.id);
    pollRef.current = setInterval(() => fetchMessages(conversation.id), POLL_INTERVAL);

    return () => clearInterval(pollRef.current);
  }, [conversation, fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !conversation) return;

    setSending(true);
    try {
      const body = { text: input.trim() };
      if (!user && guestToken) body.guestToken = guestToken;

      const res = await API.post(`/chat/conversations/${conversation.id}/messages`, body);
      setMessages((prev) => [...prev, res.data.data]);
      lastMessageTimeRef.current = res.data.data.createdAt;
      setInput("");
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open ? (
        <div className="w-80 sm:w-96 h-[28rem] bg-white dark:bg-[#181818] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
          <div className="bg-red-600 text-white px-4 py-3 flex items-center justify-between">
            <span className="font-semibold">Chat with us</span>
            <button onClick={() => setOpen(false)}>
              <FaTimes />
            </button>
          </div>

          {needsGuestInfo ? (
            <form onSubmit={handleGuestFormSubmit} className="flex-1 p-4 flex flex-col gap-3 justify-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                Quick intro before we start:
              </p>
              <input
                type="text"
                placeholder="Your name"
                value={guestForm.name}
                onChange={(e) => setGuestForm({ ...guestForm, name: e.target.value })}
                required
                className="p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-black text-sm"
              />
              <input
                type="email"
                placeholder="Your email"
                value={guestForm.email}
                onChange={(e) => setGuestForm({ ...guestForm, email: e.target.value })}
                required
                className="p-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-black text-sm"
              />
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2.5 rounded-lg"
              >
                Start Chat
              </button>
            </form>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 && (
                  <p className="text-center text-sm text-gray-400 mt-6">
                    Send a message and we'll get back to you shortly.
                  </p>
                )}
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                      msg.senderType === "admin"
                        ? "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 mr-auto rounded-bl-sm"
                        : "bg-red-600 text-white ml-auto rounded-br-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSend} className="p-3 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type a message..."
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
            </>
          )}
        </div>
      ) : (
        <button
          onClick={handleOpen}
          className="bg-red-600 hover:bg-red-700 text-white w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-2xl transition"
        >
          <FaComments />
        </button>
      )}
    </div>
  );
}