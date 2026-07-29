import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { Users, LayoutDashboard, Settings, Layers, LogOut, ArrowLeft, PlusSquare, Bell, Home } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

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
    { name: 'Dashboard', path: '/admin', icon: <Home size={22} /> },
    { name: 'Người dùng', path: '/admin/users', icon: <Users size={22} /> },
    { name: 'Công cụ', path: '/admin/tools', icon: <PlusSquare size={22} /> },
    { name: 'Danh mục', path: '/admin/categories', icon: <Layers size={22} /> },
    { name: 'Cài đặt', path: '/admin/settings', icon: <Settings size={22} /> },
  ];

  return (
    <div className="admin-layout" style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      backgroundColor: 'var(--bg-admin)', /* Will define this in index.css */
      fontFamily: "'Inter', sans-serif" 
    }}>
      {/* Floating Admin Sidebar */}
      <aside className="admin-sidebar" style={{ 
        width: '90px',
        margin: '1.5rem',
        marginRight: '1rem',
        borderRadius: '35px',
        background: 'linear-gradient(180deg, #7463c6 0%, #564696 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '2rem 0',
        boxShadow: '0 20px 40px rgba(86, 70, 150, 0.3)',
        position: 'relative',
        zIndex: 50
      }}>
        {/* Top Notification Icon */}
        <div style={{ marginBottom: '3rem', position: 'relative' }}>
          <div style={{
            width: '45px', height: '45px', borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.2)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            color: 'white', cursor: 'pointer'
          }}>
            <Bell size={20} />
          </div>
        </div>

        {/* Navigation Icons */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link 
                key={item.path}
                to={item.path}
                title={item.name}
                style={{
                  width: '50px', height: '50px',
                  borderRadius: '16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: isActive ? '#fff' : 'rgba(255,255,255,0.5)',
                  backgroundColor: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
                  boxShadow: isActive ? '0 10px 20px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.3s ease',
                  textDecoration: 'none'
                }}
              >
                {item.icon}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: 'auto' }}>
          <Link to="/" title="Về trang khách" style={{
            width: '50px', height: '50px',
            borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'rgba(255,255,255,0.7)',
            transition: 'all 0.3s ease',
            textDecoration: 'none'
          }}>
            <ArrowLeft size={22} />
          </Link>
          <button 
            onClick={handleLogout} 
            title="Đăng xuất"
            style={{
              width: '50px', height: '50px',
              borderRadius: '16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'rgba(255,255,255,0.7)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            <LogOut size={22} />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ 
        flex: 1, 
        overflowY: 'auto',
        padding: '1.5rem',
        paddingLeft: '0.5rem', /* reduce space near the floating sidebar */
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Outlet />
      </main>

      {/* Mobile Styles added globally or via module, but let's handle in index.css */}
    </div>
  );
}
