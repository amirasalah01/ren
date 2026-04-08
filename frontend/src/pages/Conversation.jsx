import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getConversation, sendMessage } from '../api/messages';
import { useAuth } from '../context/AuthContext';
import './Conversation.css';

const Conversation = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchConversation();
  }, [userId]);

  const fetchConversation = async () => {
    setLoading(true);
    try {
      const data = await getConversation(userId);
      setMessages(data.results || data);
    } catch (err) {
      console.error('Error fetching conversation:', err);
      setError('Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setSending(true);
    try {
      const lastMessage = messages[0];
      await sendMessage({
        receiver: parseInt(userId),
        subject: lastMessage?.subject ? `Re: ${lastMessage.subject}` : 'Reply',
        body: replyText,
        property: lastMessage?.property?.id,
      });
      setReplyText('');
      await fetchConversation();
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading conversation...</p>
      </div>
    );
  }

  if (error || messages.length === 0) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error || 'No messages found'}</p>
        <button onClick={() => navigate('/inbox')} className="btn-primary">
          Back to Inbox
        </button>
      </div>
    );
  }

  const otherUser = messages[0]?.sender?.id === user?.id ? messages[0]?.receiver : messages[0]?.sender;

  return (
    <div className="conversation-page">
      <div className="conversation-container">
        <div className="conversation-header">
          <button onClick={() => navigate('/inbox')} className="btn-back">
            ← Back to Inbox
          </button>
          <h1>
            Conversation with {otherUser?.first_name} {otherUser?.last_name}
          </h1>
        </div>

        <div className="messages-thread">
          {messages.map((message) => {
            const isSentByMe = message.sender?.id === user?.id;
            return (
              <div
                key={message.id}
                className={`message-bubble ${isSentByMe ? 'sent' : 'received'}`}
              >
                <div className="message-bubble-header">
                  <strong>
                    {isSentByMe
                      ? 'You'
                      : `${message.sender?.first_name} ${message.sender?.last_name}`}
                  </strong>
                  <span className="message-time">
                    {new Date(message.created_at).toLocaleString()}
                  </span>
                </div>
                {message.subject && (
                  <div className="message-bubble-subject">{message.subject}</div>
                )}
                <div className="message-bubble-body">{message.body}</div>
                {message.property && (
                  <div className="message-bubble-property">
                    🏠 {message.property.title}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="reply-form-container">
          <form onSubmit={handleSendReply} className="reply-form">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your reply..."
              rows="4"
              required
              disabled={sending}
            />
            <button type="submit" disabled={sending} className="btn-send">
              {sending ? 'Sending...' : 'Send Reply'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Conversation;
