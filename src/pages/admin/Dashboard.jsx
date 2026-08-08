import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { getCategories, getAnalyticsData } from '../../utils/storage';
import { useNavigate } from 'react-router-dom';
import { 
  Users, PenTool, Folder, TrendingUp, 
  Plus, UserPlus, FolderPlus, CheckCircle,
  MessageSquare, MousePointerClick, Clock
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend, PieChart, Pie, Cell
} from 'recharts';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    users: 0,
    tools: 0,
    categories: 0,
    activeTools: 0,
    lockedTools: 0,
    topTools: [],
    recentChats: [],
    analytics: [],
    toolsByCategory: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        const toolsSnap = await getDocs(collection(db, 'tools'));
        const categoriesData = await getCategories();
        const analyticsData = await getAnalyticsData();
        
        let active = 0;
        let maintenance = 0;
        let locked = 0;

        const toolsList = [];
        const categoryCounts = {};
        
        // Initialize categoryCounts with 0 for all categories
        categoriesData.forEach(cat => categoryCounts[cat] = 0);

        toolsSnap.forEach(doc => {
          const data = doc.data();
          toolsList.push({ id: doc.id, ...data });
          if (data.status === 'Bảo trì') maintenance++;
          else if (data.status === 'Tạm khóa') locked++;
          else active++;
          
          if (data.category) {
            categoryCounts[data.category] = (categoryCounts[data.category] || 0) + 1;
          }
        });
        
        const toolsByCategory = Object.keys(categoryCounts).map(cat => ({
          name: cat,
          count: categoryCounts[cat]
        }));

        // Get Top Tools by Clicks
        const topTools = [...toolsList].sort((a, b) => (b.clicks || 0) - (a.clicks || 0)).slice(0, 5);

        // Fetch AI Chat Logs
        const chatsSnap = await getDocs(collection(db, 'ai_chat_logs'));
        const chatsList = [];
        chatsSnap.forEach(doc => {
          chatsList.push({ id: doc.id, ...doc.data() });
        });
        chatsList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        const recentChats = chatsList.slice(0, 5);

        setStats({
          users: usersSnap.size || 0,
          tools: toolsSnap.size || 0,
          categories: categoriesData.length || 0,
          activeTools: active,
          maintenanceTools: maintenance,
          lockedTools: locked,
          topTools,
          recentChats,
          analytics: analyticsData,
          toolsByCategory
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    fetchStats();
  }, []);

  // Prepare Real Analytics data for LineChart
  const lineData = stats.analytics.length > 0 
    ? stats.analytics.map(item => {
        const d = new Date(item.date);
        return {
          name: `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}`,
          truyCap: item.pageViews || 0
        };
      })
    : [{ 
        name: new Date().toLocaleDateString('vi-VN', {day: '2-digit', month: '2-digit'}), 
        truyCap: 1 
      }];

  // Prepare Real Tools by Category data for BarChart
  const barData = stats.toolsByCategory
    .filter(item => item.count > 0)
    .sort((a, b) => b.count - a.count);

  const pieData = [
    { name: 'Hoạt động', value: stats.activeTools || 1, color: '#22c55e' }, // Fallback to 1 to show a full circle if 0
    { name: 'Bảo trì', value: stats.maintenanceTools, color: '#f59e0b' },
    { name: 'Tạm khóa', value: stats.lockedTools, color: '#ef4444' },
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', textAlign: 'center' }}>
              <div>
                <div style={{ width: '48px', height: '48px', background: '#eff2ff', color: '#6366f1', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <Users size={24} />
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: '0.5rem' }}>Người dùng</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>{stats.users}</div>
              </div>
              <div>
                <div style={{ width: '48px', height: '48px', background: '#eff2ff', color: '#6366f1', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <PenTool size={24} />
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: '0.5rem' }}>Công cụ</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>{stats.tools}</div>
              </div>
              <div>
                <div style={{ width: '48px', height: '48px', background: '#eff2ff', color: '#6366f1', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <Folder size={24} />
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginBottom: '0.5rem' }}>Danh mục</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>{stats.categories}</div>
              </div>
            </div>
          </div>

          {/* Line Chart */}
          <div style={{ ...cardStyle }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', margin: 0 }}>Lượt truy cập trang</h3>
            </div>
            
            <div style={{ height: '200px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', top: -10 }} />
                  <Line type="monotone" name="Lượt truy cập" dataKey="truyCap" stroke="#6366f1" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Row 2 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          
          {/* Bar Chart */}
          <div style={{ ...cardStyle }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem' }}>Công cụ theo danh mục</h3>
            <div style={{ height: '240px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} angle={-30} textAnchor="end" height={60} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', top: -10 }} />
                  <Bar name="Số lượng công cụ" dataKey="count" fill="#ec4899" radius={[4, 4, 0, 0]} barSize={20} />
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
                  <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b' }}>{stats.tools}</span>
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
                      <span style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>{item.name === 'Hoạt động' ? stats.activeTools : item.value}</span>
                      <span style={{ fontSize: '0.8rem', color: '#94a3b8', width: '30px', textAlign: 'right' }}>
                        {stats.tools > 0 ? Math.round(((item.name === 'Hoạt động' ? stats.activeTools : item.value) / stats.tools) * 100) : 0}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Row 3 - New Analytics */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Top Clicked Tools */}
          <div style={{ ...cardStyle }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MousePointerClick size={18} color="#6366f1" /> Top Công Cụ Nổi Bật
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {stats.topTools.map((tool, idx) => (
                <div key={tool.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: idx < stats.topTools.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#eff2ff', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700 }}>
                      {idx + 1}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#1e293b', fontSize: '0.95rem' }}>{tool.title || tool.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{tool.category}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#10b981', fontWeight: 600, fontSize: '0.9rem' }}>
                    {tool.clicks || 0} <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 400 }}>clicks</span>
                  </div>
                </div>
              ))}
              {stats.topTools.length === 0 && (
                <div style={{ color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center', padding: '1rem 0' }}>Chưa có dữ liệu clicks</div>
              )}
            </div>
          </div>

          {/* Recent AI Searches */}
          <div style={{ ...cardStyle }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageSquare size={18} color="#ec4899" /> Nhu cầu tìm kiếm gần đây
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {stats.recentChats.map((chat) => (
                <div key={chat.id} style={{ padding: '0.75rem', background: '#f8fafc', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#334155' }}>"{chat.query}"</span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock size={12} /> {new Date(chat.timestamp).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    Phản hồi: <span style={{ color: '#ec4899' }}>{chat.toolsCount || 0} công cụ được gợi ý</span>
                  </div>
                </div>
              ))}
              {stats.recentChats.length === 0 && (
                <div style={{ color: '#94a3b8', fontSize: '0.9rem', textAlign: 'center', padding: '1rem 0' }}>Chưa có dữ liệu chat</div>
              )}
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
            <button 
              onClick={() => navigate('/admin/tools')}
              style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', color: '#334155', fontWeight: 500, fontSize: '0.9rem' }}
            >
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff2ff', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Plus size={16} />
              </div>
              Thêm công cụ
            </button>
            <button 
              onClick={() => navigate('/admin/users')}
              style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', color: '#334155', fontWeight: 500, fontSize: '0.9rem' }}
            >
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff2ff', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UserPlus size={16} />
              </div>
              Thêm người dùng
            </button>
            <button 
              onClick={() => navigate('/admin/categories')}
              style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', color: '#334155', fontWeight: 500, fontSize: '0.9rem' }}
            >
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff2ff', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FolderPlus size={16} />
              </div>
              Thêm danh mục
            </button>
            <button 
              onClick={() => navigate('/admin/tools')}
              style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem 1rem', background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s', color: '#334155', fontWeight: 500, fontSize: '0.9rem' }}
            >
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff2ff', color: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle size={16} />
              </div>
              Duyệt yêu cầu
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}

