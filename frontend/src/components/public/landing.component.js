import React, { Component } from 'react';
import { connect } from 'react-redux';
import './landing.css';

import igiLogo from '../../media/igi_logo.png';
import berkeleySeal from '../../media/berkeley_seal.png';
import Navbar from '../navbar.component';

class Landing extends Component {
    handleLoginButton = () => {
        if(this.props.isAuthenticated) {
            this.props.history.push('/dashboard');
        } else {
            this.props.history.push('/devlogin');
            // window.open('/api/users/login', '_self');
        }
    }
    render() {
        return (
            <div style={{backgroundColor: '#eeeeee'}}>
                <Navbar/>
                <div className='container'>
                    <div className='row justify-content-center'>
                        <div className='col-5'>
                            <div className='pl-0 pr-4 mt-3 mb-5 ml-0 mr-0 border-right border-dark text-right'>
                                <img src={igiLogo} className='logo-image' alt=''/>
                            </div>
                        </div>
                        <div className='col-5'>
                            <div className='pl-5 pr-0 mt-3 mb-5 ml-0 mr-0'>
                                <img src={berkeleySeal} className='logo-image' alt=''/>
                            </div>
                        </div>
                    </div>
                    <div className='row justify-content-center'>
                        <div className='col'>
                            <p className='display-4 font-weight-light text-center'>
                                IGI Testing Kiosk Signup | Berkeley
                            </p>
                        </div>
                    </div>
                    <div className='row justify-content-center'>
                        <div className='col text-center'>
                            <button className='btn btn-lg btn-primary text-light' onClick={this.handleLoginButton}>
                                Login with CalNet ID
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    isAuthenticated: state.auth.isAuthenticated
});

export default connect(mapStateToProps)(Landing);
