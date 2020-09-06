import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { Row, Col, Alert, Spinner, Button, Container } from 'react-bootstrap';
import { BsFillInfoCircleFill } from 'react-icons/bs';
import moment from 'moment';

import { getSlot, cancelSlot } from '../../actions/slotActions';
import { TrackedLink, TrackedButton } from '../../tracker';

export default class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      slot: {},
      success: false,
      loaded: false,
      showCancelledMessage: false,
    };
  }
  requestCancel = e => {
    console.log('cancel');
    cancelSlot().then(res => {
      if (res.success) {
        this.setState({ loaded: false, showCancelledMessage: true });
        getSlot().then(res => this.setState({ ...res, loaded: true }));
      } else {
        alert(`Couldn't cancel your appointment! Please try again.`);
      }
    });
  }
  componentDidMount() {
    getSlot().then(res => this.setState({ ...res, loaded: true }));
  }
  render() {
    if (!this.props.auth.loaded) {
      return (
        <div style={{width: '100%'}} className='text-center'>
          <Spinner animation='border' role='status'/>
        </div>
      );
    } else if (this.props.auth.unauthed) {
      return <Redirect to='/' />;
    } else if (!this.props.auth.success) {
      return <Redirect to='/newuser' />;
    } else if (!this.state.loaded) {
      return (
        <div style={{width: '100%'}} className='text-center'>
          <Spinner animation='border' role='status'/>
        </div>
      );
    }

    if(!this.props.auth.user.reconsented) {
      return <Redirect to='/reconsent' />;
    }

    return (
      <Container className='text-center'>
        {
          this.state.slot?
          <>
            <p className='display-4'>{this.state.slot.completed?'Completed':'Scheduled'} appointment</p>
            <p className='h1 font-weight-light'>{moment(this.state.slot.time).format('dddd, MMMM Do [at] h:mm A')}</p>
            <p className='h2 font-weight-light'>located at <TrackedLink ext to={this.state.slot.OpenTime.Location.map} target='_blank' >{this.state.slot.OpenTime.Location.name}</TrackedLink></p>
            {
              this.state.slot.completed?
              <>
                <Row className='justify-content-center'>
                  <Col md={6}>
                    <Alert variant='success'>
                      <p className='lead mb-0'>
                        Thanks for completing your appointment!
                        You will be able to schedule your next
                        appointment starting this sunday. If you
                        have any more questions, please email the
                        study coordinator, Alex Ehrenberg, at <TrackedLink ext to='mailto:igi-fast@berkeley.edu'>igi-fast@berkeley.edu</TrackedLink>.
                      </p>
                    </Alert>
                  </Col>
                </Row>
              </>
              :
              <>
                <TrackedLink className={'btn btn-outline-success btn-lg mt-2 '+(this.state.slot.completed?'d-none':'')} to='/scheduler' action='dashboard reschedule button'>Change time and location</TrackedLink>
                <TrackedButton variant='outline-danger' size='lg' className='d-block ml-auto mr-auto mt-3' onClick={this.requestCancel} label='cancel appointment' action='cancel appointment'>Cancel Appointment</TrackedButton>
                <Row className='justify-content-center mt-3'>
                  <Col md={6}>
                    <Alert variant='success'>
                      <h3 className='font-weight-light text-center'>You have an upcoming appointment!</h3>
                      <p className='lead text-center mb-0'>
                        You should have received an appointment confirmation email/text. If you didn't receive an email, check your spam.
                        When you arrive for your appointment, please wear your mask, and 
                        bring the QR code that you received in the confirmation email. You can
                        also view the qr code <TrackedLink to={`/qrcode?uid=${encodeURIComponent(this.state.slot.uid)}&time=${encodeURIComponent(this.state.slot.time)}&location=${encodeURIComponent(this.state.slot.OpenTime.Location.name)}`} label='/qrcode' action='alert qr code'>here</TrackedLink>.
                      </p>
                    </Alert>
                  </Col>
                </Row>
              </>
            }
          </>
          :
          <>
            <p className='display-4'>Appointments available</p>
            <p className='h1 font-weight-light'>Starting week of {moment(this.props.auth.user.availableStart).startOf('week').format('dddd, MMMM Do')}</p>
            <TrackedLink className={'btn btn-outline-success btn-lg'} to='/scheduler' action='dashboard schedule button'>Select time and location</TrackedLink>
            {
              this.state.showCancelledMessage?
              <Row className='justify-content-center mt-3'>
                <Col md={6}>
                  <Alert variant='info'>
                    <h3 className='font-weight-light text-center'>Appointment Cancelled</h3>
                    <p className='lead mb-0'>
                      You can schedule a different time by clicking the button above.
                    </p>
                  </Alert>
                </Col>
              </Row>
              :
              undefined
            }
          </>
        }
        <Row className='justify-content-center mb-3 mt-3'>
          <Col className='text-center' md='6'>
            <Alert variant='warning' md={2} className='text-left'>
              <h2 className='text-center'>Announcement</h2>
              <p className='text-center mb-0 lead'>
                Due to recent supply chain issues with our Covid 19 testing
                lab, we have had to temporarily pause testing appointments.
              </p>
              <p>
                In our last email, we said appointments would be opening 9/6.
                However, we have decided not to open appointments yet until we
                know for sure that we have the capacity to process more samples.
              </p>
            </Alert>
          </Col>
        </Row>
        {this.props.auth.user.reconsented?
          undefined
          :
          <Row className='justify-content-center mb-3 mt-3'>
            <Col className='text-center' md='6'>
              <Alert variant='info' md={2} className='text-left'>
                <BsFillInfoCircleFill className='position-absolute' style={{marginLeft: '-15px', marginTop: '-5px'}}/>
                <p className='text-center mb-0 lead'>
                  We have updated the terms of our study. If you would like, you can review the new study informed 
                  consent, and update the answers to the questions you answered when you first signed up.
                </p>
              </Alert>
              <TrackedButton variant='outline-info' size='lg' onClick={e => this.props.history.push('/reconsent')} label='reconsent' action='reconsent'>View updated study consent</TrackedButton>
            </Col>
          </Row>
        }
      </Container>
    );
  }
}
