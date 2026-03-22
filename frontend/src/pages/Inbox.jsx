import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getInbox, getSentMessages, markAsRead } from '../api/messages';
import './Inbox.css';

const Inbox = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'inbox';

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMessages();
  }, [activeTab]);

  const fetchMessages = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = activeTab === 'sent' ? await getSentMessages() : await getInbox();
      setMessages(data.results || data);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (messageId) => {
    try {
      await markAsRead(messageId);
      setMessages(
        messages.map((msg) =>
          msg.id === messageId ? { ...msg, is_read: true } : msg
        )
      );
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const setTab = (tab) => {
    setSearchParams({ tab });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="inbox-page">
      <div className="inbox-container">
        <div className="page-header">
          <h1>Messages</h1>
        </div>

        <div className="inbox-tabs">
          <button
            className={`tab-btn ${activeTab === 'inbox' ? 'active' : ''}`}
            onClick={() => setTab('inbox')}
          >
            📨 Inbox
          </button>
          <button
            className={`tab-btn ${activeTab === 'sent' ? 'active' : ''}`}
            onClick={() => setTab('sent')}
          >
            📤 Sent
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="no-messages">
              <p>
                {activeTab === 'sent'
                  ? 'You haven\'t sent any messages yet.'
                  : 'No messages in your inbox.'}
              </p>
            </div>
          ) : (
            <div className="messages-list">
              {messages.map((message) => (
                <Link
                  key={message.id}
                  to={`/conversation/${
                    activeTab === 'sent' ? message.receiver.id : message.sender.id
                  }`}
                  className={`message-item ${!message.is_read && activeTab === 'inbox' ? 'unread' : ''}`}
                  onClick={() => {
                    if (activeTab === 'inbox' && !message.is_read) {
                      handleMarkAsRead(message.id);
                    }
                  }}
                >
                  <div className="message-header">
                    <div className="message-user">
                      <strong>
                        {activeTab === 'sent'
                          ? `To: ${message.receiver?.first_name} ${message.receiver?.last_name}`
                          : `From: ${message.sender?.first_name} ${message.sender?.last_name}`}
                      </strong>
                      {!message.is_read && activeTab === 'inbox' && (
                        <span className="unread-badge">New</span>
                      )}
                    </div>
                    <span className="message-date">
                      {new Date(message.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="message-subject">{message.subject}</div>
                  <div className="message-preview">
                    {message.body.substring(0, 100)}
                    {message.body.length > 100 ? '...' : ''}
                  </div>
                  {message.property && (
                    <div className="message-property">
                      🏠 Re: {message.property.title}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Inbox;
