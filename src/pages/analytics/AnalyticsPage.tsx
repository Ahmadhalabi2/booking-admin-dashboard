import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, DollarSign, CalendarCheck, Users as UsersIcon } from 'lucide-react';
import Layout from '../../components/Layout';

const REVENUE_DATA = [
  { month: 'يناير', revenue: 42000, bookings: 180 },
  { month: 'فبراير', revenue: 38000, bookings: 165 },
  { month: 'مارس', revenue: 51000, bookings: 210 },
  { month: 'أبريل', revenue: 47000, bookings: 195 },
  { month: 'مايو', revenue: 62000, bookings: 240 },
  { month: 'يونيو', revenue: 84200, bookings: 312 },
];

const HOTEL_PERFORMANCE = [
  { name: 'برج العرب', revenue: 28400 },
  { name: 'أمان طوكيو', revenue: 19200 },
  { name: 'ريتز باريس', revenue: 16800 },
  { name: 'فور سيزنز', revenue: 12100 },
  { name: 'أتلانتس', revenue: 9700 },
];

const BOOKING_STATUS = [
  { name: 'مؤكد', value: 45, color: '#0E5C4A' },
  { name: 'قيد الانتظار', value: 22, color: '#C69A3A' },
  { name: 'مكتمل', value: 28, color: '#6E8F86' },
  { name: 'ملغي', value: 8, color: '#BD5B3E' },
];

const KPIS = [
  { label: 'إجمالي الإيرادات', value: '324,200 $', change: '+18.2%', icon: <DollarSign size={20} />, color: '#0E5C4A' },
  { label: 'إجمالي الحجوزات', value: '1,302',    change: '+12.4%', icon: <CalendarCheck size={20} />, color: '#C69A3A' },
  { label: 'عملاء جدد', value: '284',       change: '+8.7%',  icon: <UsersIcon size={20} />, color: '#BD5B3E' },
  { label: 'متوسط قيمة الحجز', value: '249 $', change: '+4.1%',  icon: <TrendingUp size={20} />, color: '#6E8F86' },
];

export default function AnalyticsPage() {
  return (
    <Layout>
      <div style={S.header}>
        <h1 style={S.title}>التحليلات</h1>
        <p style={S.sub}>نظرة على الإيرادات والحجوزات وتوجهات العملاء — آخر ٦ أشهر</p>
      </div>

      {/* المؤشرات الرئيسية */}
      <div style={S.kpiGrid}>
        {KPIS.map((k) => (
          <div key={k.label} style={S.kpiCard}>
            <div style={{ ...S.kpiIcon, background: k.color + '1a', color: k.color }}>{k.icon}</div>
            <div>
              <p style={S.kpiValue}>{k.value}</p>
              <p style={S.kpiLabel}>{k.label}</p>
              <p style={{ ...S.kpiChange, color: '#0E5C4A' }}>{k.change} مقارنة بالفترة السابقة</p>
            </div>
          </div>
        ))}
      </div>

      {/* مخطط الإيرادات */}
      <div style={S.card}>
        <p style={S.cardTitle}>اتجاه الإيرادات والحجوزات</p>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={REVENUE_DATA}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5DFC8" />
            <XAxis dataKey="month" stroke="#93A29B" fontSize={12} />
            <YAxis stroke="#93A29B" fontSize={12} />
            <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #E5DFC8', fontSize: 13, fontFamily: 'Tajawal, sans-serif' }} />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#0E5C4A" strokeWidth={3} name="الإيرادات ($)" dot={{ r: 4 }} />
            <Line type="monotone" dataKey="bookings" stroke="#C69A3A" strokeWidth={3} name="الحجوزات" dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={S.twoCol}>
        {/* أداء الفنادق */}
        <div style={S.card}>
          <p style={S.cardTitle}>الإيرادات حسب الفندق</p>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={HOTEL_PERFORMANCE} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5DFC8" horizontal={false} />
              <XAxis type="number" stroke="#93A29B" fontSize={12} />
              <YAxis type="category" dataKey="name" stroke="#93A29B" fontSize={12} width={100} />
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #E5DFC8', fontSize: 13, fontFamily: 'Tajawal, sans-serif' }} />
              <Bar dataKey="revenue" fill="#0E5C4A" radius={[6, 0, 0, 6]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* توزيع حالات الحجز */}
        <div style={S.card}>
          <p style={S.cardTitle}>توزيع حالات الحجز</p>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={BOOKING_STATUS} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={(d) => `${d.name} ${d.value}%`}>
                {BOOKING_STATUS.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #E5DFC8', fontSize: 13, fontFamily: 'Tajawal, sans-serif' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Layout>
  );
}

const S: Record<string, React.CSSProperties> = {
  header: { marginBottom: 24, direction: 'rtl' },
  title: { margin: 0, fontSize: 28, fontWeight: 700, color: 'var(--color-ink, #1C2B27)', fontFamily: "'Amiri', serif" },
  sub: { margin: '6px 0 0', fontSize: 13, color: 'var(--color-ink-soft, #52655F)', fontFamily: "'Tajawal', sans-serif" },
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 16, marginBottom: 24, direction: 'rtl' },
  kpiCard: { background: '#fff', border: '1px solid #E5DFC8', borderRadius: 14, padding: '20px', display: 'flex', gap: 14, alignItems: 'flex-start' },
  kpiIcon: { width: 42, height: 42, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  kpiValue: { margin: '0 0 2px', fontSize: 22, fontWeight: 700, color: '#1C2B27', fontFamily: "'Tajawal', sans-serif" },
  kpiLabel: { margin: '0 0 4px', fontSize: 12, color: '#52655F' },
  kpiChange: { margin: 0, fontSize: 11, fontWeight: 600 },
  card: { background: '#fff', border: '1px solid #E5DFC8', borderRadius: 16, padding: '24px', marginBottom: 20, direction: 'rtl' },
  cardTitle: { margin: '0 0 16px', fontSize: 15, fontWeight: 700, color: '#1C2B27', fontFamily: "'Tajawal', sans-serif" },
  twoCol: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(380px,1fr))', gap: 20 },
};