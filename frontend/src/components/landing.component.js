import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import './landing.css';

import igiLogo from '../media/igi_logo.png';
import berkeleySeal from '../media/berkeley_seal.png';
import Navbar from './navbar.component';

export default class Landing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            navHeight: 0,
            height: 0
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
        return (
            <div>
                <Navbar heightChangeCallback={this.navHeightChange}/>
                <div className='landing m-0 p-0 position-absolute' style={{height: `${this.state.height}px`, top: `${this.state.navHeight}px`}}>
                    <div className='text-center align-items-center m-0 p-0'>
                        <div className='d-flex flex-row justify-content-center m-0 p-0'>
                            <div className='pl-0 pr-4 mt-3 mb-5 ml-0 mr-0 border-right border-dark'>
                                <img src={igiLogo} className='logo-image'/>
                            </div>
                            <div className='pl-5 pr-0 mt-3 mb-5 ml-0 mr-0'>
                                <img src={berkeleySeal} className='logo-image'/>
                            </div>
                        </div>
                        <div className='row p-0 m-0'>
                            <div className='col p-0 m-0'>
                                <p className='display-4 font-weight-light'>
                                    IGI Testing Kiosk Signup | Berkeley
                                </p>
                            </div>
                        </div>
                        <div className='row p-0 m-0'>
                            <div className='col p-0 m-0'>
                                <Link className='btn btn-primary text-light' to='/dashboard'>
                                    Login with CalNet ID
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
