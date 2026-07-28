import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from '../../components/Sidebar';
import ToolGrid from '../../components/ToolGrid';
import AddToolModal from '../../components/AddToolModal';
import SettingsModal from '../../components/SettingsModal';
import AiAssistant from '../../components/AiAssistant';
import { getTools, getCategories, saveTool, deleteTool, toggleFavorite, initStorage } from '../../utils/storage';
import { Search, Bell, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import AuthModal from '../../components/AuthModal';
import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { Link } from 'react-router-dom';

export default function Home() {
  const [tools, setTools] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentCategory, setCurrentCategory] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  
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

  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      // Filter by status if not admin (legacy tools without status are assumed approved)
      const isPending = tool.status === 'pending';
      if (!isAdmin && isPending) return false;

      let matchesCategory = false;
      
      const isFavorite = profile?.favorites?.includes(tool.id);
      
      if (currentCategory === 'Tất cả') {
        matchesCategory = true;
      } else if (currentCategory === 'Yêu thích') {
        matchesCategory = isFavorite;
      } else {
        matchesCategory = tool.category === currentCategory;
      }

      const matchesSearch = tool.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            tool.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    }).map(tool => ({
      ...tool,
      isFavorite: profile?.favorites?.includes(tool.id) || false
    }));
  }, [tools, currentCategory, searchQuery, isAdmin, profile]);

  return (
    <div className="app-container">
      <Sidebar 
        categories={categories}
        currentCategory={currentCategory} 
        setCurrentCategory={setCurrentCategory}
        onAddClick={() => {
          if (!user) {
            setIsAuthModalOpen(true);
          } else {
            setIsAddModalOpen(true);
          }
        }}
        onSettingsClick={() => setIsSettingsModalOpen(true)}
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
            <button className="btn-icon">
              <Bell size={20} />
            </button>
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  {profile?.role === 'admin' ? '👑 ' : ''}{user.email}
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
          <header className="page-header">
            <div>
              <h1 className="page-title">{currentCategory}</h1>
              <p className="page-subtitle">Quản lý và truy cập nhanh {filteredTools.length} công cụ.</p>
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
    </div>
  );
}
