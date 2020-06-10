import React, { Component } from 'react';
import axios from 'axios';
import './landing.css';

import igiLogo from '../../media/igi_logo.png';
import berkeleySeal from '../../media/berkeley_seal.png';
import Navbar from '../navbar.component';

export default class Landing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            devmode: false,
            devuser: ''
        };
    }
    handleLoginButton = () => {
        if(this.props.isAuthenticated) {
            this.props.history.push('/dashboard');
        } else {
            if(this.state.devmode) {
                window.open('/api/users/login?devuser='+escape(this.state.devuser), '_self');
            } else {
                window.open('/api/users/login', '_self');
            }
        }
    }
    componentDidMount() {
        axios.post('/api/users/get/devmode').then(res => {
            this.setState({devmode: res.data.devmode});
        }).catch(err => {
            console.error('could not determine if dev mode is active');
        });
    }
    render() {
        return (
            <div>
                <Navbar/>
                <div className='container'>
                    <div className='row justify-content-center mt-3 mb-2'>
                        <div className='col-5 border-right border-dark'>
                            <div className='pl-0 pr-4 mt-3 ml-0 mr-0 text-right'>
                                <img src={igiLogo} className='logo-image' alt=''/>
                            </div>
                        </div>
                        <div className='col-5'>
                            <div className='pl-3 pr-0 mt-3 ml-0 mr-0'>
                                <img src={berkeleySeal} className='logo-image' alt=''/>
                            </div>
                        </div>
                    </div>
                    <div className='row justify-content-center'>
                        <div className='col'>
                            <p className='display-4 font-weight-light text-center'>
                                IGI Healthy Campus | Berkeley
                            </p>
                        </div>
                    </div>
                    <div className={`row justify-content-center ${(this.state.devmode)?'':'d-none'}`}>
                        <div className='col-4 text-center pb-2'>
                            <input className='form-control' placeholder='Development username' value={this.state.devuser} onChange={e => this.setState({devuser: e.target.value})} autoComplete='off' autoCorrect='off' autoCapitalize='none'/>
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
