import React, { Component } from 'react';
import ReactGA from 'react-ga';

export default function withTracker(WrappedComponent, options = {}) {
  const trackPage = (page) => {
    ReactGA.set({
      page,
      ...options
    });
    ReactGA.pageview(page);
  };

  const HOC = class extends Component {
    componentDidMount() {
      const page = this.props.location.pathname;
      console.log('page:' + page);
      trackPage(page);
    }

    componentDidUpdate(prevProps) {
      const currentPage = prevProps.location.pathname;
      const nextPage = this.props.location.pathname;

      if (currentPage !== nextPage) {
        console.log('next page:' + nextPage);
        trackPage(nextPage);
      }
    }

    render() {
      return <WrappedComponent {...this.props} />;
    }
  };

  return HOC;
}
