import React from 'react';
import { LayoutGrid, PlusCircle, Settings, Bot, Code, PenTool, Zap, BookOpen, Folder, Compass, Heart, Info, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Sidebar({ 
  categories = [],
  currentCategory, 
  setCurrentCategory, 
  onAddClick,
  onSettingsClick,
  onProfileClick,
  isAdmin,
  isLoggedIn
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  
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

  const CategoryButton = ({ category, label, forceColor }) => {
    const isActive = currentCategory === category;
    
    // Determine icon color based on state and special cases
    let iconColor = 'var(--text-secondary)';
    if (isActive) {
      iconColor = forceColor || 'var(--accent-color)';
    } else if (forceColor) {
      iconColor = 'var(--text-secondary)'; 
    }

    return (
      <li>
        <button 
          onClick={() => {
            setCurrentCategory(category);
            if (currentPath !== '/') {
              navigate('/');
            }
          }}
          className={`category-btn ${isActive ? 'active' : ''}`}
          style={{ position: 'relative' }}
        >
          <span className="icon-wrapper" style={{ color: iconColor, position: 'relative', zIndex: 1 }}>
            {getCategoryIcon(category)}
          </span>
          <span style={{ position: 'relative', zIndex: 1 }}>{label || category}</span>
          
          {isActive && (
            <motion.div
              layoutId="activeCategoryIndicator"
              transition={{ type: 'spring', stiffness: 500, damping: 30, mass: 1 }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'var(--surface-active)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-highlight)',
                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                zIndex: 0
              }}
            />
          )}
        </button>
      </li>
    );
  };

  return (
    <aside className="sidebar" style={{ 
      margin: '1rem',
      borderRadius: 'var(--radius-lg)',
      padding: '2rem 1.5rem', 
      background: 'var(--bg-sidebar)',
      border: '1px solid var(--border-color)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
      zIndex: 10,
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 2rem)'
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
          <CategoryButton category="Tất cả" />
          <CategoryButton category="Yêu thích" forceColor="#ef4444" />
        </ul>

        <h4 style={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: '1rem', paddingLeft: '0.75rem' }}>Danh mục</h4>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '2rem' }}>
          {categories.map(cat => (
            <CategoryButton key={cat} category={cat} />
          ))}
        </ul>

        <h4 style={{ textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: '1rem', paddingLeft: '0.75rem' }}>Thông tin</h4>
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <li>
            <Link to="/leaderboard" style={{ textDecoration: 'none', display: 'block' }}>
              <button className={`category-btn ${currentPath === '/leaderboard' ? 'active' : ''}`} style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem' }}>
                <span className="icon-wrapper" style={{ color: currentPath === '/leaderboard' ? 'var(--accent-color)' : 'var(--text-secondary)', position: 'relative', zIndex: 1, display: 'flex' }}>
                  <Trophy size={18} />
                </span>
                <span style={{ position: 'relative', zIndex: 1 }}>Bảng Xếp Hạng</span>
                {currentPath === '/leaderboard' && (
                  <motion.div layoutId="activeCategoryIndicator" transition={{ type: 'spring', stiffness: 500, damping: 30, mass: 1 }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'var(--surface-active)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-highlight)', boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)', zIndex: 0 }} />
                )}
              </button>
            </Link>
          </li>
          <li>
            <Link to="/about" style={{ textDecoration: 'none', display: 'block' }}>
              <button className={`category-btn ${currentPath === '/about' ? 'active' : ''}`} style={{ position: 'relative', width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem' }}>
                <span className="icon-wrapper" style={{ color: currentPath === '/about' ? 'var(--accent-color)' : 'var(--text-secondary)', position: 'relative', zIndex: 1, display: 'flex' }}>
                  <Info size={18} />
                </span>
                <span style={{ position: 'relative', zIndex: 1 }}>Giới thiệu</span>
                {currentPath === '/about' && (
                  <motion.div layoutId="activeCategoryIndicator" transition={{ type: 'spring', stiffness: 500, damping: 30, mass: 1 }} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'var(--surface-active)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-highlight)', boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)', zIndex: 0 }} />
                )}
              </button>
            </Link>
          </li>
        </ul>
      </div>

      <div className="sidebar-footer" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {isLoggedIn && (
          <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', padding: '0.75rem 1rem' }} onClick={onProfileClick}>
            <Bot size={18} /> Hồ sơ của tôi
          </button>
        )}
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
