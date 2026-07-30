import React, { useState } from 'react';
import { X, Award, Target, Star, ExternalLink, Edit3, Check } from 'lucide-react';
import { getLevelInfo } from '../utils/gamification';
import { updateUserProfile } from '../utils/storage';

export default function ProfileModal({ isOpen, onClose, user, profile, tools = [] }) {
  if (!isOpen || !user || !profile) return null;

  const currentPoints = profile.points || 0;
  const levelInfo = getLevelInfo(currentPoints);
  
  // Lọc các tool do user này đăng
  const userTools = tools.filter(t => t.submittedBy === user.uid);
  
  // Tính toán tiến trình
  let progressPercentage = 100;
  let pointsNeeded = 0;
  if (levelInfo.next) {
    // Để cho tiến trình mượt hơn, có thể dùng công thức đơn giản
    // Tạm tính từ 0 để thanh progress dễ nhìn, hoặc tính từ mốc level hiện tại
    progressPercentage = Math.min(100, Math.round((currentPoints / levelInfo.next) * 100));
    pointsNeeded = levelInfo.next - currentPoints;
  }

  const [isEditingNick, setIsEditingNick] = useState(false);
  const [nickname, setNickname] = useState(profile.nickname || '');

  const handleSaveNickname = async () => {
    try {
      await updateUserProfile(user.uid, { nickname: nickname.trim() });
      setIsEditingNick(false);
      // Giả lập UI cập nhật luôn
      profile.nickname = nickname.trim();
    } catch (err) {
      console.error(err);
      alert('Lỗi lưu biệt danh');
    }
  };

  return (
    <div 
      className="modal-overlay" 
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div 
        className="modal-content glass-panel"
        style={{
          width: '100%', maxWidth: '600px',
          borderRadius: '16px',
          padding: '2rem',
          maxHeight: '85vh',
          overflowY: 'auto'
        }}
      >
        <button 
          onClick={onClose}
          style={{
            position: 'absolute', top: '1.5rem', right: '1.5rem',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-secondary)'
          }}
        >
          <X size={24} />
        </button>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
          Hồ sơ của tôi
        </h2>

        <div style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
          borderRadius: '12px',
          padding: '1.5rem',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem'
            }}>
              {levelInfo.badge}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {isEditingNick ? (
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <input 
                      type="text" 
                      value={nickname} 
                      onChange={e => setNickname(e.target.value)}
                      placeholder="Biệt danh..."
                      style={{ padding: '0.25rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', outline: 'none', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                      autoFocus
                    />
                    <button onClick={handleSaveNickname} style={{ background: 'var(--accent-color)', color: 'white', border: 'none', borderRadius: '4px', padding: '0.25rem 0.5rem', cursor: 'pointer' }}>
                      <Check size={14} />
                    </button>
                    <button onClick={() => { setIsEditingNick(false); setNickname(profile.nickname || ''); }} style={{ background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px', padding: '0.25rem 0.5rem', cursor: 'pointer' }}>
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                      {profile.nickname || user.email.split('@')[0]}
                    </h3>
                    <button onClick={() => setIsEditingNick(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '0' }}>
                      <Edit3 size={14} />
                    </button>
                  </>
                )}
              </div>
              <p style={{ color: 'var(--text-secondary)', margin: '0.25rem 0 0 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={16} /> Cấp độ {levelInfo.level} - {levelInfo.name}
              </p>
              {!isEditingNick && profile.nickname && (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: '0.25rem 0 0 0' }}>{user.email}</p>
              )}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Tiến trình huy hiệu</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                {currentPoints} {levelInfo.next ? `/ ${levelInfo.next}` : ''} điểm
              </span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'var(--bg-secondary)', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ 
                height: '100%', 
                width: `${progressPercentage}%`, 
                background: 'linear-gradient(90deg, #6366f1, #a855f7)',
                transition: 'width 1s ease-in-out'
              }}></div>
            </div>
            {levelInfo.next && (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Target size={14} /> Cần thêm {pointsNeeded} điểm (khoảng {Math.ceil(pointsNeeded/10)} công cụ) để thăng cấp.
              </p>
            )}
          </div>
        </div>

        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--text-primary)' }}>
          Công cụ đã đóng góp ({userTools.length})
        </h3>
        
        {userTools.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', background: 'var(--bg-secondary)', borderRadius: '12px' }}>
            <Star size={32} style={{ color: 'var(--text-secondary)', margin: '0 auto 1rem' }} />
            <p style={{ color: 'var(--text-secondary)' }}>Bạn chưa đóng góp công cụ nào.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {userTools.map(t => (
              <div key={t.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '1rem', background: 'var(--bg-secondary)', 
                borderRadius: '8px', border: '1px solid var(--border-color)'
              }}>
                <div>
                  <h4 style={{ margin: '0 0 0.25rem 0', fontWeight: 600, color: 'var(--text-primary)' }}>{t.title}</h4>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {t.category} • Lượt thích: {t.favorites || 0}
                  </p>
                </div>
                <a href={t.url} target="_blank" rel="noopener noreferrer" 
                   style={{ color: 'var(--accent-color)', padding: '0.5rem' }}>
                  <ExternalLink size={18} />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
