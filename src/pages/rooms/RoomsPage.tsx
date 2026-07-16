import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Landmark, TrendingUp, CreditCard, Wallet, Download, Percent } from 'lucide-react';
import Layout from '../../components/Layout';

// بيانات منحنى الإيرادات لآخر 6 أشهر في سوريا (القيم بمليون ليرة سورية م.ل.س)
const REVENUE_TREND = [
  { month: 'كانون 2', revenue: 210 }, 
  { month: 'شباط', revenue: 190 },
  { month: 'آذار', revenue: 255 }, 
  { month: 'نيسان', revenue: 235 },
  { month: 'أيار', revenue: 310 }, 
  { month: 'حزيران', revenue: 421 }, // يمثل ذروة الموسم السياحي الصيفي
];

// سجل مستحقات الفنادق السورية الشريكة
const PAYOUTS = [
  { id: 'SY-PO-2601', hotel: 'فندق داما روز (دمشق)', period: 'حزيران 2026', amount: '142,000,000', gateway: 'سيرياتيل كاش', status: 'paid' },
  { id: 'SY-PO-2602', hotel: 'منتجع أفاميا الشام (اللاذقية)', period: 'حزيران 2026', amount: '96,000,000', gateway: 'فواتير (التحويل الإلكتروني)', status: 'paid' },
  { id: 'SY-PO-2603', hotel: 'فندق الشيراتون (حلب)', period: 'حزيران 2026', amount: '84,000,000', gateway: 'حساب بنك بيمو', status: 'pending' },
  { id: 'SY-PO-2604', hotel: 'فندق بيت المملوكة (دمشق القديمة)', period: 'حزيران 2026', amount: '60,500,000', gateway: 'حساب بنك البركة', status: 'pending' },
  { id: 'SY-PO-2605', hotel: 'فندق ومنتجع بلو باي (طرطوس)', period: 'حزيران 2026', amount: '48,500,000', gateway: 'سيرياتيل كاش', status: 'paid' },
];

export default function RoomsPage() {
  return (
    <Layout>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .revenue-card-lux {
          animation: fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        .revenue-card-lux:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(14, 92, 74, 0.06) !important;
        }
        .btn-hover-lux {
          transition: all 0.2s ease;
        }
        .btn-hover-lux:hover {
          opacity: 0.9;
          transform: scale(0.98);
        }
        
        /* تحسينات الشاشات الصغيرة للمرونة والتجاوب */
        @media (max-width: 640px) {
          .rev-header-lux {
            flex-direction: column;
            align-items: flex-start !important;
            gap: 16px;
          }
          .export-btn-lux {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>

      <div style={S.wrap}>
        {/* الهيدر الرئيسي */}
        <div className="rev-header-lux" style={S.header}>
          <div>
            <h1 style={S.title}>المالية والإيرادات الفندقية</h1>
            <p style={S.sub}>نظرة عامة على حسابات الإيرادات والتحويلات المالية للفنادق في سوريا</p>
          </div>
          <button 
            className="btn-hover-lux export-btn-lux" 
            style={S.exportBtn} 
            onClick={() => alert('جاري تصدير التقرير المالي بالتنسيق المعتمد لوزارة السياحة السورية (PDF)...')}
          >
            <Download size={15} /> تصدير التقرير المالي
          </button>
        </div>

        {/* كروت الأداء والمؤشرات KPI بالليرة السورية */}
        <div style={S.kpiGrid}>
          {[
            { icon: <Landmark size={20} />, label: 'إجمالي الإيرادات (الشهر الحالي)', value: '421,000,000 ل.س', subValue: 'ما يعادل $28,000 تقريباً', color: '#0E5C4A' },
            { icon: <TrendingUp size={20} />, label: 'النمو السياحي الصيفي', value: '+18.2%', subValue: 'مقارنة بالموسم الماضي', color: '#C69A3A' },
            { icon: <CreditCard size={20} />, label: 'مستحقات فنادق قيد الانتظار', value: '144,500,000 ل.س', subValue: 'بانتظار التسوية البنكية', color: '#BD5B3E' },
            { icon: <Wallet size={20} />, label: 'متوسط عمولة المنصة', value: '12%', subValue: 'رسوم حجز ومعالجة ثابتة', color: '#6E8F86' },
          ].map((k) => (
            <div key={k.label} className="revenue-card-lux" style={S.kpiCard}>
              <div style={{ ...S.kpiIcon, background: k.color + '1a', color: k.color }}>{k.icon}</div>
              <div>
                <p style={S.kpiValue}>{k.value}</p>
                <p style={S.kpiLabel}>{k.label}</p>
                <p style={S.kpiSubValue}>{k.subValue}</p>
              </div>
            </div>
          ))}
        </div>

        {/* الرسم البياني التفاعلي بالإيرادات السنوية */}
        <div className="revenue-card-lux" style={S.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 8 }}>
            <p style={S.cardTitle}>تحليل اتجاه الإيرادات — الـ 6 أشهر الأخيرة (م.ل.س)</p>
            <span style={{ fontSize: 11, color: '#52655F', background: '#F3EEDD', padding: '4px 8px', borderRadius: 6, fontWeight: 700, fontFamily: "'Tajawal', sans-serif" }}>* القيم بـ ملايين الليرات السورية</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={REVENUE_TREND} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0E5C4A" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0E5C4A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3EEDD" vertical={false} />
              <XAxis dataKey="month" stroke="#93A29B" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#93A29B" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v} م`} />
              <Tooltip 
                formatter={(value) => [`${value.toLocaleString()} مليون ل.س`, 'الإيرادات']}
                contentStyle={{ 
                  borderRadius: 12, 
                  border: '1px solid #E5DFC8', 
                  fontSize: 13, 
                  fontFamily: "'Tajawal', sans-serif",
                  boxShadow: '0 10px 15px -3px rgba(28, 43, 39, 0.06)',
                  direction: 'rtl'
                }} 
              />
              <Area type="monotone" dataKey="revenue" stroke="#0E5C4A" strokeWidth={3} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* جدول مستحقات الفنادق الشريكة في سوريا */}
        <div className="revenue-card-lux" style={S.card}>
          <p style={S.cardTitle}>مستحقات وتسوية حسابات المنشآت السياحية السورية</p>
          <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid #F3EEDD' }}>
            <table style={S.table}>
              <thead>
                <tr>
                  {['معرّف الدفعة', 'الفندق الشريك', 'الفترة المالية', 'المبلغ الكلي المستحق', 'آلية التحويل المعتمدة', 'حالة العملية', 'الإجراء'].map((h) => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PAYOUTS.map((p, i) => (
                  <tr key={i} style={S.tr}>
                    <td style={{ ...S.td, fontWeight: 700, color: 'var(--color-primary, #0E5C4A)' }}>{p.id}</td>
                    <td style={{ ...S.td, fontWeight: 800, color: '#1C2B27' }}>{p.hotel}</td>
                    <td style={{ ...S.td, color: '#52655F' }}>{p.period}</td>
                    <td style={{ ...S.td, fontWeight: 800, color: '#1C2B27' }}>{p.amount} ل.س</td>
                    <td style={{ ...S.td, color: '#52655F', fontWeight: 600 }}>{p.gateway}</td>
                    <td style={S.td}>
                      <span style={{
                        ...S.pill,
                        background: p.status === 'paid' ? '#E1EEE7' : '#F6EBCB',
                        color: p.status === 'paid' ? '#0A4437' : '#9C7825',
                      }}>
                        {p.status === 'paid' ? 'تم تحويلها ✓' : 'قيد المعالجة الماليّة ⏳'}
                      </span>
                    </td>
                    <td style={S.td}>
                      <button 
                        className="btn-hover-lux"
                        style={S.actionBtn} 
                        onClick={() => alert(`تفاصيل إشعار التسوية للمنشأة:\nالفندق: ${p.hotel}\nقيمة الحوالة: ${p.amount} ليرة سورية\nبوابة التحويل: ${p.gateway}`)}
                      >
                        معاينة الحوالة
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}

// ─────────────────────── STYLES (Syrian Premium Brand Customizations) ──────────────────────────────────────────────
const S: Record<string, React.CSSProperties> = {
  wrap: { direction: 'rtl', padding: '10px 0', fontFamily: "'Tajawal', sans-serif" },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  title: { margin: 0, fontSize: 30, fontWeight: 700, color: '#1C2B27', letterSpacing: '-0.5px', fontFamily: "'Amiri', serif" },
  sub: { margin: '6px 0 0', fontSize: 13, color: '#52655F', fontWeight: 500 },
  exportBtn: { display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', background: '#0A4437', color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(10, 68, 55, 0.2)', fontFamily: "'Tajawal', sans-serif" },
  kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 16, marginBottom: 24 },
  kpiCard: { background: '#fff', border: '1px solid #E5DFC8', borderRadius: 18, padding: '20px', display: 'flex', gap: 14, alignItems: 'center' },
  kpiIcon: { width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  kpiValue: { margin: '0 0 2px', fontSize: 20, fontWeight: 800, color: '#1C2B27' },
  kpiLabel: { margin: 0, fontSize: 12, color: '#52655F', fontWeight: 700 },
  kpiSubValue: { margin: '4px 0 0', fontSize: 11, color: '#93A29B', fontWeight: 500 },
  card: { background: '#fff', border: '1px solid #E5DFC8', borderRadius: 20, padding: '24px', marginBottom: 24, boxShadow: '0 4px 6px -1px rgba(28, 43, 39, 0.02)' },
  cardTitle: { margin: 0, fontSize: 16, fontWeight: 800, color: '#1C2B27' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: 700, fontFamily: "'Tajawal', sans-serif" },
  th: { padding: '14px 16px', textAlign: 'right', fontSize: 12, fontWeight: 700, color: '#52655F', background: '#F3EEDD', borderBottom: '1px solid #E5DFC8', whiteSpace: 'nowrap' },
  tr: { borderBottom: '1px solid #F3EEDD', transition: 'background 0.2s' },
  td: { padding: '14px 16px', fontSize: 13, color: '#1C2B27', whiteSpace: 'nowrap', textAlign: 'right' },
  pill: { fontSize: 11, fontWeight: 800, padding: '4px 12px', borderRadius: 20 },
  actionBtn: { background: '#F3EEDD', border: '1px solid #E5DFC8', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#1C2B27', fontFamily: "'Tajawal', sans-serif" },
};