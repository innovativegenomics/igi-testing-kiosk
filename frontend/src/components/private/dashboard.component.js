import React, { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { Row, Col, Alert, Spinner, Button } from 'react-bootstrap';
import { BsFillInfoCircleFill } from 'react-icons/bs';
import moment from 'moment';

import { getSlot, cancelSlot } from '../../actions/slotActions';

export default class Dashboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      slot: {
        slot: {},
        success: false,
        loaded: false
      },
      showCancelledMessage: false,
    };
  }
  requestCancel = e => {
    cancelSlot().then(res => {
      if (res.success) {
        this.setState({ slot: { ...this.state.slot, loaded: false }, showCancelledMessage: true });
        getSlot().then(res => this.setState({ slot: { ...res, loaded: true } }));
      } else {
        alert(`Couldn't cancel your appointment! Please try again.`);
      }
    });
  }
  componentDidMount() {
    getSlot().then(res => this.setState({ slot: { ...res, loaded: true } }));
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
    } else if (!this.state.slot.loaded) {
      return (
        <div style={{width: '100%'}} className='text-center'>
          <Spinner animation='border' role='status'/>
        </div>
      );
    }
    return (
      <div>
        <div className='container'>
          <div className='row justify-content-center'>
            <div className='col text-center'>
              <p className='display-4'>{this.state.slot.slot.completed?'Completed':'Next'} {(this.state.slot.slot.location) ? '' : 'Open'} Appointment</p>
            </div>
          </div>
          <div className='row justify-content-center mb-3'>
            <div className='col text-center'>
              <p className='h1 font-weight-light'>
                {(this.state.slot.slot.location) ? '' : 'Week of '}
                {(this.state.slot.slot.location) ? moment(this.state.slot.slot.time).format('dddd, MMMM D h:mm A') : moment(this.state.slot.slot.time).format('dddd, MMMM D')}
                {(this.state.slot.slot.location) ? ` at ${this.state.slot.slot.location}` : ''}
              </p>
            </div>
          </div>
          <div className='row justify-content-center'>
            <div className='col text-center mb-3'>
              <Link className={'btn btn-outline-success btn-lg '+(this.state.slot.slot.completed?'d-none':'')} to='/scheduler'>{(this.state.slot.slot.location) ? 'Change time and location' : 'Select time and location'}</Link>
            </div>
          </div>
          <div className='row justify-content-center'>
            <div className='col text-center mb-3'>
              <button className={`btn btn-outline-danger btn-lg ${!!this.state.slot.slot.location && !this.state.slot.slot.completed ? '' : 'd-none'}`} onClick={this.requestCancel}>Cancel Appointment</button>
            </div>
          </div>
          {this.props.auth.user.reconsented?
            undefined
            :
            <Row className='justify-content-center mb-3'>
              <Col className='text-center' md='6'>
                <Alert variant='info' md={2} className='text-left'>
                  <BsFillInfoCircleFill className='position-absolute' style={{marginLeft: '-15px', marginTop: '-5px'}}/>
                  <p className='text-center'>
                    We have updated the terms of our study. If you would like, you can review the new study informed 
                    consent, and update the answers to the questions you answered when you first signed up.
                  </p>
                </Alert>
                <Button variant='outline-info' size='lg' onClick={e => this.props.history.push('/reconsent')}>View updated study consent</Button>
              </Col>
            </Row>
          }
          <div className={'row justify-content-center '+(this.state.slot.slot.completed?'':'d-none')}>
            <div className='col col-md-6'>
              <p className='lead alert alert-info text-center'>
                Thanks for completing your appointment! You will be able to reschedule for another appointment starting this Sunday.
              </p>
            </div>
          </div>
          <Row className='justify-content-center'>
            <Col md={8} className={!!this.state.slot.slot.location&&!this.state.slot.slot.completed?'':'d-none'}>
              <Alert variant='success'>
                <h3 className='font-weight-light text-center'>You have an upcoming appointment!</h3>
                <p className='lead text-center'>
                  You should have received an appointment confirmation email/text. If you didn't receive an email, check your spam.
                  When you arrive for your appointment, please wear your mask, and 
                  bring the QR code that you received in the confirmation email. You can
                  also view the qr code <Link to={'/qrcode?uid='+this.state.slot.slot.uid}>here</Link>.
                </p>
              </Alert>
            </Col>
          </Row>
          <Row className='justify-content-center'>
            <Col md={8} className={this.state.showCancelledMessage?'':'d-none'}>
              <Alert variant='info'>
                <h3 className='font-weight-light text-center'>Appointment Cancelled</h3>
                <p className='lead text-center'>
                  You can schedule a different time by clicking the button above.
                </p>
              </Alert>
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}
