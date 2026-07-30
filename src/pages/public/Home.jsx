import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../../components/Sidebar';
import ToolGrid from '../../components/ToolGrid';
import AddToolModal from '../../components/AddToolModal';
import SettingsModal from '../../components/SettingsModal';
import ProfileModal from '../../components/ProfileModal';
import AiAssistant from '../../components/AiAssistant';
import ThemeToggle from '../../components/ThemeToggle';
import TrendingCarousel from '../../components/TrendingCarousel';
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
    // If not admin, maybe mark status as pending. For now just save.
    const toolWithStatus = {
      ...newTool,
      status: isAdmin ? 'approved' : 'pending',
      submittedBy: user?.uid || 'guest'
    };
    try {
      await saveTool(toolWithStatus);
      await refreshData();
      if (!isAdmin) {
        alert("Công cụ của bạn đã được gửi và đang chờ Admin duyệt!");
      } else {
        alert("Thêm công cụ thành công!");
      }
    } catch (err) {
      alert("Lỗi: Không thể thêm công cụ. Có thể do Firebase Rules chặn quyền ghi.");
      console.error(err);
    }
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
      const matchesSearch = (tool.title || tool.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (tool.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      
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
    <div className="app-container">
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
        <div className="top-header">
          <div className="search-bar-container">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              className="search-input" 
              placeholder="Tìm kiếm công cụ, tính năng..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="search-shortcut">⌘K</div>
          </div>
          
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
            <div style={{
              padding: '2.5rem',
              borderRadius: '24px',
              background: 'linear-gradient(135deg, rgba(100, 84, 168, 0.1) 0%, rgba(255, 126, 179, 0.05) 100%)',
              border: '1px solid var(--border-color)',
              marginBottom: '2rem',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'relative', zIndex: 1, maxWidth: '650px' }}>
                <h1 style={{ 
                  fontSize: '2.5rem', 
                  fontWeight: 800, 
                  marginBottom: '1rem',
                  background: 'linear-gradient(135deg, #6454a8 0%, #ff7eb3 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  lineHeight: 1.2
                }}>
                  Khám phá kho công cụ AI & Tiện ích đỉnh cao
                </h1>
                <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                  Chào mừng bạn đến với thư viện công cụ trực tuyến. Tại đây, chúng tôi tổng hợp và phân loại hàng trăm tiện ích thiết thực giúp nâng cao hiệu suất làm việc của bạn. Hãy đăng nhập để lưu trữ bộ công cụ yêu thích của riêng mình nhé!
                </p>
                {!user && (
                  <button 
                    onClick={() => setIsAuthModalOpen(true)}
                    className="btn btn-primary"
                    style={{ padding: '0.75rem 1.5rem', borderRadius: '12px', fontSize: '1rem', fontWeight: 600, background: 'linear-gradient(135deg, #7463c6, #ff7eb3)', border: 'none', boxShadow: '0 10px 20px rgba(116, 99, 198, 0.2)' }}
                  >
                    Bắt đầu sử dụng ngay
                  </button>
                )}
              </div>
              
              {/* Decorative elements */}
              <div style={{
                position: 'absolute',
                top: '-50px',
                right: '-50px',
                width: '300px',
                height: '300px',
                background: 'linear-gradient(135deg, #7463c6, #ff7eb3)',
                borderRadius: '50%',
                filter: 'blur(80px)',
                opacity: 0.15,
                zIndex: 0
              }}></div>
            </div>
          )}

          {currentCategory === 'Tất cả' && !searchQuery && selectedTags.length === 0 && (
            <TrendingCarousel tools={tools.filter(t => t.status !== 'pending' && t.status !== 'rejected')} />
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

          <ToolGrid tools={filteredTools} onDelete={handleDeleteTool} onToggleFavorite={handleToggleFavorite} isAdmin={isAdmin} />
        </div>
      </main>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

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
