import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import moment from 'moment';
import { Container, Row, Col, Button } from 'react-bootstrap';

import { getUser } from '../../actions/authActions';
import { getSlot, cancelSlot } from '../../actions/scheduleActions';

import Navbar from '../navbar.component';

export default class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      auth: {
        user: {},
        loaded: false,
        unauthed: false,
        success: false
      },
      slot: {
        slot: {},
        success: false,
        loaded: false
      },
    };
  }
  requestCancel = e => {
    cancelSlot().then(res => {
      if (res.success) {
        this.setState({ slot: { ...this.state.slot, loaded: false } });
        getSlot().then(res => this.setState({ slot: { ...res, loaded: true } }));
      } else {
        alert(`Couldn't cancel your appointment! Please try again.`);
      }
    });
  }
  componentDidMount() {
    getUser().then(res => this.setState({ auth: { ...res, loaded: true } }));
    getSlot().then(res => this.setState({ slot: { ...res, loaded: true } }));
  }
  render() {
    if (!this.state.auth.loaded) {
      return <div>Loading User</div>;
    } else if (this.state.auth.unauthed) {
      return <Redirect to='/' />;
    } else if (!this.state.auth.success) {
      return <Redirect to='/newuser' />;
    } else if (!this.state.slot.loaded) {
      return <div>Loading schedule</div>;
    }
    console.log(this.state.slot);
    return (
      <div>
        <Navbar authed={true} admin={this.state.auth.user.admin} />
        <Container>
          <Row className='justify-content-center'>
            <Col className='text-center'>
              <p className='display-4'>Next {(this.state.slot.slot.location) ? '' : 'Open'} Appointment</p>
            </Col>
          </Row>
          <Row className='justify-content-center'>
            <Col className='text-center'>
              <p className='h1 font-weight-light'>
                {(this.state.slot.slot.location) ? '' : 'Week of '}
                {(this.state.slot.slot.location) ? moment(this.state.slot.slot.time).format('dddd, MMMM D h:mm A') : moment(this.state.slot.slot.time).format('dddd, MMMM D')}
                {(this.state.slot.slot.location) ? ` at ${this.state.slot.slot.location}` : ''}
              </p>
            </Col>
          </Row>
          <Row className='justify-content-center'>
            <Col className='text-center mb-3'>
              <Link className='btn btn-success' to='/scheduler'>{(this.state.slot.slot.location) ? 'Change time and location' : 'Select time and location'}</Link>
            </Col>
          </Row>
          <Row className='justify-content-center'>
            <Col className='text-center mb-3'>
              <Button variant='danger' className={`${this.state.slot.slot.location ? '' : 'd-none'}`} onClick={this.requestCancel}>
                Cancel Appointment
              </Button>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}
