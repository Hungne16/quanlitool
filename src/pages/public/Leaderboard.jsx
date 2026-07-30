import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Star, TrendingUp } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../config/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { getLevelInfo } from '../../utils/gamification';

const ANIMAL_AVATARS = ['🦁','🐯','🦊','🐺','🦝','🐻','🐼','🐨','🦘','🦔','🐸','🦉','🦅','🦋','🐬','🦈','🦖','🦁','🐯','🦊'];

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
  const rest = leaders.slice(3);
  const totalPoints = leaders.reduce((s, l) => s + (l.points || 0), 0);
  const myRank = user ? leaders.findIndex(l => l.id === user.uid) + 1 : 0;
  const myInfo = profile ? getLevelInfo(profile.points || 0) : null;

  // Podium: thứ tự hiển thị 2nd-left, 1st-center, 3rd-right
  const podiumSlots = [
    { dataIdx: 1, rank: 2, color: '#94a3b8', glow: 'rgba(148,163,184,0.5)', standH: 90,  medal: '🥈', label: 'NHÌ'  },
    { dataIdx: 0, rank: 1, color: '#fbbf24', glow: 'rgba(251,191,36,0.6)',  standH: 130, medal: '🥇', label: 'NHẤT' },
    { dataIdx: 2, rank: 3, color: '#cd7f32', glow: 'rgba(180,83,9,0.5)',    standH: 65,  medal: '🥉', label: 'BA'   },
  ];

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

        {/* ===== HERO SECTION ===== */}
        <div style={{
          background: 'linear-gradient(160deg, #0f0c29 0%, #1b1450 50%, #24243e 100%)',
          paddingTop: '2.5rem',
          paddingBottom: '0',
          position: 'relative',
        }}>
          {/* Decorative glow blobs */}
          <div style={{ position: 'absolute', top: '-80px', left: '-80px', width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(251,191,36,0.10) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: 0, right: '-60px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ textAlign: 'center', marginBottom: '2rem', position: 'relative', zIndex: 1 }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '0.3rem', filter: 'drop-shadow(0 0 18px rgba(251,191,36,0.7))' }}>🏆</div>
            <h1 style={{ fontSize: '1.9rem', fontWeight: 900, color: 'white', letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>
              Ai sẽ là <span style={{ color: '#fbbf24', textShadow: '0 0 20px rgba(251,191,36,0.6)' }}>LEADER</span>?
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem', marginTop: '0.4rem' }}>
              Bảng xếp hạng đóng góp cộng đồng
            </p>
          </motion.div>

          {/* ===== PODIUM TOP 3 ===== */}
          {!loading && top3.length > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              gap: '0.75rem',
              paddingLeft: '1.5rem',
              paddingRight: '1.5rem',
              position: 'relative',
              zIndex: 2,
            }}>
              {podiumSlots.map((slot) => {
                const leader = top3[slot.dataIdx];
                if (!leader) return null;
                const levelInfo = getLevelInfo(leader.points || 0);
                const isMe = user && leader.id === user.uid;
                const isFirst = slot.rank === 1;
                const animal = ANIMAL_AVATARS[slot.dataIdx];

                return (
                  <motion.div
                    key={leader.id}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: isFirst ? 0.05 : 0.2 }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: isFirst ? '0 0 200px' : '0 0 160px' }}
                  >
                    {/* Crown only for #1 */}
                    {isFirst && (
                      <motion.div
                        animate={{ y: [0, -7, 0] }}
                        transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
                        style={{ fontSize: '2rem', marginBottom: '-4px', zIndex: 3, position: 'relative', filter: 'drop-shadow(0 0 10px rgba(251,191,36,0.8))' }}
                      >
                        👑
                      </motion.div>
                    )}

                    {/* Card avatar */}
                    <div style={{
                      width: '100%',
                      background: `linear-gradient(160deg, ${slot.color}28 0%, rgba(255,255,255,0.04) 100%)`,
                      border: `2px solid ${slot.color}55`,
                      borderBottom: 'none',
                      borderRadius: isFirst ? '20px 20px 0 0' : '16px 16px 0 0',
                      padding: isFirst ? '1.1rem 0.9rem 0.9rem' : '0.8rem 0.75rem 0.7rem',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.35rem',
                      backdropFilter: 'blur(12px)',
                      boxShadow: `0 -4px 30px ${slot.glow}`,
                      position: 'relative',
                    }}>
                      {/* Top shimmer */}
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1.5px', background: `linear-gradient(90deg, transparent, ${slot.color}99, transparent)`, borderRadius: '20px 20px 0 0' }} />

                      {/* Animal */}
                      <div style={{
                        fontSize: isFirst ? '4.2rem' : '3.2rem',
                        lineHeight: 1,
                        filter: `drop-shadow(0 6px 18px ${slot.color}88)`,
                      }}>
                        {animal}
                      </div>

                      {/* Name */}
                      <div style={{
                        fontWeight: 800,
                        fontSize: isFirst ? '0.95rem' : '0.82rem',
                        color: 'white',
                        textAlign: 'center',
                        maxWidth: '160px',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {leader.nickname || (leader.email ? leader.email.split('@')[0] : 'Ẩn danh')}
                        {isMe && <span style={{ marginLeft: '0.3rem', fontSize: '0.58rem', background: '#6366f1', padding: '0.1rem 0.3rem', borderRadius: '999px', verticalAlign: 'middle' }}>BẠN</span>}
                      </div>

                      {/* Badge + points */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <span style={{ fontSize: isFirst ? '1.4rem' : '1.1rem' }}>{levelInfo.badge}</span>
                        <span style={{ fontWeight: 900, fontSize: isFirst ? '1.25rem' : '1rem', color: slot.color }}>
                          {leader.points || 0}
                        </span>
                        <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>đ</span>
                      </div>
                    </div>

                    {/* Podium stand */}
                    <div style={{
                      width: '100%',
                      height: `${slot.standH}px`,
                      background: `linear-gradient(180deg, ${slot.color}40 0%, ${slot.color}15 100%)`,
                      border: `2px solid ${slot.color}44`,
                      borderTop: `3px solid ${slot.color}88`,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.1rem',
                    }}>
                      <span style={{ fontSize: isFirst ? '1.8rem' : '1.4rem' }}>{slot.medal}</span>
                      <span style={{ fontWeight: 900, fontSize: isFirst ? '1.4rem' : '1.1rem', color: slot.color, lineHeight: 1 }}>
                        #{slot.rank}
                      </span>
                      <span style={{ fontSize: '0.6rem', color: slot.color, opacity: 0.8, fontWeight: 700, letterSpacing: '0.05em' }}>{slot.label}</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {loading && (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'rgba(255,255,255,0.5)' }}>⏳ Đang tải...</div>
          )}
        </div>

        {/* ===== BOTTOM: 3 cols ===== */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '210px 1fr 210px',
          gap: '1.25rem',
          padding: '1.5rem',
          maxWidth: '1050px',
          margin: '0 auto',
          alignItems: 'start',
        }}>

          {/* LEFT — Stats + Level legend */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
              <div style={{ borderRadius: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '1.1rem' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: '0.9rem' }}>📊 Thống kê</div>
                {[
                  { icon: <Users size={15} color="#6366f1" />, label: 'Thành viên', value: leaders.length, color: '#6366f1' },
                  { icon: <Star size={15} color="#fbbf24" />, label: 'Tổng điểm', value: totalPoints.toLocaleString(), color: '#fbbf24' },
                  { icon: <TrendingUp size={15} color="#22c55e" />, label: 'Điểm cao nhất', value: leaders[0]?.points || 0, color: '#22c55e' },
                ].map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
                    <div style={{ width: '30px', height: '30px', borderRadius: '9px', background: `${s.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{s.icon}</div>
                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 }}>
              <div style={{ borderRadius: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '1.1rem' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: '0.8rem' }}>🎖 Cấp độ</div>
                {[{ badge:'🌱',name:'Tân binh',pts:'0–19đ'},{badge:'🔍',name:'Khám phá',pts:'20–49đ'},{badge:'💡',name:'Chuyên gia',pts:'50–99đ'},{badge:'👑',name:'Bậc thầy',pts:'100đ+'}].map((lvl, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.55rem' }}>
                    <span style={{ fontSize: '1rem' }}>{lvl.badge}</span>
                    <div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{lvl.name}</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>{lvl.pts}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* CENTER — #4+ list */}
          <div>
            {rest.length === 0 && !loading ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-secondary)', fontSize: '0.88rem', opacity: 0.7 }}>
                🎉 Chỉ có Top 3 thành viên!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ fontSize: '0.67rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: '0.4rem', paddingLeft: '0.25rem' }}>
                  Các thành viên còn lại
                </div>
                {rest.map((leader, idx) => {
                  const realIdx = idx + 3;
                  const levelInfo = getLevelInfo(leader.points || 0);
                  const isMe = user && leader.id === user.uid;
                  const animal = ANIMAL_AVATARS[realIdx % ANIMAL_AVATARS.length];
                  return (
                    <motion.div
                      key={leader.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.28, delay: idx * 0.04 }}
                      style={{
                        display: 'flex', alignItems: 'center',
                        background: isMe ? 'rgba(99,102,241,0.08)' : 'var(--bg-secondary)',
                        border: `1.5px solid ${isMe ? 'var(--accent-color)' : 'var(--border-color)'}`,
                        borderRadius: '12px', overflow: 'hidden', minHeight: '58px',
                      }}
                    >
                      <div style={{ width: '50px', minWidth: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid var(--border-color)', alignSelf: 'stretch' }}>
                        <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-secondary)' }}>#{realIdx + 1}</span>
                      </div>
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.7rem', padding: '0.45rem 0.85rem' }}>
                        <span style={{ fontSize: '1.85rem', lineHeight: 1, flexShrink: 0 }}>{animal}</span>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>
                              {leader.nickname || (leader.email ? leader.email.split('@')[0] : 'Ẩn danh')}
                            </span>
                            {isMe && <span style={{ fontSize: '0.58rem', background: 'var(--accent-color)', color: 'white', padding: '0.1rem 0.35rem', borderRadius: '999px', fontWeight: 700 }}>BẠN</span>}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{levelInfo.name}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.45rem 0.9rem', borderLeft: '1px solid var(--border-color)', minWidth: '76px', justifyContent: 'center' }}>
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
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 }}>
              {user && myInfo ? (
                <div style={{ borderRadius: '16px', background: 'linear-gradient(135deg, rgba(99,102,241,0.14), rgba(139,92,246,0.08))', border: '1px solid rgba(99,102,241,0.3)', padding: '1.1rem' }}>
                  <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a5b4fc', marginBottom: '0.8rem' }}>🎯 Của bạn</div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '2.8rem', marginBottom: '0.25rem' }}>{ANIMAL_AVATARS[(myRank - 1) < 0 ? 0 : (myRank - 1) % ANIMAL_AVATARS.length]}</div>
                    <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.9rem', marginBottom: '0.15rem' }}>
                      {profile?.nickname || (user.email ? user.email.split('@')[0] : 'Bạn')}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.4rem', marginBottom: '0.65rem' }}>
                      <span style={{ fontSize: '1.25rem' }}>{myInfo.badge}</span>
                      <span style={{ fontWeight: 900, fontSize: '1.15rem', color: '#818cf8' }}>{profile?.points || 0}</span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>điểm</span>
                    </div>
                    <div style={{ background: 'rgba(99,102,241,0.18)', borderRadius: '9px', padding: '0.45rem 0.6rem', fontSize: '0.78rem', color: '#c7d2fe', fontWeight: 600 }}>
                      {myRank > 0 ? `Hạng #${myRank} trên bảng` : 'Chưa có trên BXH'}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ borderRadius: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '1.1rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                  <div style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>🔒</div>
                  Đăng nhập để xem thứ hạng
                </div>
              )}
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 }}>
              <div style={{ borderRadius: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '1.1rem' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: '0.8rem' }}>⚡ Kiếm điểm</div>
                {[
                  { icon: '🔧', text: 'Đóng góp công cụ', pts: '+10' },
                  { icon: '💬', text: 'Bình luận tích cực', pts: '+2' },
                  { icon: '❤️', text: 'Nhận lượt yêu thích', pts: '+1' },
                ].map((tip, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                      <span style={{ fontSize: '0.95rem' }}>{tip.icon}</span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{tip.text}</span>
                    </div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#22c55e' }}>{tip.pts}</span>
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
