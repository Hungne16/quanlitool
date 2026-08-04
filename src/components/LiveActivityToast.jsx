import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Star, UserPlus, Zap } from 'lucide-react';

const mockNames = ['Hoàng Long', 'Thanh Trúc', 'Vũ Nam', 'Mai Anh', 'Đức Anh', 'Hải Yến', 'Tuấn Khang', 'Bích Ngọc'];
const actions = [
  { text: 'vừa lưu', icon: <Heart size={16} color="#ef4444" fill="#ef4444" />, type: 'save' },
  { text: 'vừa đánh giá 5 sao cho', icon: <Star size={16} color="#eab308" fill="#eab308" />, type: 'rate' },
  { text: 'vừa tham gia bình luận về', icon: <Zap size={16} color="#3b82f6" fill="#3b82f6" />, type: 'comment' }
];

export default function LiveActivityToast({ tools = [] }) {
  const [activity, setActivity] = useState(null);

  useEffect(() => {
    if (!tools || tools.length === 0) return;
    let timeoutId;
    let intervalStarter;

    const triggerRandomActivity = () => {
      // Create random activity
      const randomName = mockNames[Math.floor(Math.random() * mockNames.length)];
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      const randomTool = tools[Math.floor(Math.random() * tools.length)];

      setActivity({
        id: Date.now(),
        name: randomName,
        action: randomAction,
        toolName: randomTool.title || randomTool.name || 'công cụ AI'
      });

      // Clear after 4 seconds
      setTimeout(() => {
        setActivity(null);
      }, 4000);
    };

    // Initial trigger after 3s
    timeoutId = setTimeout(triggerRandomActivity, 3000);
    
    // Then every 12-25 seconds randomly
    const intervalLogic = () => {
      const nextDelay = Math.floor(Math.random() * 13000) + 12000;
      intervalStarter = setTimeout(() => {
        triggerRandomActivity();
        intervalLogic();
      }, nextDelay);
    };
    
    intervalLogic();

    return () => {
      clearTimeout(timeoutId);
      clearTimeout(intervalStarter);
    };
  }, [tools]);

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      left: '24px',
      zIndex: 100,
      pointerEvents: 'none'
    }}>
      <AnimatePresence>
        {activity && (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="glass-panel"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.75rem 1.25rem',
              borderRadius: '100px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              background: 'var(--surface-active)'
            }}
          >
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent-color), #ec4899)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 'bold', fontSize: '14px'
            }}>
              {activity.name.charAt(0)}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{activity.name}</span>
              <span style={{ color: 'var(--text-secondary)' }}>{activity.action.text}</span>
              <span style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                {activity.toolName}
                {activity.action.icon}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
