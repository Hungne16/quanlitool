import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Star, Zap, TrendingUp } from 'lucide-react';
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

  // Podium order: 2nd, 1st, 3rd
  const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3;
  const podiumConfig = [
    { rank: 2, color: '#94a3b8', glow: 'rgba(148,163,184,0.4)', height: '130px', zIndex: 1, badge: '🥈', labelColor: '#cbd5e1', rankIdx: 1 },
    { rank: 1, color: '#fbbf24', glow: 'rgba(251,191,36,0.5)', height: '160px', zIndex: 2, badge: '🥇', labelColor: '#fde68a', rankIdx: 0 },
    { rank: 3, color: '#b45309', glow: 'rgba(180,83,9,0.4)', height: '110px', zIndex: 1, badge: '🥉', labelColor: '#fcd34d', rankIdx: 2 },
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

        {/* === FULL-WIDTH HERO TOP SECTION === */}
        <div style={{
          background: 'linear-gradient(160deg, #0f0c29 0%, #1a1440 40%, #24243e 100%)',
          padding: '2.5rem 2rem 0',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Background decorative blobs */}
          <div style={{ position: 'absolute', top: '-60px', left: '-60px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(251,191,36,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: '20px', right: '-40px', width: '250px', height: '250px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '0', left: '50%', transform: 'translateX(-50%)', width: '400px', height: '200px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(251,191,36,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: '2rem', position: 'relative', zIndex: 1 }}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              style={{ fontSize: '2.8rem', marginBottom: '0.25rem', filter: 'drop-shadow(0 0 20px rgba(251,191,36,0.7))' }}
            >
              🏆
            </motion.div>
            <h1 style={{
              fontSize: '1.9rem', fontWeight: 900, color: 'white',
              letterSpacing: '0.1em', textTransform: 'uppercase',
              textShadow: '0 2px 20px rgba(251,191,36,0.3)',
              marginBottom: '0.3rem',
            }}>
              Ai sẽ là <span style={{ color: '#fbbf24' }}>LEADER</span>?
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
              Bảng vinh danh những thành viên đóng góp nhiều nhất
            </p>
          </div>

          {/* === PODIUM TOP 3 === */}
          {!loading && top3.length > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              gap: '1rem',
              position: 'relative',
              zIndex: 1,
              maxWidth: '600px',
              margin: '0 auto',
            }}>
              {podiumConfig.map((cfg, pIdx) => {
                const leader = podiumOrder[pIdx];
                if (!leader) return null;
                const animal = ANIMAL_AVATARS[cfg.rankIdx];
                const levelInfo = getLevelInfo(leader.points || 0);
                const isMe = user && leader.id === user.uid;
                const isFirst = cfg.rank === 1;

                return (
                  <motion.div
                    key={leader.id}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: isFirst ? 0 : 0.15 }}
                    style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: isFirst ? '0 0 200px' : '0 0 160px' }}
                  >
                    {/* Crown for #1 */}
                    {isFirst && (
                      <motion.div
                        animate={{ y: [0, -6, 0] }}
                        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                        style={{ fontSize: '2rem', marginBottom: '-0.2rem', filter: 'drop-shadow(0 0 10px rgba(251,191,36,0.8))' }}
                      >
                        👑
                      </motion.div>
                    )}

                    {/* Avatar card */}
                    <div style={{
                      background: `radial-gradient(circle at 50% 40%, ${cfg.color}22 0%, rgba(255,255,255,0.04) 100%)`,
                      border: `2px solid ${cfg.color}66`,
                      borderRadius: isFirst ? '20px' : '16px',
                      padding: isFirst ? '1rem 1.2rem 0.8rem' : '0.75rem 0.9rem 0.6rem',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem',
                      boxShadow: `0 8px 32px ${cfg.glow}, inset 0 1px 0 rgba(255,255,255,0.1)`,
                      backdropFilter: 'blur(10px)',
                      width: '100%',
                      position: 'relative',
                      overflow: 'hidden',
                    }}>
                      {/* Shimmer line */}
                      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '1px', background: `linear-gradient(90deg, transparent, ${cfg.color}88, transparent)` }} />

                      <div style={{
                        fontSize: isFirst ? '4rem' : '3rem',
                        lineHeight: 1,
                        filter: `drop-shadow(0 6px 16px ${cfg.color}88)`,
                        transform: isFirst ? 'scale(1.1)' : 'scale(1)',
                      }}>
                        {animal}
                      </div>

                      <div style={{
                        fontWeight: 800,
                        fontSize: isFirst ? '0.95rem' : '0.8rem',
                        color: 'white',
                        textAlign: 'center',
                        textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap',
                        maxWidth: '140px',
                      }}>
                        {leader.nickname || (leader.email ? leader.email.split('@')[0] : 'Ẩn danh')}
                        {isMe && <span style={{ marginLeft: '0.3rem', fontSize: '0.6rem', background: 'var(--accent-color)', padding: '0.1rem 0.3rem', borderRadius: '999px' }}>Bạn</span>}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <span style={{ fontSize: isFirst ? '1.5rem' : '1.2rem' }}>{levelInfo.badge}</span>
                        <span style={{ fontWeight: 900, fontSize: isFirst ? '1.3rem' : '1.05rem', color: cfg.color }}>
                          {leader.points || 0}
                        </span>
                        <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.45)', fontWeight: 600 }}>điểm</span>
                      </div>
                    </div>

                    {/* Podium stand */}
                    <div style={{
                      width: '100%',
                      height: cfg.height,
                      background: `linear-gradient(180deg, ${cfg.color}33 0%, ${cfg.color}11 100%)`,
                      border: `1.5px solid ${cfg.color}44`,
                      borderTop: 'none',
                      borderRadius: '0 0 12px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexDirection: 'column',
                      gap: '0.2rem',
                    }}>
                      <span style={{ fontSize: isFirst ? '2.2rem' : '1.7rem' }}>{cfg.badge}</span>
                      <span style={{ fontWeight: 900, fontSize: isFirst ? '1.6rem' : '1.3rem', color: cfg.color }}>
                        #{cfg.rank}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* === BOTTOM CONTENT: 3 columns === */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '220px 1fr 220px',
          gap: '1.5rem',
          padding: '1.5rem',
          maxWidth: '1100px',
          margin: '0 auto',
          alignItems: 'start',
        }}>

          {/* LEFT PANEL — Stats */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <div style={{ borderRadius: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '1.25rem', marginBottom: '0' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: '1rem' }}>📊 Thống kê</div>
                {[
                  { icon: <Users size={16} color="#6366f1" />, label: 'Thành viên', value: leaders.length, color: '#6366f1' },
                  { icon: <Star size={16} color="#fbbf24" />, label: 'Tổng điểm', value: totalPoints.toLocaleString(), color: '#fbbf24' },
                  { icon: <TrendingUp size={16} color="#22c55e" />, label: 'Top điểm', value: leaders[0]?.points || 0, color: '#22c55e' },
                ].map((stat, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.85rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: `${stat.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {stat.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.1rem' }}>{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Cấp độ legend */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
              <div style={{ borderRadius: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '1.25rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>🎖 Cấp độ</div>
                {[
                  { badge: '🌱', name: 'Tân binh', pts: '0–19đ' },
                  { badge: '🔍', name: 'Khám phá', pts: '20–49đ' },
                  { badge: '💡', name: 'Chuyên gia', pts: '50–99đ' },
                  { badge: '👑', name: 'Bậc thầy', pts: '100đ+' },
                ].map((lvl, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.6rem' }}>
                    <span style={{ fontSize: '1.1rem' }}>{lvl.badge}</span>
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{lvl.name}</div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)' }}>{lvl.pts}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* CENTER — Ranked list #4+ */}
          <div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>⏳ Đang tải...</div>
            ) : rest.length === 0 && top3.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--bg-secondary)', borderRadius: '16px', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
                Chưa có thành viên nào có điểm.
              </div>
            ) : rest.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)', fontSize: '0.9rem', opacity: 0.7 }}>
                Chỉ có Top 3 thành viên ở trên 🎉
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: '0.5rem', paddingLeft: '0.5rem' }}>
                  Các thành viên còn lại
                </div>
                {rest.map((leader, idx) => {
                  const realIdx = idx + 3;
                  const levelInfo = getLevelInfo(leader.points || 0);
                  const isCurrentUser = user && user.uid === leader.id;
                  const animal = ANIMAL_AVATARS[realIdx % ANIMAL_AVATARS.length];

                  return (
                    <motion.div
                      key={leader.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.04 }}
                      style={{
                        display: 'flex', alignItems: 'center',
                        background: isCurrentUser ? 'rgba(99,102,241,0.08)' : 'var(--bg-secondary)',
                        border: `1.5px solid ${isCurrentUser ? 'var(--accent-color)' : 'var(--border-color)'}`,
                        borderRadius: '12px', overflow: 'hidden', minHeight: '60px',
                      }}
                    >
                      {/* Rank */}
                      <div style={{ width: '52px', minWidth: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid var(--border-color)', alignSelf: 'stretch' }}>
                        <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-secondary)' }}>#{realIdx + 1}</span>
                      </div>
                      {/* Animal + name */}
                      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.9rem' }}>
                        <span style={{ fontSize: '1.9rem', lineHeight: 1, flexShrink: 0 }}>{animal}</span>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                              {leader.nickname || (leader.email ? leader.email.split('@')[0] : 'Ẩn danh')}
                            </span>
                            {isCurrentUser && <span style={{ fontSize: '0.6rem', background: 'var(--accent-color)', color: 'white', padding: '0.1rem 0.4rem', borderRadius: '999px', fontWeight: 700 }}>BẠN</span>}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{levelInfo.name}</div>
                        </div>
                      </div>
                      {/* Badge + pts */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderLeft: '1px solid var(--border-color)', minWidth: '80px', justifyContent: 'center' }}>
                        <span style={{ fontSize: '1.2rem' }}>{levelInfo.badge}</span>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', lineHeight: 1 }}>{leader.points || 0}</div>
                          <div style={{ fontSize: '0.62rem', color: 'var(--text-secondary)', fontWeight: 600 }}>điểm</div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT PANEL — My rank + tips */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              {user && myInfo ? (
                <div style={{ borderRadius: '16px', background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))', border: '1px solid rgba(99,102,241,0.3)', padding: '1.25rem' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#a5b4fc', marginBottom: '0.85rem' }}>🎯 Của bạn</div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '0.25rem' }}>{ANIMAL_AVATARS[(myRank - 1) % ANIMAL_AVATARS.length]}</div>
                    <div style={{ fontWeight: 800, color: 'white', fontSize: '0.95rem', marginBottom: '0.15rem' }}>
                      {profile?.nickname || (user.email ? user.email.split('@')[0] : 'Bạn')}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '1.3rem' }}>{myInfo.badge}</span>
                      <span style={{ fontWeight: 800, fontSize: '1.2rem', color: '#818cf8' }}>{profile?.points || 0}</span>
                      <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', alignSelf: 'flex-end', marginBottom: '2px' }}>điểm</span>
                    </div>
                    <div style={{ background: 'rgba(99,102,241,0.2)', borderRadius: '10px', padding: '0.5rem 0.75rem', fontSize: '0.8rem', color: '#c7d2fe' }}>
                      {myRank > 0 ? `Hạng #${myRank} trên bảng` : 'Chưa có trong BXH'}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ borderRadius: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '1.25rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔒</div>
                  Đăng nhập để xem thứ hạng của bạn
                </div>
              )}
            </motion.div>

            {/* Tips */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 }}>
              <div style={{ borderRadius: '16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', padding: '1.25rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>⚡ Kiếm điểm</div>
                {[
                  { icon: '🔧', text: 'Đóng góp công cụ', pts: '+10' },
                  { icon: '💬', text: 'Bình luận tích cực', pts: '+2' },
                  { icon: '❤️', text: 'Nhận lượt yêu thích', pts: '+1' },
                ].map((tip, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1rem' }}>{tip.icon}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{tip.text}</span>
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
