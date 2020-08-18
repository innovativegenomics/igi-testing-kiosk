import React, { Component } from 'react';
import axios from 'axios';
import { Alert, Row, Col, Container } from 'react-bootstrap';

import { TrackedButton } from '../../tracker';
import './landing.css';

export default class Landing extends Component {
  constructor(props) {
    super(props);
    this.state = {
      devuser: '',
      pCount: 0,
      tCount: 0,
      lCount: 0
    };
  }
  handleLoginButton = () => {
    if (this.props.devmode) {
      window.open('/api/users/login?devuser=' + escape(this.state.devuser), '_self');
    } else {
      window.open('/api/users/login', '_self');
    }
  }
  componentDidMount = async () => {
    const multiplier = 1.005;
    const cycles = 200;
    const counterFunc = (final, prop) => {
      let time = 1;
      let interval = Math.max(Math.floor(final/cycles), 1);
      const tFunc = () => {
        if(final - this.state[prop] > interval) { 
          this.setState({[prop]: this.state[prop] + interval});
        } else {
          this.setState({[prop]: this.state[prop] + 1});
        }
        if(this.state[prop] === final) {
          return;
        }
        time*=multiplier;
        window.setTimeout(tFunc, time);
      }
      tFunc();
    }
    const participants = (await axios.get('/api/utils/participants')).data.count;
    const tests = (await axios.get('/api/utils/tests')).data.count;
    const locations = (await axios.get('/api/utils/locations')).data.count;
    console.log(locations);

    counterFunc(participants, 'pCount');
    counterFunc(tests, 'tCount');
    counterFunc(locations, 'lCount');
  }
  render() {
    return (
      <Container fluid>
        <p className='display-4 text-center'>IGI FAST: Free Asymptomatic Saliva Testing</p>
        <Row className=''>
          <Col lg>
            <p className='lead'>
              The Innovative Genomics Institute (IGI) at UC Berkeley is piloting a new, saliva-based test for 
              COVID-19. The FAST study aims to establish a testing model for our campus. If you are a UC 
              Berkeley employee approved to work on campus during the pandemic, you are invited.
            </p>
            <p className='lead'>
              <i>
                Please note that this test is experimental. All positive and inconclusive results will be validated 
                with clinically-approved tests. Additionally, we cannot guarantee that an individual with a 
                negative test result is truly negative for SARS-CoV-2 or will later become infected with COVID-19.
              </i>
            </p>
          </Col>
          <Col lg className='text-center'>
            <Row>
              <Col>
                <p className='h2 font-weight-light'>{this.state.pCount}</p>
                <p className='lead'>Participants</p>
              </Col>
              <Col>
                <p className='h2 font-weight-light'>{this.state.tCount}</p>
                <p className='lead'>Tests completed</p>
              </Col>
              <Col>
                <p className='h2 font-weight-light'>{this.state.lCount}</p>
                <p className='lead'>Locations</p>
              </Col>
            </Row>
            <p className='lead'>To enroll and schedule an appointment</p>
            <input className={this.props.devmode?'form-control':'d-none'} placeholder='Development username' value={this.state.devuser} onChange={e => this.setState({ devuser: e.target.value })} autoComplete='off' autoCorrect='off' autoCapitalize='none'/>
            <TrackedButton variant='primary' size='lg' onClick={this.handleLoginButton} label='/api/users/login' action='calnet user login' className='m-2'>
              Log in with CalNet ID
            </TrackedButton>
            <TrackedButton className='m-2' variant='outline-primary' size='lg' onClick={e => this.props.history.push('/extlogin')} label='/extlogin' action='external sign in'>
              Log in without a CalNet ID
            </TrackedButton>
            <p className='lead mb-0'>or</p>
            <TrackedButton className='m-2' variant='outline-primary' size='lg' onClick={e => this.props.history.push('/signup')} label='/signup' action='external sign up'>
              Sign up without a CalNet ID
            </TrackedButton>
          </Col>
        </Row>
      </Container>
    );
    // return (
    //   <div>
    //     <div className='container'>
    //       <div className='row justify-content-center'>
    //         <div className='col'>
    //           {/* <img src={igiFast} className='w-100 pt-5 pb-5 pl-md-5 pr-md-5' alt='IGI FAST' /> */}
    //         </div>
    //       </div>
    //       <div className='row justify-content-center'>
    //         <div className='col'>
    //           <p className='h2 font-weight-light text-center'>
    //             Free Asymptomatic Saliva Testing (FAST) Study
    //           </p>
    //           <p>
    //             The Innovative Genomics Institute (IGI) at UC Berkeley is piloting a new, saliva-based test for 
    //             COVID-19. The FAST study aims to establish a testing model for our campus. If you are a UC 
    //             Berkeley employee approved to work on campus during the pandemic, you are invited.
    //           </p>
    //           <p>
    //             <i>
    //               Please note that this test is experimental. All positive and inconclusive results will be validated 
    //               with clinically-approved tests. Additionally, we cannot guarantee that an individual with a 
    //               negative test result is truly negative for SARS-CoV-2 or will later become infected with COVID-19.
    //             </i>
    //           </p>
    //           <Row>
    //             <Col className='text-center'>
    //               <p className='h3 font-weight-light'>test</p>
    //             </Col>
    //             <Col className='text-center'>
    //               <p className='h3 font-weight-light'>test</p>
    //             </Col>
    //           </Row>
    //           <p className='lead text-center'>To enroll and schedule an appointment:</p>
    //         </div>
    //       </div>
    //       <div className={`row justify-content-center ${(this.props.devmode) ? '' : 'd-none'}`}>
    //         <div className='col-md-4 text-center pb-2'>
    //           <input className='form-control' placeholder='Development username' value={this.state.devuser} onChange={e => this.setState({ devuser: e.target.value })} autoComplete='off' autoCorrect='off' autoCapitalize='none' />
    //         </div>
    //       </div>
    //       <div className='row justify-content-center mb-2'>
    //         <div className='col text-center'>
    //           <TrackedButton variant='primary' size='lg' onClick={this.handleLoginButton} label='/api/users/login' action='calnet user login'>
    //             Log in with CalNet ID
    //           </TrackedButton>
    //           <br />
    //           <TrackedButton className='mt-2' variant='outline-primary' size='lg' onClick={e => this.props.history.push('/extlogin')} label='/extlogin' action='external sign in'>Log in without a CalNet ID</TrackedButton>
    //           <p className='mt-4 lead'>Don't have a CalNet ID, but still want to enroll?</p>
    //           <TrackedButton variant='outline-primary' size='lg' onClick={e => this.props.history.push('/signup')} label='/signup' action='external sign up'>Sign up without a CalNet ID</TrackedButton>
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    // );
  }
}
