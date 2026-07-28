import React from 'react';
import ToolCard from './ToolCard';

export default function ToolGrid({ tools, onDelete, onToggleFavorite }) {
  if (tools.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-secondary)' }}>
        <h3>Chưa có công cụ nào ở đây.</h3>
        <p style={{ marginTop: '0.5rem' }}>Hãy bấm "Thêm công cụ mới" để bắt đầu bộ sưu tập của bạn!</p>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
      gap: '1.5rem',
      paddingBottom: '2rem'
    }}>
      {tools.map(tool => (
        <ToolCard key={tool.id} tool={tool} onDelete={onDelete} onToggleFavorite={onToggleFavorite} />
      ))}
    </div>
  );
}
