import React from 'react';
import { LayoutGrid, PlusCircle, Settings, Bot, Code, PenTool, Zap, BookOpen, Folder, Compass } from 'lucide-react';
import { DEFAULT_CATEGORIES } from '../utils/storage';

export default function Sidebar({ 
  currentCategory, 
  setCurrentCategory, 
  onAddClick,
  onSettingsClick
}) {
  
  const getCategoryIcon = (category) => {
    switch(category) {
      case 'Tất cả': return <Compass size={18} />;
      case 'AI & Machine Learning': return <Bot size={18} />;
      case 'Lập trình': return <Code size={18} />;
      case 'Thiết kế': return <PenTool size={18} />;
      case 'Năng suất': return <Zap size={18} />;
      case 'Đọc sách & Tin tức': return <BookOpen size={18} />;
      default: return <Folder size={18} />;
    }
  };

  return (
    <aside className="sidebar" style={{ 
      width: '280px', 
      padding: '2rem 1.5rem', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '2rem',
      background: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border-color)',
      zIndex: 10
    }}>
      <div className="sidebar-header" style={{ padding: '0 0.5rem' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.5px' }}>
          <div style={{ background: 'linear-gradient(135deg, var(--accent-color), #3b82f6)', padding: '0.4rem', borderRadius: 'var(--radius-md)', display: 'flex' }}>
            <LayoutGrid color="white" size={20} />
          </div>
          ToolHub
        </h2>
      </div>

      <div className="sidebar-nav" style={{ flex: 1, marginTop: '1rem' }}>
        <h4 style={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: '1rem', paddingLeft: '0.75rem' }}>Danh mục</h4>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {DEFAULT_CATEGORIES.map(cat => {
            const isActive = currentCategory === cat;
            return (
              <li key={cat}>
                <button 
                  onClick={() => setCurrentCategory(cat)}
                  className={`category-btn ${isActive ? 'active' : ''}`}
                >
                  <span className="icon-wrapper" style={{ color: isActive ? 'var(--accent-color)' : 'var(--text-secondary)' }}>
                    {getCategoryIcon(cat)}
                  </span>
                  {cat}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="sidebar-footer" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', padding: '0.75rem 1rem' }} onClick={onSettingsClick}>
          <Settings size={18} /> Cài đặt hệ thống
        </button>
        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'flex-start', padding: '0.75rem 1rem' }} onClick={onAddClick}>
          <PlusCircle size={18} /> Thêm công cụ mới
        </button>
      </div>
    </aside>
  );
}
