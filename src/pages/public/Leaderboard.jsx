import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Star, TrendingUp } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../config/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { getLevelInfo } from '../../utils/gamification';

const ANIMAL_AVATARS = ['🦁','🐯','🦊','🐺','🦝','🐻','🐼','🐨','🦘','🦔','🐸','🦉','🦅','🦋','🐬','🦈','🦖','🦁','🐯','🦊'];

// F1-style accent colors per rank slot (2nd left, 1st center, 3rd right)
const F1_SLOTS = [
  { dataIdx: 1, rank: 2, accent: '#f97316', glow: 'rgba(249,115,22,0.55)', cardH: 260, numColor: 'rgba(249,115,22,0.18)', label: 'HÌ' },
  { dataIdx: 0, rank: 1, accent: '#22d3ee', glow: 'rgba(34,211,238,0.55)',  cardH: 310, numColor: 'rgba(34,211,238,0.15)',  label: 'HẤT' },
  { dataIdx: 2, rank: 3, accent: '#ef4444', glow: 'rgba(239,68,68,0.55)',   cardH: 225, numColor: 'rgba(239,68,68,0.15)',   label: 'A'   },
];

// Plus-cross pattern SVG as CSS bg
const PLUS_PATTERN = `url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10 2h4v8h8v4h-8v8h-4v-8H2v-4h8z' fill='%23ffffff' fill-opacity='0.04'/%3E%3C/svg%3E")`;

export default function Leaderboard() {
  const { user, isAdmin, profile } = useAuth();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const q = query(collection(db, 'users'), orderBy('points', 'desc'), limit(20));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setLeaders(data.filter(u => (u.points || 0) > 0));
      } catch (err) {
        console.error('Lỗi lấy danh sách leader:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaders();
  }, []);

  const top3 = leaders.slice(0, 3);
  const rest  = leaders.slice(3);
  const totalPoints = leaders.reduce((s, l) => s + (l.points || 0), 0);
  const myRank = user ? leaders.findIndex(l => l.id === user.uid) + 1 : 0;
  const myInfo = profile ? getLevelInfo(profile.points || 0) : null;

  return (
    <div className="app-container">
      <Sidebar
        categories={[]}
        currentCategory=""
        setCurrentCategory={() => {}}
        isAdmin={isAdmin}
        isLoggedIn={!!user}
      />

      <main className="main-content" style={{ overflowY: 'auto' }}>

        {/* ===== F1 HERO SECTION ===== */}
        <div style={{
          background: `${PLUS_PATTERN}, linear-gradient(170deg, #0a0a0f 0%, #12101e 60%, #1a0a0a 100%)`,
          padding: '2rem 2rem 0',
          position: 'relative',
        }}>
          {/* Red side accents like F1 */}
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '6px', background: 'linear-gradient(180deg, #ef4444, #b91c1c)' }} />
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '6px', background: 'linear-gradient(180deg, #ef4444, #b91c1c)' }} />

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: 'center', marginBottom: '1.75rem', position: 'relative', zIndex: 1 }}
          >
            <div style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: 'white',
              fontSize: '0.7rem',
              fontWeight: 900,
              letterSpacing: '0.15em',
              padding: '0.3rem 1rem',
              borderRadius: '4px',
              textTransform: 'uppercase',
              marginBottom: '0.6rem',
            }}>
              🏆 COMMUNITY GP
            </div>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 900,
              color: 'white',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              margin: 0,
              textShadow: '0 2px 20px rgba(239,68,68,0.3)',
            }}>
              Bảng Xếp Hạng
            </h1>
          </motion.div>

          {/* TOP 3 CARDS — F1 style */}
          {!loading && top3.length > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              gap: '0.5rem',
              position: 'relative',
              zIndex: 2,
              maxWidth: '700px',
              margin: '0 auto',
            }}>
              {F1_SLOTS.map((slot) => {
                const leader = top3[slot.dataIdx];
                if (!leader) return null;
                const levelInfo = getLevelInfo(leader.points || 0);
                const isMe = user && leader.id === user.uid;
                const isFirst = slot.rank === 1;
                const animal = ANIMAL_AVATARS[slot.dataIdx];
                const displayName = (leader.nickname || (leader.email ? leader.email.split('@')[0] : 'Ẩn danh')).toUpperCase();

                return (
                  <motion.div
                    key={leader.id}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: isFirst ? 0 : 0.18 }}
                    style={{
                      flex: isFirst ? '0 0 220px' : '0 0 175px',
                      height: `${slot.cardH}px`,
                      borderRadius: '10px 10px 0 0',
                      background: `linear-gradient(175deg, ${slot.accent}22 0%, rgba(0,0,0,0.7) 70%)`,
                      border: `2px solid ${slot.accent}55`,
                      borderBottom: 'none',
                      position: 'relative',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      boxShadow: `0 -8px 40px ${slot.glow}, inset 0 0 60px ${slot.numColor}`,
                      cursor: 'default',
                    }}
                  >
                    {/* Top border accent bar */}
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: slot.accent, boxShadow: `0 0 12px ${slot.accent}` }} />

                    {/* Giant rank number watermark */}
                    <div style={{
                      position: 'absolute',
                      top: '-10px',
                      left: '-10px',
                      fontSize: isFirst ? '11rem' : '9rem',
                      fontWeight: 900,
                      color: slot.accent,
                      opacity: 0.13,
                      lineHeight: 1,
                      userSelect: 'none',
                      fontStyle: 'italic',
                      letterSpacing: '-0.05em',
                    }}>
                      {slot.rank}
                    </div>

                    {/* Animal emoji — center */}
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -55%)',
                      fontSize: isFirst ? '7rem' : '5.5rem',
                      lineHeight: 1,
                      filter: `drop-shadow(0 8px 24px ${slot.accent}99)`,
                      userSelect: 'none',
                    }}>
                      {animal}
                    </div>

                    {/* Crown for #1 */}
                    {isFirst && (
                      <motion.div
                        animate={{ y: [0, -6, 0] }}
                        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                        style={{
                          position: 'absolute',
                          top: '8px',
                          right: '10px',
                          fontSize: '1.6rem',
                          filter: 'drop-shadow(0 0 8px rgba(251,191,36,0.9))',
                        }}
                      >
                        👑
                      </motion.div>
                    )}

                    {/* Bottom name strip */}
                    <div style={{
                      background: `linear-gradient(0deg, ${slot.accent}cc 0%, ${slot.accent}55 60%, transparent 100%)`,
                      padding: '1.5rem 0.75rem 0.7rem',
                      position: 'relative',
                      zIndex: 1,
                    }}>
                      {/* Rank label */}
                      <div style={{
                        fontSize: '0.6rem',
                        fontWeight: 900,
                        letterSpacing: '0.12em',
                        color: 'rgba(255,255,255,0.7)',
                        marginBottom: '0.15rem',
                      }}>
                        {levelInfo.badge} {levelInfo.name.toUpperCase()}
                      </div>
                      {/* Name */}
                      <div style={{
                        fontSize: isFirst ? '1rem' : '0.85rem',
                        fontWeight: 900,
                        color: 'white',
                        letterSpacing: '0.06em',
                        textShadow: '0 1px 4px rgba(0,0,0,0.5)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {displayName}
                        {isMe && <span style={{ marginLeft: '0.3rem', fontSize: '0.55rem', background: '#6366f1', padding: '0.1rem 0.3rem', borderRadius: '4px', verticalAlign: 'middle', fontStyle: 'normal' }}>BẠN</span>}
                      </div>
                      {/* Points */}
                      <div style={{ fontSize: isFirst ? '0.85rem' : '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.75)', marginTop: '0.1rem' }}>
                        {(leader.points || 0)} điểm
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {loading && (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'rgba(255,255,255,0.4)' }}>⏳ Đang tải...</div>
          )}
        </div>

        {/* ===== BOTTOM 3-COL ===== */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '210px 1fr 210px',
          gap: '1.25rem',
          padding: '1.5rem',
          maxWidth: '1050px',
          margin: '0 auto',
          alignItems: 'start',
        }}>

          {/* LEFT — Stats + Levels */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <div style={{ borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '1.1rem' }}>
                <div style={{ fontSize: '0.67rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: '0.9rem' }}>📊 Thống kê</div>
                {[
                  { icon: <Users size={15} color="#6366f1" />, label: 'Thành viên', value: leaders.length, color: '#6366f1' },
                  { icon: <Star size={15} color="#fbbf24" />, label: 'Tổng điểm', value: totalPoints.toLocaleString(), color: '#fbbf24' },
                  { icon: <TrendingUp size={15} color="#22c55e" />, label: 'Điểm cao nhất', value: leaders[0]?.points || 0, color: '#22c55e' },
                ].map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{s.icon}</div>
                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
                      <div style={{ fontSize: '0.67rem', color: 'var(--text-secondary)' }}>{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.42 }}>
              <div style={{ borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '1.1rem' }}>
                <div style={{ fontSize: '0.67rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: '0.8rem' }}>🎖 Cấp độ</div>
                {[{badge:'🌱',name:'Tân binh',pts:'0–19đ'},{badge:'🔍',name:'Khám phá',pts:'20–49đ'},{badge:'💡',name:'Chuyên gia',pts:'50–99đ'},{badge:'👑',name:'Bậc thầy',pts:'100đ+'}].map((lvl, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.55rem' }}>
                    <span style={{ fontSize: '1rem' }}>{lvl.badge}</span>
                    <div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{lvl.name}</div>
                      <div style={{ fontSize: '0.64rem', color: 'var(--text-secondary)' }}>{lvl.pts}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* CENTER — F1-style ranked rows #4+ */}
          <div>
            {rest.length === 0 && !loading ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-secondary)', fontSize: '0.88rem', opacity: 0.7 }}>
                🎉 Chỉ có Top 3 thành viên!
              </div>
            ) : (
              <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden' }}>
                {rest.map((leader, idx) => {
                  const realIdx = idx + 3;
                  const levelInfo = getLevelInfo(leader.points || 0);
                  const isMe = user && leader.id === user.uid;
                  const animal = ANIMAL_AVATARS[realIdx % ANIMAL_AVATARS.length];
                  const displayName = (leader.nickname || (leader.email ? leader.email.split('@')[0] : 'Ẩn danh')).toUpperCase();

                  return (
                    <motion.div
                      key={leader.id}
                      initial={{ opacity: 0, x: -16 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.28, delay: idx * 0.05 }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        borderBottom: idx < rest.length - 1 ? '1px solid var(--border-color)' : 'none',
                        background: isMe ? 'rgba(99,102,241,0.07)' : 'transparent',
                        transition: 'background 0.2s',
                        minHeight: '56px',
                      }}
                    >
                      {/* Rank number — F1 style big */}
                      <div style={{
                        width: '58px',
                        minWidth: '58px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        alignSelf: 'stretch',
                        borderRight: '1px solid var(--border-color)',
                        position: 'relative',
                        overflow: 'hidden',
                      }}>
                        {/* Faint big number behind */}
                        <span style={{
                          position: 'absolute',
                          fontSize: '2.5rem',
                          fontWeight: 900,
                          color: 'var(--text-secondary)',
                          opacity: 0.06,
                          letterSpacing: '-0.05em',
                          fontStyle: 'italic',
                          userSelect: 'none',
                        }}>{realIdx + 1}</span>
                        <span style={{ fontWeight: 800, fontSize: '1.05rem', color: isMe ? 'var(--accent-color)' : 'var(--text-secondary)', position: 'relative' }}>
                          {realIdx + 1}
                        </span>
                      </div>

                      {/* Animal + name block */}
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.7rem', padding: '0 0.9rem' }}>
                        <span style={{ fontSize: '1.8rem', lineHeight: 1, flexShrink: 0 }}>{animal}</span>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                            <span style={{ fontWeight: 800, fontSize: '0.88rem', color: 'var(--text-primary)', letterSpacing: '0.03em' }}>
                              {displayName}
                            </span>
                            {isMe && (
                              <span style={{ fontSize: '0.58rem', background: 'var(--accent-color)', color: 'white', padding: '0.1rem 0.35rem', borderRadius: '4px', fontWeight: 700 }}>BẠN</span>
                            )}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, marginTop: '1px' }}>{levelInfo.name}</div>
                        </div>
                      </div>

                      {/* Badge + points */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0 1rem',
                        borderLeft: '1px solid var(--border-color)',
                        minWidth: '82px',
                        alignSelf: 'stretch',
                        justifyContent: 'center',
                      }}>
                        <span style={{ fontSize: '1.15rem' }}>{levelInfo.badge}</span>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)', lineHeight: 1 }}>{leader.points || 0}</div>
                          <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)', fontWeight: 600 }}>điểm</div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT — My card + Tips */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              {user && myInfo ? (
                <div style={{ borderRadius: '12px', background: 'linear-gradient(135deg, rgba(99,102,241,0.13), rgba(139,92,246,0.07))', border: '1px solid rgba(99,102,241,0.28)', padding: '1.1rem' }}>
                  <div style={{ fontSize: '0.67rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a5b4fc', marginBottom: '0.8rem' }}>🎯 Của bạn</div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2.8rem', marginBottom: '0.2rem' }}>{ANIMAL_AVATARS[Math.max(0, myRank - 1) % ANIMAL_AVATARS.length]}</div>
                    <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.88rem', marginBottom: '0.15rem' }}>
                      {(profile?.nickname || (user.email ? user.email.split('@')[0] : 'Bạn')).toUpperCase()}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.35rem', marginBottom: '0.6rem' }}>
                      <span style={{ fontSize: '1.2rem' }}>{myInfo.badge}</span>
                      <span style={{ fontWeight: 900, fontSize: '1.1rem', color: '#818cf8' }}>{profile?.points || 0}</span>
                      <span style={{ fontSize: '0.62rem', color: 'var(--text-secondary)' }}>điểm</span>
                    </div>
                    <div style={{ background: 'rgba(99,102,241,0.18)', borderRadius: '8px', padding: '0.4rem 0.6rem', fontSize: '0.76rem', color: '#c7d2fe', fontWeight: 700 }}>
                      {myRank > 0 ? `Hạng #${myRank}` : 'Chưa có trên BXH'}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '1.1rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                  <div style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>🔒</div>
                  Đăng nhập để xem thứ hạng
                </div>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.42 }}>
              <div style={{ borderRadius: '12px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '1.1rem' }}>
                <div style={{ fontSize: '0.67rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: '0.8rem' }}>⚡ Kiếm điểm</div>
                {[
                  { icon: '🔧', text: 'Đóng góp công cụ', pts: '+10' },
                  { icon: '💬', text: 'Bình luận tích cực', pts: '+2' },
                  { icon: '❤️', text: 'Lượt yêu thích', pts: '+1' },
                ].map((tip, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <span style={{ fontSize: '0.95rem' }}>{tip.icon}</span>
                      <span style={{ fontSize: '0.77rem', color: 'var(--text-secondary)' }}>{tip.text}</span>
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#22c55e' }}>{tip.pts}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

        </div>
      </main>
    </div>
  );
}
