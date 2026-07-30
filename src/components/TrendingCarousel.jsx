import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight, Flame, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TrendingCarousel({ tools }) {
  const scrollRef = useRef(null);

  // Lọc ra top 10 công cụ có nhiều lượt yêu thích nhất (nếu có trường likes hoặc có thể mock bằng rating hoặc số lượng click nếu sau này có)
  // Ở đây ta có thể sắp xếp theo lượng user trong object ratings hoặc mock data nếu chưa có
  const sortedTools = [...tools].sort((a, b) => {
    const aScore = Object.keys(a.ratings || {}).length;
    const bScore = Object.keys(b.ratings || {}).length;
    return bScore - aScore;
  }).slice(0, 10);

  if (sortedTools.length === 0) return null;

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth + 50 : scrollLeft + clientWidth - 50;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div style={{ marginBottom: '3rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', paddingLeft: '0.5rem' }}>
        <Flame size={24} style={{ color: '#ef4444' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>Nổi bật nhất</h2>
      </div>

      <div style={{ position: 'relative', group: 'true' }}>
        <button 
          onClick={() => scroll('left')}
          style={{
            position: 'absolute', left: '-1rem', top: '50%', transform: 'translateY(-50%)',
            zIndex: 10, width: '40px', height: '40px', borderRadius: '50%',
            background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)', color: 'var(--text-primary)'
          }}
        >
          <ChevronLeft size={20} />
        </button>

        <div 
          ref={scrollRef}
          className="custom-scrollbar"
          style={{
            display: 'flex', overflowX: 'auto', gap: '1.5rem', padding: '0.5rem',
            scrollSnapType: 'x mandatory', scrollBehavior: 'smooth'
          }}
        >
          {sortedTools.map((tool) => (
            <motion.div 
              key={tool.id} 
              whileHover={{ y: -5 }}
              style={{
                flex: '0 0 auto', width: '300px', scrollSnapAlign: 'start',
                background: 'var(--bg-primary)', borderRadius: '16px',
                border: '1px solid var(--border-color)', padding: '1.5rem',
                display: 'flex', flexDirection: 'column', gap: '1rem',
                boxShadow: '0 4px 6px rgba(0,0,0,0.05)', cursor: 'pointer'
              }}
              onClick={() => {
                const url = tool.url.startsWith('http') ? tool.url : `https://${tool.url}`;
                window.open(url, '_blank', 'noopener,noreferrer');
              }}
            >
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px', background: '#f1f5f9',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
                }}>
                  {tool.imageUrl ? (
                    <img src={tool.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--accent-color)' }}>{tool.title.charAt(0)}</span>
                  )}
                </div>
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-primary)' }}>
                    {tool.title}
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', background: 'var(--bg-secondary)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                    {tool.category}
                  </span>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {tool.description}
              </p>
            </motion.div>
          ))}
        </div>

        <button 
          onClick={() => scroll('right')}
          style={{
            position: 'absolute', right: '-1rem', top: '50%', transform: 'translateY(-50%)',
            zIndex: 10, width: '40px', height: '40px', borderRadius: '50%',
            background: 'var(--bg-primary)', border: '1px solid var(--border-color)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)', color: 'var(--text-primary)'
          }}
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
