import React from 'react';
import { ExternalLink, Trash2, ArrowUpRight, Heart, Play } from 'lucide-react';

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
  const headerGradient = getGradient(tool.title);

  return (
    <div className="tool-card group animate-fade-in" style={{
      position: 'relative',
      background: 'var(--card-bg)',
      borderRadius: '24px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      boxShadow: 'var(--shadow-md)',
      transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
    }}>
      {/* Header Banner */}
      <div style={{
        height: '100px',
        background: headerGradient,
        position: 'relative',
        width: '100%'
      }}>
        {/* Admin / Favorite Actions */}
        {isAdmin && (
          <div style={{ 
            position: 'absolute', top: '12px', right: '12px', 
            display: 'flex', gap: '0.5rem', zIndex: 10 
          }}>
            <button 
              onClick={() => onToggleFavorite(tool)} 
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
            <button 
              onClick={() => onDelete(tool.id)} 
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
          </div>
        )}
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
            <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#6454a8' }}>{tool.title.charAt(0)}</span>
          )}
        </div>

        {/* Title and Badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{tool.title}</h3>
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

        {/* Description */}
        <p style={{
          fontSize: '0.9rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.5,
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          flex: 1,
          marginBottom: '1.5rem'
        }}>
          {tool.description}
        </p>

        {/* Bottom Actions (Domain + Hover Button) */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 'auto',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '1rem'
        }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            {domain || 'No URL'}
          </span>

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
              maxWidth: '36px' /* Default state: circle */
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px', flexShrink: 0 }}>
              <ArrowUpRight size={16} />
            </div>
            <span className="btn-text" style={{ opacity: 0, transition: 'opacity 0.2s', paddingRight: '0.5rem' }}>Truy cập</span>
          </a>
        </div>

      </div>
    </div>
  );
}
