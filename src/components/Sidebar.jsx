import React from 'react';
import { LayoutGrid, PlusCircle, Settings, Bot, Code, PenTool, Zap, BookOpen, Folder, Compass, Heart } from 'lucide-react';

export default function Sidebar({ 
  categories = [],
  currentCategory, 
  setCurrentCategory, 
  onAddClick,
  onSettingsClick,
  isAdmin,
  isLoggedIn
}) {
  
  const getCategoryIcon = (category) => {
    switch(category) {
      case 'Tất cả': return <Compass size={18} />;
      case 'Yêu thích': return <Heart size={18} color="#ef4444" fill={currentCategory === 'Yêu thích' ? '#ef4444' : 'none'} />;
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
      padding: '2rem 1.5rem', 
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

      <div className="sidebar-nav" style={{ flex: 1, marginTop: '1rem', overflowY: 'auto' }}>
        <h4 style={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: '1rem', paddingLeft: '0.75rem' }}>Khám phá</h4>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '2rem' }}>
          <li>
            <button 
              onClick={() => setCurrentCategory('Tất cả')}
              className={`category-btn ${currentCategory === 'Tất cả' ? 'active' : ''}`}
            >
              <span className="icon-wrapper" style={{ color: currentCategory === 'Tất cả' ? 'var(--accent-color)' : 'var(--text-secondary)' }}>
                {getCategoryIcon('Tất cả')}
              </span>
              Tất cả
            </button>
          </li>
          <li>
            <button 
              onClick={() => setCurrentCategory('Yêu thích')}
              className={`category-btn ${currentCategory === 'Yêu thích' ? 'active' : ''}`}
            >
              <span className="icon-wrapper" style={{ color: currentCategory === 'Yêu thích' ? '#ef4444' : 'var(--text-secondary)' }}>
                {getCategoryIcon('Yêu thích')}
              </span>
              Yêu thích
            </button>
          </li>
        </ul>

        <h4 style={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: '1rem', paddingLeft: '0.75rem' }}>Danh mục</h4>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {categories.map(cat => {
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
        {isAdmin && (
          <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', padding: '0.75rem 1rem' }} onClick={onSettingsClick}>
            <Settings size={18} /> Cài đặt hệ thống
          </button>
        )}
        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'flex-start', padding: '0.75rem 1rem' }} onClick={onAddClick}>
          <PlusCircle size={18} /> {isAdmin ? 'Thêm công cụ mới' : 'Đề xuất công cụ'}
        </button>
      </div>
    </aside>
  );
}
