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
      console.log('page:' + page);
      getUser().then(res => {
          if(res.success) {
              console.log('set uid ' + res.user.calnetid);
              ReactGA.set({userId: res.user.calnetid});
          } else {
            ReactGA.set({userId: null});
        }
        trackPage(nextPage);
      });
    }

    componentDidUpdate(prevProps) {
      const currentPage = prevProps.location.pathname;
      const nextPage = this.props.location.pathname;

      if (currentPage !== nextPage) {
        console.log('next page:' + nextPage);
        getUser().then(res => {
            if(res.success) {
                console.log('set uid ' + res.user.calnetid);
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
