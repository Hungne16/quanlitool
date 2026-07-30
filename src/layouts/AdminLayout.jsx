import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { 
  Users, LayoutDashboard, Settings, Layers, LogOut, ArrowLeft, 
  PlusSquare, Bell, Search, BarChart2, CheckSquare, Server,
  Cpu, HardDrive, Zap, ChevronDown
} from 'lucide-react';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useAuth();

  const handleLogout = async () => {
    if (window.confirm("Đăng xuất khỏi tài khoản admin?")) {
      await signOut(auth);
      navigate('/');
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Quản lý người dùng', path: '/admin/users', icon: <Users size={20} /> },
    { name: 'Quản lý công cụ', path: '/admin/tools', icon: <PlusSquare size={20} /> },
    { name: 'Quản lý danh mục', path: '/admin/categories', icon: <Layers size={20} /> },
    { name: 'Thống kê', path: '/admin/stats', icon: <BarChart2 size={20} /> },
    { name: 'Cài đặt', path: '/admin/settings', icon: <Settings size={20} /> },
  ];

  const systemStats = [
    { name: 'Storage', icon: <HardDrive size={16} />, value: 67 },
    { name: 'API', icon: <Server size={16} />, value: 81 },
    { name: 'CPU', icon: <Cpu size={16} />, value: 34 },
    { name: 'RAM', icon: <Zap size={16} />, value: 52 },
  ];

  return (
    <div className="admin-layout" style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      backgroundColor: '#f6f8fb',
      fontFamily: "'Inter', sans-serif",
      color: '#334155'
    }}>
      {/* Left Sidebar */}
      <aside style={{ 
        width: '260px',
        background: '#fff',
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem 0',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto'
      }}>
        {/* Logo */}
        <div style={{ padding: '0 1.5rem', marginBottom: '2.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ 
            width: '40px', height: '40px', borderRadius: '12px', 
            background: '#6366f1', color: 'white', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(99, 102, 241, 0.3)'
          }}>
            <Settings size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1e293b', margin: 0 }}>QuanliTool</h1>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 500 }}>Admin</span>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '0 1rem' }}>
          {navItems.map(item => {
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link 
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  padding: '0.85rem 1rem',
                  borderRadius: '12px',
                  color: isActive ? '#6366f1' : '#64748b',
                  backgroundColor: isActive ? '#eff2ff' : 'transparent',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.95rem',
                  textDecoration: 'none',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = '#f8fafc';
                    e.currentTarget.style.color = '#475569';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#64748b';
                  }
                }}
              >
                {item.icon}
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* System Stats Widget */}
        <div style={{ marginTop: 'auto', padding: '0 1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ 
            background: '#f8fafc', borderRadius: '16px', padding: '1.25rem',
            border: '1px solid #f1f5f9'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155', margin: 0 }}>Thống kê hệ thống</h4>
              <BarChart2 size={16} color="#6366f1" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {systemStats.map((stat, idx) => (
                <div key={idx}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {stat.icon}
                      <span>{stat.name}</span>
                    </div>
                    <span>{stat.value}%</span>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${stat.value}%`, height: '100%', background: '#6366f1', borderRadius: '4px' }}></div>
                  </div>
                </div>
              ))}
            </div>

            <button style={{ 
              width: '100%', padding: '0.75rem', marginTop: '1.5rem',
              background: '#6366f1', color: 'white', borderRadius: '10px',
              border: 'none', fontWeight: 600, fontSize: '0.85rem',
              display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem',
              cursor: 'pointer'
            }}>
              <CheckSquare size={16} /> Xem báo cáo
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header */}
        <header style={{ 
          height: '75px', background: '#fff', borderBottom: '1px solid #e2e8f0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 2.5rem', position: 'sticky', top: 0, zIndex: 40
        }}>
          {/* Search Bar */}
          <div style={{ 
            display: 'flex', alignItems: 'center', background: '#f1f5f9',
            padding: '0.75rem 1.25rem', borderRadius: '24px', width: '300px',
            gap: '0.75rem'
          }}>
            <Search size={18} color="#94a3b8" />
            <input 
              type="text" 
              placeholder="Tìm kiếm..." 
              style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: '0.9rem', color: '#334155' }}
            />
          </div>

          {/* Right Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <div style={{ position: 'relative', cursor: 'pointer' }}>
              <Bell size={22} color="#64748b" />
              <div style={{ 
                position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px',
                background: '#ef4444', borderRadius: '50%', border: '2px solid #fff'
              }}></div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer' }}>
              <img 
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" 
                alt="Admin" 
                style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e2e8f0' }}
              />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>Admin</span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Quản trị viên</span>
              </div>
              <ChevronDown size={16} color="#64748b" />
            </div>
            
            <button 
              onClick={handleLogout}
              style={{ 
                background: 'transparent', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444',
                fontSize: '0.9rem', fontWeight: 500, padding: '0.5rem'
              }}
              title="Đăng xuất"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main style={{ flex: 1, padding: '2.5rem', overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
