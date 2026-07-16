import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Calendar, CheckCircle, Clock, XCircle, Eye, Trash2 } from 'lucide-react';
import Layout from '../../components/Layout';
import { useBookingsStore, type Booking } from '../../store/bookingsStore';
import { useAuthStore } from '../../store/authStore';


const STATUS: Record<Booking['status'], { label: string; bg: string; text: string; icon: React.ReactNode }> = {
  pending_admin: { label: 'Pending Admin', bg: '#fffbeb', text: '#b45309', icon: <Clock size={13} /> },
  accepted_waiting_payment: {
    label: 'Accepted (Awaiting Payment)',
    bg: '#eef2ff',
    text: '#4338ca',
    icon: <Calendar size={13} />,
  },
  paid_confirmed: { label: 'Paid & Confirmed', bg: '#f0fdf4', text: '#15803d', icon: <CheckCircle size={13} /> },
  cancelled_by_admin: { label: 'Cancelled by Admin', bg: '#fef2f2', text: '#dc2626', icon: <XCircle size={13} /> },
  cancelled_by_user: { label: 'Cancelled by User', bg: '#fef2f2', text: '#dc2626', icon: <XCircle size={13} /> },
};

export default function BookingsPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const isAdmin = currentUser?.role === 'superadmin';


  const {
    bookings,
    adminAccept,
    adminCancel,
    adminMarkPaid,
    deleteBookingCompletely,
  } = useBookingsStore();

  // فحص إمكانية الدفع للمستخدم العادي عندما يوافق الأدمن على حجز بانتظار الدفع
  const canPay = (status: Booking['status']) => status === 'accepted_waiting_payment';

  const [tab, setTab] = useState<'all' | Booking['status']>('all');
  const [search, setSearch] = useState('');

  // 1. تصفية الحجوزات حسب التبويب والبحث المفتوح
  const filtered = useMemo(() => {
    return bookings
      .filter((b) => (tab === 'all' ? true : b.status === tab))
      .filter((b) =>
        (b.id || '').toLowerCase().includes(search.toLowerCase()) ||
        b.userName.toLowerCase().includes(search.toLowerCase()) ||
        b.hotelName.toLowerCase().includes(search.toLowerCase())
      );
  }, [bookings, tab, search]);

  // 2. حساب أعداد الطلبات لكل تبويب بشكل ديناميكي
  const counts = useMemo(() => {
    const base: Record<string, number> = { all: bookings.length };
    const statuses: Booking['status'][] = [
      'pending_admin',
      'accepted_waiting_payment',
      'paid_confirmed',
      'cancelled_by_admin',
      'cancelled_by_user',
    ];
    statuses.forEach((s) => {
      base[s] = bookings.filter((b) => b.status === s).length;
    });
    return base;
  }, [bookings]);

  return (
    <Layout>
      <div style={S.header}>
        <div>
          <h1 style={S.title}>Bookings</h1>
          <p style={S.sub}>{bookings.length} total requests</p>
        </div>
      </div>

      {/* تبويبات الفرز السريع */}
      <div style={S.tabs}>
        {[
          { key: 'all' as const, label: 'All' },
          { key: 'pending_admin' as const, label: 'Pending' },
          { key: 'accepted_waiting_payment' as const, label: 'Awaiting Payment' },
          { key: 'paid_confirmed' as const, label: 'Paid' },
          { key: 'cancelled_by_admin' as const, label: 'Cancelled' },
          { key: 'cancelled_by_user' as const, label: 'Cancelled (User)' },
        ].map((t) => (
          <button key={t.key} style={{ ...S.tab, ...(tab === t.key ? S.tabActive : {}) }} onClick={() => setTab(t.key as any)}>
            {t.label}
            <span style={{ ...S.tabCount, ...(tab === t.key ? S.tabCountActive : {}) }}>
              {t.key === 'all' ? counts.all : counts[t.key as Booking['status']]}
            </span>
          </button>
        ))}
      </div>

      {/* حقل البحث */}
      <div style={S.searchBox}>
        <Search size={15} color="#94a3b8" />
        <input
          style={S.searchIn}
          placeholder="Search by user, hotel or booking ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* جدول عرض البيانات */}
      <div style={S.tableWrap}>
        <table style={S.table}>
          <thead>
            <tr>
              {['Booking ID', 'User', 'Hotel', 'Dates', 'Guests', 'Amount', 'Status', 'Actions'].map((h) => (
                <th key={h} style={h === 'Guests' ? { ...S.th, textAlign: 'center' } : S.th}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ ...S.td, textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
                  No bookings found matching the selected criteria.
                </td>
              </tr>
            ) : (
              filtered.map((b) => {
                const st = STATUS[b.status];
                return (
                  <tr key={b.id} style={S.tr}>
                    <td style={{ ...S.td, fontWeight: 700, color: '#4f46e5' }}>{b.id}</td>
                    <td style={S.td}>{b.userName}</td>
                    <td style={{ ...S.td, color: '#64748b' }}>{b.hotelName}</td>
                    <td style={S.td}>
                      {b.checkIn} → {b.checkOut}
                    </td>
                    <td style={{ ...S.td, textAlign: 'center' }}>{b.guests}</td>
                    <td style={{ ...S.td, fontWeight: 700 }}>${b.amount.toLocaleString()}</td>
                    <td style={S.td}>
                      <span style={{ ...S.pill, background: st.bg, color: st.text }}>
                        {st.icon} {st.label}
                      </span>
                    </td>
                    <td style={S.td}>
                      <div style={S.actions}>
                        {/* زر عرض التفاصيل الفوري */}
                        <button
                          style={S.smallBtn}
                          onClick={() => {
                            const msg = [
                              `Booking ID: ${b.id}`,
                              `User: ${b.userName}`,
                              `Hotel: ${b.hotelName}`,
                              `Dates: ${b.checkIn} → ${b.checkOut}`,
                              `Guests: ${b.guests}`,
                              `Amount: $${b.amount.toLocaleString()}`,
                              `Status: ${b.status}`,
                            ].join('\n');
                            alert(msg);
                          }}
                          aria-label={`Viewing ${b.id}`}
                        >
                          <Eye size={14} />
                        </button>

                        {/* لوحة تحكم الأدمن أو خيارات المستخدم العادي */}
                        {isAdmin ? (
                          <>
                            {b.status === 'pending_admin' && (
                              <div style={{ display: 'flex', gap: 6 }}>
                                <button
                                  onClick={() => adminAccept(b.id)}
                                  style={{ ...S.actionBtn, background: '#10b981', color: '#fff' }}
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => adminCancel(b.id)}
                                  style={{ ...S.actionBtn, background: '#ef4444', color: '#fff' }}
                                >
                                  Cancel
                                </button>
                              </div>
                            )}
                            {b.status === 'accepted_waiting_payment' && (
                              <button
                                onClick={() => adminMarkPaid(b.id)}
                                style={{ ...S.actionBtn, background: '#4f46e5', color: '#fff' }}
                              >
                                Mark as Paid
                              </button>
                            )}
                            {/* حذف كلي من قبل الأدمن لأي حجز ملغى أو منتهٍ */}
                            {(b.status === 'cancelled_by_admin' || b.status === 'cancelled_by_user' || b.status === 'paid_confirmed') && (
                              <button
                                onClick={() => {
                                  if (confirm('Are you sure you want to delete this record permanently?')) {
                                    deleteBookingCompletely(b.id);
                                  }
                                }}
                                style={{ ...S.smallBtn, color: '#ef4444', borderColor: '#fca5a5' }}
                                title="Delete Permanently"
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </>
                        ) : (
                          /* خيارات المستخدم العادي */
                          <>
                            {canPay(b.status) && (
                              <button
                                onClick={() => {
                                  const res = adminMarkPaid(b.id); // تحويل حالة الدفع مباشرة كمحاكاة للدفع
                                  if (!res?.success) {
                                    alert(res?.message || 'Payment failed');
                                    return;
                                  }
                                  alert('Payment Successful! Your booking is now confirmed.');
                                  navigate('/my-bookings');
                                }}
                                style={{ ...S.actionBtn, background: '#2563eb', color: '#fff' }}
                              >
                                Pay Now
                              </button>
                            )}
                            {b.status === 'pending_admin' && (
                              <button
                                onClick={() => adminCancel(b.id)} // المستخدم يلغي حجز المعلق
                                style={{ ...S.actionBtn, background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db' }}
                              >
                                Cancel Request
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES الفاخرة والمنظمة لصفحة الحجوزات
// ─────────────────────────────────────────────────────────────────────────────
const S: Record<string, React.CSSProperties> = {
  header: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: 800, color: '#0f172a', margin: '0 0 4px', fontFamily: "system-ui" },
  sub: { fontSize: 14, color: '#64748b', margin: 0 },
  tabs: { display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 12, marginBottom: 16, borderBottom: '1px solid #e2e8f0' },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 16px',
    borderRadius: 9999,
    border: '1px solid #e2e8f0',
    background: '#fff',
    color: '#475569',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
  },
  tabActive: {
    background: '#0f172a',
    color: '#fff',
    borderColor: '#0f172a',
  },
  tabCount: {
    fontSize: 11,
    padding: '2px 6px',
    borderRadius: 8,
    background: '#f1f5f9',
    color: '#64748b',
    fontWeight: 700,
  },
  tabCountActive: {
    background: 'rgba(255,255,255,0.2)',
    color: '#fff',
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: '#fff',
    border: '1px solid #e2e8f0',
    borderRadius: 12,
    padding: '10px 14px',
    marginBottom: 20,
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
  },
  searchIn: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: 14,
    color: '#0f172a',
    background: 'transparent',
  },
  tableWrap: {
    background: '#fff',
    borderRadius: 16,
    border: '1px solid #e2e8f0',
    overflowX: 'auto',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  th: {
    padding: '16px 20px',
    background: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
    color: '#475569',
    fontSize: 12,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  tr: {
    borderBottom: '1px solid #f1f5f9',
    transition: 'background-color 0.15s ease',
  },
  td: {
    padding: '16px 20px',
    fontSize: 14,
    color: '#0f172a',
    verticalAlign: 'middle',
  },
  pill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    padding: '4px 10px',
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 600,
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  smallBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: 8,
    border: '1px solid #e2e8f0',
    background: '#fff',
    color: '#64748b',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  actionBtn: {
    padding: '6px 12px',
    borderRadius: 8,
    border: 'none',
    fontSize: 12,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'opacity 0.2s ease',
  },
};