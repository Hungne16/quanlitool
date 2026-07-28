import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Users, Tool, Layers, CheckCircle } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({ users: 0, tools: 0, pending: 0, categories: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        const toolsSnap = await getDocs(collection(db, 'tools'));
        const catsSnap = await getDocs(collection(db, 'settings')); // categories are in settings/categories

        let pendingCount = 0;
        let toolsCount = toolsSnap.size;

        toolsSnap.forEach(doc => {
          if (doc.data().status === 'pending') {
            pendingCount++;
          }
        });

        let catCount = 0;
        catsSnap.forEach(doc => {
          if (doc.id === 'categories') {
            catCount = doc.data().list?.length || 0;
          }
        });

        setStats({
          users: usersSnap.size,
          tools: toolsCount,
          pending: pendingCount,
          categories: catCount
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { title: 'Tổng Người dùng', value: stats.users, icon: <Users size={24} />, color: '#3b82f6' },
    { title: 'Tổng Công cụ', value: stats.tools, icon: <CheckCircle size={24} />, color: '#10b981' },
    { title: 'Chờ duyệt', value: stats.pending, icon: <CheckCircle size={24} />, color: '#f59e0b' },
    { title: 'Danh mục', value: stats.categories, icon: <Layers size={24} />, color: '#8b5cf6' },
  ];

  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '2rem' }}>Tổng quan hệ thống</h1>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '1.5rem' 
      }}>
        {statCards.map((card, i) => (
          <div key={i} style={{
            backgroundColor: 'var(--bg-primary)',
            padding: '1.5rem',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <div style={{
              width: '48px', height: '48px',
              borderRadius: '12px',
              backgroundColor: `${card.color}20`,
              color: card.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {card.icon}
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>{card.title}</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{card.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
