import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { Users, LayoutDashboard, Settings, Layers, LogOut, ArrowLeft, PlusSquare } from 'lucide-react';

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
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={18} /> },
    { name: 'Quản lý Người dùng', path: '/admin/users', icon: <Users size={18} /> },
    { name: 'Quản lý Công cụ', path: '/admin/tools', icon: <PlusSquare size={18} /> },
    { name: 'Quản lý Danh mục', path: '/admin/categories', icon: <Layers size={18} /> },
    { name: 'Cài đặt hệ thống', path: '/admin/settings', icon: <Settings size={18} /> },
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: 'var(--bg-secondary)' }}>
      {/* Admin Sidebar */}
      <aside style={{ 
        width: '260px', 
        backgroundColor: 'var(--bg-primary)', 
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>Admin Panel</h2>
          <span style={{ fontSize: '0.8rem', color: 'var(--accent-color)' }}>Role: {profile?.role}</span>
        </div>
        
        <nav style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {navItems.map(item => (
            <Link 
              key={item.path}
              to={item.path}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.75rem 1rem', borderRadius: '8px',
                textDecoration: 'none',
                color: location.pathname === item.path ? '#fff' : 'var(--text-secondary)',
                backgroundColor: location.pathname === item.path ? 'var(--accent-color)' : 'transparent',
                transition: 'all 0.2s'
              }}
            >
              {item.icon} {item.name}
            </Link>
          ))}
        </nav>

        <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <Link to="/" className="btn btn-secondary" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', textDecoration: 'none' }}>
            <ArrowLeft size={16} /> Về trang khách
          </Link>
          <button onClick={handleLogout} className="btn btn-secondary" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', color: '#ef4444' }}>
            <LogOut size={16} /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
}
