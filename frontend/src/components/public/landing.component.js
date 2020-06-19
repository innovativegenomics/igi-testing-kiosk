import React, { Component } from 'react';
import axios from 'axios';
import './landing.css';

import berkeleyLogo from '../../media/berkeley_logo.png';

import igiFast from '../../media/IGI-FAST.png';
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
    if (this.state.devmode) {
      window.open('/api/users/login?devuser=' + escape(this.state.devuser), '_self');
    } else {
      window.open('/api/users/login', '_self');
    }
  }
  componentDidMount() {
    axios.get('/api/users/devmode').then(res => {
      this.setState({ devmode: res.data.devmode });
    }).catch(err => {
      console.error('could not determine if dev mode is active');
    });
  }
  render() {
    return (
      <div>
        <Navbar devuser={this.state.devmode?this.state.devuser:null} />
        <div className='container'>
          <div className='row justify-content-center'>
            <div className='col'>
              <img src={igiFast} className='w-100 pt-5 pb-5 pl-md-5 pr-md-5' alt='IGI FAST' />
            </div>
          </div>
          <div className='row justify-content-center'>
            <div className='col'>
              <p className='h2 font-weight-light text-center'>
                IGI Free Asymptomatic Saliva Testing 
              </p>
              <p>
              </p>
              <p className='h3 font-weight-light text-center'>
                To enroll and schedule appointments:
              </p>
            </div>
          </div>
          <div className={`row justify-content-center ${(this.state.devmode) ? '' : 'd-none'}`}>
            <div className='col-md-4 text-center pb-2'>
              <input className='form-control' placeholder='Development username' value={this.state.devuser} onChange={e => this.setState({ devuser: e.target.value })} autoComplete='off' autoCorrect='off' autoCapitalize='none' />
            </div>
          </div>
          <div className='row justify-content-center mb-2'>
            <div className='col text-center'>
              <button className='btn btn-lg btn-primary text-light' onClick={this.handleLoginButton}>
                Login with CalNet ID
              </button>
            </div>
          </div>
        </div>
        <footer className='navbar navbar-light bg-transparent'>
          <div className='navbar-nav'></div>
          <img src={berkeleyLogo} className='form-inline' style={{height: '5rem'}}/>
        </footer>
      </div>
    );
  }
}
