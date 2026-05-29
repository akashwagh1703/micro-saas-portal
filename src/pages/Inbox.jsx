import { useEffect, useState, useRef } from 'react';
import { Search, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

export default function Inbox() {
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [contact, setContact] = useState(null);
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const messagesEndRef = useRef(null);

  const fetchConversations = () => {
    api.get('/inbox/conversations', { params: { search } }).then((r) => {
      setConversations(r.data.data || []);
    });
  };

  const fetchMessages = (id) => {
    api.get(`/inbox/conversations/${id}/messages`).then((r) => {
      setMessages(r.data.messages?.data || r.data.messages || []);
      setContact(r.data.conversation?.contact);
    });
  };

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(() => {
      fetchConversations();
      if (selected) fetchMessages(selected);
    }, 5000);
    return () => clearInterval(interval);
  }, [search, selected]);

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
      await api.post(`/inbox/conversations/${selected}/send`, { content: message });
      setMessage('');
      fetchMessages(selected);
      fetchConversations();
    } catch {
      toast.error('Failed to send message');
    }
  };

  return (
    <div className="flex h-[calc(100vh-3rem)] flex-col">
      <h1 className="mb-4 text-2xl font-bold">Inbox</h1>
      <div className="flex flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="w-80 flex-shrink-0 border-r border-slate-100 flex flex-col">
          <div className="border-b p-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
              <input
                className="w-full rounded-lg border border-slate-200 py-2 pl-8 pr-3 text-sm"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => selectConversation(conv)}
                className={`flex w-full items-start gap-3 border-b border-slate-50 p-3 text-left hover:bg-slate-50 ${
                  selected === conv.id ? 'bg-emerald-50' : ''
                }`}
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                  {(conv.contact?.name || conv.contact?.phone || '?')[0].toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between">
                    <p className="truncate font-medium text-sm">{conv.contact?.name || conv.contact?.phone}</p>
                    {conv.unread_count > 0 && (
                      <span className="rounded-full bg-emerald-600 px-1.5 text-xs text-white">{conv.unread_count}</span>
                    )}
                  </div>
                  <p className="truncate text-xs text-slate-500">{conv.contact?.phone}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-1 flex-col">
          {selected ? (
            <>
              <div className="border-b px-4 py-3">
                <p className="font-semibold">{contact?.name || contact?.phone}</p>
                <p className="text-xs text-slate-500">{contact?.phone}</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#e5ddd5]">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`max-w-[75%] rounded-lg px-3 py-2 text-sm shadow ${
                      m.direction === 'outgoing'
                        ? 'ml-auto bg-[#dcf8c6]'
                        : 'bg-white'
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
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <button type="submit" className="rounded-full bg-emerald-600 p-2.5 text-white hover:bg-emerald-700">
                  <Send size={18} />
                </button>
              </form>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-slate-400">
              Select a conversation
            </div>
          )}
        </div>

        {contact && selected && (
          <div className="hidden w-64 flex-shrink-0 border-l border-slate-100 p-4 xl:block">
            <h3 className="font-semibold mb-2">Contact Info</h3>
            <p className="text-sm"><span className="text-slate-500">Name:</span> {contact.name || '—'}</p>
            <p className="text-sm mt-1"><span className="text-slate-500">Phone:</span> {contact.phone}</p>
            {contact.email && <p className="text-sm mt-1"><span className="text-slate-500">Email:</span> {contact.email}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
