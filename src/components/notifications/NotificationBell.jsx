import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
import api from '../../services/api';

function bookingLink(metadata) {
  const id = metadata?.booking_id;
  if (id) return `/scheduling/bookings?id=${id}`;
  return metadata?.route || '/scheduling/bookings';
}

function canUseBrowserNotifications() {
  return typeof window !== 'undefined' && 'Notification' in window;
}

async function requestNotificationPermission() {
  if (!canUseBrowserNotifications()) return 'denied';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  try {
    return await Notification.requestPermission();
  } catch {
    return 'denied';
  }
}

function showBrowserNotification(item) {
  if (!canUseBrowserNotifications() || Notification.permission !== 'granted') return;
  try {
    const notification = new Notification(item?.title || 'New booking request', {
      body: item?.body || 'Someone requested a slot. Open to confirm or decline.',
      tag: `owner-notification-${item?.id ?? Date.now()}`,
      requireInteraction: true,
    });
    notification.onclick = () => {
      window.focus();
      const link = bookingLink(item?.metadata);
      window.location.href = link;
      notification.close();
    };
  } catch {
    /* ignore unsupported contexts */
  }
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef(null);
  const prevCountRef = useRef(0);
  const permissionAskedRef = useRef(false);

  const loadCount = useCallback(async () => {
    try {
      const { data } = await api.get('/notifications/unread-count');
      const newCount = Number(data?.count ?? 0);
      const prev = prevCountRef.current;

      if (newCount > prev && prev >= 0) {
        if (canUseBrowserNotifications()) {
          if (Notification.permission === 'default' && !permissionAskedRef.current) {
            permissionAskedRef.current = true;
            void requestNotificationPermission();
          }
          if (Notification.permission === 'granted') {
            try {
              const latest = await api.get('/notifications', { params: { limit: 1 } });
              const item = latest.data?.data?.[0];
              if (item && !item.is_read) {
                showBrowserNotification(item);
              }
            } catch {
              showBrowserNotification({ title: 'New booking request' });
            }
          }
        }
      }

      prevCountRef.current = newCount;
      setCount(newCount);
    } catch {
      setCount(0);
    }
  }, []);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/notifications', { params: { limit: 15 } });
      setItems(data?.data ?? []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCount();
    const timer = setInterval(loadCount, 15_000);
    const onVisible = () => {
      if (document.visibilityState === 'visible') loadCount();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [loadCount]);

  useEffect(() => {
    if (!open) return undefined;
    loadItems();
    const onDoc = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open, loadItems]);

  const markAllRead = async () => {
    try {
      await api.post('/notifications/read-all');
      setCount(0);
      prevCountRef.current = 0;
      setItems((prev) => prev.map((n) => ({ ...n, is_read: true, read_at: new Date().toISOString() })));
    } catch {
      /* ignore */
    }
  };

  const openItem = async (item) => {
    if (!item.is_read) {
      try {
        await api.patch(`/notifications/${item.id}/read`);
        setCount((c) => Math.max(0, c - 1));
        prevCountRef.current = Math.max(0, prevCountRef.current - 1);
      } catch {
        /* ignore */
      }
    }
    setOpen(false);
  };

  const enableAlerts = async () => {
    const result = await requestNotificationPermission();
    if (result === 'granted') {
      showBrowserNotification({
        title: 'Alerts enabled',
        body: 'You will get instant alerts when someone requests a slot.',
      });
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 shadow-sm hover:bg-slate-50"
        aria-label="Notifications"
      >
        <Bell size={20} />
        {count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[min(100vw-2rem,22rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">Notifications</p>
            <div className="flex items-center gap-2">
              {canUseBrowserNotifications() && Notification.permission !== 'granted' && (
                <button
                  type="button"
                  onClick={enableAlerts}
                  className="text-xs font-medium text-sky-700 hover:underline"
                >
                  Enable alerts
                </button>
              )}
              {count > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="text-xs font-medium text-emerald-700 hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <p className="px-4 py-6 text-sm text-slate-500">Loading…</p>
            ) : items.length === 0 ? (
              <p className="px-4 py-6 text-sm text-slate-500">No notifications yet.</p>
            ) : (
              items.map((item) => (
                <Link
                  key={item.id}
                  to={bookingLink(item.metadata)}
                  onClick={() => openItem(item)}
                  className={`block border-b border-slate-50 px-4 py-3 hover:bg-slate-50 ${
                    !item.is_read ? 'bg-emerald-50/40' : ''
                  }`}
                >
                  <p className="text-sm font-medium text-slate-900">{item.title}</p>
                  <p className="mt-0.5 text-xs text-slate-600">{item.body}</p>
                  <p className="mt-1 text-[10px] text-slate-400">
                    {new Date(item.created_at).toLocaleString()}
                  </p>
                </Link>
              ))
            )}
          </div>

          <div className="border-t border-slate-100 px-4 py-2">
            <Link
              to="/scheduling/bookings"
              onClick={() => setOpen(false)}
              className="text-xs font-medium text-emerald-700 hover:underline"
            >
              View all bookings →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
