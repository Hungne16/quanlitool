import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../../components/Sidebar';
import ToolGrid from '../../components/ToolGrid';
import AddToolModal from '../../components/AddToolModal';
import SettingsModal from '../../components/SettingsModal';
import ProfileModal from '../../components/ProfileModal';
import AiAssistant from '../../components/AiAssistant';
import ThemeToggle from '../../components/ThemeToggle';
import TrendingCarousel from '../../components/TrendingCarousel';
import LiveActivityToast from '../../components/LiveActivityToast';
import ComparisonTray from '../../components/ComparisonTray';
import ComparisonModal from '../../components/ComparisonModal';
import TechStackSection from '../../components/TechStackSection';
import { getTools, getCategories, saveTool, deleteTool, toggleFavorite, initStorage } from '../../utils/storage';
import { Search, Bell, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import AuthModal from '../../components/AuthModal';
import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { Link } from 'react-router-dom';
import { getLevelInfo } from '../../utils/gamification';

export default function Home() {
  const [tools, setTools] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentCategory, setCurrentCategory] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [compareList, setCompareList] = useState([]);
  const [isComparisonModalOpen, setIsComparisonModalOpen] = useState(false);
  
  const { user, profile, isAdmin } = useAuth();

  useEffect(() => {
    const initialize = async () => {
      await initStorage();
      await refreshData();
    };
    initialize();
  }, []);

  const refreshData = async () => {
    const fetchedTools = await getTools();
    const fetchedCategories = await getCategories();
    // Only show approved tools for non-admins, but for now we haven't implemented status properly,
    // so just show all tools. We'll update the filter later.
    setTools(fetchedTools);
    setCategories(fetchedCategories);
  };

  const handleAddTool = async (newTool) => {
    try {
      const toolWithUser = {
        ...newTool,
        submittedBy: user?.uid || 'guest',
        tags: newTool.tags || []
      };
      
      const savedTool = await saveTool(toolWithUser);
      setTools(prev => [savedTool, ...prev]);
      setIsAddModalOpen(false);
      
      setTimeout(() => {
        alert('Thêm công cụ thành công!');
      }, 300);
    } catch (error) {
      console.error('Lỗi khi thêm công cụ:', error);
      alert('Có lỗi xảy ra khi thêm công cụ');
    }
  };

  const handleCompare = (tool) => {
    setCompareList(prev => {
      if (prev.find(t => t.id === tool.id)) {
        // Already in list, remove it
        return prev.filter(t => t.id !== tool.id);
      }
      if (prev.length >= 3) {
        alert("Chỉ có thể so sánh tối đa 3 công cụ cùng lúc.");
        return prev;
      }
      return [...prev, tool];
    });
  };

  const handleRemoveCompare = (id) => {
    setCompareList(prev => prev.filter(t => t.id !== id));
  };

  const handleDeleteTool = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa công cụ này?')) {
      await deleteTool(id);
      await refreshData();
    }
  };

  const handleToggleFavorite = async (tool) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    const isCurrentlyFavorite = profile?.favorites?.includes(tool.id);
    await toggleFavorite(user.uid, tool.id, isCurrentlyFavorite);
    // No need to refreshData for tools, the user profile snapshot will trigger a re-render!
  };

  const [selectedTags, setSelectedTags] = useState([]);

  useEffect(() => {
    setSelectedTags([]);
  }, [currentCategory]);

  const categoryTools = useMemo(() => {
    return tools.filter(tool => {
      const isPending = tool.status === 'pending';
      if (!isAdmin && isPending) return false;
      
      const isFavorite = profile?.favorites?.includes(tool.id);
      if (currentCategory === 'Tất cả') return true;
      if (currentCategory === 'Yêu thích') return isFavorite;
      return tool.category === currentCategory;
    });
  }, [tools, currentCategory, isAdmin, profile]);

  const availableTags = useMemo(() => {
    const tags = new Set();
    categoryTools.forEach(tool => {
      if (tool.tags && Array.isArray(tool.tags)) {
        tool.tags.forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags).sort();
  }, [categoryTools]);

  const filteredTools = useMemo(() => {
    return categoryTools.filter(tool => {
      const matchesSearch = (tool.title || tool.name || '').toLowerCase().includes((searchQuery || '').toLowerCase()) || 
                            (tool.description || '').toLowerCase().includes((searchQuery || '').toLowerCase());
      
      let matchesTags = true;
      if (selectedTags.length > 0) {
        // Lọc theo kiểu OR: Công cụ có chứa ít nhất 1 tag đang chọn
        matchesTags = tool.tags && tool.tags.some(tag => selectedTags.includes(tag));
      }
      
      return matchesSearch && matchesTags;
    }).map(tool => ({
      ...tool,
      isFavorite: profile?.favorites?.includes(tool.id) || false
    }));
  }, [categoryTools, searchQuery, selectedTags, profile]);

  return (
    <div className="app-container" style={{ position: 'relative' }}>
      <Sidebar 
        categories={categories}
        currentCategory={currentCategory} 
        setCurrentCategory={setCurrentCategory}
        onAddClick={() => {
          if (user) setIsAddModalOpen(true);
          else setIsAuthModalOpen(true);
        }}
        onSettingsClick={() => setIsSettingsModalOpen(true)}
        onProfileClick={() => setIsProfileModalOpen(true)}
        isAdmin={isAdmin}
        isLoggedIn={!!user}
      />
      
      <main className="main-content">
        <div className="top-header" style={{ justifyContent: 'flex-end' }}>
          
          <div className="header-actions">
            <ThemeToggle />
            <button className="btn-icon">
              <Bell size={20} />
            </button>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {profile && (
                  <div 
                    onClick={() => setIsProfileModalOpen(true)}
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: '0.4rem', 
                      background: 'var(--bg-secondary)', padding: '0.2rem 0.6rem', 
                      borderRadius: '999px', border: '1px solid var(--border-color)',
                      fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)',
                      cursor: 'pointer', transition: 'all 0.2s',
                    }} 
                    className="hover:scale-105"
                    title={`${profile.points || 0} điểm - Nhấn để xem hồ sơ`}
                  >
                    {getLevelInfo(profile.points).badge} {getLevelInfo(profile.points).name}
                  </div>
                )}
                <span 
                  onClick={() => setIsProfileModalOpen(true)}
                  style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                  className="hover:text-[var(--accent-color)] transition-colors"
                  title="Nhấn để xem hồ sơ"
                >
                  <UserIcon size={14} /> {user.email}
                </span>
                {isAdmin && (
                  <Link to="/admin" className="btn btn-primary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', textDecoration: 'none' }}>
                    Dashboard
                  </Link>
                )}
                <button 
                  onClick={() => { if(window.confirm('Bạn muốn đăng xuất?')) signOut(auth); }} 
                  className="btn btn-secondary" 
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                >
                  Đăng xuất
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsAuthModalOpen(true)} 
                className="btn btn-primary" 
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <UserIcon size={16} /> Đăng nhập
              </button>
            )}
          </div>
        </div>

        <div className="content-wrapper">
          
          {currentCategory === 'Tất cả' && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              style={{
                padding: '4rem 2.5rem',
                borderRadius: '32px',
                background: 'rgba(255, 255, 255, 0.02)',
                backdropFilter: 'blur(24px) saturate(180%)',
                border: '1px solid var(--border-color)',
                marginBottom: '3rem',
                position: 'relative',
                overflow: 'hidden',
                textAlign: 'center',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
              }}
            >
              <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px', margin: '0 auto' }}>
                <motion.h1 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                  style={{ 
                    fontSize: 'clamp(2.5rem, 5vw, 4rem)', 
                    fontWeight: 900, 
                    marginBottom: '1.5rem',
                    background: 'linear-gradient(135deg, #a5b4fc 0%, #fbcfe8 50%, #a5f3fc 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    lineHeight: 1.1,
                    letterSpacing: '-0.03em'
                  }}
                >
                  Khám phá tương lai của tiện ích
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2.5rem', maxWidth: '600px', margin: '0 auto 2.5rem auto' }}
                >
                  Nâng tầm hiệu suất với hàng trăm công cụ AI và tiện ích thông minh, được tuyển chọn kỹ lưỡng dành riêng cho bạn.
                </motion.p>
                
                {/* Massive Search Bar in Hero */}
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, type: 'spring', stiffness: 200, damping: 20 }}
                  style={{
                    position: 'relative',
                    maxWidth: '600px',
                    margin: '0 auto',
                    display: 'flex',
                    alignItems: 'center',
                    background: 'var(--bg-header)',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '100px',
                    border: '1px solid var(--border-highlight)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
                  }}
                >
                  <Search size={24} style={{ color: 'var(--text-muted)', marginRight: '1rem' }} />
                  <input 
                    type="text" 
                    placeholder="Tìm kiếm công cụ, tính năng..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: 'var(--text-primary)',
                      fontSize: '1.1rem',
                      width: '100%'
                    }}
                  />
                  <div style={{
                    background: 'var(--surface-color)',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border-color)'
                  }}>⌘K</div>
                </motion.div>
              </div>
              
              {/* Heavy GPU blurs removed for performance */}
            </motion.div>
          )}

          {currentCategory === 'Tất cả' && !searchQuery && selectedTags.length === 0 && (
            <>
              <TrendingCarousel tools={tools.filter(t => t.status !== 'pending' && t.status !== 'rejected')} />
              <TechStackSection tools={tools} setTools={setTools} />
            </>
          )}

          <header className="page-header">
            <div>
              <h1 className="page-title">{currentCategory}</h1>
              <p className="page-subtitle">Quản lý và truy cập nhanh {filteredTools.length} công cụ.</p>
              
              {availableTags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1rem' }}>
                  {availableTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => {
                        setSelectedTags(prev => 
                          prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
                        );
                      }}
                      style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                        border: selectedTags.includes(tag) ? '1px solid var(--accent-color)' : '1px solid var(--border-color)',
                        background: selectedTags.includes(tag) ? 'var(--accent-color)' : 'var(--bg-secondary)',
                        color: selectedTags.includes(tag) ? '#fff' : 'var(--text-secondary)',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </header>

          <ToolGrid 
            tools={filteredTools} 
            onDelete={handleDeleteTool} 
            onToggleFavorite={handleToggleFavorite}
            onCompare={handleCompare}
            isAdmin={user?.role === 'admin'}
          />
        </div>
      </main>

      <ComparisonTray 
        compareList={compareList} 
        onRemove={handleRemoveCompare} 
        onCompareClick={() => setIsComparisonModalOpen(true)}
      />

      <ComparisonModal 
        isOpen={isComparisonModalOpen} 
        onClose={() => setIsComparisonModalOpen(false)} 
        tools={compareList} 
      />

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />

      <LiveActivityToast tools={tools} />

      <AddToolModal 
        categories={categories}
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSave={handleAddTool} 
      />

      <SettingsModal
        categories={categories}
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onDataChanged={refreshData}
      />

      <AiAssistant />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        profile={profile}
        tools={tools}
      />
    </div>
  );
}
