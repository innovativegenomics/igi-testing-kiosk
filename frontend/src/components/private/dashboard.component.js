import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { Row, Col, Alert, Spinner, Button, Container } from 'react-bootstrap';
import { BsFillInfoCircleFill } from 'react-icons/bs';
import moment from 'moment';

import { getSlot, cancelSlot } from '../../actions/slotActions';
import { getTube, cancelDropoff } from '../../actions/tubeActions';
import { TrackedLink, TrackedButton } from '../../tracker';

export default class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      slot: null,
      tube: null,
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
  cancelDropoff = async () => {
    const { success } = await cancelDropoff();
    const res = await getTube();
    this.setState({ ...res, loaded: true });
  }
  componentDidMount() {
    console.log(this.props.auth.user);
    if (this.props.auth.user.atHomeParticipant) {
      console.log('loadSlot')
      getTube().then(res => this.setState({ ...res, loaded: true }));
    } else {
      getSlot().then(res => this.setState({ ...res, loaded: true }));
    }
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

    console.log(this.state);

    return (
      <Container className='text-center'>
        {!this.props.auth.user.atHomeParticipant?
          <>
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
          </>
          :
          <>
            {
              this.state.tube?
              <>
                <p className='display-4'>{this.state.tube.scheduledDropoff?`Scheduled Dropoff ${moment(this.state.tube.scheduledDropoff).format('MMM D')}`:'Choose a dropoff date for your tube'}</p>
                {this.state.tube.scheduledDropoff?<p className='h1 font-weight-light'>{`anytime from ${moment(this.state.tube.DropoffDay.starttime).format('h:mm A')} to ${moment(this.state.tube.DropoffDay.endtime).format('h:mm A')}`}</p>:<></>}
                <Button variant='outline-primary' size='lg' onClick={() => this.props.history.push('/scheduler')}>Choose a {this.state.tube.scheduledDropoff?'new':''} date</Button>
                <br />
                {this.state.tube.scheduledDropoff?
                  <Button variant='outline-danger' className='mt-2' size='lg' onClick={this.cancelDropoff}>Cancel selected dropoff</Button>
                  :
                  <></>
                }
              </>
              :
              <>
              test
              </>
            }
          </>
        }
        <Row className='justify-content-center mt-3'>
          <Col md='6'>
            {/* <Alert variant='info'>
              <p className='lead'>
              We suggest testing once every two weeks as a part of IGI FAST,
              however you are welcome to schedule an appointment off this cadence.
              Please note that you can only have one appointment scheduled at a time.
              </p>
            </Alert> */}
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
