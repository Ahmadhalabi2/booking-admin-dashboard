import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Globe, Eye, EyeOff, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSignupHint, setShowSignupHint] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400)); // تأخير طفيف لتحسين تجربة المستخدم UX
    const result = login(email, password);
    setLoading(false);

    if (result.success) {
      const role = useAuthStore.getState().currentUser?.role as string;
      
      // التعديل هنا: توجيه الـ support إلى '/support-chat' والـ superadmin إلى '/dashboard' وباقي المستخدمين إلى '/home'
      const to = 
        role === 'superadmin' 
          ? '/dashboard' 
          : role === 'support' 
            ? '/support-chat' 
            : '/home';
            
      navigate(to, { replace: true });
    } else {
      setError(result.message);
      setShowSignupHint(true);
    }
  };

  return (
    <div style={s.shell}>
      {/* حقن حركات وفلاتر الـ CSS الفاخرة للتركيز والتفاعل */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Tajawal:wght@300;400;500;700;800;900&display=swap');

        @keyframes glassEntrance {
          from { opacity: 0; transform: scale(0.96) translateY(10px); filter: blur(4px); }
          to { opacity: 1; transform: scale(1) translateY(0); filter: blur(0); }
        }
        .login-card-lux {
          animation: glassEntrance 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .input-lux { transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1); }
        .input-lux:focus {
          border-color: #C69A3A !important;
          background: rgba(10, 24, 20, 0.6) !important;
          box-shadow: 0 0 0 3px rgba(198, 154, 58, 0.2) !important;
        }
        .btn-lux { transition: all 0.2s ease; }
        .btn-lux:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(14, 92, 74, 0.45) !important;
          opacity: 0.95;
        }
        .btn-lux:active { transform: translateY(0); }
        .link-lux { transition: color 0.2s; }
        .link-lux:hover { color: #E4C777 !important; text-decoration: underline !important; }
      `}</style>

      <div className="login-card-lux" style={s.card}>
        {/* اللوغو بجاذبية خطية مطلقة */}
        <div style={s.logo}>
          <div style={s.logoMark}>
            <Globe size={20} color="#fff" />
          </div>
          <span style={s.logoText}>حلبي</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div />
          <button
            type="button"
            onClick={() => navigate('/', { replace: true })}
            style={s.backBtn}
          >
            ← العودة للرئيسية
          </button>
        </div>

        <h1 style={s.title}>أهلاً بعودتك</h1>
        <p style={s.sub}>سجّل الدخول إلى بوابة حسابك الآمنة</p>


        <form onSubmit={handleSubmit} style={s.form}>
          <label style={s.label}>البريد الإلكتروني</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            required
            className="input-lux"
            style={s.input}
            autoComplete="email"
          />

          <label style={s.label}>كلمة المرور</label>
          <div style={s.pwWrap}>
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="input-lux"
              style={{ ...s.input, margin: 0, paddingLeft: 44 }}
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              style={s.eyeBtn}
              aria-label={showPw ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
            >
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {error && (
            <div style={s.error}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" className="btn-lux" style={s.btn} disabled={loading}>
            {loading ? 'جارٍ التحقق…' : 'تسجيل الدخول'}
          </button>
        </form>

        {showSignupHint && (
          <p style={s.signupHint}>
            ليس لديك حساب؟{' '}
            <Link to="/signup" className="link-lux" style={s.link}>أنشئ حساباً من هنا</Link>
          </p>
        )}
        
        <p style={{ ...s.signupHint, marginTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16 }}>
          <Link to="/signup" className="link-lux" style={s.link}>تسجيل منشأة جديدة</Link>
        </p>
      </div>
    </div>
  );
}

// ─────────────────────── STYLES (Glassmorphism بلمسة زمردية وذهبية) ──────────────────────────────────────────────
const s: Record<string, React.CSSProperties> = {
  shell: {
    minHeight: '100vh',
    background: 'radial-gradient(circle at 50% 50%, #123c32 0%, #0A1712 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    fontFamily: "'Tajawal', system-ui, -apple-system, sans-serif",
    direction: 'rtl',
  },
  card: {
    background: 'rgba(20, 46, 39, 0.45)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    borderRadius: 24,
    padding: '44px 40px',
    width: '100%',
    maxWidth: 430,
    boxShadow: '0 24px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.1)',
    boxSizing: 'border-box',
  },
  logo: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 },
  logoMark: {
    width: 36, height: 36,
    background: 'linear-gradient(135deg, #0E5C4A, #0A4437)',
    borderRadius: 10,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(14, 92, 74, 0.4)',
  },
  logoText: { fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: '-0.3px', fontFamily: "'Amiri', serif" },
  title: { margin: '0 0 6px', fontSize: 26, fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', fontFamily: "'Amiri', serif" },
  sub: { margin: '0 0 24px', fontSize: 14, color: '#A8B8B2', fontWeight: 500 },
  hint: {
    background: 'rgba(198, 154, 58, 0.1)',
    border: '1px solid rgba(198, 154, 58, 0.2)',
    borderRadius: 14,
    padding: '14px 16px',
    fontSize: 12,
    color: '#F6EBCB',
    lineHeight: 1.8,
    marginBottom: 24,
  },
  code: { color: '#E4C777', fontFamily: 'monospace', fontSize: 12, fontWeight: 600 },
  badge: { fontSize: 10, background: 'rgba(255,255,255,0.08)', padding: '1px 6px', borderRadius: 6, color: '#A8B8B2', marginRight: 4 },
  form: { display: 'flex', flexDirection: 'column', gap: 4 },
  label: { fontSize: 12, fontWeight: 700, color: '#D7E0DB', marginBottom: 6, marginTop: 10, textTransform: 'uppercase', letterSpacing: '0.5px' },
  input: {
    width: '100%',
    padding: '12px 16px',
    background: 'rgba(10, 23, 18, 0.35)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    fontSize: 14,
    color: '#fff',
    outline: 'none',
    marginBottom: 4,
    boxSizing: 'border-box',
    fontFamily: "'Tajawal', sans-serif",
  },
  pwWrap: { position: 'relative', marginBottom: 4 },
  eyeBtn: {
    position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', cursor: 'pointer', color: '#93A29B', padding: 4,
    display: 'flex', alignItems: 'center', justifyContent: 'center'
  },
  error: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: 'rgba(189, 91, 62, 0.15)', border: '1px solid rgba(189, 91, 62, 0.3)',
    borderRadius: 10, padding: '11px 14px',
    fontSize: 13, color: '#F3C2AE', marginTop: 12,
  },
  btn: {
    marginTop: 24,
    padding: '14px',
    background: 'linear-gradient(135deg, #0E5C4A 0%, #0A4437 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(14, 92, 74, 0.3)',
    fontFamily: "'Tajawal', sans-serif",
  },
  signupHint: { margin: '18px 0 0', textAlign: 'center', fontSize: 13, color: '#A8B8B2', fontWeight: 500 },
  backBtn: {
    background: 'none',
    border: '1px solid rgba(198,154,58,0.35)',
    color: '#E4C777',
    borderRadius: 12,
    padding: '10px 14px',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 800,
    fontFamily: "'Tajawal', sans-serif",
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  link: { color: '#E4C777', fontWeight: 700, textDecoration: 'none' },
};