import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Image, FileText, AlertTriangle, ChevronRight } from 'lucide-react';
import { SMS_CONVERSATIONS, SMS_MESSAGES } from './mockData';
import type { SmsConversation, SmsMessage } from './types';

const QUICK_REPLIES = [
  'On my way!',
  'Running about 10 min late',
  'Your vehicle is ready',
  'Could you please call us?',
  'Thanks for your patience',
];

function isQuietHours(): boolean {
  const h = new Date().getHours();
  return h >= 21 || h < 8;
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getDate() - d.getDate();
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function ConversationItem({
  conv,
  selected,
  onClick,
}: {
  conv: SmsConversation;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '14px 16px', cursor: 'pointer', borderBottom: '1px solid #F3F4F6',
        background: selected ? '#E6F7F7' : '#fff',
        borderLeft: selected ? '3px solid #00A9AC' : '3px solid transparent',
        transition: 'background 0.1s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: '#1A1A1A' }}>{conv.customerName}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 11, color: '#9CA3AF' }}>{fmtDate(conv.lastMessageAt)}</span>
          {conv.unreadCount > 0 && (
            <span style={{ minWidth: 18, height: 18, borderRadius: 99, background: '#00A9AC', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' }}>
              {conv.unreadCount}
            </span>
          )}
        </div>
      </div>
      <div style={{ fontSize: 12, color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {conv.customerPhone}
      </div>
      <div style={{ fontSize: 12, color: '#6B7280', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {conv.lastMessageBody}
      </div>
    </div>
  );
}

function MessageBubble({ msg }: { msg: SmsMessage }) {
  const isOut = msg.direction === 'outbound';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: isOut ? 'flex-end' : 'flex-start', marginBottom: 10 }}>
      {msg.senderName && isOut && (
        <div style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 3, paddingRight: 4 }}>{msg.senderName}</div>
      )}
      <div style={{
        maxWidth: '72%', padding: '9px 13px', borderRadius: isOut ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
        background: isOut ? '#00A9AC' : '#F3F4F6',
        color: isOut ? '#fff' : '#1A1A1A',
        fontSize: 13, lineHeight: 1.5,
      }}>
        {msg.body}
        {msg.attachments.map(att => (
          <div key={att.id} style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6, padding: '5px 8px', background: isOut ? 'rgba(255,255,255,0.15)' : '#E5E7EB', borderRadius: 6 }}>
            <span style={{ fontSize: 14 }}>{att.emoji}</span>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600 }}>{att.name}</div>
              <div style={{ fontSize: 10, opacity: 0.7 }}>{(att.size / 1024).toFixed(0)} KB</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 10, color: '#9CA3AF', marginTop: 3, paddingLeft: isOut ? 0 : 4, paddingRight: isOut ? 4 : 0 }}>
        {fmtTime(msg.sentAt)}
        {isOut && msg.readAt && <span style={{ marginLeft: 4, color: '#15803D' }}>✓ Read</span>}
      </div>
    </div>
  );
}

export function InboxView() {
  const [selectedId, setSelectedId] = useState<string>(SMS_CONVERSATIONS[0].id);
  const [input, setInput]           = useState('');
  const [localMessages, setLocalMessages] = useState<SmsMessage[]>(SMS_MESSAGES);
  const bottomRef = useRef<HTMLDivElement>(null);
  const quiet = isQuietHours();

  const selectedConv = SMS_CONVERSATIONS.find(c => c.id === selectedId)!;
  const messages = localMessages.filter(m => m.conversationId === selectedId);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  function sendMessage(body: string) {
    if (!body.trim() || quiet) return;
    const msg: SmsMessage = {
      id: `msg-local-${Date.now()}`,
      conversationId: selectedId,
      shopId: 'shop-1',
      direction: 'outbound',
      body: body.trim(),
      attachments: [],
      sentAt: new Date().toISOString(),
      senderName: 'You',
    };
    setLocalMessages(p => [...p, msg]);
    setInput('');
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 220px)', minHeight: 500, border: '1px solid #E5E7EB', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
      {/* Left panel — conversation list */}
      <div style={{ width: 280, flexShrink: 0, borderRight: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', background: '#FAFAFA' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #E5E7EB', fontWeight: 700, fontSize: 14, color: '#1A1A1A' }}>
          SMS Inbox
          {SMS_CONVERSATIONS.filter(c => c.unreadCount > 0).length > 0 && (
            <span style={{ marginLeft: 8, minWidth: 18, height: 18, borderRadius: 99, background: '#00A9AC', color: '#fff', fontSize: 10, fontWeight: 700, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px' }}>
              {SMS_CONVERSATIONS.reduce((s, c) => s + c.unreadCount, 0)}
            </span>
          )}
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {SMS_CONVERSATIONS.map(conv => (
            <ConversationItem key={conv.id} conv={conv} selected={selectedId === conv.id} onClick={() => setSelectedId(conv.id)} />
          ))}
        </div>
      </div>

      {/* Right panel — chat thread */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Header */}
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#1A1A1A' }}>{selectedConv.customerName}</div>
            <div style={{ fontSize: 12, color: '#9CA3AF' }}>{selectedConv.customerPhone}</div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <span style={{ fontSize: 11, color: '#6B7280', padding: '3px 8px', background: '#F3F4F6', borderRadius: 99 }}>
              Customer #{selectedConv.customerId}
            </span>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px' }}>
          {messages.map(msg => <MessageBubble key={msg.id} msg={msg} />)}
          <div ref={bottomRef} />
        </div>

        {/* TCPA warning */}
        {quiet && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: '#FFFBEB', borderTop: '1px solid #FDE68A' }}>
            <AlertTriangle size={13} color="#D97706" />
            <span style={{ fontSize: 12, color: '#92400E', fontWeight: 500 }}>
              TCPA quiet hours (9 PM – 8 AM) — outbound messages are blocked until 8:00 AM
            </span>
          </div>
        )}

        {/* Quick replies */}
        <div style={{ padding: '8px 16px 0', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {QUICK_REPLIES.map(qr => (
            <button
              key={qr}
              onClick={() => sendMessage(qr)}
              disabled={quiet}
              style={{
                padding: '4px 10px', borderRadius: 99, border: '1px solid #E5E7EB',
                background: '#fff', color: '#374151', fontSize: 11, fontWeight: 500,
                cursor: quiet ? 'not-allowed' : 'pointer', opacity: quiet ? 0.5 : 1,
              }}
            >
              {qr}
            </button>
          ))}
        </div>

        {/* Input bar */}
        <div style={{ padding: '10px 16px 14px', display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', border: '1px solid #D1D5DB', borderRadius: 10, padding: '6px 10px', gap: 6, background: quiet ? '#F9FAFB' : '#fff' }}>
            <button style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '2px', display: 'flex' }}>
              <Paperclip size={16} color="#9CA3AF" />
            </button>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
              disabled={quiet}
              placeholder={quiet ? 'Messaging blocked during quiet hours (9 PM–8 AM)' : 'Type a message… (Enter to send)'}
              rows={1}
              style={{
                flex: 1, border: 'none', outline: 'none', resize: 'none', fontSize: 13,
                fontFamily: 'Inter, sans-serif', background: 'transparent',
                color: '#1A1A1A', minHeight: 24, maxHeight: 80,
              }}
            />
          </div>
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || quiet}
            style={{
              width: 40, height: 40, borderRadius: 99, border: 'none',
              background: input.trim() && !quiet ? '#00A9AC' : '#E5E7EB',
              cursor: input.trim() && !quiet ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}
          >
            <Send size={16} color={input.trim() && !quiet ? '#fff' : '#9CA3AF'} />
          </button>
        </div>
      </div>
    </div>
  );
}
