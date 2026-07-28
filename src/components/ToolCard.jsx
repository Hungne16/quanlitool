import React from 'react';
import { ExternalLink, Trash2, ArrowUpRight, Heart } from 'lucide-react';

export default function ToolCard({ tool, onDelete, onToggleFavorite }) {
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

  return (
    <div className="tool-card group animate-fade-in">
      <div className="tool-card-content">
        <div className="tool-card-header">
          <div className="tool-logo-wrapper">
            {imageUrl ? (
              <img src={imageUrl} alt={tool.title} className="tool-logo" onError={(e) => { e.target.style.display = 'none' }} />
            ) : (
              <span className="tool-logo-fallback">{tool.title.charAt(0)}</span>
            )}
          </div>
          
          <div className="tool-actions" style={{ display: 'flex', gap: '0.25rem' }}>
            <button 
              onClick={() => onToggleFavorite(tool)} 
              className="btn-icon-delete opacity-0 group-hover-opacity-100"
              style={{ color: tool.isFavorite ? '#ef4444' : 'var(--text-muted)' }}
              title={tool.isFavorite ? "Bỏ yêu thích" : "Yêu thích"}
            >
              <Heart size={16} fill={tool.isFavorite ? '#ef4444' : 'none'} />
            </button>
            <button 
              onClick={() => onDelete(tool.id)} 
              className="btn-icon-delete opacity-0 group-hover-opacity-100"
              title="Xóa công cụ"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <div className="tool-info">
          <h3 className="tool-title">{tool.title}</h3>
          <span className="tool-badge">{tool.category}</span>
        </div>

        <p className="tool-description">
          {tool.description}
        </p>

        <a 
          href={tool.url} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="tool-link-btn"
        >
          <span>Truy cập</span> <ArrowUpRight size={16} className="tool-link-icon" />
        </a>
      </div>
      
      {/* Decorative gradient glow that appears on hover */}
      <div className="tool-card-glow"></div>
    </div>
  );
}
