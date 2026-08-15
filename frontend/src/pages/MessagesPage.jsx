import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { messagesApi } from '../api/client.js';
import { Search, Send, MessageSquare, Clock, Circle, ArrowLeft } from 'lucide-react';
import { Spinner, EmptyState } from '../components/ui';

/**
 * ConversationList — left panel showing all conversations with search.
 */
function ConversationList({ conversations, activeId, onSelect, loading }) {
  const [search, setSearch] = useState('');

  const filtered = conversations.filter((c) => {
    if (!search) return true;
    const name = (c.partnerName || c.partnerEmail || '').toLowerCase();
    return name.includes(search.toLowerCase());
  });

  return (
    <div className="msg-sidebar">
      <div className="msg-sidebar-header">
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
          <MessageSquare size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          Messages
        </h3>
      </div>
      <div className="msg-search-wrap">
        <Search size={16} className="msg-search-icon" />
        <input
          type="text"
          className="msg-search-input"
          placeholder="Search conversations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="msg-conversation-list">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}><Spinner size="md" /></div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
            {search ? 'No matching conversations' : 'No conversations yet'}
          </div>
        ) : (
          filtered.map((conv) => (
            <button
              key={conv.partnerId}
              type="button"
              className={`msg-conversation-item ${activeId === conv.partnerId ? 'active' : ''}`}
              onClick={() => onSelect(conv)}
            >
              <div className="msg-conv-avatar">
                {(conv.partnerName || conv.partnerEmail || 'U')[0].toUpperCase()}
              </div>
              <div className="msg-conv-info">
                <div className="msg-conv-name">
                  {conv.partnerName || conv.partnerEmail?.split('@')[0] || 'User'}
                  {conv.unreadCount > 0 && (
                    <span className="msg-unread-badge">{conv.unreadCount}</span>
                  )}
                </div>
                <div className="msg-conv-preview">
                  {conv.lastMessage?.content?.substring(0, 50) || 'No messages yet'}
                  {conv.lastMessage?.content?.length > 50 ? '...' : ''}
                </div>
              </div>
              <div className="msg-conv-time">
                {conv.lastMessage?.createdAt
                  ? new Date(conv.lastMessage.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                  : ''}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

/**
 * ChatWindow — right panel showing the active message thread.
 */
function ChatWindow({ partner, messages, onSend, loading, userId }) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [partner]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!partner) {
    return (
      <div className="msg-chat-empty">
        <MessageSquare size={48} strokeWidth={1} style={{ opacity: 0.3, marginBottom: '16px' }} />
        <h3 style={{ margin: '0 0 8px', fontWeight: 600 }}>Select a conversation</h3>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>
          Choose a conversation from the list to start messaging
        </p>
      </div>
    );
  }

  return (
    <div className="msg-chat-panel">
      <div className="msg-chat-header">
        <div className="msg-chat-header-avatar">
          {(partner.partnerName || partner.partnerEmail || 'U')[0].toUpperCase()}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: '16px' }}>
            {partner.partnerName || partner.partnerEmail?.split('@')[0] || 'User'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
            {partner.partnerRole || 'User'}
          </div>
        </div>
      </div>
      <div className="msg-chat-messages">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Spinner size="md" /></div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            Start the conversation by sending a message below
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isMine = msg.senderId === userId || msg.senderId?._id === userId;
            return (
              <div key={msg._id || idx} className={`msg-bubble-wrap ${isMine ? 'mine' : 'theirs'}`}>
                <div className={`msg-bubble ${isMine ? 'mine' : 'theirs'}`}>
                  <p className="msg-bubble-text">{msg.content}</p>
                  <span className="msg-bubble-time">
                    {new Date(msg.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    {isMine && msg.readAt && <Circle size={8} fill="var(--color-primary)" stroke="none" style={{ marginLeft: 4 }} />}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="msg-chat-input-bar">
        <textarea
          ref={inputRef}
          className="msg-chat-input"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
        />
        <button
          type="button"
          className="msg-send-btn"
          onClick={handleSend}
          disabled={!input.trim()}
          aria-label="Send message"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}

/**
 * MessagesPage — full messaging page with split-panel layout.
 */
export default function MessagesPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [showMobileChat, setShowMobileChat] = useState(false);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    try {
      const res = await messagesApi.conversations();
      if (res?.success) setConversations(res.data.conversations || []);
    } catch {
      // silently fail
    } finally {
      setLoadingConvs(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 8000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  // Fetch thread when active conversation changes
  const fetchThread = useCallback(async (partnerId) => {
    setLoadingMsgs(true);
    try {
      const res = await messagesApi.getThread(partnerId);
      if (res?.success) setMessages(res.data.messages || []);
    } catch {
      setMessages([]);
    } finally {
      setLoadingMsgs(false);
    }
  }, []);

  useEffect(() => {
    if (!activeConv) return;
    fetchThread(activeConv.partnerId);
    const interval = setInterval(() => fetchThread(activeConv.partnerId), 5000);
    return () => clearInterval(interval);
  }, [activeConv, fetchThread]);

  const handleSelectConversation = (conv) => {
    setActiveConv(conv);
    setShowMobileChat(true);
  };

  const handleSend = async (content) => {
    if (!activeConv) return;
    try {
      await messagesApi.send(activeConv.partnerId, content);
      fetchThread(activeConv.partnerId);
      fetchConversations();
    } catch {
      // silently fail
    }
  };

  return (
    <div className={`msg-page ${showMobileChat ? 'mobile-chat-open' : ''}`}>
      <div className="msg-page-sidebar-col">
        <ConversationList
          conversations={conversations}
          activeId={activeConv?.partnerId}
          onSelect={handleSelectConversation}
          loading={loadingConvs}
        />
      </div>
      <div className="msg-page-chat-col">
        {showMobileChat && (
          <button
            type="button"
            className="msg-mobile-back"
            onClick={() => setShowMobileChat(false)}
          >
            <ArrowLeft size={18} /> Back
          </button>
        )}
        <ChatWindow
          partner={activeConv}
          messages={messages}
          onSend={handleSend}
          loading={loadingMsgs}
          userId={user?._id || user?.id}
        />
      </div>
    </div>
  );
}
