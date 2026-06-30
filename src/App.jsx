import React from 'react';
import App6 from './App6.jsx';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    console.error('App6 error:', error);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, color: 'white', fontFamily: 'Arial, sans-serif' }}>
          <h1>Erreur Safari dans App6</h1>
          <pre style={{ whiteSpace: 'pre-wrap', background: '#111827', padding: 16, borderRadius: 8 }}>
            {String(this.state.error && (this.state.error.stack || this.state.error.message || this.state.error))}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <App6 />
    </ErrorBoundary>
  );
}
