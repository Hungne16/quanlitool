import React, { useState } from 'react';
import { ExternalLink, Trash2, ArrowUpRight, Heart, Play, X, Star, Flag, Share2, MessageCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { rateTool, reportTool } from '../utils/storage';
import CommentsModal from './CommentsModal';

const gradients = [
  'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
  'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
  'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
  'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
  'linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%)',
  'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
];

const getGradient = (text) => {
  if (!text) return gradients[0];
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
};

export default function ToolCard({ tool, onDelete, onToggleFavorite, isAdmin }) {
  const [flipped, setFlipped] = useState(false);
  const [isDescriptionLong, setIsDescriptionLong] = useState(false);
  
  // Rating and Reporting State
  const { user } = useAuth();
  const [isReporting, setIsReporting] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [localTool, setLocalTool] = useState(tool);

  React.useEffect(() => {
    // Show "Xem chi tiết" if detailedDescription exists OR description is long
    if (tool.detailedDescription || (tool.description && tool.description.length > 120)) {
      setIsDescriptionLong(true);
    } else {
      setIsDescriptionLong(false);
    }
  }, [tool.description, tool.detailedDescription]);

  const handleRate = async (score) => {
    if (!user) {
      alert("Vui lòng đăng nhập để đánh giá công cụ.");
      return;
    }
    try {
      await rateTool(tool.id, user.uid, score);
      // Giả lập UI update nhanh mà ko cần reload trang (hoặc reload data)
      if (!tool.ratings) tool.ratings = {};
      tool.ratings[user.uid] = score;
      // ép trigger render bằng cách toggle flipped hoặc state giả
      setFlipped(f => !f); setTimeout(() => setFlipped(f => !f), 10);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReportSubmit = async () => {
    if (!user) {
      alert("Vui lòng đăng nhập để báo cáo công cụ.");
      return;
    }
    if (!reportReason.trim()) return;
    
    try {
      await reportTool(tool.id, user.uid, reportReason, tool.title);
      alert("Báo cáo của bạn đã được gửi tới Admin.");
      setIsReporting(false);
      setReportReason('');
    } catch (e) {
      alert("Có lỗi xảy ra khi gửi báo cáo.");
    }
  };

  const calculateRating = () => {
    if (!tool.ratings) return { avg: 0, count: 0 };
    const scores = Object.values(tool.ratings);
    if (scores.length === 0) return { avg: 0, count: 0 };
    const sum = scores.reduce((a, b) => a + b, 0);
    return { avg: (sum / scores.length).toFixed(1), count: scores.length };
  };

  const ratingInfo = calculateRating();
  const userRating = user && tool.ratings ? tool.ratings[user.uid] : 0;

  const getDomain = (url) => {
    try {
      const domain = new URL(url).hostname;
      return domain;
    } catch {
      return '';
    }
  };

  const domain = getDomain(tool.url);
  const imageUrl = tool.imageUrl || (domain ? `https://logo.clearbit.com/${domain}` : null);
  const headerGradient = getGradient(tool.title || tool.name);

  return (
    <div style={{ perspective: '1000px', height: '100%' }}>
      <div style={{
        transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        transformStyle: 'preserve-3d',
        position: 'relative',
        height: '100%',
        transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
      }}>
        
        {/* FRONT FACE */}
        <div className="tool-card group animate-fade-in" style={{
          backfaceVisibility: 'hidden',
          position: 'relative',
          background: 'var(--card-bg)',
          borderRadius: '24px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          boxShadow: 'var(--shadow-md)',
          zIndex: flipped ? 0 : 1
        }}>
          {/* Header Banner */}
          <div style={{
            height: '100px',
            background: headerGradient,
            position: 'relative',
            width: '100%'
          }}>
            {/* Actions: Comment + Share + Favorite (always) + Delete (admin only) */}
            <div style={{ 
              position: 'absolute', top: '12px', right: '12px', 
              display: 'flex', gap: '0.5rem', zIndex: 10 
            }}>
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  setIsCommentsOpen(true);
                }} 
                style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.3)', backdropFilter: 'blur(4px)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                  color: '#fff'
                }}
                title="Bình luận"
              >
                <MessageCircle size={16} />
              </button>

              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  const url = `${window.location.origin}?tool=${tool.id}`;
                  navigator.clipboard.writeText(url);
                  alert('Đã copy link công cụ!');
                }} 
                style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.3)', backdropFilter: 'blur(4px)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                  color: '#fff'
                }}
                title="Chia sẻ link"
              >
                <Share2 size={16} />
              </button>

              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  onToggleFavorite(tool); 
                }} 
                style={{
                  width: '32px', height: '32px', borderRadius: '50%',
                  background: 'rgba(255,255,255,0.3)', backdropFilter: 'blur(4px)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                  color: tool.isFavorite ? '#ef4444' : '#fff'
                }}
                title={tool.isFavorite ? "Bỏ yêu thích" : "Yêu thích"}
              >
                <Heart size={16} fill={tool.isFavorite ? '#ef4444' : 'none'} />
              </button>
              
              {isAdmin && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(tool.id); }} 
                  style={{
                    width: '32px', height: '32px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.3)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                    color: '#fff'
                  }}
                  title="Xóa công cụ"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Content Area */}
          <div style={{
            padding: '0 1.5rem 1.5rem 1.5rem',
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            position: 'relative',
            background: 'var(--bg-primary)'
          }}>
            
            {/* Floating Logo */}
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'white',
              border: '4px solid var(--bg-primary)',
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
              marginTop: '-32px',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              zIndex: 5
            }}>
              {imageUrl ? (
                <img src={imageUrl} alt={tool.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none' }} />
              ) : (
                <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#6454a8' }}>{(tool.title || tool.name || '?').charAt(0)}</span>
              )}
            </div>

            {/* Title and Badge */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{tool.title || tool.name || 'Không có tên'}</h3>
              <span style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                padding: '0.2rem 0.6rem',
                background: 'rgba(100, 84, 168, 0.1)',
                color: '#6454a8',
                borderRadius: '20px',
                whiteSpace: 'nowrap'
              }}>
                {tool.category}
              </span>
            </div>

            {/* Rating Stars */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', marginBottom: '0.5rem' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  onClick={(e) => { e.preventDefault(); handleRate(star); }}
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: star <= (userRating || Math.round(ratingInfo.avg)) ? '#fbbf24' : '#cbd5e1' }}
                  title={`Đánh giá ${star} sao`}
                >
                  <Star size={14} fill={star <= (userRating || Math.round(ratingInfo.avg)) ? '#fbbf24' : 'none'} />
                </button>
              ))}
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.25rem' }}>
                ({ratingInfo.count > 0 ? ratingInfo.avg : 'Chưa có'})
              </span>
            </div>

            {/* Tags */}
            {tool.tags && tool.tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '0.75rem' }}>
                {tool.tags.map(tag => (
                  <span key={tag} style={{
                    fontSize: '0.65rem',
                    fontWeight: 500,
                    padding: '0.15rem 0.4rem',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-secondary)',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)'
                  }}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            <div style={{ flex: 1, marginBottom: '1.5rem' }}>
              <p style={{
                fontSize: '0.9rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                margin: 0
              }}>
                {tool.description}
              </p>
              {isDescriptionLong && (
                <button 
                  onClick={(e) => { e.preventDefault(); setFlipped(true); }}
                  style={{ 
                    background: 'none', border: 'none', color: '#6454a8', 
                    cursor: 'pointer', padding: 0, fontSize: '0.8rem', 
                    fontWeight: 600, marginTop: '0.5rem', textDecoration: 'underline'
                  }}
                >
                  Xem chi tiết
                </button>
              )}
            </div>

            {/* Bottom Actions (Domain + Hover Button) */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 'auto',
              borderTop: '1px solid var(--border-color)',
              paddingTop: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                  {domain || 'No URL'}
                </span>
                <button 
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsReporting(true); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="Báo cáo công cụ này"
                >
                  <Flag size={14} />
                </button>
              </div>

              <a 
                href={tool.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="tool-action-btn"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  background: '#6454a8',
                  color: 'white',
                  padding: '0.5rem',
                  borderRadius: '24px',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                  transition: 'all 0.3s ease',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  maxWidth: '36px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', flexShrink: 0 }}>
                  <ArrowUpRight size={16} />
                </div>
                <span className="tool-action-text" style={{ opacity: 0, transition: 'opacity 0.2s', width: 0, overflow: 'hidden' }}>Truy cập ngay</span>
              </a>
            </div>

          </div>
        </div>

        {/* BACK FACE */}
        <div style={{
          backfaceVisibility: 'hidden',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'var(--card-bg)',
          borderRadius: '24px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-lg)',
          transform: 'rotateY(180deg)',
          zIndex: flipped ? 1 : 0
        }}>
          
          {/* Header of Back Face */}
          <div style={{
            padding: '1.25rem',
            background: 'rgba(100, 84, 168, 0.05)',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              Mô tả chi tiết
            </h3>
            <button 
              onClick={(e) => { e.preventDefault(); setFlipped(false); }}
              style={{
                background: 'var(--surface-hover)',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-secondary)'
              }}
            >
              <X size={16} />
            </button>
          </div>
          
          <div style={{ flex: 1, padding: '1.25rem', overflowY: 'auto' }} className="custom-scrollbar">
            <p style={{
              fontSize: '0.9rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              margin: 0,
              whiteSpace: 'pre-wrap'
            }}>
              {tool.detailedDescription || tool.description}
            </p>
          </div>
          
        </div>

      </div>
      
      {/* Report Overlay */}
      {isReporting && (
        <div style={{
          position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
          background: 'var(--card-bg)', zIndex: 50, borderRadius: '24px',
          display: 'flex', flexDirection: 'column', padding: '1.5rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 600 }}>Báo cáo công cụ</h4>
            <button onClick={() => setIsReporting(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
              <X size={16} />
            </button>
          </div>
          <textarea 
            value={reportReason}
            onChange={e => setReportReason(e.target.value)}
            placeholder="Vấn đề bạn gặp phải là gì? (Ví dụ: link hỏng, sai mô tả...)"
            style={{ flex: 1, resize: 'none', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '0.75rem', outline: 'none', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.9rem' }}
          />
          <button 
            onClick={handleReportSubmit} 
            className="btn btn-primary" 
            style={{ padding: '0.75rem', marginTop: '1rem', borderRadius: '12px', background: '#ef4444', border: 'none', fontWeight: 600, width: '100%' }}
          >
            Gửi báo cáo
          </button>
        </div>
      )}

      <CommentsModal 
        isOpen={isCommentsOpen} 
        onClose={() => setIsCommentsOpen(false)} 
        tool={localTool}
        onCommentAdded={(newComment) => {
          setLocalTool(prev => ({
            ...prev,
            comments: [...(prev.comments || []), newComment]
          }));
        }}
        onCommentDeleted={(deletedComment) => {
          setLocalTool(prev => ({
            ...prev,
            comments: (prev.comments || []).filter(c => c.createdAt !== deletedComment.createdAt || c.userId !== deletedComment.userId)
          }));
        }}
      />
    </div>
  );
}
