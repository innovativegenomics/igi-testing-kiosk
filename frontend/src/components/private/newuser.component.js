import React, { Component } from 'react';

import Navbar from '../navbar.component';
import { connect } from 'react-redux';
import './newuser.css';

import { setFirstName,
         setLastName,
         setEmail,
         setPhone,
         setAlertEmail,
         setAlertPhone } from '../../actions/authActions';

class NewUser extends Component {
    constructor(props) {
        super(props);
        this.state = {
            navHeight: 0,
            height: 0,
        };
    }
    navHeightChange = h => {
        this.setState({navHeight: h, height: window.innerHeight - h});
    }
    onResize = () => {
        this.setState({height: window.innerHeight - this.state.navHeight});
    }
    componentDidMount() {
        window.addEventListener('resize', this.onResize);
    }
    componentWillUnmount() {
        window.removeEventListener('resize', this.onResize);
    }
    render() {
        console.log(this.props.auth);
        return (
            <div>
                <Navbar heightChangeCallback={this.navHeightChange}/>
                <div className='position-absolute overflow-hidden newuser' style={{height: `${this.state.height}px`, top: `${this.state.navHeight}px`}}>
                    <div className='d-flex flex-column justify-content-center h-100'>
                        <div>{this.props.auth.user.calnetid}</div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    auth: state.auth
});

export default connect(mapStateToProps, { setFirstName,
                                          setLastName,
                                          setEmail,
                                          setPhone,
                                          setAlertEmail,
                                          setAlertPhone })(NewUser);
