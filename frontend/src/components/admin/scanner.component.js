import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Container, Row, Col, Alert, Button } from 'react-bootstrap';
import qs from 'qs';
import moment from 'moment';

import Navbar from '../navbar.component';
import { getSlotInfo, completeSlot } from '../../actions/adminActions';

export default class Scanner extends Component {
  constructor(props) {
    super(props);
    this.state = {
      slot: null,
      slotLoaded: false,
      completed: false,
    };
  }
  completeSlot = async () => {
    console.log('here');
    this.setState({completed: true});
    const response = await completeSlot(this.state.slot.uid);
  }
  componentDidMount = async () => {
    const uid = qs.parse(this.props.location.search, {ignoreQueryPrefix: true}).uid;
    const slot = getSlotInfo(uid);
    this.setState({slotLoaded: true, slot: (await slot).slot});
  }
  render() {
    if(!this.state.slotLoaded) {
      return <div>Loading...</div>
    }

    var clear = true;
    var error = '';
    if(!this.state.slot) {
      clear = false;
      error = 'No appointment exists for this QR code!';
    } else if(this.state.slot.completed) {
      clear = false;
      error = `This appointment has already been completed`;
    } else if(!this.state.slot.location) {
      clear = false;
      error = `This patient has either not scheduled an appointment, or has cancelled their appointment`;
    } else if(!moment().isSame(moment(this.state.slot.time), 'date')) {
      clear = false;
      error = `This patient is here on the wrong day! Their appointment is ${moment(this.state.slot.time).format('dddd, MMMM D h:mm A')}`;
    }

    return (
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
          <Col className={(this.state.level>=10&&clear?'':'d-none')}>
            <Button onClick={e => this.completeSlot()} disabled={this.state.completed}>Show Appointment Details</Button>
          </Col>
        </Row>
        <Row className='justify-content-center text-center'>
          {(this.state.completed)?
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
    );
  }
}
