import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import ReactGA from 'react-ga';
import { Button, Modal } from 'react-bootstrap';

export const withTracker = (WrappedComponent, options = {}) => {
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
      ReactGA.set({userId: this.props.auth.user.calnetid || null});
      trackPage(page);
    }

    componentDidUpdate(prevProps) {
      const currentPage = prevProps.location.pathname;
      const nextPage = this.props.location.pathname;
      
      try {
        if(prevProps.auth.user.calnetid !== this.props.auth.user.calnetid) {
          ReactGA.set({userId: this.props.auth.user.calnetid || null});
        }
      } catch(err) {
        
      }

      if (currentPage !== nextPage) {
        trackPage(nextPage);
      }
    }

    render() {
      return <WrappedComponent {...this.props} />;
    }
  };

  return HOC;
}

export const TrackedButton = props => {
  return <Button {...props} onClick={e => {
    ReactGA.event({
      category: props.category,
      action: props.action,
      label: props.label,
      value: props.value,
    });
    return props.onClick(e);
  }}/>
}

TrackedButton.propTypes = {
  category: PropTypes.string.isRequired,
  action: PropTypes.string.isRequired,
  label: PropTypes.string,
  value: PropTypes.any
};

export const TrackedLink = props => {
  const {ext, ...otherProps} = props;
  if(ext) {
    // return <a {...props} href={props.to} onClick={e => {
    //   e.preventDefault();
    //   ReactGA.event({
    //     category: 'external link',
    //     action: 'External page link',
    //     label: props.to
    //   });
    //   window.open(props.to);
    // }}/>;
    return <ReactGA.OutboundLink {...otherProps} eventLabel={props.label||props.to}/>
  }
  return <Link {...otherProps} onClick={e => {
    ReactGA.event({
      category: 'internal link',
      action: props.to,
      label: props.label
    });
    return props.onClick(e);
  }}/>;
}

TrackedLink.propTypes = {
  ext: PropTypes.bool,
  label: PropTypes.string
};

export class TrackedModal extends Component {
  componentDidUpdate = (prevProps, prevState) => {
    if(this.props.show !== prevProps.show && this.props.show) {
      ReactGA.modalview(this.props.modalName);
    }
  }
  render() {
    return <Modal {...this.props}/>;
  }
}

TrackedModal.propTypes = {
  modalName: PropTypes.string.isRequired
};
