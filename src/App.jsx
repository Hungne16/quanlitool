import React, { useState, useEffect, useMemo } from 'react';
import { Search, Bell, User as UserIcon } from 'lucide-react';
import Sidebar from './components/Sidebar';
import ToolGrid from './components/ToolGrid';
import AddToolModal from './components/AddToolModal';
import SettingsModal from './components/SettingsModal';
import AiAssistant from './components/AiAssistant';
import AuthModal from './components/AuthModal';
import { getTools, getCategories, saveTool, deleteTool, toggleFavorite, initStorage } from './utils/storage';
import { auth } from './config/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

function App() {
  const [tools, setTools] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentCategory, setCurrentCategory] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAdmin(true);
        setUserEmail(user.email);
      } else {
        setIsAdmin(false);
        setUserEmail('');
      }
    });
    return () => unsubscribe();
  }, []);

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
    setTools(fetchedTools);
    setCategories(fetchedCategories);
  };

  const handleAddTool = async (newTool) => {
    await saveTool(newTool);
    await refreshData();
  };

  const handleDeleteTool = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa công cụ này?')) {
      await deleteTool(id);
      await refreshData();
    }
  };

  const handleToggleFavorite = async (tool) => {
    await toggleFavorite(tool.id, tool.isFavorite);
    await refreshData();
  };

  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      let matchesCategory = false;
      if (currentCategory === 'Tất cả') {
        matchesCategory = true;
      } else if (currentCategory === 'Yêu thích') {
        matchesCategory = tool.isFavorite === true;
      } else {
        matchesCategory = tool.category === currentCategory;
      }

      const matchesSearch = tool.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            tool.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [tools, currentCategory, searchQuery]);

  return (
    <div className="app-container">
      <Sidebar 
        categories={categories}
        currentCategory={currentCategory} 
        setCurrentCategory={setCurrentCategory}
        onAddClick={() => setIsAddModalOpen(true)}
        onSettingsClick={() => setIsSettingsModalOpen(true)}
        isAdmin={isAdmin}
      />
      
      <main className="main-content">
        {/* Top Header */}
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
            {/* keyboard shortcut hint */}
            <div className="search-shortcut">⌘K</div>
          </div>
          
          <div className="header-actions">
            <button className="btn-icon">
              <Bell size={20} />
            </button>
            {isAdmin ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{userEmail}</span>
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
                <UserIcon size={16} /> Admin
              </button>
            )}
          </div>
        </div>

        <div className="content-wrapper">
          <header className="page-header">
            <div>
              <h1 className="page-title">{currentCategory}</h1>
              <p className="page-subtitle">Quản lý và truy cập nhanh {filteredTools.length} công cụ yêu thích của bạn.</p>
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

export default App;
