import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Container, Row, Col, Alert } from 'react-bootstrap';
import qs from 'qs';
import moment from 'moment';

import Navbar from '../navbar.component';
import { getAdminLevel, getSlotInfo } from '../../actions/adminActions';

export default class Scanner extends Component {
  constructor(props) {
    super(props);
    this.state = {
      level: null,
      loaded: false,
      slot: null,
      slotLoaded: false,
    };
  }
  componentDidMount = async () => {
    const uid = qs.parse(this.props.location.search, {ignoreQueryPrefix: true}).uid;
    console.log(uid);
    const admin = getAdminLevel();
    const slot = getSlotInfo(uid);
    this.setState({loaded: true, level: (await admin).level});
    this.setState({slotLoaded: true, slot: (await slot).slot});
  }
  render() {
    if(!this.state.loaded || !this.state.slotLoaded) {
      return <div>Loading...</div>
    } else if(this.state.loaded && !this.state.level) {
      return <Redirect to='/' />
    }

    var clear = true;
    var error = '';
    if(!this.state.slot) {
      clear = false;
      error = 'No appointment exists for this QR code!';
    } else if(!this.state.slot.location) {
      clear = false;
      error = `This patient has either not scheduled an appointment, or has cancelled their appointment`;
    } else if(!moment().isSame(moment(this.state.slot.time), 'date')) {
      clear = false;
      error = `This patient is here on the wrong day! Their appointment is ${moment(this.state.slot.time).format('dddd, MMMM D h:mm A')}`;
    }

    return (
      <div>
        <Navbar showLogout={ true } admin={ this.state.level } />
        <Container>
          <Row className='justify-content-center text-center'>
            <Col className='text-center'>
              <p className='display-4'>
                Scan Result
              </p>
            </Col>
          </Row>
          <Row className='justify-content-center text-center'>
            <Col md='6'>
              <Alert variant='danger' className={(clear?'d-none':'')}>
                <h2>Not Clear to Proceed</h2>
              </Alert>
              <Alert variant='success' className={(clear?'':'d-none')}>
                <h2>Clear to Proceed</h2>
              </Alert>
            </Col>
          </Row>
          <Row className='justify-content-center text-center'>
            <Col md='6' className={(clear?'d-none':'')}>
              <h3 className='text-center font-weight-light'>
                <u>Error</u>
              </h3>
              <p className='lead'>{error}</p>
            </Col>
          </Row>
          <Row className='justify-content-center text-center'>
            {(this.state.slot.location)?
            <Col md='6'>
              <h3 className='text-center font-weight-light'>
                <u>Appointment Details</u>
              </h3>
              <p className='lead'>Name: {this.state.slot.name}</p>
              <p className='lead'>Time: {moment(this.state.slot.time).format('dddd, MMMM D h:mm A')}</p>
              <p className='lead'>Location: {this.state.slot.location}</p>
            </Col>
            :
            <br />
            }
          </Row>
        </Container>
      </div>
    );
  }
}
