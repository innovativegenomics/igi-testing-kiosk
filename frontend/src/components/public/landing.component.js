import React, { Component } from 'react';
import axios from 'axios';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';

import './landing.css';
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
        <Navbar />
        <Container>
          <Row className='justify-content-center'>
            <Col>
              <img src={igiFast} className='w-100' alt='IGI FAST' />
            </Col>
          </Row>
          <Row className='justify-content-center'>
            <Col>
              <p className='h2 font-weight-light text-center'>
                IGI Free Asymptomatic Saliva Testing
              </p>
            </Col>
          </Row>
          <Row className={`justify-content-center ${(this.state.devmode) ? '' : 'd-none'}`}>
            <Col md='4'>
              <Form.Control type='text' placeholder='Development username' value={this.state.devuser} onChange={e => this.setState({ devuser: e.target.value })} autoComplete='off' autoCorrect='off' autoCapitalize='none'/>
            </Col>
          </Row>
          <Row className='justify-content-center mb-2'>
            <Col className='text-center p-3'>
              <Button onClick={this.handleLoginButton}>Login with CalNet ID</Button>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}
