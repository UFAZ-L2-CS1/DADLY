import React, { Component } from 'react';

// Optional: for logging errors to an external service
// function logErrorToService(error, errorInfo) {
//   console.error('Logging error to service:', error, errorInfo);
// }

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render shows the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging or external monitoring
    console.error('Uncaught error:', error, errorInfo);
    // logErrorToService(error, errorInfo);
    this.setState({ error, errorInfo });
  }

  handleReload = () => {
    // Reset the error state or refresh the app
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: '2rem',
            textAlign: 'center',
            color: '#333',
            fontFamily: 'Arial, sans-serif',
          }}
        >
          <h2 style={{ color: '#d32f2f' }}>⚠️ Something went wrong.</h2>
          <p>
            Please try refreshing the page or contact support if the issue
            persists.
          </p>

          <button
            onClick={this.handleReload}
            style={{
              marginTop: '1rem',
              padding: '0.6rem 1.2rem',
              backgroundColor: '#1976d2',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            🔄 Try Again
          </button>

          <details
            style={{
              marginTop: '1.5rem',
              textAlign: 'left',
              whiteSpace: 'pre-wrap',
              backgroundColor: '#f9f9f9',
              padding: '1rem',
              borderRadius: '8px',
            }}
          >
            <summary
              style={{ cursor: 'pointer', color: '#555', fontWeight: 'bold' }}
            >
              Error Details
            </summary>
            {this.state.error && <p>{this.state.error.toString()}</p>}
            {this.state.errorInfo && (
              <p>{this.state.errorInfo.componentStack}</p>
            )}
          </details>
        </div>
      );
    }

    // When there’s no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
