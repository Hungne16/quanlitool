import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { getUnreadReports, markReportAsRead } from '../utils/storage';
import VerticalDock from '../components/VerticalDock';
import { 
  Users, LayoutDashboard, Settings, Layers, LogOut, ArrowLeft, 
  PlusSquare, Bell, Search, BarChart2, CheckSquare, Server,
  Cpu, HardDrive, Zap, ChevronDown, Home, Check
} from 'lucide-react';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { profile } = useAuth();
  
  const [reports, setReports] = useState([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      const data = await getUnreadReports();
      setReports(data);
    };
    fetchReports();
    
    // Optional: Refresh reports every minute
    const interval = setInterval(fetchReports, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleReadReport = async (reportId) => {
    await markReportAsRead(reportId);
    setReports(prev => prev.filter(r => r.id !== reportId));
  };

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
        width: '90px',
        background: '#fff',
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '1.5rem 0',
        position: 'sticky',
        top: 0,
        height: '100vh',
        overflowY: 'auto',
        overflowX: 'visible',
        zIndex: 40
      }}>
        {/* Logo */}
        <div style={{ marginBottom: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ 
            width: '40px', height: '40px', borderRadius: '12px', 
            background: '#6366f1', color: 'white', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(99, 102, 241, 0.3)'
          }}>
            <Settings size={22} />
          </div>
        </div>

        {/* Navigation */}
        <div style={{ width: '100%', flex: 1, display: 'flex', justifyContent: 'center' }}>
          <VerticalDock items={navItems} />
        </div>

        {/* System Stats Widget - Hidden for slim sidebar */}
        {false && (
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
        )}
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
            <button 
              onClick={() => navigate('/')}
              style={{ 
                background: '#f1f5f9', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#334155',
                fontSize: '0.85rem', fontWeight: 600, padding: '0.5rem 1rem', borderRadius: '20px',
                transition: 'all 0.2s'
              }}
              title="Về trang khách"
            >
              <Home size={16} /> Trang khách
            </button>

            <div style={{ position: 'relative' }}>
              <div 
                style={{ cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <Bell size={22} color="#64748b" />
                {reports.length > 0 && (
                  <div style={{ 
                    position: 'absolute', top: '2px', right: '4px', width: '18px', height: '18px',
                    background: '#ef4444', borderRadius: '50%', border: '2px solid #fff',
                    color: 'white', fontSize: '0.6rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    {reports.length}
                  </div>
                )}
              </div>
              
              {/* Reports Dropdown */}
              {isDropdownOpen && (
                <div style={{
                  position: 'absolute', top: '50px', right: '-10px', width: '320px',
                  background: 'white', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                  border: '1px solid #e2e8f0', zIndex: 100, overflow: 'hidden'
                }}>
                  <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#1e293b' }}>Báo cáo chưa đọc</h4>
                    <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, background: '#e2e8f0', padding: '0.2rem 0.5rem', borderRadius: '12px' }}>{reports.length} mới</span>
                  </div>
                  
                  <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {reports.length === 0 ? (
                      <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                        Không có báo cáo nào mới.
                      </div>
                    ) : (
                      reports.map(report => (
                        <div key={report.id} style={{ padding: '1rem', borderBottom: '1px solid #f1f5f9', display: 'flex', gap: '0.75rem' }}>
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', marginTop: '6px', flexShrink: 0 }}></div>
                          <div style={{ flex: 1 }}>
                            <h5 style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem', color: '#1e293b' }}>{report.toolName}</h5>
                            <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.8rem', color: '#64748b', lineHeight: 1.4 }}>{report.reason}</p>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                                {new Date(report.createdAt).toLocaleDateString('vi-VN')}
                              </span>
                              <button 
                                onClick={() => handleReadReport(report.id)}
                                style={{ background: 'transparent', border: '1px solid #cbd5e1', padding: '0.2rem 0.5rem', borderRadius: '12px', fontSize: '0.7rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#64748b', transition: 'all 0.2s' }}
                                onMouseEnter={e => { e.currentTarget.style.background = '#6366f1'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = '#6366f1'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748b'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                              >
                                <Check size={12} /> Đã xử lý
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
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
