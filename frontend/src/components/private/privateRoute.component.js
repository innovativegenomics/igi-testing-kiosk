import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { loadUser } from '../../actions/authActions';

const PrivateRoute = ({ component: Component, auth, loadUser, ...rest }) => (
    <Route
        {...rest}
        render={props => {
            console.log('loop');
            if(!auth.isAuthenticated && !auth.loading) {
                loadUser();
            }
            if(auth.isAuthenticated) {
                if(auth.user.updating) {
                    return <div>Updating...</div>;
                } else if(!auth.fullUser) {
                    if(rest.path === '/newuser') return <Component {...props} />;
                    else return <Redirect to='/newuser' />;
                } else if(!auth.user.screened) {
                    if(rest.path === '/screening') return <Component {...props} />;
                    else return <Redirect to='/screening' />;
                } else {
                    return <Component {...props} />;
                }
            } else if(auth.loading) {
                return <div>Authenticating...</div>;
            } else if(auth.failed) {
                return <Redirect to='/' />;
            }
            return <div>Authenticating...</div>;
        }}
    />
);

// class PrivateRoute extends Route {
//   render() {
//     if(this.props.auth === true) {
//       return (this.props.children);
//     } else {
//       return (<Redirect to='/login' />);
//     }
//   }
// }

PrivateRoute.propTypes = {
    auth: PropTypes.object.isRequired,
    loadUser: PropTypes.func.isRequired,
};
const mapStateToProps = state => ({
    auth: state.auth
});
export default connect(mapStateToProps, { loadUser })(PrivateRoute);
