import { useEffect } from 'react';
import { CalendarCheck, Star, AlertCircle, UserPlus, CheckCircle, Trash2 } from 'lucide-react';
import Layout from '../../components/Layout';
import { useNotifStore, type Notif } from '../../store/notifStore';

const ICONS: Record<Notif['type'], { icon: React.ReactNode; bg: string }> = {
  booking:  { icon: <CalendarCheck size={16} />, bg: '#E1EEE7' },
  review:   { icon: <Star size={16} />,          bg: '#F6EBCB' },
  alert:    { icon: <AlertCircle size={16} />,   bg: '#FAEAE2' },
  customer: { icon: <UserPlus size={16} />,      bg: '#E1EEE7' },
  confirm:  { icon: <CheckCircle size={16} />,   bg: '#F3EEDD' },
};

export default function NotificationsPage() {
  const { notifs, markAllRead, markRead, dismiss } = useNotifStore();
  const unreadCount = notifs.filter((n) => n.unread).length;

  // فتح الصفحة يجعل كل الإشعارات مقروءة تلقائياً -> يصفّر الشارة فوراً
  useEffect(() => {
    markAllRead();
  }, [markAllRead]);

  return (
    <Layout>
      <div style={S.header}>
        <div>
          <h1 style={S.title}>الإشعارات</h1>
          <p style={S.sub}>{notifs.length} إشعار بالإجمالي</p>
        </div>
        {unreadCount > 0 && (
          <button style={S.markBtn} onClick={markAllRead}>تعليم الكل كمقروء</button>
        )}
      </div>

      <div style={S.list}>
        {notifs.map((n) => {
          const { icon, bg } = ICONS[n.type];
          return (
            <div key={n.id} style={{ ...S.item, background: n.unread ? '#FAF9F2' : '#fff' }} onClick={() => markRead(n.id)}>
              <div style={{ ...S.iconWrap, background: bg }}>{icon}</div>
              <div style={{ flex: 1 }}>
                <p style={S.itemTitle}>{n.title} {n.unread && <span style={S.dot} />}</p>
                <p style={S.itemDesc}>{n.desc}</p>
                <p style={S.itemTime}>{n.time}</p>
              </div>
              <button style={S.dismissBtn} onClick={(e) => { e.stopPropagation(); dismiss(n.id); }} aria-label="حذف الإشعار">
                <Trash2 size={14} />
              </button>
            </div>
          );
        })}
        {notifs.length === 0 && (
          <p style={{ textAlign: 'center', color: '#93A29B', padding: '60px 0', fontFamily: "'Tajawal', sans-serif" }}>لا توجد إشعارات جديدة، أنت على اطّلاع تام! 🎉</p>
        )}
      </div>
    </Layout>
  );
}

const S: Record<string, React.CSSProperties> = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, direction: 'rtl' },
  title: { margin: 0, fontSize: 28, fontWeight: 700, color: '#1C2B27', fontFamily: "'Amiri', serif" },
  sub: { margin: '6px 0 0', fontSize: 13, color: '#52655F', fontFamily: "'Tajawal', sans-serif" },
  markBtn: { background: 'none', border: 'none', color: '#0E5C4A', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Tajawal', sans-serif" },
  list: { display: 'flex', flexDirection: 'column', gap: 10, direction: 'rtl' },
  item: { display: 'flex', gap: 14, padding: '16px', border: '1px solid #E5DFC8', borderRadius: 14, cursor: 'pointer', alignItems: 'flex-start' },
  iconWrap: { width: 38, height: 38, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  itemTitle: { margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: '#1C2B27', display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Tajawal', sans-serif" },
  itemDesc: { margin: '0 0 6px', fontSize: 13, color: '#52655F', fontFamily: "'Tajawal', sans-serif" },
  itemTime: { margin: 0, fontSize: 11, color: '#93A29B' },
  dot: { width: 7, height: 7, borderRadius: '50%', background: '#C69A3A', display: 'inline-block' },
  dismissBtn: { background: 'none', border: 'none', color: '#C7BFA0', cursor: 'pointer', padding: 6, flexShrink: 0 },
};