import { useNavigate } from 'react-router-dom';
import { Mail, Shield, Calendar, LogOut, Edit2 } from 'lucide-react';
import Layout from '../../components/Layout';
import { useAuthStore } from '../../store/authStore';

const ROLE_LABEL: Record<string, string> = {
  superadmin: 'مدير النظام الرئيسي',
  manager: 'مدير الفندق',
  support: 'موظف الدعم',
  customer: 'عميل',
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuthStore();
  const initials = currentUser?.name?.slice(0, 2).toUpperCase() || 'U';
  const roleKey = (currentUser?.role as string) || 'customer';

  const handleLogout = () => { logout(); navigate('/login', { replace: true }); };

  return (
    <Layout>
      <h1 style={S.title}>ملفي الشخصي</h1>
      <p style={S.sub}>تفاصيل الحساب والنشاط</p>

      <div style={S.card}>
        <div style={S.topRow}>
          <div style={S.avatar}>{initials}</div>
          <div style={{ flex: 1 }}>
            <p style={S.name}>{currentUser?.name}</p>
            <span style={S.rolePill}><Shield size={11} /> {ROLE_LABEL[roleKey] || roleKey}</span>
          </div>
          <button style={S.editBtn} onClick={() => navigate('/settings')}>
            <Edit2 size={14} /> تعديل
          </button>
        </div>

        <div style={S.infoGrid}>
          <div style={S.infoItem}>
            <Mail size={16} color="#0E5C4A" />
            <div>
              <p style={S.infoLabel}>البريد الإلكتروني</p>
              <p style={S.infoVal}>{currentUser?.email}</p>
            </div>
          </div>
          <div style={S.infoItem}>
            <Shield size={16} color="#C69A3A" />
            <div>
              <p style={S.infoLabel}>الصلاحية</p>
              <p style={S.infoVal}>{ROLE_LABEL[roleKey] || roleKey}</p>
            </div>
          </div>
          <div style={S.infoItem}>
            <Calendar size={16} color="#BD5B3E" />
            <div>
              <p style={S.infoLabel}>عضو منذ</p>
              <p style={S.infoVal}>يونيو 2026</p>
            </div>
          </div>
        </div>
      </div>

      <div style={S.card}>
        <p style={S.cardTitle}>إجراءات الحساب</p>
        <button style={S.logoutBtn} onClick={handleLogout}>
          <LogOut size={16} style={{ transform: 'rotate(180deg)' }} /> تسجيل الخروج من ضِيافة
        </button>
      </div>
    </Layout>
  );
}

const S: Record<string, React.CSSProperties> = {
  title: { margin: 0, fontSize: 28, fontWeight: 700, color: '#1C2B27', fontFamily: "'Amiri', serif" },
  sub: { margin: '6px 0 24px', fontSize: 13, color: '#52655F', fontFamily: "'Tajawal', sans-serif" },
  card: { background: '#fff', border: '1px solid #E5DFC8', borderRadius: 16, padding: '24px', marginBottom: 20, maxWidth: 600, direction: 'rtl' },
  topRow: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 24, borderBottom: '1px solid #F3EEDD' },
  avatar: { width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#0E5C4A,#0A4437)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, flexShrink: 0 },
  name: { margin: '0 0 6px', fontSize: 19, fontWeight: 700, color: '#1C2B27', fontFamily: "'Tajawal', sans-serif" },
  rolePill: { display: 'inline-flex', alignItems: 'center', gap: 4, background: '#E1EEE7', color: '#0A4437', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 },
  editBtn: { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', border: '1px solid #E5DFC8', borderRadius: 8, background: '#F3EEDD', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#1C2B27', fontFamily: "'Tajawal', sans-serif" },
  infoGrid: { display: 'flex', flexDirection: 'column', gap: 16 },
  infoItem: { display: 'flex', alignItems: 'center', gap: 12 },
  infoLabel: { margin: '0 0 2px', fontSize: 11, color: '#93A29B' },
  infoVal: { margin: 0, fontSize: 14, fontWeight: 700, color: '#1C2B27', fontFamily: "'Tajawal', sans-serif" },
  cardTitle: { margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#1C2B27', fontFamily: "'Tajawal', sans-serif" },
  logoutBtn: { display: 'flex', alignItems: 'center', gap: 8, padding: '11px 20px', background: 'none', border: '1px solid #FAEAE2', color: '#BD5B3E', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 700, fontFamily: "'Tajawal', sans-serif" },
};