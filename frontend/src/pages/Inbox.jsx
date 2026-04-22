import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FiSend, FiSearch, FiUser, FiArrowLeft, FiTrash2 } from "react-icons/fi";
import { deleteMessage, getConversation, getInbox, getSent, markAsRead, sendMessage } from "../api/messages";
import { searchUsers } from "../api/user";
import { useAuth } from "../context/AuthContext";

export default function Inbox() {
  const { userId } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Conversations list: derived from inbox + sent
  const [contacts, setContacts] = useState([]); // [{user, lastMessage, unread}]
  const [loadingContacts, setLoadingContacts] = useState(true);

  // Active conversation
  const [activeUser, setActiveUser] = useState(null); // {id, username, ...}
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Compose
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  // New conversation search
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const messagesEndRef = useRef(null);
  const searchTimerRef = useRef(null);

  // Load contacts (unique users from inbox + sent)
  useEffect(() => {
    loadContacts();
  }, []);

  // Open conversation from URL param (e.g. from "Contact Owner")
  useEffect(() => {
    const uid = searchParams.get("user_id");
    const uname = searchParams.get("username");
    if (uid && uname && !activeUser) {
      openConversation({ id: parseInt(uid), username: uname });
    }
  }, [searchParams]);

  async function loadContacts() {
    setLoadingContacts(true);
    try {
      const [inbox, sent] = await Promise.all([getInbox(), getSent()]);
      const inboxList = Array.isArray(inbox) ? inbox : inbox.results || [];
      const sentList = Array.isArray(sent) ? sent : sent.results || [];

      const contactMap = new Map();

      // From inbox: other user is sender
      for (const msg of inboxList) {
        const other = msg.sender;
        if (!other) continue;
        if (!contactMap.has(other.id)) {
          contactMap.set(other.id, { user: other, lastMessage: msg, unread: 0 });
        }
        if (!msg.is_read) contactMap.get(other.id).unread++;
      }

      // From sent: other user is receiver
      for (const msg of sentList) {
        const other = msg.receiver;
        if (!other) continue;
        if (!contactMap.has(other.id)) {
          contactMap.set(other.id, { user: other, lastMessage: msg, unread: 0 });
        } else {
          // Update last message if more recent
          const existing = contactMap.get(other.id);
          if (new Date(msg.created_at) > new Date(existing.lastMessage.created_at)) {
            existing.lastMessage = msg;
          }
        }
      }

      const sorted = Array.from(contactMap.values()).sort(
        (a, b) => new Date(b.lastMessage.created_at) - new Date(a.lastMessage.created_at)
      );
      setContacts(sorted);
    } catch {
      setContacts([]);
    } finally {
      setLoadingContacts(false);
    }
  }

  async function openConversation(user) {
    setActiveUser(user);
    setMessages([]);
    setLoadingMessages(true);
    setShowSearch(false);
    setSearchQuery("");
    setSearchResults([]);
    try {
      const data = await getConversation(user.id);
      const list = Array.isArray(data) ? data : data.results || [];
      setMessages(list);
      // Mark unread inbox messages as read
      for (const msg of list) {
        if (msg.receiver?.id === userId && !msg.is_read) {
          markAsRead(msg.id).catch(() => {});
        }
      }
      // Update contacts unread count
      setContacts((prev) =>
        prev.map((c) => (c.user.id === user.id ? { ...c, unread: 0 } : c))
      );
    } catch {
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  async function handleSend(e) {
    e.preventDefault();
    if (!body.trim() || !activeUser) return;
    setSending(true);
    try {
      const msg = await sendMessage({ receiver: activeUser.id, body: body.trim() });
      setMessages((prev) => [...prev, msg]);
      setBody("");
      // Refresh contacts
      loadContacts();
    } catch (err) {
      const d = err.response?.data;
      alert(d ? JSON.stringify(d) : "Failed to send message.");
    } finally {
      setSending(false);
    }
  }

  async function handleDeleteMessage(msgId) {
    if (!window.confirm("Delete this message?")) return;
    try {
      await deleteMessage(msgId);
      setMessages((prev) => prev.filter((m) => m.id !== msgId));
    } catch {
      alert("Failed to delete.");
    }
  }

  function handleSearchChange(e) {
    const q = e.target.value;
    setSearchQuery(q);
    clearTimeout(searchTimerRef.current);
    if (!q.trim()) { setSearchResults([]); return; }
    searchTimerRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchUsers(q.trim());
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
  }

  const unreadTotal = contacts.reduce((sum, c) => sum + c.unread, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-slate-900">
          Messages {unreadTotal > 0 && <span className="ml-2 text-sm bg-blue-600 text-white rounded-full px-2 py-0.5">{unreadTotal}</span>}
        </h1>
        <button
          onClick={() => { setShowSearch(true); setActiveUser(null); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-2xl text-sm font-medium hover:bg-blue-700 transition"
        >
          <FiSearch className="text-xs" /> New Conversation
        </button>
      </div>

      <div className="flex gap-4 h-[600px] bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        {/* Sidebar: contacts */}
        <div className={`w-72 flex-shrink-0 border-r border-slate-100 flex flex-col ${activeUser ? "hidden md:flex" : "flex"}`}>
          <div className="p-4 border-b border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Conversations</p>
          </div>

          {/* New conversation search panel */}
          {showSearch && (
            <div className="p-3 border-b border-slate-100">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search by username..."
                  className="w-full pl-8 pr-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              {searching && <p className="text-xs text-slate-400 mt-2 px-1">Searching...</p>}
              {searchResults.length > 0 && (
                <div className="mt-2 space-y-1">
                  {searchResults.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => openConversation(u)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-50 text-left transition"
                    >
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <FiUser className="text-blue-500 text-sm" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{u.username}</p>
                        {(u.first_name || u.last_name) && (
                          <p className="text-xs text-slate-400">{[u.first_name, u.last_name].filter(Boolean).join(" ")}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {!searching && searchQuery && searchResults.length === 0 && (
                <p className="text-xs text-slate-400 mt-2 px-1">No users found.</p>
              )}
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            {loadingContacts ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />)}
              </div>
            ) : contacts.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-slate-400 text-sm">No conversations yet.</p>
                <p className="text-slate-400 text-xs mt-1">Start a new conversation!</p>
              </div>
            ) : (
              contacts.map(({ user, lastMessage, unread }) => (
                <button
                  key={user.id}
                  onClick={() => openConversation(user)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition text-left border-b border-slate-50 ${
                    activeUser?.id === user.id ? "bg-blue-50 border-l-2 border-l-blue-500" : ""
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                      <FiUser className="text-slate-400" />
                    </div>
                    {unread > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                        {unread}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm truncate ${unread > 0 ? "font-semibold text-slate-900" : "text-slate-700"}`}>
                      {user.username}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{lastMessage.body}</p>
                  </div>
                  <span className="text-[10px] text-slate-300 flex-shrink-0">
                    {new Date(lastMessage.created_at).toLocaleDateString()}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col min-w-0">
          {!activeUser ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="text-5xl mb-4">💬</div>
              <p className="text-slate-600 font-medium">Select a conversation</p>
              <p className="text-slate-400 text-sm mt-1">or start a new one</p>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
                <button
                  onClick={() => setActiveUser(null)}
                  className="md:hidden text-slate-400 hover:text-slate-600 transition"
                >
                  <FiArrowLeft />
                </button>
                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
                  <FiUser className="text-slate-400" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{activeUser.username}</p>
                  {(activeUser.first_name || activeUser.last_name) && (
                    <p className="text-xs text-slate-400">{[activeUser.first_name, activeUser.last_name].filter(Boolean).join(" ")}</p>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
                {loadingMessages ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => <div key={i} className={`h-10 rounded-2xl animate-pulse bg-slate-100 ${i % 2 === 0 ? "ml-12" : "mr-12"}`} />)}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-slate-400 text-sm">No messages yet. Say hello!</p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isOwn = msg.sender?.id === userId;
                    return (
                      <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"} group`}>
                        <div className={`relative max-w-[70%] ${isOwn ? "order-2" : ""}`}>
                          <div
                            className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                              isOwn
                                ? "bg-blue-600 text-white rounded-br-md"
                                : "bg-slate-100 text-slate-800 rounded-bl-md"
                            }`}
                          >
                            {msg.body}
                          </div>
                          <div className={`flex items-center gap-1 mt-1 ${isOwn ? "justify-end" : "justify-start"}`}>
                            <span className="text-[10px] text-slate-400">
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </span>
                            {isOwn && (
                              <button
                                onClick={() => handleDeleteMessage(msg.id)}
                                className="text-slate-300 hover:text-red-400 transition opacity-0 group-hover:opacity-100"
                              >
                                <FiTrash2 className="text-[10px]" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message input */}
              <div className="px-4 py-3 border-t border-slate-100">
                <form onSubmit={handleSend} className="flex items-end gap-2">
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend(e);
                      }
                    }}
                    placeholder="Type a message..."
                    rows={1}
                    className="flex-1 border border-slate-200 rounded-2xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                  <button
                    type="submit"
                    disabled={sending || !body.trim()}
                    className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center hover:bg-blue-700 transition disabled:opacity-50 flex-shrink-0"
                  >
                    <FiSend className="text-sm" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
