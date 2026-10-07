import React from 'react';

export default class RouteErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="page route-error-page">
          <section className="card route-error-card" role="alert">
            <div className="eyebrow">Page unavailable</div>
            <h2>This page could not be displayed.</h2>
            <p>Your session is still active. Return to the Nexus and try the route again.</p>
            <button type="button" className="btn" onClick={this.props.onRecover}>RETURN TO THE NEXUS</button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
