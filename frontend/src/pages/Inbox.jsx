import { useEffect, useState } from "react";
import { FiSend, FiMail, FiTrash2, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { deleteMessage, getInbox, getSent, markAsRead, sendMessage } from "../api/messages";

export default function Inbox() {
  const [tab, setTab] = useState("inbox"); // 'inbox' | 'sent' | 'compose'
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const [compose, setCompose] = useState({ receiver: "", subject: "", body: "" });
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");
  const [sendSuccess, setSendSuccess] = useState("");

  useEffect(() => {
    if (tab !== "compose") {
      fetchMessages();
    }
  }, [tab]);

  async function fetchMessages() {
    try {
      setLoading(true);
      setMessages([]);
      const data = tab === "inbox" ? await getInbox() : await getSent();
      const list = Array.isArray(data) ? data : data.results || [];
      setMessages(list);
    } catch {
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleExpand(msg) {
    if (expanded === msg.id) {
      setExpanded(null);
      return;
    }
    setExpanded(msg.id);
    if (tab === "inbox" && !msg.is_read) {
      try {
        await markAsRead(msg.id);
        setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, is_read: true } : m));
      } catch {/* ignore */}
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this message?")) return;
    try {
      await deleteMessage(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch {
      alert("Failed to delete.");
    }
  }

  async function handleSend(e) {
    e.preventDefault();
    setSending(true);
    setSendError("");
    setSendSuccess("");
    try {
      await sendMessage(compose);
      setSendSuccess("Message sent successfully!");
      setCompose({ receiver: "", subject: "", body: "" });
    } catch (err) {
      const d = err.response?.data;
      setSendError(d ? JSON.stringify(d) : "Failed to send message.");
    } finally {
      setSending(false);
    }
  }

  const unread = messages.filter((m) => !m.is_read).length;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">Messages</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-200">
        {[
          { key: "inbox", label: `Inbox${unread > 0 && tab === "inbox" ? ` (${unread})` : ""}` },
          { key: "sent", label: "Sent" },
          { key: "compose", label: "Compose" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition ${
              tab === key ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Compose */}
      {tab === "compose" && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">New Message</h2>
          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Recipient (user ID)</label>
              <input
                type="number"
                value={compose.receiver}
                onChange={(e) => setCompose((p) => ({ ...p, receiver: e.target.value }))}
                className="w-full border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                required
                placeholder="User ID"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
              <input
                value={compose.subject}
                onChange={(e) => setCompose((p) => ({ ...p, subject: e.target.value }))}
                className="w-full border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Subject (optional)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Message *</label>
              <textarea
                value={compose.body}
                onChange={(e) => setCompose((p) => ({ ...p, body: e.target.value }))}
                rows={5}
                className="w-full border border-slate-200 rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                required
                placeholder="Write your message..."
              />
            </div>
            {sendError && <p className="text-red-600 text-sm bg-red-50 rounded-2xl px-4 py-2">{sendError}</p>}
            {sendSuccess && <p className="text-green-600 text-sm bg-green-50 rounded-2xl px-4 py-2">{sendSuccess}</p>}
            <button
              type="submit"
              disabled={sending}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl hover:bg-blue-700 transition font-medium disabled:opacity-70"
            >
              <FiSend />
              {sending ? "Sending..." : "Send Message"}
            </button>
          </form>
        </div>
      )}

      {/* Message list */}
      {tab !== "compose" && (
        <>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="bg-slate-100 rounded-2xl h-16 animate-pulse" />)}
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">📭</div>
              <p className="text-slate-500">No messages here.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {messages.map((msg) => (
                <div key={msg.id} className={`bg-white border rounded-2xl overflow-hidden transition ${msg.is_read || tab === "sent" ? "border-slate-200" : "border-blue-200 bg-blue-50/30"}`}>
                  <div
                    className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-slate-50"
                    onClick={() => handleExpand(msg)}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex-shrink-0">
                        {!msg.is_read && tab === "inbox"
                          ? <FiMail className="text-blue-500" />
                          : <FiMail className="text-slate-400" />
                        }
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm truncate ${!msg.is_read && tab === "inbox" ? "font-semibold text-slate-900" : "text-slate-700"}`}>
                          {tab === "inbox"
                            ? `From: ${msg.sender?.username || "Unknown"}`
                            : `To: ${msg.receiver?.username || "Unknown"}`}
                        </p>
                        <p className="text-xs text-slate-400 truncate">{msg.subject || "(no subject)"}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                      <span className="text-xs text-slate-400">{new Date(msg.created_at).toLocaleDateString()}</span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(msg.id); }}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition"
                      >
                        <FiTrash2 className="text-sm" />
                      </button>
                      {expanded === msg.id ? <FiChevronUp className="text-slate-400" /> : <FiChevronDown className="text-slate-400" />}
                    </div>
                  </div>
                  {expanded === msg.id && (
                    <div className="px-5 pb-5 pt-1 border-t border-slate-100">
                      <p className="text-slate-700 text-sm whitespace-pre-wrap leading-relaxed">{msg.body}</p>
                      {msg.property && (
                        <p className="text-xs text-slate-400 mt-2">Property ID: {msg.property}</p>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}