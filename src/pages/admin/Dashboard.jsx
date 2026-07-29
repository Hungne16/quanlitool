import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Users, Wrench, Layers, CheckCircle, ChevronDown, Activity, ChevronRight, UserPlus, MapPin, Play, Mail } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState({ users: 0, tools: 0, pending: 0, categories: 0 });
  const [recentUsers, setRecentUsers] = useState([]);
  
  // Fake chart data for the overview
  const data = [
    { name: 'Jan', steps: 4000 },
    { name: 'Feb', steps: 3000 },
    { name: 'Mar', steps: 2000 },
    { name: 'Apr', steps: 9178 },
    { name: 'May', steps: 1890 },
    { name: 'Jun', steps: 2390 },
    { name: 'Jul', steps: 3490 },
    { name: 'Aug', steps: 5000 },
    { name: 'Sep', steps: 4000 },
    { name: 'Oct', steps: 3000 },
  ];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        const toolsSnap = await getDocs(collection(db, 'tools'));
        const catsSnap = await getDocs(collection(db, 'settings'));

        let pendingCount = 0;
        toolsSnap.forEach(doc => {
          if (doc.data().status === 'pending') pendingCount++;
        });

        let catCount = 0;
        catsSnap.forEach(doc => {
          if (doc.id === 'categories') {
            catCount = doc.data().list?.length || 0;
          }
        });

        setStats({
          users: usersSnap.size,
          tools: toolsSnap.size,
          pending: pendingCount,
          categories: catCount
        });

        // Fetch recent active users (fake order by email for now if no createdAt)
        const userQ = query(collection(db, 'users'), limit(4));
        const uSnap = await getDocs(userQ);
        const uList = [];
        uSnap.forEach(d => {
          uList.push({ id: d.id, ...d.data() });
        });
        setRecentUsers(uList);

      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div style={{ display: 'flex', gap: '2rem', flex: 1, paddingRight: '1.5rem' }}>
      
      {/* Main Dashboard Content (Left) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.2rem' }}>Primary</p>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-primary)' }}>Dashboard</h1>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ 
              background: 'var(--bg-primary)', padding: '0.6rem 1.2rem', 
              borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '0.5rem',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <span style={{ color: 'var(--text-muted)' }}>🔍</span>
              <input type="text" placeholder="Search" style={{ 
                border: 'none', background: 'transparent', outline: 'none', 
                color: 'var(--text-primary)', width: '150px' 
              }} />
            </div>
            <div style={{ 
              width: '40px', height: '40px', borderRadius: '50%', 
              background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center',
              overflow: 'hidden'
            }}>
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="Admin" style={{ width: '100%', height: '100%' }} />
            </div>
          </div>
        </div>

        {/* Top Widgets */}
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          
          {/* Big Overview Chart */}
          <div style={{ 
            flex: '2 1 400px', background: 'linear-gradient(135deg, #60519f, #4a3e7a)',
            borderRadius: '30px', padding: '1.5rem', position: 'relative', overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(96, 81, 159, 0.3)', color: 'white',
            display: 'flex', flexDirection: 'column'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Thống kê truy cập (Overview)</h2>
              <div style={{ background: 'rgba(255,255,255,0.1)', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                Monthly <ChevronDown size={14} />
              </div>
            </div>
            
            <div style={{ flex: 1, width: '100%', height: '150px', marginLeft: '-20px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSteps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff7eb3" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ff7eb3" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip contentStyle={{ background: '#333', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  <Area type="monotone" dataKey="steps" stroke="#ff7eb3" strokeWidth={3} fillOpacity={1} fill="url(#colorSteps)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div style={{ 
              display: 'flex', justifyContent: 'space-around', marginTop: '1rem',
              background: 'rgba(0,0,0,0.15)', borderRadius: '20px', padding: '1rem', backdropFilter: 'blur(10px)',
              flexWrap: 'wrap', gap: '1rem'
            }}>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>Công cụ</p>
                <p style={{ fontSize: '1.4rem', fontWeight: 700 }}>{stats.tools} <span style={{ fontSize: '1rem', fontWeight: 400 }}>T</span></p>
              </div>
              <div style={{ textAlign: 'center', borderLeft: '1px solid rgba(255,255,255,0.1)', borderRight: '1px solid rgba(255,255,255,0.1)', padding: '0 2rem' }}>
                <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>Lượt dùng</p>
                <p style={{ fontSize: '1.4rem', fontWeight: 700 }}>9.178 <span style={{ fontSize: '1rem', fontWeight: 400 }}>St</span></p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>Mục tiêu</p>
                <p style={{ fontSize: '1.4rem', fontWeight: 700 }}>9.200 <span style={{ fontSize: '1rem', fontWeight: 400 }}>St</span></p>
              </div>
            </div>
          </div>

          {/* Right Side Cards */}
          <div style={{ flex: '1 1 250px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div style={{ 
              background: '#6454a8', borderRadius: '30px', padding: '1.5rem',
              display: 'flex', alignItems: 'center', gap: '1rem', color: 'white',
              boxShadow: '0 15px 30px rgba(100, 84, 168, 0.3)'
            }}>
              <div style={{ background: 'rgba(255,255,255,0.2)', width: '60px', height: '60px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Wrench size={28} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Tổng Công Cụ</h3>
                <p style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stats.tools}</p>
              </div>
            </div>

            <div style={{ 
              background: 'linear-gradient(135deg, #ff8fa3, #ff5e7e)', borderRadius: '30px', padding: '1.5rem',
              color: 'white', boxShadow: '0 15px 30px rgba(255, 94, 126, 0.3)', flex: 1, position: 'relative'
            }}>
              <div style={{ background: 'rgba(255,255,255,0.2)', width: '60px', height: '60px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <CheckCircle size={28} />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Chờ duyệt</h3>
              <p style={{ fontSize: '2rem', fontWeight: 800 }}>{stats.pending} <span style={{ fontSize: '1rem', fontWeight: 400 }}>Mới</span></p>
              
              <div style={{ position: 'absolute', bottom: '1.5rem', right: '1.5rem', width: '35px', height: '35px', borderRadius: '50%', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ChevronRight size={18} />
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginTop: '1.5rem', paddingBottom: '1.5rem' }}>
          
          <div style={{ background: 'var(--bg-primary)', borderRadius: '30px', padding: '2rem 1.5rem 1.5rem', position: 'relative', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', textAlign: 'center' }}>
            <div style={{ position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)', background: '#5d509f', width: '60px', height: '60px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 10px 20px rgba(93, 80, 159, 0.4)' }}>
              <Layers size={28} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.5rem' }}>Danh mục</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Phân loại công cụ</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginTop: '1.5rem', fontWeight: 600 }}>
              <span style={{ color: 'var(--text-primary)' }}>Progress</span>
              <span style={{ color: 'var(--text-secondary)' }}>{(stats.categories/10)*100}%</span>
            </div>
            <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '3px', marginTop: '0.5rem', overflow: 'hidden' }}>
              <div style={{ width: '45%', height: '100%', background: '#10b981', borderRadius: '3px' }}></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{stats.categories} / 10 danh mục</span>
              <span style={{ fontSize: '0.7rem', color: '#f43f5e', background: '#ffe4e6', padding: '0.3rem 0.6rem', borderRadius: '12px', fontWeight: 600 }}>Sắp đầy</span>
            </div>
          </div>

          <div style={{ background: 'var(--bg-primary)', borderRadius: '30px', padding: '2rem 1.5rem 1.5rem', position: 'relative', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', textAlign: 'center' }}>
            <div style={{ position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)', background: '#5d509f', width: '60px', height: '60px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 10px 20px rgba(93, 80, 159, 0.4)' }}>
              <Users size={28} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.5rem' }}>Người dùng</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Tài khoản hoạt động</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginTop: '1.5rem', fontWeight: 600 }}>
              <span style={{ color: 'var(--text-primary)' }}>Progress</span>
              <span style={{ color: 'var(--text-secondary)' }}>13%</span>
            </div>
            <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '3px', marginTop: '0.5rem', overflow: 'hidden' }}>
              <div style={{ width: '13%', height: '100%', background: '#10b981', borderRadius: '3px' }}></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{stats.users} / 100 tài khoản</span>
              <span style={{ fontSize: '0.7rem', color: '#f43f5e', background: '#ffe4e6', padding: '0.3rem 0.6rem', borderRadius: '12px', fontWeight: 600 }}>Tăng trưởng</span>
            </div>
          </div>

          <div style={{ background: 'var(--bg-primary)', borderRadius: '30px', padding: '2rem 1.5rem 1.5rem', position: 'relative', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', textAlign: 'center' }}>
            <div style={{ position: 'absolute', top: '-25px', left: '50%', transform: 'translateX(-50%)', background: '#5d509f', width: '60px', height: '60px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 10px 20px rgba(93, 80, 159, 0.4)' }}>
              <Activity size={28} />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '0.5rem' }}>Máy chủ</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Tài nguyên API</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginTop: '1.5rem', fontWeight: 600 }}>
              <span style={{ color: 'var(--text-primary)' }}>Progress</span>
              <span style={{ color: 'var(--text-secondary)' }}>90%</span>
            </div>
            <div style={{ height: '6px', background: 'var(--border-color)', borderRadius: '3px', marginTop: '0.5rem', overflow: 'hidden' }}>
              <div style={{ width: '90%', height: '100%', background: '#10b981', borderRadius: '3px' }}></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>3200 / 3600 reqs</span>
              <span style={{ fontSize: '0.7rem', color: '#f43f5e', background: '#ffe4e6', padding: '0.3rem 0.6rem', borderRadius: '12px', fontWeight: 600 }}>Cảnh báo</span>
            </div>
          </div>
          
        </div>
      </div>

      {/* Right Sidebar */}
      <div style={{ 
        width: '280px', 
        background: 'var(--bg-primary)', 
        borderRadius: '30px',
        padding: '2rem 1.5rem',
        display: 'flex', flexDirection: 'column', gap: '2rem',
        boxShadow: '0 10px 40px rgba(0,0,0,0.03)'
      }} className="hidden lg:flex">
        
        {/* Friends / Users */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              <Users size={18} /> Thành viên mới
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#6454a8', fontWeight: 600, cursor: 'pointer' }}>View All</span>
          </div>
          
          <div style={{ display: 'flex', background: 'var(--surface-hover)', borderRadius: '20px', padding: '0.3rem', marginBottom: '1.5rem' }}>
            <button style={{ flex: 1, background: '#6454a8', color: 'white', border: 'none', borderRadius: '16px', padding: '0.5rem', fontSize: '0.8rem', fontWeight: 600 }}>Tất cả</button>
            <button style={{ flex: 1, background: 'transparent', color: 'var(--text-secondary)', border: 'none', borderRadius: '16px', padding: '0.5rem', fontSize: '0.8rem', fontWeight: 600 }}>Online</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {recentUsers.map((u, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${u.email}`} alt="Avatar" style={{ width: '45px', height: '45px', borderRadius: '50%', background: '#e2e8f0' }} />
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{u.email}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{u.role}</p>
                </div>
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                  <Mail size={14} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Map / Widget */}
        <div style={{ marginTop: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              <MapPin size={18} /> Truy cập Map
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#6454a8', fontWeight: 600, cursor: 'pointer' }}>View</span>
          </div>
          
          <div style={{ 
            height: '180px', borderRadius: '25px', background: '#e2e8f0', position: 'relative', overflow: 'hidden',
            backgroundImage: 'url("https://www.transparenttextures.com/patterns/cartographer.png")'
          }}>
            {/* Fake map pin */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: '#ff5e7e', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 10px 20px rgba(255, 94, 126, 0.4)' }}>
              <Play size={16} fill="currentColor" />
            </div>
            <div style={{ position: 'absolute', bottom: '20px', left: '20px', background: 'white', padding: '0.4rem', borderRadius: '50%' }}>
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" style={{ width: '25px', height: '25px' }} />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
