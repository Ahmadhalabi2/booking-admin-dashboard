import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useSupportChatStore } from '../../store/supportChatStore';
import { Send, Loader2, ShieldQuestion, MessagesSquare, User, Sparkles, ArrowRight } from 'lucide-react';
import { useNotifEventsStore } from '../../store/notifEvents';

export default function SupportChatPage() {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuthStore(); // قمنا بجلب logout في حال أردت تسجيل خروج الدعم عند الضغط على رجوع
  const {
    ensureThreadForUser,
    sendMessageFromUser,
    sendMessageFromSupport,
    markThreadReadForSupport,
    markThreadReadForUser,
    threads,
    messages,
  } = useSupportChatStore();
  
  // استدعاء تابع إضافة الأحداث من المتجر الخاص بك
  const { addEvent } = useNotifEventsStore();

  const isSupport = currentUser?.role === 'support' || currentUser?.role === 'superadmin';

  const [threadId, setThreadId] = useState<string>('');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  // دالة التحكم بالرجوع الذكي
  const handleBack = async () => {
    if (isSupport) {
      // إذا كان المستخدم دعم فني أو مدير، يتم توجيهه لصفحة تسجيل الدخول فوراً
      // (اختياري): إذا كنت تريد تسجيل خروجه فعلياً عند الضغط على السهم، قم بفك التعليق عن السطر التالي:
       if (logout) await logout(); 
      
      navigate('/login', { replace: true });
    } else {
      // للمستخدم العادي، يرجعه للخلف أو للرئيسية كخيار احتياطي
      if (window.history.length > 2) {
        navigate(-1);
      } else {
        navigate('/');
      }
    }
  };

  // 1. إدارة تهيئة الـ Thread وجلبه حسب دور المستخدم الحالي
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (isSupport) {
      if (threads && threads.length > 0 && !threadId) {
        setThreadId(threads[0].id);
      }
    } else {
      const th = ensureThreadForUser({ userId: currentUser.id, userName: currentUser.name });
      setThreadId(th.id);
    }
  }, [currentUser, ensureThreadForUser, navigate, isSupport, threads, threadId]);

  // 2. تصفية الرسائل الخاصة بالغرفة المحددة حالياً وترتيبها زمنياً
  const threadMessages = useMemo(() => {
    if (!threadId) return [];
    return messages
      .filter((m) => m.threadId === threadId)
      .sort((a, b) => a.createdAt - b.createdAt);
  }, [messages, threadId]);

  // 3. قراءة المحادثة وتصفير عداد غير المقروء للطرف المعني
  useEffect(() => {
    if (!threadId) return;
    if (!currentUser) return;

    if (isSupport) {
      markThreadReadForSupport(threadId);
    } else {
      markThreadReadForUser(threadId, currentUser.id);
    }
  }, [threadId, currentUser, isSupport, markThreadReadForSupport, markThreadReadForUser, threadMessages.length]);

  // التمرير التلقائي لأسفل الشات عند وصول رسائل جديدة
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [threadMessages.length]);

  const onSend = async () => {
    if (!currentUser) return;
    if (!threadId) return;
    if (!text.trim()) return;

    const payloadText = text.trim();
    setText('');
    setSending(true);

    // محاكاة تأخير الإرسال قليلاً
    await new Promise((r) => setTimeout(r, 250));

    if (isSupport) {
      sendMessageFromSupport({
        threadId,
        fromUserId: currentUser.id,
        fromName: currentUser.name,
        text: payloadText,
      });
    } else {
      sendMessageFromUser({
        threadId,
        userId: currentUser.id,
        userName: currentUser.name,
        text: payloadText,
      });

      // إنشاء حدث جديد للمشرف (superadmin) باستخدام المتجر الخاص بك
      addEvent({
        type: 'booking_created', // نوع الحدث المدعوم حالياً في المتجر الخاص بك
        bookingId: threadId,
        createdByUserId: currentUser.id,
        createdByName: currentUser.name,
        targetRole: 'superadmin',
        title: 'رسالة دعم جديدة',
        desc: payloadText.length > 140 ? payloadText.slice(0, 140) + '…' : payloadText,
      });
    }

    setSending(false);
  };

  const activeThread = threads?.find((t) => t.id === threadId);

  return (
    <div style={S.pageContainer}>
      <div style={S.wrap}>
        <style>{`
          @keyframes messageEntrance {
            from { opacity: 0; transform: translateY(8px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          @keyframes pulseGreen {
            0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(14, 92, 74, 0.7); }
            70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(14, 92, 74, 0); }
            100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(14, 92, 74, 0); }
          }
          .msg-bubble-animate {
            animation: messageEntrance 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .pulse-indicator {
            animation: pulseGreen 2s infinite;
          }
          .thread-tab-lux {
            transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .thread-tab-lux:hover {
            background-color: #F3EEDD !important;
            transform: translateX(-3px);
          }
          .composer-input-lux {
            transition: all 0.2s ease;
          }
          .composer-input-lux:focus {
            border-color: #0E5C4A !important;
            box-shadow: 0 0 0 4px rgba(14, 92, 74, 0.12) !important;
            background: #fff !important;
          }
          .btn-send-lux {
            transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .btn-send-lux:hover {
            opacity: 0.95;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(10, 68, 55, 0.3);
          }
          .btn-send-lux:active {
            transform: translateY(0);
          }
          .btn-back-lux {
            transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .btn-back-lux:hover {
            background-color: #E1EEE7 !important;
            color: #0A4437 !important;
            border-color: #BFE0D2 !important;
            transform: translateX(3px);
          }
          .btn-back-lux:active {
            transform: scale(0.95);
          }
        `}</style>

        {/* رأس الصفحة */}
        <div style={S.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* زر العودة الذكي */}
            <button 
              onClick={handleBack} 
              className="btn-back-lux" 
              style={S.backBtn}
              title={isSupport ? "تسجيل الخروج والرجوع" : "رجوع"}
            >
              <ArrowRight size={20} />
            </button>

            <div style={S.icon}>
              {isSupport ? <ShieldQuestion size={22} /> : <MessagesSquare size={22} />}
            </div>
            <div>
              <h1 style={S.title}>{isSupport ? 'صندوق وارد الدعم' : 'محادثة الدعم'}</h1>
              <p style={S.sub}>
                {isSupport ? 'إدارة رسائل المستخدمين والرد على الاستفسارات' : 'أرسل مشكلتك أو ملاحظاتك وسيتم الرد من فريق الدعم'}
              </p>
            </div>
          </div>
          {!isSupport && (
            <div style={S.agentBadge}>
              <div className="pulse-indicator" style={S.onlineDot} />
              <span>فريق الدعم متصل حالياً</span>
            </div>
          )}
        </div>

        {/* جسم الشات مع القائمة الجانبية */}
        <div style={S.chatShell}>
          {isSupport && (
            <div style={S.sidebar}>
              <div style={S.sidebarHeader}>
                <span>المحادثات النشطة</span>
                <span style={S.sidebarBadge}>{threads?.length || 0}</span>
              </div>
              <div style={S.threadList}>
                {threads && threads.length === 0 ? (
                  <p style={{ padding: 24, fontSize: 13, color: '#93A29B', textAlign: 'center', fontWeight: 600 }}>لا توجد محادثات نشطة</p>
                ) : (
                  threads?.map((th) => {
                    const isSelected = th.id === threadId;
                    
                    const unreadCount = messages.filter(
                      (m) => m.threadId === th.id && m.unreadForSupport
                    ).length;
                    
                    const hasUnread = unreadCount > 0;

                    return (
                      <button
                        key={th.id}
                        onClick={() => setThreadId(th.id)}
                        className="thread-tab-lux"
                        style={{
                          ...S.threadTab,
                          background: isSelected ? 'linear-gradient(135deg, #E1EEE7 0%, #F6EBCB 100%)' : 'transparent',
                          color: isSelected ? '#0A4437' : '#374151',
                          borderRight: isSelected ? '4px solid #0A4437' : '4px solid transparent',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, overflow: 'hidden' }}>
                          <div style={S.avatarWrapper}>
                            <User size={16} color={isSelected ? '#0A4437' : '#52655F'} />
                            <div className="pulse-indicator" style={S.onlineIndicator} />
                          </div>
                          <div style={{ textAlign: 'right', overflow: 'hidden' }}>
                            <span style={{ fontWeight: isSelected || hasUnread ? 800 : 600, display: 'block', fontSize: 13, color: isSelected ? '#0A4437' : '#1C2B27', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                              {th.userName}
                            </span>
                            {th.lastMessagePreview && (
                              <span style={{ fontSize: 11, color: isSelected ? '#0A4437' : '#52655F', fontWeight: hasUnread ? 700 : 500, display: 'block', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>
                                {th.lastMessagePreview}
                              </span>
                            )}
                          </div>
                        </div>
                        {hasUnread && (
                          <span style={S.unreadBadge}>{unreadCount}</span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* مساحة عرض الرسائل وصندوق الكتابة */}
          <div style={S.mainChatArea}>
            {isSupport && activeThread ? (
              <div style={S.activeUserBar}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={S.miniUserIcon}><User size={14} color="#0A4437" /></div>
                  <span>محادثة نشطة مع: <strong style={{ color: '#0A4437', fontWeight: 800 }}>{activeThread.userName}</strong></span>
                </div>
              </div>
            ) : null}

            <div style={S.chatBody}>
              {threadMessages.length === 0 ? (
                <div style={S.empty}>
                  <div style={S.sparkleCircle}>
                    <Sparkles size={24} color="#0E5C4A" />
                  </div>
                  <p style={S.emptyTitle}>لا توجد رسائل بعد</p>
                  <p style={S.emptySub}>{isSupport ? 'اختر مستخدماً من القائمة للبدء بمراسلته.' : 'أهلاً بك! ابدأ بإرسال أول استفسار وسنرد عليك بأسرع وقت.'}</p>
                </div>
              ) : (
                <div style={S.bubbleList}>
                  {threadMessages.map((m) => {
                    const mine = isSupport ? m.fromRole !== 'user' : m.fromRole === 'user';
                    const fromUser = m.fromRole === 'user';

                    return (
                      <div
                        key={m.id}
                        className="msg-bubble-animate"
                        style={{
                          display: 'flex',
                          justifyContent: mine ? 'flex-end' : 'flex-start',
                          marginBottom: 14,
                        }}
                      >
                        <div
                          style={{
                            maxWidth: '72%',
                            padding: '12px 16px',
                            borderRadius: mine ? '18px 18px 0px 18px' : '18px 18px 18px 0px',
                            background: mine ? 'linear-gradient(135deg, #0E5C4A 0%, #0A4437 100%)' : '#ffffff',
                            color: mine ? '#fff' : '#1C2B27',
                            boxShadow: mine ? '0 4px 12px rgba(10, 68, 55, 0.18)' : '0 4px 12px rgba(28,43,39,0.04)',
                            border: mine ? 'none' : '1px solid #E5DFC8',
                          }}
                        >
                          {((isSupport && fromUser) || (!isSupport && !fromUser)) && (
                            <p style={{ ...S.meta, color: mine ? 'rgba(255,255,255,0.9)' : '#C69A3A' }}>{m.fromName}</p>
                          )}
                          <p style={{ margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: 13.5, fontWeight: 500 }}>
                            {m.text}
                          </p>
                          <p style={{
                            ...S.time,
                            color: mine ? 'rgba(255,255,255,0.7)' : '#93A29B'
                          }}>
                            {new Date(m.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={scrollRef} />
                </div>
              )}
            </div>

            {/* صندوق الإدخال والإرسال */}
            {threadId && (
              <div style={S.composer}>
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={isSupport ? 'اكتب رد الدعم وسوف يصل للعميل فوراً…' : 'اكتب رسالتك هنا وسيقوم الفريق بمساعدتك…'}
                  className="composer-input-lux"
                  style={S.input}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      onSend();
                    }
                  }}
                />
                <button className="btn-send-lux" style={S.sendBtn} onClick={onSend} disabled={sending}>
                  {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} style={{ transform: 'rotate(180deg)' }} />}
                  <span style={{ marginInlineStart: 6 }}>إرسال</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  pageContainer: { flex: 1, padding: '32px 28px', maxWidth: 1200, width: '100%', margin: '0 auto', boxSizing: 'border-box' },
  wrap: { direction: 'rtl', fontFamily: "'Tajawal', 'Cairo', system-ui, sans-serif" },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 },
  
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    borderRadius: 14,
    border: '1px solid #E5DFC8',
    background: '#FAF6EC',
    color: '#52655F',
    cursor: 'pointer',
    outline: 'none',
    boxShadow: '0 4px 6px rgba(28, 43, 39, 0.03)',
  },

  icon: { width: 46, height: 46, borderRadius: 16, background: 'linear-gradient(135deg, #E1EEE7 0%, #F6EBCB 100%)', color: '#0A4437', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #C9A227', boxShadow: '0 4px 6px rgba(10, 68, 55, 0.06)' },
  title: { margin: 0, fontSize: 26, fontWeight: 700, color: '#1C2B27', letterSpacing: '-0.3px', fontFamily: "'Amiri', serif" },
  sub: { margin: '4px 0 0', fontSize: 13, color: '#52655F', fontWeight: 500 },
  
  agentBadge: { display: 'flex', alignItems: 'center', gap: 8, background: '#E1EEE7', border: '1px solid #BFE0D2', borderRadius: 20, padding: '6px 12px', fontSize: 12, color: '#0A4437', fontWeight: 700 },
  onlineDot: { width: 8, height: 8, borderRadius: '50%', background: '#0E5C4A' },

  chatShell: { display: 'flex', background: '#fff', border: '1px solid #E5DFC8', borderRadius: 24, overflow: 'hidden', boxShadow: '0 10px 30px rgba(28, 43, 39, 0.05)', minHeight: 560 },
  
  sidebar: { width: '310px', borderLeft: '1px solid #E5DFC8', background: '#FAF6EC', display: 'flex', flexDirection: 'column', flexShrink: 0 },
  sidebarHeader: { padding: '18px 20px', fontWeight: 800, fontSize: 14, borderBottom: '1px solid #E5DFC8', color: '#1C2B27', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  sidebarBadge: { background: '#E5DFC8', color: '#52655F', fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 8 },
  
  threadList: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' },
  threadTab: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', border: 'none', borderBottom: '1px solid #F3EEDD', cursor: 'pointer', textAlign: 'right', outline: 'none' },
  avatarWrapper: { position: 'relative', width: 34, height: 34, borderRadius: '50%', background: '#E5DFC8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  onlineIndicator: { position: 'absolute', bottom: -1, right: -1, width: 8, height: 8, borderRadius: '50%', background: '#0E5C4A', border: '2px solid #FAF6EC' },
  unreadBadge: { background: '#BD5B3E', color: '#fff', fontSize: 10, fontWeight: 900, padding: '2px 7px', borderRadius: '50%', flexShrink: 0, boxShadow: '0 2px 6px rgba(189, 91, 62, 0.3)' },

  mainChatArea: { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: '#FDFBF5' },
  activeUserBar: { padding: '14px 20px', background: '#ffffff', borderBottom: '1px solid #F3EEDD', fontSize: 13, color: '#374151', boxShadow: '0 1px 2px rgba(28,43,39,0.02)' },
  miniUserIcon: { width: 24, height: 24, borderRadius: 8, background: '#E1EEE7', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  
  chatBody: { flex: 1, height: 420, overflowY: 'auto', padding: '24px 20px', background: '#FAF6EC' },
  bubbleList: { display: 'flex', flexDirection: 'column' },

  empty: { padding: '80px 16px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' },
  sparkleCircle: { width: 56, height: 56, borderRadius: '50%', background: '#E1EEE7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  emptyTitle: { margin: 0, fontWeight: 800, fontSize: 16, color: '#1C2B27', fontFamily: "'Tajawal', sans-serif" },
  emptySub: { margin: 0, fontSize: 13, color: '#52655F', fontWeight: 500, maxWidth: 280, lineHeight: 1.6 },

  composer: { display: 'flex', gap: 12, padding: 18, borderTop: '1px solid #E5DFC8', alignItems: 'center', background: '#fff' },
  input: { flex: 1, borderRadius: 14, border: '1.5px solid #E5DFC8', padding: '13px 16px', outline: 'none', fontSize: 13.5, background: '#FAF6EC', color: '#1C2B27', fontFamily: "'Tajawal', sans-serif" },
  sendBtn: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '13px 20px', borderRadius: 14, border: 'none', cursor: 'pointer', fontWeight: 800, fontSize: 13.5, color: '#fff', background: 'linear-gradient(135deg, #0E5C4A 0%, #0A4437 100%)', fontFamily: "'Tajawal', sans-serif" },

  meta: { margin: '0 0 4px', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2px' },
  time: { margin: '4px 0 0', fontSize: 9.5, fontWeight: 700, textAlign: 'left' },
};