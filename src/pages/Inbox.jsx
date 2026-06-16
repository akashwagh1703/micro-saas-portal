import { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Send, Inbox as InboxIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import EmptyState from '../components/ui/EmptyState';
import PageHeader from '../components/ui/PageHeader';
import Pagination from '../components/ui/Pagination';
import TestBotCard from '../components/onboarding/TestBotCard';
import api from '../services/api';
import { fetchSetupProgress } from '../utils/setupProgress';
import { contactPrimaryLabel, contactSecondaryLabel } from '../utils/contactDisplay';

const CONVERSATIONS_PAGE_SIZE = 20;

export default function Inbox() {
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [contact, setContact] = useState(null);
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [channelFilter, setChannelFilter] = useState('');
  const [conversationsPage, setConversationsPage] = useState(1);
  const [progress, setProgress] = useState(null);
  const messagesEndRef = useRef(null);
  const searchRef = useRef(search);
  const channelFilterRef = useRef(channelFilter);
  const selectedRef = useRef(selected);

  searchRef.current = search;
  channelFilterRef.current = channelFilter;
  selectedRef.current = selected;

  const fetchConversations = useCallback(() => {
    return api.get('/inbox/conversations', {
      params: {
        search: searchRef.current,
        channel: channelFilterRef.current || undefined,
      },
    }).then((r) => {
      setConversations(r.data.data || []);
    });
  }, []);

  const fetchMessages = (id) => {
    api.get(`/inbox/conversations/${id}/messages`).then((r) => {
      setMessages(r.data.messages?.data || r.data.messages || []);
      setContact(r.data.conversation?.contact);
    });
  };

  useEffect(() => {
    fetchSetupProgress(api).then(setProgress);
  }, []);

  useEffect(() => {
    setConversationsPage(1);
  }, [search, channelFilter]);

  useEffect(() => {
    const t = setTimeout(() => {
      fetchConversations();
    }, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [search, channelFilter, fetchConversations]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchConversations();
      if (selectedRef.current) fetchMessages(selectedRef.current);
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectConversation = (conv) => {
    setSelected(conv.id);
    fetchMessages(conv.id);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !selected) return;
    try {
      const { data } = await api.post(`/inbox/conversations/${selected}/send`, { content: message });
      if (!data.success) {
        toast.error(data.error || 'Failed to send message');
        return;
      }
      setMessage('');
      fetchMessages(selected);
      fetchConversations();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send message');
    }
  };

  const selectedConversation = conversations.find((c) => c.id === selected);
  const pagedConversations = conversations.slice(
    (conversationsPage - 1) * CONVERSATIONS_PAGE_SIZE,
    conversationsPage * CONVERSATIONS_PAGE_SIZE,
  );
  const replyPlaceholder =
    selectedConversation?.channel === 'instagram'
      ? 'Reply on Instagram…'
      : 'Type a reply…';

  return (
    <div className="flex h-[calc(100vh-5rem)] flex-col">
      <PageHeader
        eyebrow="Inbox"
        title="Customer messages"
        description="Chats from WhatsApp and Instagram — auto-replies appear here too"
      />

      {progress?.hasLive && (
        <div className="mb-4">
          <TestBotCard
            whatsappDisplay={progress.whatsappDisplay}
            instagramUsername={progress.instagramUsername}
            workflows={progress.workflows}
          />
        </div>
      )}

      <div className="flex flex-1 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm shadow-slate-200/40">
        <div className="flex w-80 flex-shrink-0 flex-col border-r border-slate-100">
          <div className="border-b p-3 space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
              <input
                className="w-full rounded-lg border border-slate-200 py-2 pl-8 pr-3 text-sm"
                placeholder="Search chats..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
            >
              <option value="">All channels</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="instagram">Instagram</option>
            </select>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-6 text-center">
                <InboxIcon className="mx-auto mb-2 text-slate-300" size={32} />
                <p className="text-sm text-slate-500">No messages yet</p>
                <p className="mt-1 text-xs text-slate-400">Messages from WhatsApp or Instagram will appear here</p>
              </div>
            ) : (
              <>
                {pagedConversations.map((conv) => (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => selectConversation(conv)}
                  className={`flex w-full items-start gap-3 border-b border-slate-50 p-3 text-left hover:bg-slate-50 ${
                    selected === conv.id ? 'bg-emerald-50' : ''
                  }`}
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                    {contactPrimaryLabel(conv.contact)[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between gap-2">
                      <p className="truncate text-sm font-medium">{contactPrimaryLabel(conv.contact)}</p>
                      {conv.channel === 'instagram' ? (
                        <span className="shrink-0 rounded bg-pink-100 px-1.5 text-[10px] font-medium text-pink-700">IG</span>
                      ) : (
                        <span className="shrink-0 rounded bg-emerald-100 px-1.5 text-[10px] font-medium text-emerald-700">WA</span>
                      )}
                      {conv.unread_count > 0 && (
                        <span className="rounded-full bg-emerald-600 px-1.5 text-xs text-white">{conv.unread_count}</span>
                      )}
                    </div>
                    <p className="truncate text-xs text-slate-500">{contactSecondaryLabel(conv.contact)}</p>
                  </div>
                </button>
                ))}
                <Pagination
                  page={conversationsPage}
                  pageSize={CONVERSATIONS_PAGE_SIZE}
                  totalItems={conversations.length}
                  onPageChange={setConversationsPage}
                  itemLabel="conversation"
                  className="px-3"
                />
              </>
            )}
          </div>
        </div>

        <div className="flex flex-1 flex-col">
          {selected ? (
            <>
              <div className="border-b px-4 py-3">
                <p className="font-semibold">{contactPrimaryLabel(contact)}</p>
                <p className="text-xs text-slate-500">{contactSecondaryLabel(contact)}</p>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto bg-[#e5ddd5] p-4">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`max-w-[75%] rounded-lg px-3 py-2 text-sm shadow ${
                      m.direction === 'outgoing' ? 'ml-auto bg-[#dcf8c6]' : 'bg-white'
                    }`}
                  >
                    {m.content}
                    <p className="mt-1 text-right text-[10px] text-slate-400">
                      {new Date(m.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={sendMessage} className="flex gap-2 border-t p-3">
                <input
                  className="flex-1 rounded-full border border-slate-200 px-4 py-2 text-sm"
                  placeholder={replyPlaceholder}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <button type="submit" className="rounded-full bg-emerald-600 p-2.5 text-white hover:bg-emerald-700">
                  <Send size={18} />
                </button>
              </form>
            </>
          ) : (
            <EmptyState
              icon={InboxIcon}
              title="Select a conversation"
              description="Choose a chat on the left, or send a test message on WhatsApp or Instagram to see it here."
              actionLabel={progress?.channelConnected ? undefined : 'Connect a channel'}
              actionHref={progress?.channelConnected ? undefined : '/settings'}
              hint={
                progress?.whatsappDisplay
                  ? `WhatsApp: ${progress.whatsappDisplay}`
                  : progress?.instagramUsername
                    ? `Instagram: @${progress.instagramUsername.replace(/^@/, '')}`
                    : undefined
              }
            />
          )}
        </div>

        {contact && selected && (
          <div className="hidden w-64 flex-shrink-0 border-l border-slate-100 p-4 xl:block">
            <h3 className="mb-2 font-semibold">Contact</h3>
            <p className="text-sm"><span className="text-slate-500">Name:</span> {contact.name || '—'}</p>
            {contact.channel === 'instagram' ? (
              <p className="mt-1 text-sm"><span className="text-slate-500">Instagram:</span> {contact.username ? `@${contact.username.replace(/^@/, '')}` : '—'}</p>
            ) : (
              <p className="mt-1 text-sm"><span className="text-slate-500">Phone:</span> {contact.phone || '—'}</p>
            )}
            {contact.email && <p className="mt-1 text-sm"><span className="text-slate-500">Email:</span> {contact.email}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
