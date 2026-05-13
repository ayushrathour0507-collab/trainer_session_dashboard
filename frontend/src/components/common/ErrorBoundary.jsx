/**
 * Purpose: Catches render errors and displays a graceful recovery message for the app shell.
 */
import PropTypes from "prop-types";
import { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="page-gutter">
          <div className="nexus-card border-danger/40 p-6">
            <p className="label-tag text-danger">Something went wrong</p>
            <h1 className="mt-2 text-2xl font-bold">BytesAndBeyond could not render this view.</h1>
            <p className="mt-2 text-sm text-textSecondary">{this.state.error.message}</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ErrorBoundary;
