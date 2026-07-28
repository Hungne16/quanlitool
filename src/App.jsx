import React, { useState, useEffect, useMemo } from 'react';
import { Search, Bell, User as UserIcon } from 'lucide-react';
import Sidebar from './components/Sidebar';
import ToolGrid from './components/ToolGrid';
import AddToolModal from './components/AddToolModal';
import SettingsModal from './components/SettingsModal';
import AiAssistant from './components/AiAssistant';
import { getTools, saveTool, deleteTool, initStorage, DEFAULT_CATEGORIES } from './utils/storage';

function App() {
  const [tools, setTools] = useState([]);
  const [currentCategory, setCurrentCategory] = useState(DEFAULT_CATEGORIES[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  useEffect(() => {
    initStorage();
    setTools(getTools());
  }, []);

  const handleAddTool = (newTool) => {
    saveTool(newTool);
    setTools(getTools()); // Refresh from storage
  };

  const handleDeleteTool = (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa công cụ này?')) {
      deleteTool(id);
      setTools(getTools());
    }
  };

  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      const matchesCategory = currentCategory === 'Tất cả' || tool.category === currentCategory;
      const matchesSearch = tool.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            tool.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [tools, currentCategory, searchQuery]);

  return (
    <div className="app-container">
      <Sidebar 
        currentCategory={currentCategory} 
        setCurrentCategory={setCurrentCategory}
        onAddClick={() => setIsAddModalOpen(true)}
        onSettingsClick={() => setIsSettingsModalOpen(true)}
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
            <div className="user-avatar">
              <UserIcon size={20} />
            </div>
          </div>
        </div>

        <div className="content-wrapper">
          <header className="page-header">
            <div>
              <h1 className="page-title">{currentCategory}</h1>
              <p className="page-subtitle">Quản lý và truy cập nhanh {filteredTools.length} công cụ yêu thích của bạn.</p>
            </div>
          </header>

          <ToolGrid tools={filteredTools} onDelete={handleDeleteTool} />
        </div>
      </main>

      <AddToolModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSave={handleAddTool} 
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      <AiAssistant />
    </div>
  );
}

export default App;
