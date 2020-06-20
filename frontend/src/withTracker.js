import React, { Component } from 'react';
import ReactGA from 'react-ga';

import { getUser } from './actions/authActions';

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
      getUser().then(res => {
          if(res.success) {
              ReactGA.set({userId: res.user.calnetid});
          } else {
            ReactGA.set({userId: null});
        }
        trackPage(page);
      });
    }

    componentDidUpdate(prevProps) {
      const currentPage = prevProps.location.pathname;
      const nextPage = this.props.location.pathname;

      if (currentPage !== nextPage) {
        getUser().then(res => {
            if(res.success) {
                ReactGA.set({userId: res.user.calnetid});
            } else {
                ReactGA.set({userId: null});
            }
            trackPage(nextPage);
        });
      }
    }

    render() {
      return <WrappedComponent {...this.props} />;
    }
  };

  return HOC;
}
