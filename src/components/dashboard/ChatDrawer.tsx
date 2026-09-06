'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, User, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
}

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  entityId: string | null;
  entityType: 'LEAD' | 'PROJECT';
  currentUser: any;
}

export default function ChatDrawer({ isOpen, onClose, entityId, entityType, currentUser }: ChatDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    if (!entityId) return;
    setLoading(true);
    try {
      const endpoint = entityType === 'LEAD' 
        ? `/api/leads/${entityId}/messages` 
        : `/api/projects/${entityId}/messages`;
      
      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load messages', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && entityId) {
      fetchMessages();
      // Mark messages as read
      const readEndpoint = entityType === 'LEAD'
        ? `/api/leads/${entityId}/messages/read`
        : `/api/projects/${entityId}/messages/read`;
      fetch(readEndpoint, { method: 'POST' }).catch(() => {});
    }
  }, [isOpen, entityId, entityType]);

  useEffect(() => {
    // Auto-scroll to bottom
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !entityId) return;

    setSending(true);
    try {
      const endpoint = entityType === 'LEAD' 
        ? `/api/leads/${entityId}/messages` 
        : `/api/projects/${entityId}/messages`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newMessage }),
      });

      if (res.ok) {
        setNewMessage('');
        fetchMessages(); // Refresh message list
      } else {
        alert('Failed to send message');
      }
    } catch (err) {
      console.error('Error sending message', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="cb-modal-overlay"
            style={{ zIndex: 999 }}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              height: '100vh',
              width: '100%',
              maxWidth: '420px',
              backgroundColor: 'var(--cb-bg-page)',
              borderLeft: '1px solid var(--cb-border-subtle)',
              zIndex: 1000,
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '-10px 0 40px rgba(0,0,0,0.5)',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '20px',
              borderBottom: '1px solid var(--cb-border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'var(--cb-bg-card)',
            }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--cb-text-primary)' }}>Discussion</h3>
                <p style={{ fontSize: '12px', color: 'var(--cb-text-secondary)', marginTop: '4px' }}>
                  {entityType === 'LEAD' ? 'Lead' : 'Project'} &bull; {entityId?.substring(0, 8).toUpperCase()}
                </p>
              </div>
              <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--cb-text-muted)', cursor: 'pointer', padding: '4px' }}>
                <X size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--cb-text-muted)' }}>
                  <Loader2 className="animate-spin" size={24} />
                </div>
              ) : messages.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--cb-text-muted)', marginTop: '40px', fontSize: '13px' }}>
                  <User size={32} style={{ margin: '0 auto 12px auto', opacity: 0.2 }} />
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMe = msg.sender_id === currentUser?.id;
                  return (
                    <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        maxWidth: '85%',
                        padding: '12px 16px',
                        borderRadius: '16px',
                        borderBottomRightRadius: isMe ? '4px' : '16px',
                        borderBottomLeftRadius: !isMe ? '4px' : '16px',
                        backgroundColor: isMe ? '#0284C7' : 'var(--cb-bg-subtle)',
                        border: isMe ? 'none' : '1px solid var(--cb-border-subtle)',
                        color: isMe ? '#FFFFFF' : 'var(--cb-text-primary)',
                        fontSize: '14px',
                        lineHeight: 1.5,
                      }}>
                        {msg.content}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--cb-text-muted)', marginTop: '6px', margin: '0 4px' }}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div style={{
              padding: '20px',
              borderTop: '1px solid var(--cb-border-subtle)',
              backgroundColor: 'var(--cb-bg-card)',
            }}>
              <form onSubmit={handleSend} style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="cb-input"
                  style={{
                    flex: 1,
                    borderRadius: '20px',
                    padding: '10px 16px',
                    backgroundColor: 'var(--cb-bg-input)',
                    color: 'var(--cb-text-primary)',
                    border: '1px solid var(--cb-border-subtle)',
                  }}
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="cb-btn cb-btn-cyan"
                  style={{ borderRadius: '50%', width: '42px', height: '42px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                >
                  {sending ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
