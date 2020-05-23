import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch, withRouter } from 'react-router-dom';
import './landing.css';

import igiLogo from '../media/igi_logo.png';
import berkeleySeal from '../media/berkeley_seal.png';

export default class Landing extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <div className='homepage text-center align-items-center overflow-hidden'>
                <div className='d-flex flex-row justify-content-center'>
                    <div className=' pr-4 mt-5 mb-5 border-right border-dark'>
                        <img src={igiLogo} className='logo-image'/>
                    </div>
                    <div className='pl-5 mt-5 mb-5'>
                        <img src={berkeleySeal} className='logo-image'/>
                    </div>
                </div>
                <div className='row'>
                    <div className='col'>
                        <p className='display-4 font-weight-light'>
                            IGI Testing Kiosk Signup | Berkeley
                        </p>
                    </div>
                </div>
                <div className='row'>
                    <div className='col'>
                        <a className='btn btn-primary text-light'>
                            Login with CalNet ID
                        </a>
                    </div>
                </div>
            </div>
        );
    }
}
