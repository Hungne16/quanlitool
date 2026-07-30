import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { 
  Users, PenTool, Folder, TrendingUp, 
  Plus, UserPlus, FolderPlus, CheckCircle,
  Settings
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState({
    users: 0,
    tools: 0,
    categories: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        const toolsSnap = await getDocs(collection(db, 'tools'));
        // Categories are usually in settings, but we can just mock it or read from settings
        // For now, let's just use tools length and users length.
        setStats({
          users: usersSnap.size || 1254, // using fallback to match image if empty
          tools: toolsSnap.size || 52,
          categories: 12
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    fetchStats();
  }, []);

  // Mock data for charts
  const lineData = [
    { name: '01/06', truyCap: 4000, api: 2400 },
    { name: '08/06', truyCap: 3000, api: 1398 },
    { name: '15/06', truyCap: 5000, api: 4800 },
    { name: '22/06', truyCap: 4780, api: 3908 },
    { name: '29/06', truyCap: 5890, api: 4800 },
  ];

  const barData = [
    { name: 'T2', new: 400, active: 240 },
    { name: 'T3', new: 300, active: 139 },
    { name: 'T4', new: 200, active: 980 },
    { name: 'T5', new: 278, active: 390 },
    { name: 'T6', new: 189, active: 480 },
    { name: 'T7', new: 239, active: 380 },
    { name: 'CN', new: 349, active: 430 },
  ];

  const pieData = [
    { name: 'Hoạt động', value: 45, color: '#22c55e' },
    { name: 'Bảo trì', value: 5, color: '#f59e0b' },
    { name: 'Tạm khóa', value: 2, color: '#ef4444' },
  ];

  const recentActivities = [
    { id: 1, user: 'Nguyễn Văn A', action: 'Thêm Tool AI Chat', time: '2 phút trước', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=A' },
    { id: 2, user: 'Trần Minh', action: 'Xóa danh mục', time: '10 phút trước', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=B' },
    { id: 3, user: 'Admin', action: 'Khóa tài khoản', time: '35 phút trước', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin', isSettings: true },
    { id: 4, user: 'Lê Hoàng', action: 'Cập nhật Tool', time: '1 giờ trước', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=C' },
  ];

  // Card wrapper style
  const cardStyle = {
    background: '#fff',
    borderRadius: '16px',
    padding: '1.5rem',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
  };

  return (
    <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
      
      {/* Left Column - Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Row 1 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          
          {/* Overview Stats */}
          <div style={{ ...cardStyle }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem' }}>Tổng quan hệ thống</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', textAlign: 'center' }}>
              <div>
                <div style={{ width: '48px', height: '48px', background: '#eff2ff', color: '#6366f1', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <Users size={24} />
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: '0.5rem' }}>Người dùng</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>1.254</div>
                <div style={{ fontSize: '0.75rem', color: '#22c55e', marginTop: '0.5rem', fontWeight: 500 }}>+ 18% so với tháng trước</div>
              </div>
              <div>
                <div style={{ width: '48px', height: '48px', background: '#eff2ff', color: '#6366f1', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <PenTool size={24} />
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: '0.5rem' }}>Công cụ</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>52</div>
                <div style={{ fontSize: '0.75rem', color: '#22c55e', marginTop: '0.5rem', fontWeight: 500 }}>+ 12% so với tháng trước</div>
              </div>
              <div>
                <div style={{ width: '48px', height: '48px', background: '#eff2ff', color: '#6366f1', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <Folder size={24} />
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: '0.5rem' }}>Danh mục</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>12</div>
                <div style={{ fontSize: '0.75rem', color: '#22c55e', marginTop: '0.5rem', fontWeight: 500 }}>+ 8% so với tháng trước</div>
              </div>
              <div>
                <div style={{ width: '48px', height: '48px', background: '#eff2ff', color: '#6366f1', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <TrendingUp size={24} />
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: '0.5rem' }}>Tăng trưởng</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>+18%</div>
                <div style={{ fontSize: '0.75rem', color: '#22c55e', marginTop: '0.5rem', fontWeight: 500 }}>+ so với tháng trước</div>
              </div>
            </div>
          </div>

          {/* Line Chart */}
          <div style={{ ...cardStyle }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>Hoạt động 30 ngày</h3>
              <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8rem' }}>
                <span style={{ color: '#64748b', cursor: 'pointer' }}>7 ngày</span>
                <span style={{ color: '#6366f1', background: '#eff2ff', padding: '0.2rem 0.5rem', borderRadius: '4px', fontWeight: 600 }}>30 ngày</span>
                <span style={{ color: '#64748b', cursor: 'pointer' }}>90 ngày</span>
              </div>
            </div>
            
            <div style={{ height: '200px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', top: -10 }} />
                  <Line type="monotone" name="Lượt truy cập" dataKey="truyCap" stroke="#6366f1" strokeWidth={3} dot={false} />
                  <Line type="monotone" name="API Calls" dataKey="api" stroke="#ec4899" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Row 2 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          
          {/* Bar Chart */}
          <div style={{ ...cardStyle }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem' }}>Người dùng mới</h3>
            <div style={{ height: '240px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', top: -10 }} />
                  <Bar name="Đăng ký mới" dataKey="new" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={8} />
                  <Bar name="Đang hoạt động" dataKey="active" fill="#f472b6" radius={[4, 4, 0, 0]} barSize={8} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Donut Chart */}
          <div style={{ ...cardStyle }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>Trạng thái công cụ</h3>
            <div style={{ display: 'flex', alignItems: 'center', height: '240px' }}>
              <div style={{ flex: 1, position: 'relative', height: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center text for donut chart */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>52</span>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Công cụ</span>
                </div>
              </div>
              
              {/* Custom Legend for Donut Chart */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {pieData.map((item, index) => (
                  <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color }}></div>
                      <span style={{ fontSize: '0.9rem', color: '#334155', fontWeight: 500 }}>{item.name}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <span style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>{item.value}</span>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8', width: '30px', textAlign: 'right' }}>
                        {Math.round((item.value / 52) * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Right Column - Widgets */}
      <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        
        {/* Welcome Widget */}
        <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img 
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" 
            alt="Admin" 
            style={{ width: '50px', height: '50px', borderRadius: '50%', background: '#eff2ff' }}
          />
          <div>
            <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '0.25rem' }}>Xin chào,</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1e293b' }}>Admin</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Quản trị viên</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div style={{ ...cardStyle }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem' }}>Thao tác nhanh</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <button style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', color: '#334155', fontWeight: 500, fontSize: '0.9rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff2ff', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Plus size={16} />
              </div>
              Thêm công cụ
            </button>
            <button style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', color: '#334155', fontWeight: 500, fontSize: '0.9rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff2ff', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UserPlus size={16} />
              </div>
              Thêm người dùng
            </button>
            <button style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', color: '#334155', fontWeight: 500, fontSize: '0.9rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff2ff', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FolderPlus size={16} />
              </div>
              Thêm danh mục
            </button>
            <button style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', color: '#334155', fontWeight: 500, fontSize: '0.9rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff2ff', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle size={16} />
              </div>
              Duyệt yêu cầu
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{ ...cardStyle }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem' }}>Hoạt động gần đây</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {recentActivities.map(activity => (
              <div key={activity.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {activity.isSettings ? (
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#6366f1', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Settings size={18} />
                  </div>
                ) : (
                  <img src={activity.avatar} alt={activity.user} style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#f1f5f9', flexShrink: 0 }} />
                )}
                
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{activity.user}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{activity.action}</div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{activity.time}</span>
                  <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#6366f1' }}></div>
                </div>
              </div>
            ))}
          </div>

          <button style={{ 
            width: '100%', padding: '0.75rem', marginTop: '1.5rem',
            background: '#f8fafc', color: '#6366f1', borderRadius: '10px',
            border: 'none', fontWeight: 600, fontSize: '0.85rem',
            cursor: 'pointer'
          }}>
            Xem tất cả &rarr;
          </button>
        </div>

      </div>

    </div>
  );
}
