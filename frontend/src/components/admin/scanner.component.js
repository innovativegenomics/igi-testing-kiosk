import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Container, Row, Col, Alert, Button, Spinner } from 'react-bootstrap';
import qs from 'qs';
import moment from 'moment';

import { getSlotInfo, completeSlot } from '../../actions/adminActions';

export default class Scanner extends Component {
  constructor(props) {
    super(props);
    this.state = {
      slot: null,
      slotLoaded: false,
      completed: false,
      copied: false,
    };
    this.nameRef = React.createRef();
    this.patientidRef = React.createRef();
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
      return (
        <div style={{width: '100%'}} className='text-center'>
          <Spinner animation='border' role='status'/>
        </div>
      );
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
          <Col className={(this.props.level>=10&&clear?'':'d-none')}>
            <Button onClick={e => this.completeSlot()} disabled={this.state.completed}>Show Appointment Details</Button>
          </Col>
        </Row>
        <Row className='justify-content-center text-center'>
          {(this.state.completed||this.state.slot.completed)?
          <Col md='6'>
            <h3 className='text-center font-weight-light'>
              <u>Appointment Details</u>
            </h3>
            <p className={'alert alert-success ' + (this.state.copied?'':'d-none')}>
              Copied!
            </p>
            <textarea className='position-fixed' style={{top: '-100px'}} value={this.state.slot.name} ref={this.nameRef}/>
            <textarea className='position-fixed' style={{top: '-100px'}} value={this.state.slot.patientid} ref={this.patientidRef}/>
            <p className='lead'>Name: <a onClick={e => {this.nameRef.current.select();document.execCommand('copy');this.setState({copied: true})}} href='#'>{this.state.slot.name}</a></p>
            <p className='lead'>Patient ID: <a onClick={e => {this.patientidRef.current.select();document.execCommand('copy');this.setState({copied: true})}} href='#'>{this.state.slot.patientid}</a></p>
            <p className='lead'>Time: {moment(this.state.slot.time).format('dddd, MMMM D h:mm A')}</p>
            <p className={'lead '+(this.state.slot.completed?'':'d-none')}>Completed: {moment(this.state.slot.completed).format('dddd, MMMM D h:mm A')}</p>
            <p className='lead'>Location: {this.state.slot.OpenTime.Location.name}</p>
            <p className='lead'>Has had previous appointment: {this.state.slot.apptCount > 0?'Yes':'No'}</p>
          </Col>
          :
          <br />
          }
        </Row>
      </Container>
    );
  }
}
