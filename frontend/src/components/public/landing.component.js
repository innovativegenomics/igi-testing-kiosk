import React, { Component } from 'react';
import axios from 'axios';
import { Alert } from 'react-bootstrap';

import { TrackedButton } from '../../tracker';
import './landing.css';

export default class Landing extends Component {
  constructor(props) {
    super(props);
    this.state = {
      devuser: ''
    };
  }
  handleLoginButton = () => {
    if (this.props.devmode) {
      window.open('/api/users/login?devuser=' + escape(this.state.devuser), '_self');
    } else {
      window.open('/api/users/login', '_self');
    }
  }
  render() {
    return (
      <div>
        <div className='container'>
          <div className='row justify-content-center'>
            <div className='col'>
              {/* <img src={igiFast} className='w-100 pt-5 pb-5 pl-md-5 pr-md-5' alt='IGI FAST' /> */}
            </div>
          </div>
          <div className='row justify-content-center'>
            <div className='col'>
              <p className='h2 font-weight-light text-center'>
                Free Asymptomatic Saliva Testing (FAST) Study
              </p>
              <p>
                The Innovative Genomics Institute (IGI) at UC Berkeley is piloting a new, saliva-based test for 
                COVID-19. The FAST study aims to establish a testing model for our campus. If you are a UC 
                Berkeley employee approved to work on campus during the pandemic, you are invited.
              </p>
              <p>
                <i>
                  Please note that this test is experimental. All positive and inconclusive results will be validated 
                  with clinically-approved tests. Additionally, we cannot guarantee that an individual with a 
                  negative test result is truly negative for SARS-CoV-2 or will later become infected with COVID-19.
                </i>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
