import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import { Modal, Button, ButtonGroup, Row, Col, Form, Spinner } from 'react-bootstrap';
import moment from 'moment';

import { getUser } from '../../actions/authActions';
import { getAvailable, requestSlot } from '../../actions/slotActions';

import { BsChevronLeft, BsChevronRight } from 'react-icons/bs';

import './calendar.css';

class DateButton extends Component {
  render() {
    if (this.props.grey) {
      return (
        <div className='col m-0 p-0'><button className='btn btn-outline-primary border-0 btn-circle btn-sm text-secondary' disabled>{this.props.day}</button></div>
      );
    } else if (this.props.invisible) {
      return (
        <div className='col m-0 p-0'><button className='btn btn-outline-primary border-0 btn-circle btn-sm invisible' disabled>{this.props.day}</button></div>
      );
    } else if (this.props.active) {
      if (this.props.selected) {
        return (
          <div className='col m-0 p-0'><button className='btn btn-outline-success border-0 btn-circle btn-sm active' onClick={e => this.props.onClick()}>{this.props.day}</button></div>
        );
      } else {
        return (
          <div className='col m-0 p-0'><button className='btn btn-outline-primary border-0 btn-circle btn-sm active' onClick={e => this.props.onClick()}>{this.props.day}</button></div>
        );
      }
    } else {
      return (
        <div className='col m-0 p-0'><button className='btn btn-outline-primary border-0 btn-circle btn-sm' disabled>{this.props.day}</button></div>
      );
    }
  }
}

class Calendar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      month: moment().startOf('month').startOf('day')
    };
  }

  render() {
    const lastMonth = this.state.month.clone().subtract(1, 'month');
    const startDay = this.state.month.day();
    let btns = [];
    for (var i = 0; i < 6; i++) {
      let btnRow = [];
      for (var d = 0; d < 7; d++) {
        let day = i * 7 + d;
        if (day < startDay) {
          btnRow.push(<DateButton grey={true} day={lastMonth.daysInMonth() - startDay + 1 + day} key={day} />);
        } else if (day >= startDay && day < this.state.month.daysInMonth() + startDay) {
          const active = !this.props.days.every(e => !e.startOf('day').isSame(this.state.month.clone().set('date', day - startDay + 1).startOf('day')));
          const dayMoment = this.state.month.clone().set('day', day - startDay + 1);
          btnRow.push(<DateButton active={active} selected={dayMoment.isSame(this.props.day)} day={day - startDay + 1} onClick={e => this.props.setDay(dayMoment)} key={day} />);
        } else {
          btnRow.push(<DateButton invisible={true} day={day - startDay + 1} key={day} />);
        }
      }
      btns.push(<div className='row m-0 p-0' key={i}>{btnRow}</div>);
    }
    return (
      <div className='card text-center' style={{ width: '22rem' }}>
        <div className='card-header'>
          <div className='btn-group'>
            <button className='btn btn-light' onClick={() => this.setState({ month: this.state.month.subtract(1, 'month') })}><BsChevronLeft /></button>
            <p className='lead p-2 m-0' style={{ lineHeight: 1.2 }}>{this.state.month.format('MMMM YYYY')}</p>
            <button className='btn btn-light' onClick={() => this.setState({ month: this.state.month.add(1, 'month') })}><BsChevronRight /></button>
          </div>
        </div>
        <div className='card-body'>
          <div className='row m-0 p-0'>
            <div className='col m-0 p-0'><p className='lead'>S</p></div>
            <div className='col m-0 p-0'><p className='lead'>M</p></div>
            <div className='col m-0 p-0'><p className='lead'>T</p></div>
            <div className='col m-0 p-0'><p className='lead'>W</p></div>
            <div className='col m-0 p-0'><p className='lead'>T</p></div>
            <div className='col m-0 p-0'><p className='lead'>F</p></div>
            <div className='col m-0 p-0'><p className='lead'>S</p></div>
          </div>
          {btns}
        </div>
      </div>
    );
  }
}

class AppointmentTable extends Component {
  render() {
    const slots = this.props.slots;
    const body = [];
    for (var i in slots) {
      const m = moment(i);
      if (m.isSame(this.props.day, 'day'))
        body.push(<tr key={`${i}`}><td><button data-toggle='modal' data-target='#confirmModal' onClick={e => this.props.request(m)} className={`btn ${(slots[i] > 0) ? 'btn-primary' : 'd-none'}`} disabled={!(slots[i] > 0)}>{m.format('h:mm A')}</button></td></tr>);
    }
    return (
      <table className='table'>
        <thead>
          <tr className='text-center'>
            <th scope='col'>{this.props.location}</th>
          </tr>
        </thead>
        <tbody className='text-center'>
          {body}
        </tbody>
      </table>
    );
  }
}

class Question extends Component {
  render() {
    const listItems = [];
    if (this.props.list) {
      for (var l in this.props.list) {
        listItems.push(<li key={l}>{this.props.list[l]}</li>);
      }
    }
    return (
      <div className='row pt-2 pb-2'>
        <div className='col-md-9'>
          <p className='m-0'>{this.props.question}</p>
          <ul>
            {listItems}
          </ul>
        </div>
        <div className='col-2'>
          <div className='btn-group'>
            <button className={`btn ${(this.props.selected === true) ? 'btn-primary' : 'btn-secondary'}`} onClick={this.props.option1Click}>{this.props.option1}</button>
            <button className={`btn ${(this.props.selected === false) ? 'btn-primary' : 'btn-secondary'}`} onClick={this.props.option2Click}>{this.props.option2}</button>
          </div>
        </div>
      </div>
    );
  }
}

class ConfirmModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      question1: 0,
      question2: 0,
      question3: 'None',
      question4: 'None',
      question5: 'No',
    }
  }
  render() {
    var isComplete = true;
    for (var k in this.state) {
      if (this.state[k] === '') {
        isComplete = false;
        break;
      }
    }
    const symtomatic = false;

    return (
      <div className="modal fade" id='confirmModal' tabIndex="-1" role="dialog">
        <div className="modal-dialog modal-lg" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Confirm appointment</h5>
              <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <p>Confirm that you would like to reserve this time slot</p>
              <p className='lead'>{this.props.selected ? this.props.selected.format('dddd, MMMM D h:mm A') : ''} at {this.props.location}</p>
              <h3>Please answer the following survey before you confirm your appointment</h3>
              
              <Row>
                <Col md={9}>
                  <p>In the two weeks leading up to this appointment, how many days have/will you work on campus?</p>
                </Col>
                <Col md={2}>
                  <Form.Control type='number' value={this.state.question1} min={0} step={1} pattern='\d+' onChange={e => this.setState({question1: parseInt(e.target.value)})}/>
                </Col>
              </Row>
              <Row>
                <Col md={9}>
                  <p>For the days you are/have been on campus in the two weeks leading up to this appointment, how many hours are you on campus, on average?</p>
                </Col>
                <Col md={2}>
                  <Form.Control type='number' value={this.state.question2} min={0} step={1} pattern='\d+' onChange={e => this.setState({question2: parseInt(e.target.value)})}/>
                </Col>
              </Row>
              {/* <Row>
                <Col md={7}>
                  <p>When you are working on campus, what building is your primary work space in?</p>
                </Col>
                <Col md={4}>
                  <Form.Control type='text' placeholder='Building' value={this.state.question3} onChange={e => this.setState({question3: e.target.value})}/>
                </Col>
              </Row> */}
              <Row>
                <Col md={9}>
                  <p>Are you using a mobile contact tracing application? If so, which one?</p>
                </Col>
                <Col md={2}>
                  <ButtonGroup>
                    <Button variant={this.state.question4==='None'?'secondary':'primary'} onClick={e => this.setState({question4: ''})}>Yes</Button>
                    <Button variant={this.state.question4==='None'?'primary':'secondary'} onClick={e => this.setState({question4: 'None'})}>No</Button>
                  </ButtonGroup>
                </Col>
                <Col md={4}>
                  <Form.Control type='text' className={this.state.question4==='None'?'d-none':''} placeholder='App Name' value={this.state.question4} onChange={e => this.setState({question4: e.target.value})}/>
                </Col>
              </Row>
              <Row>
                <Col md={7}>
                  <p>Have you ever been diagnosed with COVID-19?</p>
                </Col>
                <Col md={5}>
                  <ButtonGroup>
                    <Button variant={this.state.question5==='Yes'?'primary':'secondary'} onClick={e => this.setState({question5: 'Yes'})}>Yes</Button>
                    <Button variant={this.state.question5==='No'?'primary':'secondary'} onClick={e => this.setState({question5: 'No'})}>No</Button>
                    <Button variant={this.state.question5==='Decline to state'?'primary':'secondary'} onClick={e => this.setState({question5: 'Decline to state'})}>Decline to state</Button>
                  </ButtonGroup>
                </Col>
              </Row>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-primary" data-dismiss="modal" disabled={!isComplete} onClick={e => this.props.onSubmit(this.state)}>Confirm</button>
              <button type="button" className="btn btn-secondary" data-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default class Scheduler extends Component {
  constructor(props) {
    super(props);
    this.state = {
      auth: {
        user: {},
        loaded: false,
        unauthed: false,
        success: false
      },
      schedule: {
        available: {},
        success: false,
        loaded: false,
      },
      location: '',
      day: null,
      selected: null,
      success: false,
      showSymtomaticModal: false
    };
  }
  componentDidMount() {
    getUser().then(res => this.setState({ auth: { ...res, loaded: true } }));
    getAvailable().then(res => this.setState({ schedule: { ...res, loaded: true } }));
  }
  submitRequest = qs => {
    // if (s) {
    //   return this.setState({ showSymtomaticModal: true });
    // }
    console.log(this.state.selected);
    console.log(this.state.location);
    requestSlot(this.state.selected, this.state.location, qs).then(res => {
      if (!res.success) {
        alert('Unable to assign you that slot. Please try again!');
      } else {
        this.setState({ success: true });
      }
    });
  }
  render() {
    if (this.state.success) {
      return <Redirect to='/dashboard' />;
    }
    if (!this.state.auth.loaded) {
      return (
        <div style={{width: '100%'}} className='text-center'>
          <Spinner animation='border' role='status'/>
        </div>
      );
    } else if (this.state.auth.unauthed) {
      return <Redirect to='/' />;
    } else if (!this.state.auth.success) {
      return <Redirect to='/newuser' />;
    } else if (!this.state.schedule.loaded) {
      return (
        <div style={{width: '100%'}} className='text-center'>
          <Spinner animation='border' role='status'/>
        </div>
      );
    } else if (!this.state.schedule.success) {
      return <div>Failed to load the schedule! Please try reloading the page.</div>;
    }
    const locationOptions = [];
    Object.keys(this.state.schedule.available).forEach(k => {
      locationOptions.push(<option key={k}>{k}</option>);
    });
    const slots = Object.keys(this.state.schedule.available[this.state.location] || {}).filter(v => {
      return this.state.schedule.available[this.state.location][v] > 0;
    }).map(v => moment(v));
    return (
      <div>
        <div className='container'>
          <div className='row justify-content-center m-3'>
            <div className='col-sm-4'>
              <p className='lead'>Location:</p>
              <select className='form-control' onChange={e => this.setState({ location: e.target.value, day: null })}>
                <option value=''>--location--</option>
                {locationOptions}
              </select>
            </div>
          </div>
          <div className='row justify-content-center'>
            <Calendar days={slots} setDay={d => this.setState({ day: d })} day={this.state.day} />
          </div>
          <div className='row justify-content-center'>
            <div className='col-sm-8'>
              {this.state.day ? <AppointmentTable slots={this.state.schedule.available[this.state.location]} location={this.state.location} day={this.state.day} request={e => this.setState({ selected: e })} /> : <br />}
            </div>
          </div>
        </div>
        <ConfirmModal selected={this.state.selected} location={this.state.location} onSubmit={this.submitRequest} />
        <Modal show={this.state.showSymtomaticModal} backdrop='static' keyboard={false}>
          <Modal.Header>
            <Modal.Title>Alert</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            You indicated on the symtom questionaire that you are experiencing symtoms linked to Covid 19.
            Please consult the UC Berkeley Tang center for a testing appointment. Thanks!
          </Modal.Body>
          <Modal.Footer>
            <Button variation='primary' onClick={e => window.open('/dashboard', '_self')}>Ok</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}
