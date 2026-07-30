import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../config/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { getLevelInfo } from '../../utils/gamification';

// Map điểm → con vật nổi bật (3D emoji)
const ANIMAL_AVATARS = ['🦁','🐯','🦊','🐺','🦝','🐻','🐼','🐨','🦘','🦔','🐸','🦉','🦅','🦋','🐬','🦈','🦖','🦁','🐯','🦊'];

// Màu nền mỗi hàng theo thứ hạng
const ROW_GRADIENTS = [
  'linear-gradient(135deg, rgba(251,191,36,0.18) 0%, rgba(217,119,6,0.10) 100%)',
  'linear-gradient(135deg, rgba(148,163,184,0.18) 0%, rgba(100,116,139,0.10) 100%)',
  'linear-gradient(135deg, rgba(180,83,9,0.18) 0%, rgba(120,53,15,0.10) 100%)',
];
const ROW_BORDER = ['rgba(251,191,36,0.45)', 'rgba(148,163,184,0.45)', 'rgba(180,83,9,0.45)'];
const RANK_COLORS = ['#fbbf24', '#94a3b8', '#b45309'];
const RANK_LABELS = ['#1', '#2', '#3'];

export default function Leaderboard() {
  const { user, isAdmin } = useAuth();
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
        <div style={{ maxWidth: '760px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem', filter: 'drop-shadow(0 4px 16px rgba(251,191,36,0.4))' }}>🏆</div>
            <h1 style={{
              fontSize: '2.2rem', fontWeight: 900, marginBottom: '0.4rem',
              background: 'linear-gradient(135deg, #fbbf24, #f97316)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em'
            }}>
              AI LEADERBOARD
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Bảng xếp hạng đóng góp — Ai sẽ là <strong style={{ color: 'var(--text-primary)' }}>LEADER</strong>?
            </p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
              ⏳ Đang tải...
            </div>
          ) : leaders.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '3rem', background: 'var(--bg-secondary)',
              borderRadius: '20px', color: 'var(--text-secondary)', border: '1px solid var(--border-color)'
            }}>
              Chưa có thành viên nào có điểm.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
              {leaders.map((leader, idx) => {
                const levelInfo = getLevelInfo(leader.points || 0);
                const isCurrentUser = user && user.uid === leader.id;
                const animal = ANIMAL_AVATARS[idx % ANIMAL_AVATARS.length];
                const isTop3 = idx < 3;

                const rowBg = isTop3
                  ? ROW_GRADIENTS[idx]
                  : isCurrentUser
                    ? 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.05) 100%)'
                    : 'var(--bg-secondary)';

                const rowBorder = isTop3
                  ? ROW_BORDER[idx]
                  : isCurrentUser ? 'var(--accent-color)' : 'var(--border-color)';

                return (
                  <motion.div
                    key={leader.id}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: idx * 0.05 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0,
                      background: rowBg,
                      border: `1.5px solid ${rowBorder}`,
                      borderRadius: isTop3 ? '18px' : '14px',
                      overflow: 'hidden',
                      boxShadow: isTop3
                        ? `0 6px 24px ${ROW_BORDER[idx].replace('0.45', '0.18')}`
                        : '0 2px 8px rgba(0,0,0,0.06)',
                      position: 'relative',
                      minHeight: isTop3 ? '88px' : '72px',
                    }}
                  >
                    {/* LEFT — Rank number */}
                    <div style={{
                      width: isTop3 ? '70px' : '60px',
                      minWidth: isTop3 ? '70px' : '60px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0.75rem 0',
                      background: isTop3
                        ? `linear-gradient(180deg, ${RANK_COLORS[idx]}33 0%, transparent 100%)`
                        : 'transparent',
                      borderRight: `1.5px solid ${rowBorder}`,
                      gap: '0.1rem',
                    }}>
                      <span style={{
                        fontSize: isTop3 ? '1.35rem' : '1.1rem',
                        fontWeight: 900,
                        color: isTop3 ? RANK_COLORS[idx] : 'var(--text-secondary)',
                        letterSpacing: '-0.03em',
                        lineHeight: 1,
                      }}>
                        {isTop3 ? RANK_LABELS[idx] : `#${idx + 1}`}
                      </span>
                      {isTop3 && (
                        <span style={{ fontSize: '0.75rem', color: RANK_COLORS[idx], fontWeight: 700, opacity: 0.7 }}>
                          {['NHẤT','NHÌ','BA'][idx]}
                        </span>
                      )}
                    </div>

                    {/* CENTER — Animal icon + Name */}
                    <div style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.9rem',
                      padding: '0.6rem 1rem',
                      overflow: 'hidden',
                    }}>
                      {/* Animal avatar */}
                      <div style={{
                        fontSize: isTop3 ? '3rem' : '2.2rem',
                        lineHeight: 1,
                        filter: isTop3 ? 'drop-shadow(0 4px 10px rgba(0,0,0,0.3))' : 'none',
                        flexShrink: 0,
                        transform: isTop3 ? 'scale(1.05)' : 'scale(1)',
                        transition: 'transform 0.2s',
                      }}>
                        {animal}
                      </div>

                      {/* Name + level */}
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <span style={{
                            fontWeight: 800,
                            fontSize: isTop3 ? '1.1rem' : '0.95rem',
                            color: 'var(--text-primary)',
                            textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap',
                            maxWidth: '200px',
                          }}>
                            {leader.nickname || (leader.email ? leader.email.split('@')[0] : 'Ẩn danh')}
                          </span>
                          {isCurrentUser && (
                            <span style={{
                              fontSize: '0.65rem', background: 'var(--accent-color)', color: 'white',
                              padding: '0.1rem 0.45rem', borderRadius: '999px', fontWeight: 700, flexShrink: 0,
                            }}>BẠN</span>
                          )}
                        </div>
                        <div style={{
                          fontSize: '0.78rem', color: isTop3 ? RANK_COLORS[idx] : 'var(--text-secondary)',
                          fontWeight: 600, marginTop: '0.1rem', opacity: isTop3 ? 0.9 : 0.7,
                        }}>
                          {levelInfo.name}
                        </div>
                      </div>
                    </div>

                    {/* RIGHT — Badge + Points */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0.6rem 1.25rem',
                      borderLeft: `1.5px solid ${rowBorder}`,
                      minWidth: '90px',
                      gap: '0.15rem',
                    }}>
                      <span style={{
                        fontSize: isTop3 ? '1.8rem' : '1.4rem',
                        lineHeight: 1,
                        filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.2))',
                      }}>
                        {levelInfo.badge}
                      </span>
                      <span style={{
                        fontSize: isTop3 ? '1.1rem' : '0.95rem',
                        fontWeight: 900,
                        color: isTop3 ? RANK_COLORS[idx] : 'var(--text-primary)',
                        letterSpacing: '-0.02em',
                        lineHeight: 1,
                      }}>
                        {leader.points || 0}
                      </span>
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        điểm
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
