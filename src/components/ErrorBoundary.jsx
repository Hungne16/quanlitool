import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    this.setState({ info });
    console.error('🔴 App crashed:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: '#0f0f0f', color: 'white', padding: '2rem', fontFamily: 'monospace'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💥</div>
          <h2 style={{ color: '#ef4444', marginBottom: '0.5rem' }}>Ứng dụng bị lỗi!</h2>
          <pre style={{
            background: '#1a1a1a', border: '1px solid #333', borderRadius: '8px',
            padding: '1rem', maxWidth: '800px', width: '100%', overflow: 'auto',
            fontSize: '0.8rem', color: '#f87171', marginBottom: '1rem'
          }}>
            {this.state.error?.toString()}
            {'\n\n'}
            {this.state.info?.componentStack}
          </pre>
          <button
            onClick={() => { this.setState({ hasError: false, error: null, info: null }); window.location.reload(); }}
            style={{ background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', padding: '0.75rem 1.5rem', cursor: 'pointer', fontWeight: 700 }}
          >
            Tải lại trang
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
