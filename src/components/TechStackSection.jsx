import React from 'react';
import { motion } from 'framer-motion';
import { Layers, Copy, Check, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toggleFavorite } from '../utils/storage';

const mockStacks = [
  {
    id: 's1',
    title: 'Bộ Công Cụ Content Creator',
    description: 'Trọn bộ AI viết kịch bản, làm ảnh thumbnail và lồng tiếng tự động.',
    author: 'Admin',
    toolNames: ['ChatGPT', 'Midjourney', 'ElevenLabs', 'Canva']
  },
  {
    id: 's2',
    title: 'Tech Stack Cho Coder',
    description: 'Tăng x3 tốc độ code với AI hỗ trợ từ viết đến debug.',
    author: 'Hải Yến',
    toolNames: ['GitHub Copilot', 'Cursor', 'ChatGPT', 'Vercel']
  },
  {
    id: 's3',
    title: 'Startup Sinh Viên',
    description: 'Bộ công cụ miễn phí hoàn toàn giúp bạn build sản phẩm từ con số 0.',
    author: 'Tuấn Khang',
    toolNames: ['Notion', 'Figma', 'Gemini', 'Vercel']
  }
];

export default function TechStackSection({ tools, setTools }) {
  const { user } = useAuth();
  const [cloned, setCloned] = React.useState({});

  const handleClone = async (stack) => {
    if (!user) {
      alert("Vui lòng đăng nhập để sử dụng tính năng này!");
      return;
    }
    
    // In a real scenario, this would look up actual tool IDs in the DB by name 
    // and add them to the user's favorites.
    // For demo WOW factor, we will just show a success state.
    
    setCloned(prev => ({ ...prev, [stack.id]: true }));
    
    setTimeout(() => {
      setCloned(prev => ({ ...prev, [stack.id]: false }));
      alert(`Đã lưu "${stack.title}" vào bộ sưu tập của bạn!`);
    }, 2000);
  };

  return (
    <div style={{ marginBottom: '4rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '12px',
          background: 'linear-gradient(135deg, var(--accent-color), var(--color-2))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white'
        }}>
          <Layers size={20} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Tech Stack Nổi Bật</h2>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '1.5rem' 
      }}>
        {mockStacks.map((stack, idx) => (
          <motion.div
            key={stack.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="glass-panel"
            style={{
              padding: '1.5rem',
              borderRadius: '20px',
              border: '1px solid var(--border-color)',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Heavy GPU blurs removed for performance */}

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{stack.title}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)', background: 'var(--surface-color)', padding: '0.2rem 0.6rem', borderRadius: '100px' }}>
                  <Users size={12} /> {stack.author}
                </div>
              </div>
              
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.5rem' }}>
                {stack.description}
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {stack.toolNames.map(name => (
                  <span key={name} style={{
                    fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)',
                    background: 'var(--surface-active)', padding: '0.25rem 0.75rem',
                    borderRadius: '8px', border: '1px solid var(--border-color)'
                  }}>
                    {name}
                  </span>
                ))}
              </div>

              <button
                onClick={() => handleClone(stack)}
                style={{
                  width: '100%', padding: '0.75rem', borderRadius: '12px',
                  border: 'none', background: cloned[stack.id] ? '#10b981' : 'var(--surface-color)',
                  color: cloned[stack.id] ? 'white' : 'var(--text-primary)',
                  fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: '0.5rem', cursor: 'pointer', transition: 'all 0.3s'
                }}
              >
                {cloned[stack.id] ? <Check size={16} /> : <Copy size={16} />}
                {cloned[stack.id] ? 'Đã lưu' : 'Clone toàn bộ (Lưu)'}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
