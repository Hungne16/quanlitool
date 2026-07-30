import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Star, Shield, ArrowUp } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../contexts/AuthContext';
import { db } from '../../config/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { getLevelInfo } from '../../utils/gamification';

export default function Leaderboard() {
  const { user, isAdmin } = useAuth();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const q = query(collection(db, "users"), orderBy("points", "desc"), limit(20));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setLeaders(data.filter(u => (u.points || 0) > 0)); // Chỉ lấy người có điểm
      } catch (err) {
        console.error("Lỗi lấy danh sách leader:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaders();
  }, []);

  const getRankStyle = (index) => {
    if (index === 0) return { color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.1)', icon: <Trophy size={24} color="#fbbf24" /> };
    if (index === 1) return { color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.1)', icon: <Medal size={24} color="#94a3b8" /> };
    if (index === 2) return { color: '#b45309', bg: 'rgba(180, 83, 9, 0.1)', icon: <Medal size={24} color="#b45309" /> };
    return { color: 'var(--text-secondary)', bg: 'transparent', icon: <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>#{index + 1}</span> };
  };

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
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1.5rem' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto',
              boxShadow: '0 10px 25px rgba(245, 158, 11, 0.3)'
            }}>
              <Trophy size={40} color="white" />
            </div>
            <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Bảng Xếp Hạng</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Vinh danh những thành viên đóng góp tích cực nhất cho cộng đồng</p>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>Đang tải dữ liệu...</div>
          ) : leaders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--bg-secondary)', borderRadius: '16px', color: 'var(--text-secondary)' }}>
              Chưa có thành viên nào có điểm.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {leaders.map((leader, idx) => {
                const rankStyle = getRankStyle(idx);
                const levelInfo = getLevelInfo(leader.points || 0);
                const isCurrentUser = user && user.uid === leader.id;

                return (
                  <motion.div
                    key={leader.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    style={{
                      display: 'flex', alignItems: 'center', padding: '1.5rem',
                      background: isCurrentUser ? 'rgba(99, 102, 241, 0.05)' : 'var(--bg-primary)',
                      border: isCurrentUser ? '1px solid var(--accent-color)' : '1px solid var(--border-color)',
                      borderRadius: '16px', gap: '1.5rem',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
                    }}
                  >
                    <div style={{ width: '40px', display: 'flex', justifyContent: 'center', color: rankStyle.color }}>
                      {rankStyle.icon}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                          {leader.nickname || (leader.email ? leader.email.split('@')[0] : 'Người dùng ẩn danh')}
                        </span>
                        {isCurrentUser && (
                          <span style={{ fontSize: '0.7rem', background: 'var(--accent-color)', color: 'white', padding: '0.1rem 0.5rem', borderRadius: '999px', fontWeight: 600 }}>Bạn</span>
                        )}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ 
                          fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.6rem',
                          background: 'var(--bg-secondary)', color: 'var(--text-secondary)', borderRadius: '6px',
                          display: 'flex', alignItems: 'center', gap: '0.25rem'
                        }}>
                          <Shield size={12} /> {levelInfo.title}
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-color)' }}>
                        {leader.points || 0}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        <Star size={12} fill="var(--text-secondary)" /> Điểm
                      </div>
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
