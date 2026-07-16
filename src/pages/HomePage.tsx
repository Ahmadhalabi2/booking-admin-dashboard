import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Hotel,
  CalendarCheck,
  TrendingUp,
  Users,
  ChevronRight,
  Star,
  MapPin,
  Shield,
  Globe,
  Search,
  Plus,
  Trash2,
  Edit,
  BarChart3,
  X,
  Sparkles,
  Tag,
} from 'lucide-react';
import Layout from '../components/Layout';
import { useAuthStore } from '../store/authStore';
import { useHotelsStore } from '../store/hotelsStore';
import { useBookingsStore } from '../store/bookingsStore';
import { SYRIA_PROVINCES } from '../data/syria';
import {
  PALETTE,
  KhatamMark,
  buildDisplayHotels,
  useHotelBookingFlow,
  HotelDetailsModal,
  BookingFormModal,
  HotelCard,
  HotelBookingFlowStyles,
  themeStyles,
  type DisplayHotel,
} from '../components/HotelBookingFlow';

// ─────────────────────────────────────────────────────────────────────────────
// STAFF HOME (Admin / Manager) — عرض واستعراض فقط، بدون أي إمكانية حجز
// ─────────────────────────────────────────────────────────────────────────────
function StaffHome() {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const { hotels } = useHotelsStore();
  const { bookings } = useBookingsStore();

  const [time, setTime] = useState(new Date());
  // الأدمن ما بيثبّت حجوزات، فهاد الخطاف هون بيُستخدم فقط لفتح/إغلاق نافذة "عرض التفاصيل"
  const syriaFlow = useHotelBookingFlow();
  const syriaHotels = useMemo(() => buildDisplayHotels(), []);

  // العدد الفعلي للحجوزات الواصلة من المستخدمين وبانتظار موافقة الإدارة (مش رقم ثابت)
  const pendingBookingsCount = useMemo(
    () => bookings.filter((b: any) => b.status === 'pending_admin').length,
    [bookings]
  );

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const greeting = time.getHours() < 12 ? 'صباح الخير' : time.getHours() < 18 ? 'مساء الخير' : 'طاب مساؤك';

  const STATS = [
    { label: 'إجمالي المنشآت والخدمات', value: hotels.length.toString(), icon: <Hotel size={22} />, color: PALETTE.brass },
    { label: 'الحجوزات النشطة الحالية', value: '1,843', icon: <CalendarCheck size={22} />, color: PALETTE.teal },
    { label: 'أرباح الشهر الحالي (MTD)', value: '$84,200', icon: <TrendingUp size={22} />, color: PALETTE.pomegranate },
    { label: 'قاعدة العملاء الكلية', value: '1,284', icon: <Users size={22} />, color: PALETTE.inkSoft },
  ];

  const QUICK = [
    {
      label: 'إضافة فندق جديد',
      icon: Plus,
      path: '/add-hotel',
      color: `linear-gradient(135deg, ${PALETTE.teal}, ${PALETTE.tealDeep})`,
      stats: 'إنشاء منشأة جديدة فوراً',
    },
    {
      label: 'إدارة الفنادق والمنتجعات',
      icon: Hotel,
      path: '/hotels',
      color: `linear-gradient(135deg, ${PALETTE.ink}, ${PALETTE.inkDeep})`,
      stats: `${hotels.length} منشأة مسجلة`,
    },
    {
      label: 'إدارة الحجوزات المعلقة',
      icon: CalendarCheck,
      path: '/bookings',
      color: `linear-gradient(135deg, ${PALETTE.inkSoft}, ${PALETTE.ink})`,
      stats: `${pendingBookingsCount} معلق حالياً`,
    },
    {
      label: 'التقارير والتحليلات',
      icon: BarChart3,
      path: '/analytics',
      color: `linear-gradient(135deg, ${PALETTE.pomegranate}, #5e1e26)`,
      stats: '+18% نمو متصاعد',
    },
  ];

  // كروت staff للأغراض الإدارية (عرض فقط + زرّ تعديل/حذف)
  const StaffHotelCard = ({ hotel }: { hotel: any }) => {
    return (
      <div key={hotel.id} className="premium-hotel-card" style={themeStyles.hotelCard}>
        <div style={themeStyles.hotelImageContainer}>
          <img src={hotel.image} alt={hotel.name} style={themeStyles.hotelImg} loading="lazy" />
          <span style={themeStyles.hotelTagBadge}>{hotel.tag}</span>
        </div>
        <div style={{ padding: 20 }}>
          <p style={themeStyles.hotelCardName}>{hotel.name}</p>
          <p style={themeStyles.hotelCardLocation}>
            <MapPin size={13} color={PALETTE.ink400} /> {hotel.city}، {hotel.country}
          </p>
          <div style={themeStyles.hotelCardMetaRow}>
            <span style={themeStyles.hotelRatingContainer}>
              <Star size={13} fill={PALETTE.brass} stroke={PALETTE.brass} /> {hotel.rating}
            </span>
            <span style={themeStyles.hotelPriceContainer}>
              {hotel.price?.toLocaleString?.() ?? hotel.price} <span style={themeStyles.currencyText}>ل.س / ليلة</span>
            </span>
          </div>
          <div style={themeStylesLocal.adminActionRow}>
            <button onClick={() => navigate(`/edit-hotel/${hotel.id}`)} style={themeStylesLocal.btnAdminEdit}>
              <Edit size={14} /> تعديل المنشأة
            </button>
            <button
              onClick={() => {
                if (confirm(`هل أنت متأكد من رغبتك في حذف ${hotel.name}?`)) {
                  alert('تم حذف الفندق بنجاح من قاعدة البيانات التجريبية.');
                }
              }}
              style={themeStylesLocal.btnAdminDelete}
            >
              <Trash2 size={14} /> حذف
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="animate-reveal" style={themeStylesLocal.heroStaff}>
        <div style={themeStylesLocal.archTopline} />
        <div style={themeStylesLocal.heroText}>
          <p style={themeStylesLocal.eyebrowStaff}>
            <KhatamMark color={PALETTE.brassLight} size={12} />
            {time.toLocaleDateString('ar-EG', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 style={themeStylesLocal.heroTitleStaff}>
            {greeting}، {currentUser?.name?.split(' ')[0]} 👋
          </h1>
          <p style={themeStylesLocal.heroSubStaff}>
            لديك حالياً <strong style={themeStylesLocal.highlightTextGold}>{pendingBookingsCount} حجزاً معلقاً</strong> و{' '}
            <strong style={themeStylesLocal.highlightTextTeal}>3 مراجعات جديدة</strong> تتطلب فحص الإدارة.
          </p>
          <div style={themeStylesLocal.flexGapWrap}>
            <button className="btn-luxury-glow" style={themeStylesLocal.ctaPrimaryStaff} onClick={() => navigate('/bookings')}>
              مراجعة طلبات الحجز
              <ChevronRight size={16} style={{ marginRight: 6, transform: 'rotate(180deg)' }} />
            </button>
            <button className="btn-luxury-secondary" style={themeStylesLocal.ctaSecondaryStaff} onClick={() => navigate('/add-hotel')}>
              إضافة فندق سوري جديد
              <Plus size={16} style={{ marginRight: 6 }} />
            </button>
          </div>
        </div>
        <div className="pulse-card" style={themeStylesLocal.heroCardStaff}>
          <Shield size={32} color={PALETTE.brassLight} />
          <p style={themeStylesLocal.systemStatusTitle}>حالة النظام الأساسي</p>
          <div style={themeStylesLocal.flexCenterGap6}>
            <span style={themeStylesLocal.statusIndicatorGreen} />
            <p style={themeStylesLocal.statusTextGreen}>مستقر بالكامل</p>
          </div>
          <p style={themeStylesLocal.systemStatusSub}>جميع البوابات تعمل بكفاءة</p>
        </div>
      </div>

      <div className="animate-reveal delay-1" style={themeStylesLocal.statsGrid}>
        {STATS.map((s) => (
          <div key={s.label} className="interactive-stat-card" style={themeStylesLocal.statCard}>
            <div style={{ ...themeStylesLocal.statIcon, background: `${s.color}18`, color: s.color }}>{s.icon}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <p style={themeStylesLocal.statVal}>{s.value}</p>
              <p style={themeStylesLocal.statLabel}>{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <p className="animate-reveal delay-2" style={themeStyles.sectionTitle}>
        <KhatamMark />العمليات السريعة للنظام
      </p>
      <div className="animate-reveal delay-2" style={themeStylesLocal.quickGrid}>
        {QUICK.map((q) => (
          <button
            key={q.path}
            className="interactive-quick-card"
            style={{ ...themeStylesLocal.quickCard, background: q.color }}
            onClick={() => navigate(q.path)}
          >
            <div style={themeStylesLocal.quickIconContainer}>
              <q.icon size={24} color="#fff" />
            </div>
            <p style={themeStylesLocal.quickCardLabel}>{q.label}</p>
            <p style={themeStylesLocal.quickCardSub}>{q.stats}</p>
            <ChevronRight size={18} color="rgba(255,255,255,.4)" style={themeStylesLocal.quickCardArrow} />
          </button>
        ))}
      </div>

      <div className="animate-reveal delay-3" style={themeStyles.sectionHeaderFlex}>
        <p style={{ ...themeStyles.sectionTitle, margin: 0 }}>
          <KhatamMark />الفنادق والمنتجعات الحالية (لوحة التحكم)
        </p>
        <button className="see-all-btn" style={themeStylesLocal.seeAllBtn} onClick={() => navigate('/hotels')}>
          عرض تفاصيل الفنادق <ChevronRight size={15} style={{ transform: 'rotate(180deg)' }} />
        </button>
      </div>

      <div className="animate-reveal delay-3" style={themeStyles.hotelsGrid}>
        {hotels.slice(0, 4).map((h: any) => (
          <StaffHotelCard key={h.id} hotel={h} />
        ))}
      </div>

      {/* الفنادق السورية المعروضة للنزلاء — للأدمن هون هي عرض/استعراض فقط، بدون خيار حجز إطلاقاً */}
      <div className="animate-reveal delay-3" style={{ marginTop: 48 }}>
        <p style={themeStyles.sectionTitle}>
          <KhatamMark />الفنادق السورية المعروضة للنزلاء (استعراض فقط)
        </p>
        <div style={themeStyles.hotelsGrid}>
          {syriaHotels.map((h: DisplayHotel) => (
            <HotelCard key={h.id} hotel={h} onViewDetails={() => syriaFlow.openDetails(h)} />
          ))}
        </div>
      </div>

      {/* نافذة التفاصيل بدون onBook → ما رح يظهر زر "احجز الآن" نهائياً للأدمن */}
      {syriaFlow.viewHotel && (
        <HotelDetailsModal hotel={syriaFlow.viewHotel} onClose={syriaFlow.closeDetails} />
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// USER HOME (Client / Guest)
// ─────────────────────────────────────────────────────────────────────────────
function UserHome() {
  const navigate = useNavigate();
  const { currentUser } = useAuthStore();
  const flow = useHotelBookingFlow(navigate);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProvinceId, setSelectedProvinceId] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');

  const allHotels = useMemo(() => buildDisplayHotels(), []);
  const offerHotels = useMemo(() => allHotels.filter((h) => !!h.offerText), [allHotels]);

  const byProvince = useMemo(() => {
    if (selectedProvinceId === 'all') return allHotels;
    return allHotels.filter((h) => h.provinceId === selectedProvinceId);
  }, [allHotels, selectedProvinceId]);

  const byCity = useMemo(() => {
    if (selectedCity === 'all') return byProvince;
    return byProvince.filter((h) => h.city === selectedCity);
  }, [byProvince, selectedCity]);

  const availableCities = useMemo(() => Array.from(new Set(byProvince.map((h) => h.city).filter(Boolean))), [byProvince]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    return allHotels.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        h.city.toLowerCase().includes(q) ||
        h.provinceName.toLowerCase().includes(q)
    );
  }, [allHotels, searchQuery]);

  return (
    <>
      <div className="animate-reveal" style={themeStylesLocal.heroUser}>
        <div style={themeStylesLocal.heroBlobUser} />
        <div style={themeStylesLocal.archTopline} />
        <p style={themeStylesLocal.eyebrowUser}>
          <Sparkles size={14} color={PALETTE.brassLight} /> مرحباً بك مجدداً، {currentUser?.name?.split(' ')[0] || 'ضيفنا الكريم'}
        </p>
        <h1 style={themeStylesLocal.heroTitleUser}>
          اكتشف ملاذك الفاخر
          <br />
          وإقامتك الاستثنائية في سوريا
        </h1>
        <p style={themeStylesLocal.heroSubUser}>تصفح أكثر من {allHotels.length} فندق نخبوي فريد داخل ١٣ محافظة سورية</p>

        <div className="luxury-search-shadow" style={themeStylesLocal.searchBarContainer}>
          <Search size={20} color={PALETTE.teal} style={{ flexShrink: 0 }} />
          <input
            style={themeStylesLocal.searchBarInput}
            placeholder="ابحث عن الفنادق، المدن، أو المحافظة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button style={themeStylesLocal.searchClearBtn} onClick={() => setSearchQuery('')}>
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {searchResults && (
        <div className="animate-reveal">
          <p style={themeStyles.sectionTitle}>
            <KhatamMark />عثرنا على {searchResults.length} نتيجة لبحثك عن "{searchQuery}"
          </p>
          <div style={themeStyles.hotelsGrid}>
            {searchResults.map((h) => (
              <HotelCard key={h.id} hotel={h} onViewDetails={() => flow.openDetails(h)} />
            ))}
          </div>
          {searchResults.length === 0 && (
            <div style={themeStyles.noResultsBox}>
              <Hotel size={40} color={PALETTE.ink400} style={{ marginBottom: 12 }} />
              <p style={{ margin: 0 }}>لم نجد منشآت مطابقة للبحث داخل المحافظات السورية.</p>
            </div>
          )}
        </div>
      )}

      {!searchResults && (
        <>
          {offerHotels.length > 0 && (
            <div className="animate-reveal delay-1" style={{ marginBottom: 36 }}>
              <p style={themeStyles.sectionTitle}>
                <Tag size={16} color={PALETTE.pomegranate} /> عروض حصرية لفترة محدودة
              </p>
              <div className="no-scrollbar" style={themeStylesLocal.offersRow}>
                {offerHotels.map((h) => (
                  <div key={h.id} style={themeStylesLocal.offerCard} onClick={() => flow.openDetails(h)}>
                    <img src={h.image} alt={h.name} style={themeStylesLocal.offerImg} loading="lazy" />
                    <div style={themeStylesLocal.offerOverlay} />
                    <div style={themeStylesLocal.offerContent}>
                      <p style={themeStylesLocal.offerHotelName}>{h.name}</p>
                      <p style={themeStylesLocal.offerTextLine}>{h.offerText}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="animate-reveal delay-1" style={themeStyles.sectionHeaderFlex}>
            <p style={{ ...themeStyles.sectionTitle, margin: 0 }}>
              <KhatamMark />إقامات سورية فاخرة موصى بها لك
            </p>
          </div>
          <div className="animate-reveal delay-1" style={themeStyles.hotelsGrid}>
            {allHotels.slice(0, 4).map((h) => (
              <HotelCard key={h.id} hotel={h} onViewDetails={() => flow.openDetails(h)} />
            ))}
          </div>

          <div className="animate-reveal delay-2" style={{ marginTop: 48 }}>
            <p style={themeStyles.sectionTitle}>
              <Globe size={16} color={PALETTE.teal} /> استكشف الفخامة السورية حسب المحافظة
            </p>

            <div className="no-scrollbar" style={themeStylesLocal.filterRowScrollable}>
              <button
                style={{ ...themeStyles.filterPill, ...(selectedProvinceId === 'all' ? themeStyles.filterPillActive : {}) }}
                onClick={() => {
                  setSelectedProvinceId('all');
                  setSelectedCity('all');
                }}
              >
                <Globe size={14} /> كل المحافظات
              </button>
              {SYRIA_PROVINCES.map((p) => (
                <button
                  key={p.id}
                  className="country-pill-hover"
                  style={{
                    ...themeStyles.filterPill,
                    ...(selectedProvinceId === p.id ? themeStyles.filterPillActive : {}),
                  }}
                  onClick={() => {
                    setSelectedProvinceId(p.id);
                    setSelectedCity('all');
                  }}
                >
                  {p.name}
                </button>
              ))}
            </div>

            <div className="no-scrollbar" style={{ ...themeStylesLocal.filterRowScrollable, marginBottom: 32 }}>
              <button
                style={{ ...themeStyles.filterPill, ...(selectedCity === 'all' ? themeStyles.filterPillActive : {}) }}
                onClick={() => setSelectedCity('all')}
              >
                كل المدن الداخلية
              </button>
              {availableCities.map((c) => (
                <button
                  key={c}
                  className="country-pill-hover"
                  style={{
                    ...themeStyles.filterPill,
                    ...(selectedCity === c ? themeStyles.filterPillActive : {}),
                  }}
                  onClick={() => setSelectedCity(c)}
                >
                  {c}
                </button>
              ))}
            </div>

            <div style={themeStyles.hotelsGrid}>
              {byCity.map((h) => (
                <HotelCard key={h.id} hotel={h} onViewDetails={() => flow.openDetails(h)} />
              ))}
            </div>
            {byCity.length === 0 && (
              <div style={themeStyles.noResultsBox}>
                <Hotel size={40} color={PALETTE.ink400} style={{ marginBottom: 12 }} />
                <p style={{ margin: 0 }}>لا توجد أي فنادق متاحة في المنطقة السورية المحددة حالياً.</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* المستخدم العادي فقط هو من يقدر يحجز → onBook موجودة هون */}
      {flow.viewHotel && (
        <HotelDetailsModal
          hotel={flow.viewHotel}
          onClose={flow.closeDetails}
          onBook={() => flow.startBooking(flow.viewHotel!)}
        />
      )}
      {flow.bookingHotel && <BookingFormModal hotel={flow.bookingHotel} flow={flow} />}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PAGE WRAPPER
// ─────────────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const { currentUser } = useAuthStore();
  const isStaff = currentUser?.role === 'superadmin';

  return (
    <Layout>
      <HotelBookingFlowStyles />
      <style>{`
        @keyframes floatEffect { 0% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-10px) rotate(1deg); } 100% { transform: translateY(0px) rotate(0deg); } }
        .luxestay-root { font-family: 'Cairo', 'Tajawal', system-ui, sans-serif; }
        .luxestay-root h1, .luxestay-root h2, .luxestay-root h3 { font-family: 'Amiri', 'Cairo', serif; }
        .interactive-stat-card { transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1) !important; }
        .interactive-stat-card:hover { transform: translateY(-4px); border-color: ${PALETTE.brass}55 !important; box-shadow: 0 20px 35px rgba(198, 154, 61, 0.12) !important; }
        .interactive-quick-card { transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1) !important; }
        .interactive-quick-card:hover { transform: translateY(-6px); box-shadow: 0 25px 45px rgba(13, 22, 38, 0.25) !important; filter: brightness(1.05); }
        .btn-luxury-secondary { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1) !important; }
        .btn-luxury-secondary:hover { background: rgba(255, 255, 255, 0.15) !important; border-color: rgba(255, 255, 255, 0.35) !important; transform: translateY(-2px); }
        .see-all-btn { transition: all 0.3s ease; }
        .see-all-btn:hover { color: ${PALETTE.teal} !important; transform: translateX(-4px); }
        .luxury-search-shadow { box-shadow: 0 12px 35px rgba(13, 22, 38, 0.22); transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        .luxury-search-shadow:focus-within { transform: scale(1.015); box-shadow: 0 20px 40px rgba(198, 154, 61, 0.28); border-color: ${PALETTE.brass}66 !important; }
      `}</style>
      <div className="luxestay-root" style={{ direction: 'rtl', padding: '8px 0', background: PALETTE.page }}>
        {isStaff ? <StaffHome /> : <UserHome />}
      </div>
    </Layout>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// STYLES الخاصة بهذه الصفحة فقط
// ─────────────────────────────────────────────────────────────────────────────
const themeStylesLocal: Record<string, React.CSSProperties> = {
  archTopline: {
    position: 'absolute',
    top: 0,
    left: '10%',
    right: '10%',
    height: 3,
    background: `linear-gradient(90deg, transparent, ${PALETTE.brass}, transparent)`,
    borderRadius: '0 0 40px 40px',
  },
  heroStaff: {
    background: `linear-gradient(135deg, ${PALETTE.inkDeep} 0%, ${PALETTE.ink} 55%, ${PALETTE.inkSoft} 100%)`,
    borderRadius: '28px 28px 20px 20px',
    padding: '40px',
    color: '#fff',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 28,
    flexWrap: 'wrap',
    marginBottom: 32,
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 20px 45px rgba(13, 22, 38, 0.25)',
  },
  heroText: { maxWidth: 580, zIndex: 1 },
  eyebrowStaff: {
    margin: '0 0 10px',
    fontSize: 13,
    color: PALETTE.brassLight,
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  heroTitleStaff: { margin: '0 0 12px', fontSize: 32, fontWeight: 700, lineHeight: 1.3, color: '#fff' },
  heroSubStaff: { margin: 0, fontSize: 15, color: '#cdd6e4', lineHeight: 1.7, fontWeight: 500 },
  highlightTextGold: { color: PALETTE.brassLight, fontWeight: 700 },
  highlightTextTeal: { color: '#7fd4d1', fontWeight: 700 },
  flexGapWrap: { display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 24 },
  ctaPrimaryStaff: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '12px 24px',
    background: `linear-gradient(135deg, ${PALETTE.teal}, ${PALETTE.tealDeep})`,
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
  },
  ctaSecondaryStaff: {
    padding: '12px 24px',
    background: 'rgba(255,255,255,.06)',
    color: '#f1f5f9',
    border: `1px solid ${PALETTE.brass}44`,
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    backdropFilter: 'blur(4px)',
  },
  heroCardStaff: {
    background: 'rgba(255,255,255,.05)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: `1px solid ${PALETTE.brass}33`,
    borderRadius: 16,
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: 200,
    textAlign: 'center',
    zIndex: 1,
    animation: 'floatEffect 5s ease-in-out infinite',
    boxShadow: '0 15px 30px rgba(0,0,0,0.18)',
  },
  systemStatusTitle: { margin: '10px 0 4px', fontWeight: 700, fontSize: 14, color: '#f1f5f9' },
  statusIndicatorGreen: { width: 9, height: 9, borderRadius: '50%', background: '#5ed6b5', boxShadow: '0 0 10px #5ed6b5', display: 'block' },
  statusTextGreen: { margin: 0, fontSize: 12, color: '#5ed6b5', fontWeight: 700 },
  systemStatusSub: { margin: '4px 0 0', fontSize: 11, color: '#93a3bd' },

  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 32 },
  statCard: { background: PALETTE.paper, border: `1px solid ${PALETTE.line}`, borderRadius: 16, padding: '20px', display: 'flex', gap: 14, alignItems: 'center' },
  statIcon: { width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center', flexShrink: 0, justifyContent: 'center' },
  statVal: { margin: 0, fontSize: 24, fontWeight: 800, color: PALETTE.ink900, lineHeight: 1 },
  statLabel: { margin: 0, fontSize: 13, color: PALETTE.ink600, fontWeight: 600 },

  quickGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 36 },
  quickCard: { position: 'relative', border: 'none', borderRadius: 16, padding: '24px 20px', cursor: 'pointer', textAlign: 'right', width: '100%', boxShadow: '0 8px 20px rgba(0,0,0,0.05)' },
  quickIconContainer: { width: 40, height: 40, background: 'rgba(255,255,255,0.14)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  quickCardLabel: { margin: '14px 0 4px', fontSize: 15, fontWeight: 700, color: '#fff' },
  quickCardSub: { margin: 0, fontSize: 11, color: 'rgba(255,255,255,.75)', fontWeight: 500 },
  quickCardArrow: { position: 'absolute', top: 24, left: 20, transform: 'rotate(180deg)' },

  seeAllBtn: { display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', color: PALETTE.teal, fontWeight: 700, fontSize: 13, cursor: 'pointer' },

  adminActionRow: { display: 'flex', gap: 8, marginTop: 14, borderTop: `1px solid ${PALETTE.line}`, paddingTop: 12 },
  btnAdminEdit: { flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '8px', background: PALETTE.page, border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, color: PALETTE.ink600, cursor: 'pointer' },
  btnAdminDelete: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '8px', background: '#fbeceb', border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, color: PALETTE.pomegranate, cursor: 'pointer' },

  heroUser: {
    background: `linear-gradient(160deg, ${PALETTE.ink} 0%, ${PALETTE.tealDeep} 100%)`,
    borderRadius: '28px 28px 20px 20px',
    padding: '52px 32px 44px',
    color: '#fff',
    marginBottom: 36,
    textAlign: 'center',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 20px 40px rgba(13, 22, 38, 0.25)',
  },
  heroBlobUser: { position: 'absolute', width: 320, height: 320, background: `radial-gradient(circle, ${PALETTE.brass}22 0%, transparent 65%)`, top: '-18%', left: '-10%', filter: 'blur(25px)' },
  eyebrowUser: { margin: '0 0 10px', fontSize: 14, color: 'rgba(255,255,255,.9)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 },
  heroTitleUser: { margin: '0 0 12px', fontSize: 34, fontWeight: 700, lineHeight: 1.35, color: '#fff', letterSpacing: '-0.3px' },
  heroSubUser: { margin: '0 0 28px', fontSize: 15, color: 'rgba(255,255,255,.82)', fontWeight: 500 },

  searchBarContainer: { display: 'flex', alignItems: 'center', gap: 10, background: '#fff', borderRadius: 14, padding: '12px 18px', maxWidth: 550, margin: '0 auto', border: '1px solid transparent' },
  searchBarInput: { flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 15, color: PALETTE.ink900, fontWeight: 500 },
  searchClearBtn: { background: 'none', border: 'none', color: PALETTE.ink400, cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 4 },

  offersRow: { display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 8 },
  offerCard: { position: 'relative', minWidth: 260, height: 150, borderRadius: 16, overflow: 'hidden', cursor: 'pointer', flexShrink: 0, boxShadow: '0 10px 25px rgba(21,34,56,0.12)' },
  offerImg: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  offerOverlay: { position: 'absolute', inset: 0, background: `linear-gradient(0deg, ${PALETTE.inkDeep}ee 0%, transparent 60%)` },
  offerContent: { position: 'absolute', bottom: 0, right: 0, left: 0, padding: '14px 16px' },
  offerHotelName: { margin: '0 0 4px', color: '#fff', fontSize: 13, fontWeight: 700 },
  offerTextLine: { margin: 0, color: PALETTE.brassLight, fontSize: 11, fontWeight: 600 },

  filterRowScrollable: { display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 12, paddingRight: 4, whiteSpace: 'nowrap' },
  flexCenterGap6: { display: 'flex', alignItems: 'center', gap: 6 },
};